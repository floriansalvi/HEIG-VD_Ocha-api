import express from "express";
import { authController } from "../../controllers/v1/authController.js";

const router = express.Router();

// Login
router.post(
    "/login",
    authController.login
);

export default router;