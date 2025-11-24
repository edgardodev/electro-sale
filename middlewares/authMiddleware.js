// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro";

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded contiene: id, correo, role, nombre
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token inválido:", err);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
