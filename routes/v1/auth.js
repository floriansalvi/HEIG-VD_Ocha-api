import express from "express";
import { authController } from "../../controllers/v1/authController.js";

const router = express.Router();

/**
 * @api {post} /auth/login Login user
 * @apiName LoginUser
 * @apiGroup Authentication
 *
 * @apiDescription
 * Authenticates a user using email and password.
 * If the credentials are valid, a JWT token is returned.
 *
 * @apiBody {String} email User email address
 * @apiBody {String} password User password (plain text)
 * 
 * @apiExample request example:
 *  POST /api/v1/auth/login
 *  Content-Type: application/json
 *  Body: {
 *    "email":"test@example.com",
 *    "password":"password123"
 *  }
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {String} token JWT authentication token
 * @apiSuccess (200) {Object} user Authenticated user data
 * @apiSuccess (200) {String} user.id User unique identifier
 * @apiSuccess (200) {String} user.email User email address
 * @apiSuccess (200) {String} user.display_name User display name
 *
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Login successful",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *       "user": {
 *         "id": "64f1c2e9a1b2c3d4e5f67890",
 *         "email": "user@example.com",
 *         "display_name": "John Doe"
 *       }
 *     }
 *
 * @apiError (401) Unauthorized Email or password incorrect
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.post(
    "/login",
    authController.login
);

export default router;