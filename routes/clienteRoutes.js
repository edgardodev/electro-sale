const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");
const authMiddleware = require("../middlewares/authMiddleware"); // 👈

// CRUD clientes token
router.post("/", authMiddleware, clienteController.crearCliente);
router.get("/", authMiddleware, clienteController.obtenerClientes);
router.get("/:id", authMiddleware, clienteController.obtenerClientePorId);
router.put("/:id", authMiddleware, clienteController.actualizarCliente);
router.delete("/:id", authMiddleware, clienteController.eliminarCliente);

module.exports = router;
