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
 * 
 * @apiExample Request example:
 *  GET /stores?page=1&limit=5
 * 
 * @apiExample Request example:
 *  GET /stores?near=6.93,46.99&radius=5000
 *
 * @apiSuccess (200) {String} message Response message
 * @apiSuccess (200) {Number} totalStores Total number of stores
 * @apiSuccess (200) {Object[]} stores List of stores
 *
 * @apiSuccessExample {json} Success response:
 *  HTTP/1.1 200 OK
 *      {
 *          "message": "List of stores",
 *          "page": 1,
 *          "totalPages": 1,
 *          "totalStores": 1,
 *          "stores": [
                {
                    "address": {
                        "line1": "Rue de Genève 21",
                        "city": "Lausanne",
                        "zipcode": "1003",
                        "country": "Suisse"
                    },
                    "location": {
                        "type": "Point",
                        "coordinates": [
                            6.629,
                            46.522
                        ]
                    },
                    "_id": "695e520d173af7481ecbfad5",
                    "name": "Ocha Lausanne Flon",
                    "slug": "ocha-lausanne-flon",
                    "phone": "+41214445566",
                    "email": "lausanne-flon@ocha.ch",
                    "is_active": true,
                    "opening_hours": [
                        [],
                        [
                            "09:00",
                            "18:30"
                        ],
                        [
                            "09:00",
                            "18:30"
                        ],
                        [
                            "09:00",
                            "18:30"
                        ],
                        [
                            "09:00",
                            "20:00"
                        ],
                        [
                            "09:00",
                            "20:00"
                        ],
                        [
                            "10:00",
                            "18:00"
                        ]
                    ],
                    "created_at": "2026-01-07T12:31:09.893Z",
                    "updated_at": "2026-01-07T12:31:09.893Z",
                    "__v": 0
                }
            ]
 *      }
 *
 * @apiError (400) BadRequest Invalid near parameter. Expected format: lat,lng
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
 * @apiSuccessExample {json} Success response:
 *  HTTP/1.1 200 OK
 *      {
            "message": "Store found",
            "store": {
                "address": {
                    "line1": "Rue du Rhône 12",
                    "city": "Genève",
                    "zipcode": "1204",
                    "country": "Suisse"
                },
                "location": {
                    "type": "Point",
                    "coordinates": [
                        6.149,
                        46.203
                    ]
                },
                "_id": "695e520d173af7481ecbfad6",
                "name": "Ocha Genève Rive",
                "slug": "ocha-geneve-rive",
                "phone": "+41225556677",
                "email": "geneve-rive@ocha.ch",
                "is_active": true,
                "opening_hours": [
                    [],
                    [
                        "09:30",
                        "19:00"
                    ],
                    [
                        "09:30",
                        "19:00"
                    ],
                    [
                        "09:30",
                        "19:00"
                    ],
                    [
                        "09:30",
                        "20:00"
                    ],
                    [
                        "09:30",
                        "20:00"
                    ],
                    [
                        "10:00",
                        "18:30"
                    ]
                ],
                "created_at": "2026-01-07T12:31:09.895Z",
                "updated_at": "2026-01-07T12:31:09.895Z",
                "__v": 0
            }
        }
 *
 * @apiError (404) NotFound Store not found
 * @apiError (400) InvalidId Invalid store ID
 */
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