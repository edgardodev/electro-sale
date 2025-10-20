 const db = require("../config/db");

// Crear nuevo pedido
exports.crearPedido = (req, res) => {
  const { id_cliente, id_admin, fecha } = req.body;

  if (!id_cliente || !id_admin || !fecha) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const sql = "INSERT INTO pedido (id_cliente, id_admin, fecha) VALUES (?, ?, ?)";
  db.query(sql, [id_cliente, id_admin, fecha], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al crear pedido", error: err });
    res.status(201).json({ mensaje: "Pedido creado correctamente", id_pedido: result.insertId });
  });
};

// Obtener todos los pedidos
exports.obtenerPedidos = (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS cliente, a.nombre AS admin
    FROM pedido p
    LEFT JOIN cliente c ON p.id_cliente = c.id_cliente
    LEFT JOIN admin a ON p.id_admin = a.id_admin
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener pedidos", error: err });
    res.json(results);
  });
};

// Obtener un pedido por ID
exports.obtenerPedidoPorId = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM pedido WHERE id_pedido = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener pedido", error: err });
    if (result.length === 0) return res.status(404).json({ mensaje: "Pedido no encontrado" });
    res.json(result[0]);
  });
};

// Actualizar un pedido
exports.actualizarPedido = (req, res) => {
  const { id } = req.params;
  const { id_cliente, id_admin, fecha } = req.body;
  const sql = "UPDATE pedido SET id_cliente = ?, id_admin = ?, fecha = ? WHERE id_pedido = ?";
  db.query(sql, [id_cliente, id_admin, fecha, id], (err) => {
    if (err) return res.status(500).json({ mensaje: "Error al actualizar pedido", error: err });
    res.json({ mensaje: "Pedido actualizado correctamente" });
  });
};

// Eliminar un pedido
exports.eliminarPedido = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM pedido WHERE id_pedido = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ mensaje: "Error al eliminar pedido", error: err });
    res.json({ mensaje: "Pedido eliminado correctamente" });
  });
};
