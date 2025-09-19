const express = require("express");
const router = express.Router();   
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware"); // 👈 importarlo

// Ruta de prueba
router.get("/test", (req, res) => {
  res.send("Ruta de auth funcionando ✅");
});

// Registro
router.post("/register", authController.registerUser);

// Login
router.post("/login", authController.loginUser);

// 👇 Nueva ruta protegida
router.get("/perfil", authMiddleware, (req, res) => {
  res.json({
    message: "Perfil del usuario",
    user: req.user, // viene del token
  });
});

module.exports = router;
