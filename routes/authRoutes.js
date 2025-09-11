const express = require("express");
const router = express.Router();   
const authController = require("../controllers/authController");

// Ruta de prueba
router.get("/test", (req, res) => {
  res.send("Ruta de auth funcionando ✅");
});

// Ruta para registrar usuario nuevo
router.post("/register", authController.registerUser);

// Ruta para login
router.post("/login", authController.loginUser);

module.exports = router;