import express from "express";
import { productController } from "../../controllers/v1/productController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

// List of products (filters + pagination)
router.get(
    "/",
    productController.getProducts
);

// Details about a products
router.get(
    "/:id",
    productController.getProductById
);

// Create a new product
router.post(
    "/",
    protect,
    admin,
    productController.createProduct
);

// Update a product
router.patch(
    "/:id",
    protect,
    admin,
    productController.updateProduct
);

// Delete a product
router.delete(
    "/:id",
    protect,
    admin,
    productController.deleteProduct
);

// Add or update product image
router.put(
    "/:id/image",
    protect,
    admin,
    productController.uploadProductImage
)

export default router;