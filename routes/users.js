import express from "express";
import { authController } from "../controllers/authController.js";
import { validateEmail } from "../middleware/validateEmail.js";
import { validateDisplayName } from "../middleware/validateDisplayName.js";
import { validatePhone } from "../middleware/validatePhone.js";
import { validatePassword } from "../middleware/validatePassword.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Créer un compte
router.post(
    "/register",
    validateEmail,
    validateDisplayName,
    validatePhone,
    validatePassword,
    authController.register
);

// Se connecter
router.post(
    "/login",
    authController.login
);

router.get("/profile", protect, (req, res) => {
    res.json({ user: req.user });
});

export default router;
