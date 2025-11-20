const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

// CRUD productos SOLO admin
router.post("/", authMiddleware, adminOnly, productoController.crearProducto);
router.get("/", authMiddleware, adminOnly, productoController.obtenerProductos);
router.get("/:id", authMiddleware, adminOnly, productoController.obtenerProductoPorId);
router.put("/:id", authMiddleware, adminOnly, productoController.actualizarProducto);
router.delete("/:id", authMiddleware, adminOnly, productoController.eliminarProducto);

module.exports = router;
