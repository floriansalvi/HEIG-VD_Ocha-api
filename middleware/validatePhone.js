import User from "../models/User.js";

export const validatePhone = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.trim() === "") {
            return next();
        }

        const cleanedPhone = phone.replace(/[^\d]/g, "");

        if (!cleanedPhone || cleanedPhone.length < 8) {
            return res.status(400).json({
                message: "Numéro de téléphone invalide"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la validation du numéro de téléphone",
            error: error.message
        });
    }
};