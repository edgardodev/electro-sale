const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/overview", authMiddleware, dashboardController.getOverview);
router.get("/products", authMiddleware, dashboardController.getProducts);
router.get("/orders", authMiddleware, dashboardController.getOrders);
router.put(
  "/products/:id/price",
  authMiddleware,
  dashboardController.updateProductPrice
);
router.post(
  "/inventory",
  authMiddleware,
  dashboardController.registerInventory
);

module.exports = router;
