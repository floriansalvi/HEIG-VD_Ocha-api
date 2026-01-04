// seeders/seedStores.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/store.js";
import slugify from "slugify";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ocha-dev";

// Test data for stores
const storesData = [
    {
        name: "Ocha Lausanne Flon",
        slug: slugify("Ocha Lausanne Flon", { lower: true, strict: true }),
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
        // opening_hours is optional; if omitted, the default value from the schema will be used
        opening_hours: [
            [],                     // Dimanche : closed
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
        slug: slugify("Ocha Genève Rive", { lower: true, strict: true }),
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
            [],                     // Dimanche : closed
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
        slug: slugify("Ocha EPFL", { lower: true, strict: true }),
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
            [],                     // Dimanche : closed
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
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);

        console.log("Deleting existing stores...");
        await Store.deleteMany();

        console.log("Inserting new stores...");
        const createdStores = await Store.insertMany(storesData);

        console.log(` Seed completed: ${createdStores.length} stores created.`);
        process.exit(0);
    } catch (error) {
        console.error("Error during store seeding:", error.message);
        process.exit(1);
    }
};

seedStores();
