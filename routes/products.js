import express from "express";
import { productController } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// public
router.get(
    "/",
    productController.getProducts
);

router.get(
    "/:id",
    productController.getProductById
);

// admin ?
router.post(
    "/",
    protect,
    admin,
    productController.createProduct
);

router.patch(
    "/:id",
    protect,
    admin,
    productController.updateProduct
);

router.delete(
    "/:id",
    protect,
    admin,
    productController.deleteProduct
);

export default router;
