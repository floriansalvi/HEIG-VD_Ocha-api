import express from "express";
import { storeController } from "../../controllers/v1/storeController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { admin } from "../../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @api {get} /stores Get stores
 * @apiName GetStores
 * @apiGroup Stores
 *
 * @apiDescription
 * Retrieves a list of stores.
 * Supports pagination and geolocation search using query parameter.
 *
 * @apiQuery {Number} [page=1] Page number
 * @apiQuery {Number} [limit=10] Number of stores per page
 * @apiQuery {String} [near] Coordinates in format "lng,lat"
 * @apiQuery {Number} [radius=10000] Search radius in meters (only with near)
 *
 * @apiExample Request example:
 *  GET /stores?page=1&limit=5
 *
 * @apiExample {curl} Example usage (nearby):
 *   curl -X GET "https://api.example.com/stores?near=6.93,46.99&radius=5000"
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Number} totalStores Total number of stores
 * @apiSuccess (200) {Object[]} stores List of stores
 *
 * @apiSuccessExample {json} Success response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "List of stores",
 *       "page": 1,
 *       "totalPages": 2,
 *       "totalStores": 12,
 *       "stores": [
 *         {
 *           "_id": "64f1c2e9a1b2c3d4e5f12345",
 *           "name": "Coffee Shop",
 *           "email": "contact@coffee.ch",
 *           "address": "Main street 1"
 *         }
 *       ]
 *     }
 *
 * @apiError (400) InvalidNearParameter Invalid near query format
 * @apiError (500) InternalServerError Unexpected server error
 */
router.get(
    "/",
    storeController.getStores
);

// Get store with id
router.get(
    "/:id",
    storeController.getStoreById
);

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