import express from "express";
import { orderController } from "../../controllers/v1/orderController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @api {get} /users Get current user profile
 * @apiName GetUserProfile
 * @apiGroup Users
 *
 * @apiDescription
 * Retrieves the currently authenticated user's profile.
 * Requires a valid Bearer token in the Authorization header.
 *
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiExample Request example:
 *  GET /users
 *  Authorization: Bearer YOUR_TOKEN_HERE
 *
 * @apiSuccess (200) {Object} user User profile data
 * @apiSuccess (200) {String} user.id User unique identifier
 * @apiSuccess (200) {String} user.email User email address
 * @apiSuccess (200) {String} user.display_name User display name
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/",
    protect,
    (req, res) => {
        try {
            return res.status(200).json({
                user: req.user
            });
        } catch (error) {
            return res.status(500).json({
                message: "An unexpected error occurred",
            });
        }
    }
);

/**
 * @api {get} /users/orders Get current user's orders
 * @apiName GetMyOrders
 * @apiGroup Orders
 *
 * @apiDescription
 * Retrieves all orders for the authenticated user. Supports pagination and filtering by status or store_id.
 *
 * @apiHeader {String} Authorization Bearer token
 * @apiQuery {String} [status] Filter orders by status
 * @apiQuery {String} [store_id] Filter orders by store
 * @apiQuery {Number} [page=1] Page number for pagination
 * @apiQuery {Number} [limit=10] Number of orders per page
 *
 * @apiExample Request example:
 *  GET /users/orders?status=pending&page=1&limit=5
 *  Authorization: Bearer YOUR_TOKEN_HERE
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Number} page Current page number
 * @apiSuccess (200) {Number} totalPages Total number of pages
 * @apiSuccess (200) {Number} totalOrders Total number of orders
 * @apiSuccess (200) {Object[]} orders List of orders
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/orders",
    protect,
    orderController.getMyOrders
);

export default router;