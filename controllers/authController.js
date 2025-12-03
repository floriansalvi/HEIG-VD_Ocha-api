import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const register = async (req, res) => {
    try {
        const { email, password, display_name, phone } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: "Email déjà utilisé" });
        }

        const existingDisplayName = await User.findOne({ display_name });
        if (existingDisplayName) {
            return res.status(409).json({ message: "Nom d'utilisateur déjà utilisé" });
        }

        const user = new User({
            email,
            password,
            display_name,
            phone
        });

        await user.save();

        const token = generateToken(user);

        return res.status(201).json({
            message: "Utilisateur créé",
            token,
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Une erreur est survenue : ",
            error: error.message
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Une erreur est survenue : ",
            error: error.message
        });
    }
};

export const authController = {
    register,
    login
};