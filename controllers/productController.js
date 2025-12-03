import Product from "../models/product.js";

const handleMongooseError = (res, error) => {
    if (error.name === "ValidationError") {
        return res.status(422).json({
            message: "Données invalides",
            error: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Conflit de données (slug déjà utilisé)",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "Erreur interne du serveur",
        error: error.message
    });
};

// POST /products
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
                message: "slug, name, category, description, basePriceCHF et image sont requis"
            });
        }

        const existingSlug = await Product.findOne({ slug });
        if (existingSlug) {
            return res.status(409).json({ message: "Slug déjà utilisé" });
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
            message: "Produit créé",
            product
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// GET /products
// option: /products?active=true
const getProducts = async (req, res) => {
    try {
        const { active } = req.query;
        let products;

        if (active === "true") {
            products = await Product.findActive();
        } else {
            products = await Product.find();
        }

        return res.status(200).json({
            message: "Liste des produits",
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur interne du serveur",
            error: error.message
        });
    }
};

// GET /products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        return res.status(200).json({
            message: "Produit trouvé",
            product
        });
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

// PATCH /products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
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
            message: "Produit mis à jour",
            product
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// DELETE /products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Produit introuvable" });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

export const productController = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};