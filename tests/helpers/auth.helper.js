import request from "supertest";
import jwt from "jsonwebtoken";
import User from "../../models/user.js";
import app from "../../app.js";

/**
 * Creates a new user and returns the user object along with a JWT token.
 * 
 * @param {Object} userData - User data to create
 * @param {string} userData.role - User role ('admin' or 'user')
 * @param {string} userData.email - User email (optional, generated if not provided)
 * @param {string} userData.display_name - User display name (optional)
 * @returns {Promise<Object>} Object containing user instance and authentication token
 */
export const createUserWithToken = async (userData = {}) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    
    const {
        role = "admin",
        email = `${role}-${timestamp}-${random}@test.com`,
        display_name = `Test User ${timestamp}-${random}`,
        password = "Password-123"
    } = userData;

    const user = new User({ 
        display_name,
        email,
        password,
        role 
    });
    await user.save();

    // Perform login to obtain a valid JWT token
    const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ email, password });

    return { 
        user, 
        token: loginRes.body.token 
    };
};

/**
 * Generate a valid JWT token for a user.
 * 
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
export const generateValidToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "1h" }
    );
};

/**
 * Generate an expired JWT token for testing.
 * 
 * @param {Object} user - User object
 * @returns {string} Expired JWT token
 */
export const generateExpiredToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "test-secret",
        { expiresIn: "-1h" }
    );
};

/**
 * Generate an invalid JWT token for testing.
 * 
 * @returns {string} Invalid JWT token
 */
export const generateInvalidToken = () => {
    return "invalid.jwt.token";
};