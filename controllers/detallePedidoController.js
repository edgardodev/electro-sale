 const db = require("../config/db");

// Crear nuevo detalle de pedido
exports.crearDetalle = (req, res) => {
  const { id_pedido, id_producto, cantidad } = req.body;

  if (!id_pedido || !id_producto || !cantidad) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const sql = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad) VALUES (?, ?, ?)";
  db.query(sql, [id_pedido, id_producto, cantidad], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al crear detalle", error: err });
    res.status(201).json({ mensaje: "Detalle de pedido creado correctamente", id_detalle: result.insertId });
  });
};

// Obtener todos los detalles de pedido
exports.obtenerDetalles = (req, res) => {
  const sql = `
    SELECT d.*, p.nombre_producto 
    FROM detalle_pedido d
    LEFT JOIN producto p ON d.id_producto = p.id_producto
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener detalles", error: err });
    res.json(results);
  });
};

// Obtener detalle por ID
exports.obtenerDetallePorId = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM detalle_pedido WHERE id_detalle = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener detalle", error: err });
    if (result.length === 0) return res.status(404).json({ mensaje: "Detalle no encontrado" });
    res.json(result[0]);
  });
};

// Actualizar detalle de pedido
exports.actualizarDetalle = (req, res) => {
  const { id } = req.params;
  const { id_pedido, id_producto, cantidad } = req.body;
  const sql = "UPDATE detalle_pedido SET id_pedido = ?, id_producto = ?, cantidad = ? WHERE id_detalle = ?";
  db.query(sql, [id_pedido, id_producto, cantidad, id], (err) => {
    if (err) return res.status(500).json({ mensaje: "Error al actualizar detalle", error: err });
    res.json({ mensaje: "Detalle actualizado correctamente" });
  });
};

// Eliminar detalle
exports.eliminarDetalle = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM detalle_pedido WHERE id_detalle = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ mensaje: "Error al eliminar detalle", error: err });
    res.json({ mensaje: "Detalle eliminado correctamente" });
  });
};
