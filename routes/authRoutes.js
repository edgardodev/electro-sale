// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Ruta de prueba rápida
router.get("/test", (req, res) => {
  res.send("Ruta de auth funcionando ✅");
});

// 🧾 Registro (siempre crea clientes, nunca admin)
router.post("/register", authController.registerUser);

// 🔐 Login (devuelve token + user con role)
router.post("/login", authController.loginUser);

router.get("/perfil", authMiddleware, (req, res) => {
  res.json({
    message: "Perfil del usuario",
    user: req.user, 
  });
});

// 👑 Perfil SOLO de admin 
router.get("/perfil/admin", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    message: "Perfil del administrador",
    user: req.user, 
  });
});

router.get("/admin/active", (req, res) => {
 
  res.json({
    nombre: "Administración de Electro-Sale",
    estado: "Revisando mensajes manualmente",
    tiempoRespuesta: "15 min",
  });
});

module.exports = router;
