import express from "express";
import { storeController } from "../controllers/storeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public

// Get paginated list of stores
router.get(
    "/",
    storeController.getStores
);

// Get store with id
router.get(
    "/:id",
    storeController.getStoreById
);

// Get nearby stores
router.get(
    "/nearby",
    storeController.getNearbyStores
);

// Admin

// Create a new store
router.post(
    "/",
    protect,
    admin,
    storeController.createStore
);

// Update a store
router.patch(
    "/:id",
    protect,
    admin,
    storeController.updateStore
);

// Delete a store
router.delete(
    "/:id",
    protect,
    admin,
    storeController.deleteStore
);

export default router;