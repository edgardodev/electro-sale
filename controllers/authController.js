 const db = require("../config/db");

// Registro de nuevo usuario
exports.registerUser = (req, res) => {
  console.log("Datos recibidos en req.body:", req.body);

  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const query = "INSERT INTO cliente (nombre, correo, password) VALUES (?, ?, ?)";
  db.query(query, [nombre, correo, password], (err, result) => {
    if (err) {
      console.error("❌ Error al registrar:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.status(201).json({ message: "✅ cliente registrado con éxito" });
  });
};

// Login de usuario
exports.loginUser = (req, res) => {
  const { correo, password } = req.body;

  const query = "SELECT * FROM cliente WHERE correo = ? AND password = ?";
  db.query(query, [correo, password], (err, results) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    res.status(200).json({ message: "✅ Login exitoso", user: results[0] });
  });
};