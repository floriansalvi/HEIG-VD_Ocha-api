import User from "../../models/user.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/generateToken.js";

/**
 * Register a new user.
 *
 * This controller handles user registration by:
 * - validating email and display name uniqueness
 * - creating a new user
 * - generating a JWT authentication token
 *
 * @param {Object} req Express request object.
 * @param {Object} req.body Request body containing user data.
 * @param {string} req.body.email User email address.
 * @param {string} req.body.password User password (plain text).
 * @param {string} req.body.display_name Public display name.
 * @param {string} req.body.phone User phone number.
 *
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the authentication token and user data.
 */
const register = async (req, res) => {
    try {
        const { email, password, display_name, phone } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({
                message: "Email already in use"
            });
        }

        const existingDisplayName = await User.findOne({ display_name });
        if (existingDisplayName) {
            return res.status(409).json({
                message: "Username already in use"
            });
        }

        const user = new User({
            email,
            password,
            display_name,
            phone
        });

        await user.save();

        const token = generateToken(user);

        return res.status(201).json({
            message: "User successfully registered",
            token,
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "An unexpected error occurred",
        });
    }
};

/**
 * Authenticate an existing user.
 *
 * This controller handles user login by:
 * - validating the provided credentials
 * - comparing the hashed password
 * - generating a JWT authentication token
 *
 * @param {Object} req Express request object.
 * @param {Object} req.body Request body containing login credentials.
 * @param {string} req.body.email User email address.
 * @param {string} req.body.password User password (plain text).
 *
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the authentication token and user data.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                message: "Email or password incorrect"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Email or password incorrect"
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "An unexpected error occurred",
        });
    }
};

/**
 * Authentication controller.
 *
 * Groups all authentication-related controller methods.
 */
export const authController = {
    register,
    login
};