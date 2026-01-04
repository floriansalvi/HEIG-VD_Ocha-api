import User from "../models/user.js";

/**
 * Middleware to validate the `email` field in the request body.
 *
 * This middleware:
 * - ensures `email` is provided and is not empty
 * - normalizes the email by converting it to lowercase and trimming whitespace
 * - validates the email format
 * - checks that the email is not already used in the database
 * - attaches the cleaned `email` back to `req.body`
 * - calls `next()` if all checks pass
 * - returns an appropriate HTTP error response otherwise
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a JSON error response
 */
export const validateEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email is required" });
        }

        const cleanedEmail = email.toLowerCase().trim();
        req.body.email = cleanedEmail;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(cleanedEmail)) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const existing = await User.findOne({ email: cleanedEmail });
        if (existing) {
            return res.status(409).json({ message: "Email already used" });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Error during email validation",
            error: error.message
        });
    }
};