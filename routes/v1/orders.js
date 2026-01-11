import express from "express";
import { orderController } from "../../controllers/v1/orderController.js";
import { orderItemController } from "../../controllers/v1/orderItemController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();


/**
 * @api {post} /orders Create a new order
 * @apiName CreateOrder
 * @apiGroup Orders
 *
 * @apiDescription
 * Creates a new order for the authenticated user.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} store_id ID of the store
 * @apiBody {String} pickup Pickup time or instructions
 * @apiBody {Object[]} items Array of order items
 * @apiBody {String} items.product_id Product ID
 * @apiBody {String} items.size Product size
 * @apiBody {Number} items.quantity Quantity of the product
 *
 * @apiExample Request example:
 *  POST /orders
 *  Authorization: Bearer USER_TOKEN
 *  Content-Type: application/json
 *  Body: {
 *      "store_id": "64f1c2e9a1b2c3d4e5f12345",
 *      "pickup": "2026-01-10T12:30:00Z",
 *      "items": [
 *          { "product_id": "64f1c2e9a1b2c3d4e5f12346", "size": "M", "quantity": 2 }
 *      ]
 *  }
 *
 * @apiSuccess (201) {String} message Success message
 * @apiSuccess (201) {Object} order Created order object
 *
 * @apiError (400) BadRequest Missing required fields or invalid data
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (404) NotFound Store not found
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.post(
    "/",
    protect,
    orderController.createOrder
);

/**
 * @api {get} /orders/:id Get order by ID
 * @apiName GetOrderById
 * @apiGroup Orders
 *
 * @apiDescription
 * Retrieves a specific order by its ID.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id Order unique identifier
 *
 * @apiExample Request example:
 *  GET /orders/64f1c2e9a1b2c3d4e5f12345
 *  Authorization: Bearer USER_TOKEN
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} order Order data
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (404) NotFound Order not found
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
    "/:id",
    protect,
    orderController.getOrderById
);

/**
 * @api {delete} /orders/:id Delete order
 * @apiName DeleteOrder
 * @apiGroup Orders
 *
 * @apiDescription
 * Deletes a specific order by ID.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id Order unique identifier
 *
 * @apiExample Request example:
 *  DELETE /orders/64f1c2e9a1b2c3d4e5f12345
 *  Authorization: Bearer USER_TOKEN
 *
 * @apiSuccess (204) NoContent Order successfully deleted
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (404) NotFound Order not found
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.delete(
    "/:id",
    protect,
    orderController.deleteOrder
);

/**
 * @api {patch} /orders/:id Update order
 * @apiName UpdateOrder
 * @apiGroup Orders
 *
 * @apiDescription
 * Updates an order's status or other editable fields.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id Order unique identifier
 *
 * @apiBody {String} [status] New order status
 *
 * @apiExample Request example:
 *  PATCH /orders/64f1c2e9a1b2c3d4e5f12345
 *  Authorization: Bearer ADMIN_TOKEN
 *  Content-Type: application/json
 *  Body: {
 *      "status": "prête"
 * }
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} order Updated order object
 *
 * @apiError (400) BadRequest Invalid request, Missing data or Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Order not found
 * @apiError (409) Conflict Data conflict
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.patch(
    "/:id",
    protect,
    admin,
    orderController.updateOrderStatus
);


/**
 * @api {get} /orders/:id/items Get items of a specific order
 * @apiName GetOrderItems
 * @apiGroup Orders
 *
 * @apiDescription
 * Retrieves all items of a specific order.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiParam {String} id Order unique identifier
 *
 * @apiExample Request example:
 *  GET /orders/64f1c2e9a1b2c3d4e5f12345/items
 *  Authorization: Bearer USER_TOKEN
 *
 * @apiSuccess (200) {Object[]} items List of order items
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (404) NotFound Order not found
 * @apiError (500) InternalServerError An unexpected error occurred
 */
router.get(
  "/:id/items",
  protect,
  orderItemController.getItemsByOrder
);

export default router;