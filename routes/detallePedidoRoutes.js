 const express = require("express");
const router = express.Router();
const detalleController = require("../controllers/detallePedidoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, detalleController.crearDetalle);
router.get("/", authMiddleware, detalleController.obtenerDetalles);
router.get("/:id", authMiddleware, detalleController.obtenerDetallePorId);
router.put("/:id", authMiddleware, detalleController.actualizarDetalle);
router.delete("/:id", authMiddleware, detalleController.eliminarDetalle);

module.exports = router;
