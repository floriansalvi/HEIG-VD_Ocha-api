/**
 * Middleware to verify that the authenticated user has an admin role.
 *
 * This middleware:
 * - checks if `req.user` exists and has a role of 'admin'
 * - allows the request to proceed if the user is an admin
 * - returns a 403 Forbidden response if the user is not an admin
 *
 * @param {Object} req Express request object (expects `req.user` to be populated)
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a 403 JSON response
 */
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            message: 'Access restricted to administrators'
        });
    }
};