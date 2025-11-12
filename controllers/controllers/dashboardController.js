const db = require("../config/db");

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });

const columnCache = new Map();

const hasColumn = async (table, column) => {
  const cacheKey = `${table}.${column}`;
  if (columnCache.has(cacheKey)) {
    return columnCache.get(cacheKey);
  }

  const rows = await queryAsync("SHOW COLUMNS FROM ?? LIKE ?", [table, column]);
  const exists = rows.length > 0;
  columnCache.set(cacheKey, exists);
  return exists;
};

const getOptionalColumn = async (table, candidates) => {
  for (const column of candidates) {
    if (await hasColumn(table, column)) {
      return column;
    }
  }
  return null;
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

exports.getOverview = async (req, res) => {
  try {
    const [productCountRow] = await queryAsync(
      "SELECT COUNT(*) AS total FROM producto"
    );

    const [stockRow] = await queryAsync(
      "SELECT COALESCE(SUM(stock), 0) AS totalStock FROM producto"
    );

    const [ordersRow] = await queryAsync(
      "SELECT COUNT(*) AS total FROM pedido"
    );

    const estadoColumn = await getOptionalColumn("pedido", ["estado", "status"]);
    let pendingOrders = 0;

    if (estadoColumn) {
      const pendingStatuses = [
        "pendiente",
        "pending",
        "en preparacion",
        "enpreparacion",
        "procesando",
      ];
      const placeholders = pendingStatuses.map(() => "?").join(", ");
      const pendingSql = `SELECT COUNT(*) AS pending FROM pedido WHERE LOWER(${estadoColumn}) IN (${placeholders})`;
      const [pendingRow] = await queryAsync(pendingSql, pendingStatuses);
      pendingOrders = pendingRow?.pending || 0;
    }

    const stockMinColumn = await getOptionalColumn("producto", ["stock_minimo", "stockMinimo", "stock_min"]);
    let criticalSql = "SELECT COUNT(*) AS critical FROM producto WHERE stock <= ?";
    let criticalParams = [5];

    if (stockMinColumn) {
      criticalSql = `SELECT COUNT(*) AS critical FROM producto WHERE stock <= GREATEST(1, FLOOR(${stockMinColumn} * 0.5))`;
      criticalParams = [];
    }

    const [criticalRow] = await queryAsync(criticalSql, criticalParams);

    const now = new Date();
    const timestamp = now.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    res.json({
      products: {
        total: productCountRow?.total || 0,
        trend: `Catálogo sincronizado a las ${timestamp}`,
      },
      inventory: {
        units: stockRow?.totalStock || 0,
        trend: "Inventario consolidado desde la base de datos",
      },
      orders: {
        total: ordersRow?.total || 0,
        pending: pendingOrders,
        trend: pendingOrders > 0 ? "Revisa los pedidos en cola" : "Sin pedidos pendientes",
      },
      critical: {
        total: criticalRow?.critical || 0,
        trend:
          (criticalRow?.critical || 0) > 0
            ? "Existen productos con stock crítico"
            : "Todo el stock se encuentra en rangos seguros",
      },
    });
  } catch (error) {
    console.error("Error obteniendo métricas del dashboard:", error);
    res.status(500).json({ mensaje: "No fue posible obtener las métricas", error });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const stockMinColumn = await getOptionalColumn("producto", ["stock_minimo", "stockMinimo", "stock_min"]);
    const updatedAtColumn = await getOptionalColumn("producto", ["updated_at", "fecha_actualizacion", "fecha_modificacion"]);

    const selectFields = [
      "p.id_producto AS id",
      "p.nombre",
      "p.precio",
      "p.stock",
      stockMinColumn ? `p.${stockMinColumn} AS stock_minimo` : "NULL AS stock_minimo",
      updatedAtColumn ? `p.${updatedAtColumn} AS actualizado` : "NULL AS actualizado",
    ];

    const sql = `SELECT ${selectFields.join(", ")} FROM producto p ORDER BY p.nombre ASC`;
    const products = await queryAsync(sql);

    res.json(
      products.map((product) => ({
        id: product.id,
        nombre: product.nombre,
        precio: formatCurrency(product.precio),
        stock: Number(product.stock) || 0,
        stockMinimo:
          product.stock_minimo !== null && product.stock_minimo !== undefined
            ? Number(product.stock_minimo)
            : null,
        actualizado: product.actualizado,
      }))
    );
  } catch (error) {
    console.error("Error obteniendo productos del dashboard:", error);
    res.status(500).json({ mensaje: "No fue posible obtener los productos", error });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const estadoColumn = await getOptionalColumn("pedido", ["estado", "status"]);
    const selectEstado = estadoColumn
      ? `COALESCE(p.${estadoColumn}, 'pendiente') AS estado`
      : "'pendiente' AS estado";

    const sql = `
      SELECT
        p.id_pedido AS id,
        p.fecha,
        ${selectEstado},
        c.nombre AS cliente,
        COALESCE(SUM(dp.cantidad * prod.precio), 0) AS total
      FROM pedido p
      LEFT JOIN cliente c ON p.id_cliente = c.id_cliente
      LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN producto prod ON prod.id_producto = dp.id_producto
      GROUP BY p.id_pedido
      ORDER BY p.fecha DESC
      LIMIT 50
    `;

    const orders = await queryAsync(sql);

    res.json(
      orders.map((order) => ({
        id: order.id,
        fecha: order.fecha,
        estado: order.estado,
        cliente: order.cliente || "Cliente sin nombre",
        total: formatCurrency(order.total),
      }))
    );
  } catch (error) {
    console.error("Error obteniendo órdenes del dashboard:", error);
    res.status(500).json({ mensaje: "No fue posible obtener las órdenes", error });
  }
};

exports.updateProductPrice = async (req, res) => {
  const { id } = req.params;
  const { precio } = req.body;

  if (!precio || Number.isNaN(Number(precio))) {
    return res.status(400).json({ mensaje: "El precio proporcionado no es válido" });
  }

  try {
    const updateFields = ["precio = ?"];
    const params = [Number(precio), id];

    const updatedAtColumn = await getOptionalColumn("producto", ["updated_at", "fecha_actualizacion", "fecha_modificacion"]);
    if (updatedAtColumn) {
      updateFields.push(`${updatedAtColumn} = NOW()`);
    }

    const sql = `UPDATE producto SET ${updateFields.join(", ")} WHERE id_producto = ?`;
    await queryAsync(sql, params);

    res.json({ mensaje: "Precio actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando precio del producto:", error);
    res.status(500).json({ mensaje: "No fue posible actualizar el precio", error });
  }
};

exports.registerInventory = async (req, res) => {
  const { id_producto, cantidad } = req.body;

  const productId = Number(id_producto);
  const quantity = Number(cantidad);

  if (!productId || Number.isNaN(productId)) {
    return res.status(400).json({ mensaje: "Debe indicar un producto válido" });
  }

  if (!quantity || Number.isNaN(quantity) || quantity <= 0) {
    return res
      .status(400)
      .json({ mensaje: "La cantidad debe ser un número mayor a cero" });
  }

  try {
    const [product] = await queryAsync(
      "SELECT stock FROM producto WHERE id_producto = ?",
      [productId]
    );

    if (!product) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const newStock = Number(product.stock || 0) + quantity;

    await queryAsync(
      "UPDATE producto SET stock = ? WHERE id_producto = ?",
      [newStock, productId]
    );

    res.json({ mensaje: "Inventario actualizado", stock: newStock });
  } catch (error) {
    console.error("Error registrando inventario:", error);
    res.status(500).json({ mensaje: "No fue posible registrar el inventario", error });
  }
};
