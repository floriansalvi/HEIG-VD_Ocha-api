import User from "../models/user.js";

/**
 * Middleware to validate the `display_name` field in the request body.
 *
 * This middleware:
 * - ensures `display_name` is provided and is not empty
 * - trims whitespace from the display name
 * - checks that the length is between 3 and 30 characters
 * - ensures it contains only letters, numbers, or underscores
 * - verifies that the display name is not already taken in the database
 * - attaches the cleaned `display_name` back to `req.body`
 * - calls `next()` if all checks pass
 * - returns an appropriate HTTP error response otherwise
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a JSON error response
 */
export const validateDisplayName = async (req, res, next) => {
    try {
        const { display_name } = req.body;

        if (!display_name || display_name.trim() === "") {
            return res.status(400).json({
                message: "Display name is required"
            });
        }

        const cleanedDisplayName = display_name.trim();
        req.body.display_name = cleanedDisplayName;

        if (cleanedDisplayName.length < 3 || cleanedDisplayName.length > 30) {
            return res.status(400).json({
                message: "Display name must be between 3 and 30 characters"
            });
        }

        const displayNameRegex = /^[a-zA-Z0-9_]+$/;
        if(!displayNameRegex.test(cleanedDisplayName)) {
            return res.status(400).json({
                message: "Display name can only contain letters, numbers, and underscores"
            });
        }

        const existing = await User.findOne({ display_name: cleanedDisplayName });
        if (existing) {
            return res.status(409).json({
                message: "Display name already used"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Error during display name validation",
            error: error.message
        });
    }
};