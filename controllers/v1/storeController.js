import Store from "../../models/store.js";

/**
 * Handle Mongoose-related errors and return an appropriate HTTP response.
 *
 * @param {Object} res Express response object.
 * @param {Error} error Mongoose error instance.
 * @return {Object} JSON response with an appropriate HTTP status code.
 */
const handleMongooseError = (res, error) => {
    if (error.name === "ValidationError") {
        return res.status(422).json({
            message: "Invalid data",
            error: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Data conflict (duplicate)",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "An unexpected error occurred"
    });
};

/**
 * Create a new store.
 *
 * This controller:
 * - validates required fields
 * - ensures email uniqueness
 * - creates and persists the store
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the created store.
 */
const createStore = async (req, res) => {
    try {
        const { name, phone, email, address, location, opening_hours } = req.body;

        if (!name || !email || !address || !location) {
            return res.status(400).json({
                message: "name, email, address and location are required"
            });
        }

        const existingEmail = await Store.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email already used for a store" });
        }

        const store = new Store({
            name,
            phone,
            email,
            address,
            location,
            opening_hours
        });

        await store.save();

        return res.status(201).json({
            message: "Store created",
            store
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Retrieve a paginated list of stores.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing paginated stores.
 */
const getStores = async (req, res) => {
    try {
        const { near, radius, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // Geospatial query for nearby stores
        if (near) {
            const [lng, lat] = near.split(",");

            if (!lng || !lat) {
                return res.status(400).json({
                    message: "Invalid near parameter. Expected format: lng,lat"
                });
            }

            const radiusInMeters = parseInt(radius) || 10000;

            const stores = await Store.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: radiusInMeters
                    }
                }
            })
            .skip(skip)
            .limit(limitNumber);

            const totalStores = await Store.countDocuments({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: radiusInMeters
                    }
                }
            });

            return res.status(200).json({
                message: "Nearby stores",
                page: pageNumber,
                totalPages: Math.ceil(totalStores / limitNumber),
                totalStores,
                stores
            });
        }

        const stores = await Store.find()
            .skip(skip)
            .limit(limitNumber);

        const totalStores = await Store.countDocuments();

        return res.status(200).json({
            message: "List of stores",
            page: pageNumber,
            totalPages: Math.ceil(totalStores / limitNumber),
            totalStores,
            stores
        });
    } catch (error) {
        return res.status(500).json({
            message: "An unexpected error occurred"
        });
    }
};

/**
 * Retrieve a single store by its identifier.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the store.
 */
const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        return res.status(200).json({
            message: "Store found",
            store
        });
    } catch (error) {
        return res.status(400).json({
            message: "Invalid request (invalid id)",
            error: error.message
        });
    }
};

/**
 * Update an existing store.
 *
 * Only predefined fields can be updated.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the updated store.
 */
const updateStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        const updatableFields = ["name", "phone", "email", "address", "location", "opening_hours", "is_active"];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                store[field] = req.body[field];
            }
        });

        await store.save();

        return res.status(200).json({
            message: "Store updated",
            store
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Delete a store by its identifier.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {void}
 */
const deleteStore = async (req, res) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({
            message: "Invalid request (invalid id)",
            error: error.message
        });
    }
};

/**
 * Store item controller.
 *
 * Groups all store-related controller methods.
 */
export const storeController = {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
};
