const db = require("../config/db");
const jwt = require("jsonwebtoken");

// ⚠️ En producción usa un archivo .env
const JWT_SECRET = "mi_secreto_super_seguro";

// 📌 Registrar nuevo cliente
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
    res.status(201).json({ message: "✅ Cliente registrado con éxito" });
  });
};

// 📌 Login con JWT
exports.loginUser = (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos" });
  }

  const query = "SELECT * FROM cliente WHERE correo = ? AND password = ?";
  db.query(query, [correo, password], (err, results) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "❌ Credenciales incorrectas" });
    }

    const user = results[0];

    // 🔑 Generar token válido por 1 hora
    const token = jwt.sign(
      { id: user.idcliente, correo: user.correo },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "✅ Login exitoso",
      token,
      user: {
        id: user.idcliente,
        nombre: user.nombre,
        correo: user.correo,
      },
    });
  });
};
