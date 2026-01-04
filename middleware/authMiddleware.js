import jwt from 'jsonwebtoken';
import User from "../models/user.js";

/**
 * Middleware to protect routes and ensure the user is authenticated.
 *
 * This middleware:
 * - checks for a Bearer token in the `Authorization` header
 * - verifies the JWT token and decodes the user ID
 * - fetches the user from the database (excluding the password)
 * - attaches the user object to `req.user` for downstream middleware/controllers
 * - returns a 401 Unauthorized response if the token is missing, invalid, expired, or the user does not exist
 *
 * @param {Object} req Express request object
 * @param {Object} res Express response object
 * @param {Function} next Callback to pass control to the next middleware
 * @return {void} Either calls `next()` or sends a 401 JSON response
 */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized, token missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'User not found for the provided token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};