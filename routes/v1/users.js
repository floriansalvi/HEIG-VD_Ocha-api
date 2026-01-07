import express from "express";
import { authController } from "../../controllers/v1/authController.js";
import { orderController } from "../../controllers/v1/orderController.js";
import { validateEmail } from "../../middleware/validateEmail.js";
import { validateDisplayName } from "../../middleware/validateDisplayName.js";
import { validatePhone } from "../../middleware/validatePhone.js";
import { validatePassword } from "../../middleware/validatePassword.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();


/**
 * @api {post} /users Register a new user
 * @apiName RegisterUser
 * @apiGroup Authentication
 *
 * @apiDescription
 * Creates a new user account. Email and display_name must be unique.
 *
 * @apiBody {String} email User email address
 * @apiBody {String} password User password (plain text, min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
 * @apiBody {String} display_name Public display name (3-30 chars, letters, numbers, underscores)
 * @apiBody {String} [phone] Optional phone number (min 8 digits)
 * 
 * @apiExample request example:
 *  POST /api/v1/users
 *  Content-Type: application/json
 *  Body: {
 *    "email":"test@example.com",
 *    "password":"password123",
 *    "display_name":"test_user",
 *    "phone":"12345678"
 *  }
 *
 * @apiSuccess (201) {String} message Success message
 * @apiSuccess (201) {String} token JWT authentication token
 * @apiSuccess (201) {Object} user Registered user data
 * @apiSuccess (201) {String} user.id User unique identifier
 * @apiSuccess (201) {String} user.email User email address
 * @apiSuccess (201) {String} user.display_name User display name
 *
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 201 Created
 *     {
 *       "message": "User successfully registered",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *       "user": {
 *         "id": "64f1c2e9a1b2c3d4e5f67890",
 *         "email": "test@example.com",
 *         "display_name": "test_user"
 *       }
 *     }
 *
 * @apiError (400) BadRequest Request body is missing or validation error for email, password, display_name, or phone
 * @apiError (409) Conflict Email or display_name already in use
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.post(
    "/",
    validateEmail,
    validateDisplayName,
    validatePhone,
    validatePassword,
    authController.register
);

/**
 * @api {get} /api/users/me Get current user profile
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
    "/me",
    protect,
    (req, res) => {
        res.json({ user: req.user });
    }
);

/**
 * @api {get} /users/me/orders Get current user's orders
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
    "/me/orders",
    protect,
    orderController.getMyOrders
);

export default router;