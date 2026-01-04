import User from "../models/user.js";

/**
 * Middleware to validate the `password` field in the request body.
 *
 * This middleware:
 * - ensures `password` is provided and is not empty
 * - enforces a minimum length of 8 characters
 * - requires at least one lowercase letter, one uppercase letter, one number, and one special character
 * - calls `next()` if all checks pass
 * - returns an appropriate HTTP error response otherwise
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a JSON error response
 */
export const validatePassword = (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.trim() === "") {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters"
            });
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[\W_]/.test(password);

        if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Error during password validation",
            error: error.message
        });
    }
};