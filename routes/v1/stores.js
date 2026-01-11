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
 *  GET /stores
 * @apiExample Request example:
 *  GET /stores?page=1&limit=5
 * @apiExample Request example:
 *  GET /stores?near=6.93,46.99&radius=5000
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Number} page Current page
 * @apiSuccess (200) {Number} totalPages Total number of pages
 * @apiSuccess (200) {Number} totalStores Total number of stores
 * @apiSuccess (200) {Object[]} stores List of stores
 *
 * @apiError (400) BadRequest Invalid query or request parameters
 * @apiError (500) InternalServerError Unexpected server error
 */
router.get(
    "/",
    storeController.getStores
);

/**
 * @api {get} /stores/:id Get store by ID
 * @apiName GetStoreById
 * @apiGroup Stores
 *
 * @apiParam {String} id Store unique identifier
 *
 * @apiExample Request example:
 *  GET /stores/64f1c2e9a1b2c3d4e5f12345
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Object} store Store data
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (404) NotFound Store not found
 * @apiError (500) InternalServerError An unexpected error occurred

 */
router.get(
    "/:id",
    storeController.getStoreById
);

/**
 * @api {post} /stores Create store
 * @apiName CreateStore
 * @apiGroup Stores
 *
 * @apiDescription
 * Creates a new store.
 * Requires authentication and admin role.
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} name Store name (3–50 characters, unique)
 * @apiBody {String} email Store email (valid email, unique)
 * @apiBody {String} [phone] Store phone number (international format)
 * @apiBody {Object} address Store address
 * @apiBody {String} address.line1 Street address
 * @apiBody {String} address.city City
 * @apiBody {String} address.zipcode ZIP or postal code
 * @apiBody {String} address.country Country
 * @apiBody {Object} location GeoJSON location
 * @apiBody {String="Point"} location.type GeoJSON type (must be "Point")
 * @apiBody {Number[]} location.coordinates Longitude and latitude [lng, lat]
 * @apiBody {String[][]} [opening_hours] Weekly opening hours
 * Array of 7 elements (Sunday to Saturday).
 * Each day is either [] (closed) or ["HH:MM", "HH:MM"].
 *
 * @apiExample Request example:
 *  POST /stores
 *      Authorization: Bearer ADMIN_TOKEN
 *      Content-Type: application/json
 *      Body: {
 *          "name": "Ocha Neuchâtel",
 *          "email": "neuchatel@ocha.ch",
 *          "phone": "12345678", 
 *          "address": {
 *             "line1": "Avenue de la Gare 1",
 *              "city": "Neuchâtel",
 *              "zipcode": "2000",
 *              "country": "Suisse"
 *          },
 *          "location": {
 *              "type": "Point",
 *              "coordinates": [6.93, 46.99]
 *          },
 *          "opening_hours": [
 *              [],
 *              ["08:00", "18:00"],
 *              ["08:00", "18:00"],
 *              ["08:00", "18:00"],
 *              ["08:00", "20:00"],
 *              ["08:00", "20:00"],  
 *              ["09:00", "17:00"]
 *         ]
 *      }
 *
 * @apiSuccess (201) {String} message Response message
 * @apiSuccess (201) {Object} store Created store
 *
 * @apiError (400) BadRequest Missing or invalid fields
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (409) Conflict Store with same name or email exists
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError Unexpected server error
 */
router.post(
    "/",
    protect,
    admin,
    storeController.createStore
);

/**
 * @api {patch} /stores/:id Update store
 * @apiName UpdateStore
 * @apiGroup Stores
 *
 * @apiDescription
 * Updates an existing store.
 * Only predefined fields can be updated.
 * Requires authentication and administrator privileges.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam {String} id Store unique identifier
 *
 * @apiBody {String} [name] Store name
 * @apiBody {String} [email] Store email
 * @apiBody {String} [phone] Store phone number
 * @apiBody {Object} [address] Store address
 * @apiBody {Object} [location] Store location
 * @apiBody {String[][]} [opening_hours] Weekly opening hours
 * @apiBody {Boolean} [is_active] Store active status
 *
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} store Updated store
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Store not found
 * @apiError (409) Conflict Store with same email or name exists
 * @apiError (422) UnprocessableEntity Validation error
 * @apiError (500) InternalServerError Unexpected server error
 */
router.patch(
    "/:id",
    protect,
    admin,
    storeController.updateStore
);

/**
 * @api {delete} /stores/:id Delete store
 * @apiName DeleteStore
 * @apiGroup Stores
 *
 * @apiDescription
 * Deletes a store by its identifier.
 * Requires authentication and an administrator role.
 *
 * @apiHeader {String} Authorization Bearer JWT token
 *
 * @apiParam {String} id Store unique identifier
 *
 * @apiSuccess (204) NoContent Store successfully deleted
 *
 * @apiError (400) BadRequest Invalid ID format
 * @apiError (401) Unauthorized Missing or invalid token
 * @apiError (403) Forbidden Admin access required
 * @apiError (404) NotFound Store not found
 * @apiError (500) InternalServerError Unexpected server error
 */
router.delete(
    "/:id",
    protect,
    admin,
    storeController.deleteStore
);

export default router;