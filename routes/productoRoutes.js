const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController"); 
const authMiddleware = require("../middlewares/authMiddleware");

// CRUD productos 
router.post("/", authMiddleware, productoController.crearProducto);
router.get("/", authMiddleware, productoController.obtenerProductos);
router.get("/:id", authMiddleware, productoController.obtenerProductoPorId);
router.put("/:id", authMiddleware, productoController.actualizarProducto);
router.delete("/:id", authMiddleware, productoController.eliminarProducto);

module.exports = router;

