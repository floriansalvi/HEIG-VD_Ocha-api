// seeders/seedProducts.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ocha-dev";

const productsData = [
    {
        slug: "classic-matcha-latte",
        name: "Classic Matcha Latte",
        category: "Matcha",
        description: "Matcha latte classique, équilibré et crémeux.",
        basePriceCHF: 5.9,
        isActive: true,
        image: "classic-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "vanilla-matcha-latte",
        name: "Vanilla Matcha Latte",
        category: "Matcha",
        description: "Matcha latte doux avec une touche de vanille.",
        basePriceCHF: 6.3,
        isActive: true,
        image: "vanilla-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "coconut-matcha-latte",
        name: "Coconut Matcha Latte",
        category: "Matcha",
        description: "Matcha latte infusé au lait de coco pour une note exotique.",
        basePriceCHF: 6.3,
        isActive: true,
        image: "coconut-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "lavender-matcha-latte",
        name: "Lavender Matcha Latte",
        category: "Matcha",
        description: "Matcha latte aromatisé à la lavande, floral et apaisant.",
        basePriceCHF: 6.9,
        isActive: true,
        image: "lavender-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "strawberry-matcha-latte",
        name: "Strawberry Matcha Latte",
        category: "Matcha",
        description: "Matcha latte fruité avec purée de fraise.",
        basePriceCHF: 6.5,
        isActive: true,
        image: "strawberry-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "apricot-matcha-latte",
        name: "Apricot Matcha Latte",
        category: "Matcha",
        description: "Matcha latte avec une touche d’abricot juteux.",
        basePriceCHF: 6.9,
        isActive: true,
        image: "apricot-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "mixed-berries-matcha-latte",
        name: "Mixed Berries Matcha Latte",
        category: "Matcha",
        description: "Matcha latte aux fruits rouges, acidulé et gourmand.",
        basePriceCHF: 7.1,
        isActive: true,
        image: "mixed-berries-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "acai-matcha-latte",
        name: "Acai Matcha Latte",
        category: "Matcha",
        description: "Matcha latte boosté à l’açaï pour une dose d’énergie.",
        basePriceCHF: 6.9,
        isActive: true,
        image: "acai-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "mango-matcha-latte",
        name: "Mango Matcha Latte",
        category: "Matcha",
        description: "Matcha latte tropical à la mangue.",
        basePriceCHF: 6.5,
        isActive: true,
        image: "mango-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    },
    {
        slug: "blueberry-matcha-latte",
        name: "Blueberry Matcha Latte",
        category: "Matcha",
        description: "Matcha latte gourmand aux myrtilles.",
        basePriceCHF: 6.5,
        isActive: true,
        image: "blueberry-matcha-latte.jpg",
        size: ["S", "M", "L"],
        extra_chf: { S: 0, M: 2, L: 3 }
    }
];

const seedProducts = async () => {
    try {
        console.log("Connexion à MongoDB...");
        await mongoose.connect(MONGO_URI);

        console.log("Suppression des produits existants...");
        await Product.deleteMany();

        console.log("Insertion des nouveaux produits (matchas)...");
        const createdProducts = await Product.insertMany(productsData);

        console.log(`Seed terminé : ${createdProducts.length} produits créés.`);
        process.exit(0);
    } catch (error) {
        console.error("Erreur lors du seed des produits :", error.message);
        process.exit(1);
    }
};

seedProducts();
