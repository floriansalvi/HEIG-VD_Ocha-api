import express from "express";
import { productController } from "../../controllers/v1/productController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @api {get} /products Get products
 * @apiName GetProducts
 * @apiGroup Products
 *
 * @apiDescription
 * Retrieves a list of products.
 * Supports filtering and pagination.
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Number of products per page
 * @apiQuery {Boolean} [active] Filter active products only
 *
 * @apiExample Request example:
 *  GET /products
 * @apiExample Request example:
 *  GET /products?active=true
 * @apiExample Request example:
 *  GET /products?page=1&limit=10
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Number} page Current page
 * @apiSuccess (200) {Number} totalPages Total number of pages
 * @apiSuccess (200) {Number} totalProducts Total number of products
 * @apiSuccess (200) {Object[]} products List of products
 *
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/",
    productController.getProducts
);

/**
 * @api {get} /products/:id Get product by ID
 * @apiName GetProductById
 * @apiGroup Products
 *
 * @apiParam {String} id Product unique identifier
 *
 * @apiExample Request example:
 *  GET /products/64f1c2e9a1b2c3d4e5f12345
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Object} product Product data
 *
 * @apiError (404) NotFound Product not found
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/:id",
    productController.getProductById
);


/**
 * @api {post} /products Create product
 * @apiName CreateProduct
 * @apiGroup Products
 *
 * @apiDescription
 * Creates a new product.
 * Requires authentication and administrator privileges.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiBody {String} name Product name
 * @apiBody {Number} price Product price
 * @apiBody {String} [description] Product description
 *
 * @apiExample Request example:
 *  POST /products
 *  Authorization: Bearer ADMIN_TOKEN
 *  Content-Type: application/json
 *      Body: {
 *          "name": "Matcha Latte",
 *          "price": 5.00,
 *          "description": "Delicious matcha latte with a hint of sweetness."
 *      }
 *
 * @apiSuccess (201) {String} message Response message
 * @apiSuccess (201) {Object} product Created product
 *
 * @apiError (400) BadRequest Missing or invalid fields
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (409) Conflict Product with same name already exists
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.post(
    "/",
    protect,
    admin,
    productController.createProduct
);


/**
 * @api {patch} /products/:id Update product
 * @apiName UpdateProduct
 * @apiGroup Products
 *
 * @apiDescription
 * Updates an existing product.
 * Requires authentication and administrator privileges.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam {String} id Product unique identifier
 *
 * @apiBody {String} [name] Product name
 * @apiBody {Number} [price] Product price
 * @apiBody {String} [description] Product description
 * 
 * @apiExample Request example:
 *  PATCH /products/64f1c2e9a1b2c3d4e5f12345
 *  Authorization: Bearer ADMIN_TOKEN
 *  Content-Type: application/json
 *  Body: {
 *      "name": "Caramel Matcha Latte",
 *      "price": 6.50,
 *      "description": "Matcha latte onctueux avec sirop au caramel."
 *  }
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Object} product Updated product
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Product not found
 * @apiError (409) Conflict Product with same name already exists
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.patch(
    "/:id",
    protect,
    admin,
    productController.updateProduct
);

/**
 * @api {delete} /products/:id Delete product
 * @apiName DeleteProduct
 * @apiGroup Products
 *
 * @apiDescription
 * Deletes a product by its identifier.
 * Requires authentication and administrator privileges.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam {String} id Product unique identifier
 *
 * @apiExample Request example:
 *  DELETE /products/64f1c2e9a1b2c3d4e5f12345
 *      Authorization: Bearer ADMIN_TOKEN
 *
 * @apiSuccess (204) NoContent Product successfully deleted
 *
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Product not found
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.delete(
    "/:id",
    protect,
    admin,
    productController.deleteProduct
);


/**
 * @api {put} /products/:id/image Upload product image
 * @apiName UploadProductImage
 * @apiGroup Products
 *
 * @apiDescription
 * Uploads or updates the image of a product.
 * Requires authentication and administrator privileges.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiHeader {String} Content-Type multipart/form-data
 *
 * @apiParam {String} id Product unique identifier
 *
 * @apiExample Request example:
 *  PUT /products/64f1c2e9a1b2c3d4e5f12345/image
 *      Authorization: Bearer ADMIN_TOKEN
 *      Content-Type: multipart/form-data
 *      Body: {
 *          "image": <file>
 *      }
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} product Updated product
 *
 * @apiError (400) BadRequest Invalid file or request
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Product not found
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.put(
    "/:id/image",
    protect,
    admin,
    productController.uploadProductImage
)

export default router;