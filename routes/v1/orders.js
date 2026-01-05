import express from "express";
import { orderController } from "../../controllers/v1/orderController.js";
import { orderItemController } from "../../controllers/v1/orderItemController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

// Create a new order
router.post(
    "/",
    protect,
    orderController.createOrder
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

// Update an order status
router.patch(
    "/:id",
    protect,
    admin,
    orderController.updateOrderStatus
);

// Get items of a specific order
router.get(
  "/:id/items",
  protect,
  orderItemController.getItemsByOrder
);

export default router;