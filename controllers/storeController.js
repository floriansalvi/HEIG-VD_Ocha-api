import Store from "../models/store.js";

const handleMongooseError = (res, error) => {
    if (error.name === "ValidationError") {
        return res.status(422).json({
            message: "Données invalides",
            error: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Conflit de données (doublon)",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "Erreur interne du serveur",
        error: error.message
    });
};

// POST /stores
export const createStore = async (req, res) => {
    try {
        const { name, phone, email, address, location, opening_hours } = req.body;

        if (!name || !email || !address || !location) {
            return res.status(400).json({
                message: "name, email, address et location sont requis"
            });
        }

        const existingEmail = await Store.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email déjà utilisé pour un magasin" });
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
            message: "Magasin créé",
            store
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// GET /stores
export const getStores = async (req, res) => {
    try {
        const stores = await Store.find();
        return res.status(200).json({
            message: "Liste des magasins",
            stores
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur interne du serveur",
            error: error.message
        });
    }
};

// GET /stores/:id
export const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Magasin introuvable" });
        }

        return res.status(200).json({
            message: "Magasin trouvé",
            store
        });
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

// PATCH /stores/:id
export const updateStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Magasin introuvable" });
        }

        const updatableFields = ["name", "phone", "email", "address", "location", "opening_hours", "is_active"];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                store[field] = req.body[field];
            }
        });

        await store.save();

        return res.status(200).json({
            message: "Magasin mis à jour",
            store
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// DELETE /stores/:id
export const deleteStore = async (req, res) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);
        if (!store) {
            return res.status(404).json({ message: "Magasin introuvable" });
        }

        // suppression réussie, pas de contenu à renvoyer
        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};
