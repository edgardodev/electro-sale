const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");

// CRUD pedidos SOLO admin (panel)
router.post("/", authMiddleware, adminOnly, pedidoController.crearPedido);
router.get("/", authMiddleware, adminOnly, pedidoController.obtenerPedidos);
router.get("/:id", authMiddleware, adminOnly, pedidoController.obtenerPedidoPorId);
router.put("/:id", authMiddleware, adminOnly, pedidoController.actualizarPedido);
router.delete("/:id", authMiddleware, adminOnly, pedidoController.eliminarPedido);

module.exports = router;
