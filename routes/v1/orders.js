import express from "express";
import { orderController } from "../../controllers/v1/orderController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

// Conected

// Create a new order
router.post(
    "/",
    protect,
    orderController.createOrder
);

// Get list of own orders
router.get(
    "/me",
    protect,
    orderController.getMyOrders
);

// Get orders statistics
router.get(
    "/stats",
    protect,
    admin,
    orderController.getOrderStats
);

// Get details of a specific order
router.get(
    "/:id",
    protect,
    orderController.getOrderById
);

// Delete an order
router.delete(
    "/:id",
    protect,
    orderController.deleteOrder
);

// Admin

// Update an order status
router.patch(
    "/:id/status",
    protect,
    admin,
    orderController.updateOrderStatus
);

export default router;