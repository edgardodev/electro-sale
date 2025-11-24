const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

// 🔓 Lectura de productos: clientes y admins (solo requiere estar logueado)
router.get("/", authMiddleware, productoController.obtenerProductos);
router.get("/:id", authMiddleware, productoController.obtenerProductoPorId);

// 🔐 Escritura de productos: SOLO admin
router.post("/", authMiddleware, adminOnly, productoController.crearProducto);
router.put("/:id", authMiddleware, adminOnly, productoController.actualizarProducto);
router.delete("/:id", authMiddleware, adminOnly, productoController.eliminarProducto);

module.exports = router;
