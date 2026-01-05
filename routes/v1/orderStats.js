import express from "express";
import { orderStatsController } from "../../controllers/v1/orderStatsController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

// Get orders statistics
router.get(
    "/",
    protect,
    admin,
    orderStatsController.getOrderStats
);

export default router;