import express from "express";
import {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
} from "../controllers/storeController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// public
router.get("/", getStores);
router.get("/:id", getStoreById);

// admin seulement ? si oui tu peux remplacer protect par un "isAdmin"
router.post("/", protect, createStore);
router.patch("/:id", protect, updateStore);
router.delete("/:id", protect, deleteStore);

export default router;
