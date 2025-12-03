import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// public
router.get("/", getProducts);
router.get("/:id", getProductById);

// admin ?
router.post("/", protect, createProduct);
router.patch("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
