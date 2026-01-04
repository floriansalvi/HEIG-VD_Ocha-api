import express from "express";
import { authController } from "../../controllers/v1/authController.js";
import { validateEmail } from "../../middleware/validateEmail.js";
import { validateDisplayName } from "../../middleware/validateDisplayName.js";
import { validatePhone } from "../../middleware/validatePhone.js";
import { validatePassword } from "../../middleware/validatePassword.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post(
    "/register",
    validateEmail,
    validateDisplayName,
    validatePhone,
    validatePassword,
    authController.register
);

// Login
router.post(
    "/login",
    authController.login
);

// Connected user profile
router.get(
    "/profile",
    protect,
    (req, res) => {
        res.json({ user: req.user });
    }
);

export default router;