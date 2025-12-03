import express from "express";
import { orderItemController } from "../controllers/orderItemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// récupérer les items d'une commande
router.get(
    "/:orderId/items",
    protect,
    orderItemController.getItemsByOrder
);

export default router;