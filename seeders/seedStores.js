// seeders/seedStores.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/store.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ocha-dev";

// Données de test pour les magasins
const storesData = [
    {
        name: "Ocha Lausanne Flon",
        email: "lausanne-flon@ocha.ch",
        phone: "+41214445566",
        address: {
            line1: "Rue de Genève 21",
            city: "Lausanne",
            zipcode: "1003",
            country: "Suisse"
        },
        location: {
            type: "Point",
            // [longitude, latitude]
            coordinates: [6.629, 46.522]
        },
        // opening_hours facultatif, si tu l'enlèves il prendra la valeur par défaut du schema
        opening_hours: [
            [],                     // Dimanche : fermé
            ["09:00", "18:30"],     // Lundi
            ["09:00", "18:30"],     // Mardi
            ["09:00", "18:30"],     // Mercredi
            ["09:00", "20:00"],     // Jeudi
            ["09:00", "20:00"],     // Vendredi
            ["10:00", "18:00"]      // Samedi
        ],
        is_active: true
    },
    {
        name: "Ocha Genève Rive",
        email: "geneve-rive@ocha.ch",
        phone: "+41225556677",
        address: {
            line1: "Rue du Rhône 12",
            city: "Genève",
            zipcode: "1204",
            country: "Suisse"
        },
        location: {
            type: "Point",
            coordinates: [6.149, 46.203]
        },
        opening_hours: [
            [],                     // Dimanche : fermé
            ["09:30", "19:00"],     // Lundi
            ["09:30", "19:00"],     // Mardi
            ["09:30", "19:00"],     // Mercredi
            ["09:30", "20:00"],     // Jeudi
            ["09:30", "20:00"],     // Vendredi
            ["10:00", "18:30"]      // Samedi
        ],
        is_active: true
    },
    {
        name: "Ocha EPFL",
        email: "epfl@ocha.ch",
        phone: "+41216996969",
        address: {
            line1: "Route Cantonale",
            city: "Lausanne",
            zipcode: "1015",
            country: "Suisse"
        },
        location: {
            type: "Point",
            coordinates: [6.566, 46.519]
        },
        opening_hours: [
            [],                     // Dimanche : fermé
            ["09:00", "18:30"],     // Lundi
            ["09:00", "18:30"],     // Mardi
            ["09:00", "18:30"],     // Mercredi
            ["09:00", "20:00"],     // Jeudi
            ["09:00", "20:00"],     // Vendredi
            ["10:00", "18:00"]      // Samedi
        ],
        is_active: true
    }
];

const seedStores = async () => {
    try {
        console.log("Connexion à MongoDB...");
        await mongoose.connect(MONGO_URI);

        console.log("Suppression des magasins existants...");
        await Store.deleteMany();

        console.log("Insertion des nouveaux magasins...");
        const createdStores = await Store.insertMany(storesData);

        console.log(` Seed terminé : ${createdStores.length} magasins créés.`);
        process.exit(0);
    } catch (error) {
        console.error("Erreur lors du seed des magasins :", error.message);
        process.exit(1);
    }
};

seedStores();
