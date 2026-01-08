import express from "express";
import { orderController } from "../../controllers/v1/orderController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @api {get} /api/users Get current user profile
 * @apiName GetUserProfile
 * @apiGroup Authentication
 *
 * @apiDescription
 * Retrieves the currently authenticated user's profile.
 * Requires a valid Bearer token in the Authorization header.
 *
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiExample Request example:
 *  GET /users/me
 *  Authorization: Bearer YOUR_TOKEN_HERE
 *
 * @apiSuccess (200) {Object} user User profile data
 * @apiSuccess (200) {String} user.id User unique identifier
 * @apiSuccess (200) {String} user.email User email address
 * @apiSuccess (200) {String} user.display_name User display name
 * 
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *         "id": "64f1c2e9a1b2c3d4e5f67890",
 *         "email": "test@example.com",
 *         "display_name": "test_user"
 *       }
 *     }
 *
 * @apiError (401) Unauthorized Missing or invalid token
 */
router.get(
    "/",
    protect,
    (req, res) => {
        res.json({ user: req.user });
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
 * @apiExample {curl} Example usage:
 *   curl -X GET "https://api.example.com/auth/me/orders?page=1&limit=5" -H "Authorization: Bearer YOUR_TOKEN_HERE"
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Number} page Current page number
 * @apiSuccess (200) {Number} totalPages Total number of pages
 * @apiSuccess (200) {Number} totalOrders Total number of orders
 * @apiSuccess (200) {Object[]} orders List of orders
 *
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Your order history",
 *       "page": 1,
 *       "totalPages": 3,
 *       "totalOrders": 15,
 *       "orders": [
 *         {
 *           "_id": "64f1c2e9a1b2c3d4e5f67890",
 *           "store_id": {
 *             "_id": "64f1c2e9a1b2c3d4e5f12345",
 *             "name": "Store A"
 *           },
 *           "user_id": {
 *             "_id": "64f1c2e9a1b2c3d4e5f67890",
 *             "email": "user@example.com",
 *             "display_name": "John Doe"
 *           },
 *           "pickup": "2026-01-10T12:00:00Z",
 *           "total_price_chf": 42.5,
 *           "status": "pending",
 *           "createdAt": "2026-01-07T10:00:00Z",
 *           "updatedAt": "2026-01-07T10:30:00Z"
 *         }
 *       ]
 *     }
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