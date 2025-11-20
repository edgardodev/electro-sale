// controllers/authController.js
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// ⚠️ Usa variable de entorno en producción
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

// ✅ Correo que será tratado como administrador
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "edgardoflorez1@gmail.com";

// 📌 Registrar nuevo cliente (siempre como cliente, nunca admin desde aquí)
exports.registerUser = (req, res) => {
  console.log("Datos recibidos en req.body:", req.body);

  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  // 💡 Aquí suponemos que tu tabla cliente NO tiene columna role todavía.
  // Si luego agregas `role`, cambias este INSERT para guardar 'cliente'.
  const query =
    "INSERT INTO cliente (nombre, correo, password) VALUES (?, ?, ?)";
  db.query(query, [nombre, correo, password], (err, result) => {
    if (err) {
      console.error("❌ Error al registrar:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }
    res.status(201).json({ message: "✅ Cliente registrado con éxito" });
  });
};

// 📌 Login con JWT y soporte de rol (cliente / admin)
exports.loginUser = (req, res) => {
  const { correo, password, role: requestedRole } = req.body; // role viene del select del front

  if (!correo || !password) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos" });
  }

  const query = "SELECT * FROM cliente WHERE correo = ? AND password = ?";
  db.query(query, [correo, password], (err, results) => {
    if (err) {
      console.error("❌ Error en login:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "❌ Credenciales incorrectas" });
    }

    const user = results[0];

    // 🧠 Determinar rol REAL del usuario
    // 1) Si en el futuro tienes columna role/rol, úsala
    // 2) Si no, tratamos ADMIN_EMAIL como admin y resto cliente
    const dbRole =
      user.role ||
      user.rol ||
      (user.correo === ADMIN_EMAIL ? "admin" : "cliente");

    // 🛡️ Si el usuario intenta entrar como "admin" en el select,
    //     pero su rol real no es admin → bloqueamos
    if (requestedRole === "admin" && dbRole !== "admin") {
      return res
        .status(403)
        .json({ message: "No tienes permisos de administrador" });
    }

    const userId = user.idcliente || user.id_cliente || user.id; // por si el nombre cambia

    // 🔐 Incluir el rol dentro del token
    const token = jwt.sign(
      { id: userId, correo: user.correo, role: dbRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "✅ Login exitoso",
      token,
      user: {
        id: userId,
        nombre: user.nombre,
        correo: user.correo,
        role: dbRole, // 👈 importantísimo para el front
      },
    });
  });
};
