import Store from "../../models/store.js";
import mongoose from "mongoose";

/**
 * Génère un objet valide de store pour les tests
 * @param {Object} overrides - valeurs à surcharger
 * @returns {Object} storeData
 */
export const getValidStoreData = (overrides = {}) => {
    return {
        name: overrides.name || "Test Store",
        slug: overrides.slug || "test-store",
        phone: overrides.phone || "+41214445566",
        email: overrides.email || "store@test.com",
        address: {
            line1: overrides.line1 || "Rue de Test 1",
            city: overrides.city || "Lausanne",
            zipcode: overrides.zipcode || "1000",
            country: overrides.country || "Suisse"
        },
        location: {
            type: "Point",
            coordinates: overrides.coordinates || [6.629, 46.522] // [longitude, latitude]
        },
        is_active: overrides.is_active !== undefined ? overrides.is_active : true,
        opening_hours: overrides.opening_hours || [
            [],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["09:00", "17:00"],
            ["10:00", "16:00"]
        ],
        ...overrides
    };
};

/**
 * Crée un store en base pour les tests
 * @param {Object} overrides - valeurs à surcharger
 * @returns {Promise<Store>}
 */
export const createStore = async (overrides = {}) => {
    const storeData = getValidStoreData(overrides);
    const store = await Store.create(storeData);
    return store;
};
