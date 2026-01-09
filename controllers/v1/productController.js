import Product from "../../models/product.js";
import cloudinary from "../../config/cloudinary.js";

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
            message: "Data conflict",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "An unexpected error occurred",
        error: error.message
    });
};

/**
 * Retrieve a paginated list of products.
 *
 * Supports optional filtering by active status.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing paginated products.
 */
const getProducts = async (req, res) => {
    try {
        const { active } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};
        if (active === 'true') filter.isActive = true;

        const products = await Product.find(filter)
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            message: "List of products",
            page,
            totalPages: Math.ceil(totalProducts / limit),
            totalProducts,
            products
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Retrieve a single product by its identifier.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the product.
 */
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            message: "Product found",
            product
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Create a new product.
 *
 * This controller:
 * - validates required fields
 * - ensures slug uniqueness
 * - creates and persists the product
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the created product.
 */
const createProduct = async (req, res) => {
    try {
        const {
            slug,
            name,
            category,
            description,
            basePriceCHF,
            isActive,
            image,
            size,
            extra_chf
        } = req.body;

        if (!slug || !name || !category || !description || basePriceCHF === undefined || !image) {
            return res.status(400).json({
                message: "slug, name, category, description, basePriceCHF and image are required"
            });
        }

        const existingSlug = await Product.findOne({ slug });
        if (existingSlug) {
            return res.status(409).json({ message: "Slug already in use" });
        }

        const existingName = await Product.findOne({ name });
        if (existingName) {
            return res.status(409).json({ message: "Name already in use" });
        }

        const product = new Product({
            slug,
            name,
            category,
            description,
            basePriceCHF,
            isActive,
            image,
            size,
            extra_chf
        });

        await product.save();

        return res.status(201).json({
            message: "Product created",
            product
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Update an existing product.
 *
 * Only predefined fields can be updated.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the updated product.
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatableFields = [
            "slug",
            "name",
            "category",
            "description",
            "basePriceCHF",
            "isActive",
            "image",
            "size",
            "extra_chf"
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        return res.status(200).json({
            message: "Product updated",
            product
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Delete a product by its identifier.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {void}
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(204).send();
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

const uploadProductImage = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        const { image } = req.body;
        if (!image) return res.status(400).json({ message: "Image is required" });

        const result = await cloudinary.uploader.upload(image, {
            folder: "products",
            public_id: product.slug,
            overwrite: true,
            transformation: [
                { width: 500, height: 500, crop: "fill", gravity: "auto" },
                { fetch_format: "auto", quality: "auto" }
            ]
        });

        product.image = result.secure_url;
        await product.save();

        return res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url
        });

    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Product item controller.
 *
 * Groups all product-related controller methods.
 */
export const productController = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
};