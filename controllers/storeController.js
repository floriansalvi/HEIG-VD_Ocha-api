import Store from "../models/store.js";

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
        message: "An error occurred :",
        error: error.message
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const stores = await Store.find()
            .skip(skip)
            .limit(limit);

        const totalStores = await Store.countDocuments();

        return res.status(200).json({
            message: "List of stores",
            page,
            totalPages: Math.ceil(totalStores / limit),
            totalStores,
            stores
        });
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred :",
            error: error.message
        });
    }
};

/**
 * Retrieve nearby stores based on geographic coordinates.
 *
 * @param {Object} req Express request object.
 * @param {Object} req.query Query parameters.
 * @param {string} req.query.lat Latitude.
 * @param {string} req.query.lng Longitude.
 * @param {string} [req.query.radius] Search radius in meters.
 *
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing nearby stores.
 */
const getNearbyStores = async (req, res) => {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({
            message: "Latitude and longitude are required"
        })
    }

    const radiusInMeters = parseInt(radius) || 10000;

    try {
        const stores = await Store.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: radiusInMeters
                }
            }
        });

        return res.status(200).json({
            message: "Nearby stores",
            stores
        })
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred :",
            error: error.message
        });
    }
}

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
    getNearbyStores,
    updateStore,
    deleteStore
};
