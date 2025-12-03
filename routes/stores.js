import express from "express";
import { storeController } from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// public
router.get(
    "/",
    storeController.getStores
);

router.get(
    "/:id",
    storeController.getStoreById
);

// admin seulement ? si oui tu peux remplacer protect par un "isAdmin"
router.post(
    "/",
    protect,
    admin,
    storeController.createStore
);

router.patch(
    "/:id",
    protect,
    admin,
    storeController.updateStore
);

router.delete(
    "/:id",
    protect,
    admin,
    storeController.deleteStore
);

export default router;
