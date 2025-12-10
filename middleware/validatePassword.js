import User from "../models/user.js";

export const validatePassword = (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password || password.trim() === "") {
            return res.status(400).json({
                message: "Mot de passe requis"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins 8 caractères"
            });
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[\W_]/.test(password);

        if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
            return res.status(400).json({
                message: "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Erreur lors de la validation du mot de passe",
            error: error.message
        });
    }
};