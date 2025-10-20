 const db = require("../config/db");

// Crear producto
exports.crearProducto = (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || !precio || !stock) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const query = "INSERT INTO producto (nombre, precio, stock) VALUES (?, ?, ?)";
  db.query(query, [nombre, precio, stock], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ mensaje: "Producto creado con éxito", id: result.insertId });
  });
};

// Obtener todos los productos
exports.obtenerProductos = (req, res) => {
  const query = "SELECT * FROM producto";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};

// Obtener producto por ID
exports.obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM producto WHERE id_producto = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.json(result[0]);
  });
};

// Actualizar producto
exports.actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, precio, stock } = req.body;
  const query = "UPDATE producto SET nombre = ?, precio = ?, stock = ? WHERE id_producto = ?";
  db.query(query, [nombre, precio, stock, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: "Producto actualizado con éxito" });
  });
};

// Eliminar producto
exports.eliminarProducto = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM producto WHERE id_producto = ?";
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ mensaje: "Producto eliminado con éxito" });
  });
};
