import User from "../models/user.js";

/**
 * Middleware to validate the `phone` field in the request body.
 *
 * This middleware:
 * - allows `phone` to be optional
 * - strips non-digit characters
 * - ensures that if provided, the phone number contains at least 8 digits
 * - calls `next()` if all checks pass
 * - returns an appropriate HTTP error response otherwise
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a JSON error response
 */
export const validatePhone = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is missing"
            });
        }

        const { phone } = req.body;

        if (!phone || phone.trim() === "") {
            return next();
        }

        const cleanedPhone = phone.replace(/[^\d]/g, "");

        if (!cleanedPhone || cleanedPhone.length < 8) {
            return res.status(422).json({
                message: "Invalid phone number"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "An unexpected error occurred",
        });
    }
};