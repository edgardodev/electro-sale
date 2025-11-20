const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const adminOnly = require("../middlewares/adminOnly");
const dashboardController = require("../controllers/dashboardController");

// Resumen general del dashboard
router.get(
  "/overview",
  authMiddleware,
  adminOnly,
  dashboardController.getOverview
);

// Productos para panel (stock, precios, etc.)
router.get(
  "/products",
  authMiddleware,
  adminOnly,
  dashboardController.getProducts
);

// Órdenes recientes
router.get(
  "/orders",
  authMiddleware,
  adminOnly,
  dashboardController.getOrders
);

// Actualizar precio de un producto
router.put(
  "/products/:id/price",
  authMiddleware,
  adminOnly,
  dashboardController.updateProductPrice
);

// Registrar ingreso de inventario
router.post(
  "/inventory",
  authMiddleware,
  adminOnly,
  dashboardController.registerInventory
);

module.exports = router;
