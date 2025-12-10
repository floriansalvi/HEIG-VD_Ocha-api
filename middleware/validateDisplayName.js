import User from "../models/user.js";

export const validateDisplayName = async (req, res, next) => {
    try {
        const { display_name } = req.body;

        if (!display_name || display_name.trim() === "") {
            return res.status(400).json({
                message: "Nom d'utilisateur requis"
            });
        }

        const cleanedDisplayName = display_name.trim();
        req.body.display_name = cleanedDisplayName;

        if (cleanedDisplayName.length < 3 || cleanedDisplayName.length > 30) {
            return res.status(400).json({
                message: "Le nom d'utilisateur doit contenir entre 3 et 30 caractères"
            });
        }

        const displayNameRegex = /^[a-zA-Z0-9_]+$/;
        if(!displayNameRegex.test(cleanedDisplayName)) {
            return res.status(400).json({
                message: "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des underscores"
            });
        }

        const existing = await User.findOne({ display_name: cleanedDisplayName });
        if (existing) {
            return res.status(409).json({
                message: "Nom d'utilisateur déjà utilisé"
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la validation du nom d'utilisateur",
            error: error.message
        });
    }
};