 const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, pedidoController.crearPedido);
router.get("/", authMiddleware, pedidoController.obtenerPedidos);
router.get("/:id", authMiddleware, pedidoController.obtenerPedidoPorId);
router.put("/:id", authMiddleware, pedidoController.actualizarPedido);
router.delete("/:id", authMiddleware, pedidoController.eliminarPedido);

module.exports = router;
