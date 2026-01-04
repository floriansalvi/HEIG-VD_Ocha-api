import express from "express";
import { orderItemController } from "../../controllers/v1/orderItemController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get items of a specific order
router.get(
    "/:orderId/items",
    protect,
    orderItemController.getItemsByOrder
);
export default router;