const db = require("../config/db");

// Crear cliente
exports.crearCliente = (req, res) => {
  const { nombre, correo, direccion, metodo_pago, password } = req.body;

  if (!nombre || !correo || !direccion || !metodo_pago || !password) {
    return res
      .status(400)
      .json({ message: "Nombre, correo, direccion, metodo_pago y password son obligatorios" });
  }

  const sql =
    "INSERT INTO cliente (nombre, correo, direccion, metodo_pago, password) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [nombre, correo, direccion, metodo_pago, password], (err, result) => {
    if (err) {
      console.error("❌ Error al crear cliente:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ message: "✅ Cliente creado", id: result.insertId });
  });
};

// Listar clientes
exports.obtenerClientes = (req, res) => {
  db.query("SELECT * FROM cliente", (err, results) => {
    if (err) {
      console.error("❌ Error al listar clientes:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
};

// Obtener cliente por ID
exports.obtenerClientePorId = (req, res) => {
  db.query("SELECT * FROM cliente WHERE idcliente = ?", [req.params.id], (err, result) => {
    if (err) {
      console.error("❌ Error al buscar cliente:", err);
      return res.status(500).json({ error: err });
    }
    if (result.length === 0)
      return res.status(404).json({ message: "Cliente no encontrado" });
    res.json(result[0]);
  });
};

// Actualizar cliente
exports.actualizarCliente = (req, res) => {
  const { nombre, correo, direccion, metodo_pago, password } = req.body;

  const sql =
    "UPDATE cliente SET nombre=?, correo=?, direccion=?, metodo_pago=?, password=? WHERE idcliente=?";
  db.query(sql, [nombre, correo, direccion, metodo_pago, password, req.params.id], (err) => {
    if (err) {
      console.error("❌ Error al actualizar cliente:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ message: "✅ Cliente actualizado" });
  });
};

// Eliminar cliente
exports.eliminarCliente = (req, res) => {
  db.query("DELETE FROM cliente WHERE idcliente = ?", [req.params.id], (err) => {
    if (err) {
      console.error("❌ Error al eliminar cliente:", err);
      return res.status(500).json({ error: err });
    }
    res.json({ message: "🗑️ Cliente eliminado" });
  });
};

