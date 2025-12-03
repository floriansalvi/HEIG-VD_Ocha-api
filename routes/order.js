import express from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// utilisateur connecté
router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// statut souvent réservé au staff/admin
router.patch("/:id/status", protect, updateOrderStatus);

// suppression d'une commande
router.delete("/:id", protect, deleteOrder);

export default router;
