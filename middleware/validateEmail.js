import User from "../models/User.js";

export const validateEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email || email.trim() === "") {
            return res.status(400).json({ message: "Email requis" });
        }

        const cleanedEmail = email.toLowerCase().trim();
        req.body.email = cleanedEmail;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(cleanedEmail)) {
            return res.status(400).json({ message: "Email invalide" });
        }

        const existing = await User.findOne({ email: cleanedEmail });
        if (existing) {
            return res.status(409).json({ message: "Email déjà utilisé" });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la validation de l'email",
            error: error.message
        });
    }
};