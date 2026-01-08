import express from "express";
import { validateEmail } from "../../middleware/validateEmail.js";
import { validateDisplayName } from "../../middleware/validateDisplayName.js";
import { validatePhone } from "../../middleware/validatePhone.js";
import { validatePassword } from "../../middleware/validatePassword.js";
import { authController } from "../../controllers/v1/authController.js";

const router = express.Router();

/**
 * @api {post} /auth Register a new user
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