import express from "express";
import { authController } from "../../controllers/v1/authController.js";
import { orderController } from "../../controllers/v1/orderController.js";
import { validateEmail } from "../../middleware/validateEmail.js";
import { validateDisplayName } from "../../middleware/validateDisplayName.js";
import { validatePhone } from "../../middleware/validatePhone.js";
import { validatePassword } from "../../middleware/validatePassword.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post(
    "/",
    validateEmail,
    validateDisplayName,
    validatePhone,
    validatePassword,
    authController.register
);

// Connected user profile
router.get(
    "/me",
    protect,
    (req, res) => {
        res.json({ user: req.user });
    }
);

// Get list of own orders
router.get(
    "/me/orders",
    protect,
    orderController.getMyOrders
);

export default router;