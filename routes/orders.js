import express from "express";
import { orderController } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// utilisateur connecté
router.post(
    "/",
    protect,
    orderController.createOrder
);

router.get(
    "/me",
    protect,
    orderController.getMyOrders
);

router.get(
    "/:id",
    protect,
    orderController.getOrderById
);

// statut souvent réservé au staff/admin
router.patch(
    "/:id/status",
    protect, admin,
    orderController.updateOrderStatus
);

// suppression d'une commande
router.delete(
    "/:id",
    protect,
    orderController.deleteOrder
);

export default router;