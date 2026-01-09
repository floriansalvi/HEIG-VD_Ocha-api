import express from "express";
import { orderStatsController } from "../../controllers/v1/orderStatsController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @api {get} /order-stats Get order statistics
 * @apiName GetOrderStats
 * @apiGroup Statistics
 *
 * @apiDescription
 * Retrieves aggregated order statistics per user.
 * Requires authentication and administrator privileges.
 *
 * Statistics include:
 * - total number of orders per user
 * - total amount spent per user (CHF)
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiExample Request example:
 *  GET /order-stats
 *  Authorization: Bearer ADMIN_TOKEN
 *
 * @apiSuccess (200) {Object[]} stats List of order statistics per user
 * @apiSuccess (200) {String} stats.user User display name
 * @apiSuccess (200) {Number} stats.totalOrders Total number of orders placed by the user
 * @apiSuccess (200) {Number} stats.totalSpent Total amount spent by the user (CHF)
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/",
    protect,
    admin,
    orderStatsController.getOrderStats
);

export default router;