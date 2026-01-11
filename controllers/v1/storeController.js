import Store from "../../models/store.js";
import mongoose from "mongoose";
import slugify from "slugify";
import { handleMongooseError } from "../../utils/errorHandler.js";

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

        const existingStore = await Store.findOne({
            $or: [
                { email: email.toLowerCase() },
                { name }
            ]
        });

        if (existingStore) {
            return res.status(409).json({ message: "Name or/and email already in use" });
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
        const { near, radius } = req.query;

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
            });

            return res.status(200).json({
                message: "Nearby stores",
                totalStores: stores.length,
                stores
            });
        }

        // Standard paginated listing
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
        return handleMongooseError(res, error);
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
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        return res.status(200).json({
            message: "Store found",
            store
        });
    } catch (error) {
        return handleMongooseError(res, error);
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

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        const updatableFields = ["name", "phone", "email", "address", "location", "opening_hours", "is_active"];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                store[field] = req.body[field];

                if (field === "name") {
                    store.slug = slugify(req.body.name, { lower: true });
                }
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
 * @return {Object} JSON response containing success message.
 */
const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const store = await Store.findByIdAndDelete(id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        return res.sendStatus(204);
    } catch (error) {
        return handleMongooseError(res, error);
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
