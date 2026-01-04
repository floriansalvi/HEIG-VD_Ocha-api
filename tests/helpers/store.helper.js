import Store from "../../models/store.js";

export const createStore = async (overrides = {}) => {
    return Store.create({
        name: "Test Store",
        email: "store@test.ch",
        address: {
            line1: "Rue de test 1",
            city: "Neuchâtel",
            zipcode: "2000",
            country: "CH"
        },
        location: {
            type: "Point",
            coordinates: [6.931, 46.989]
        },
        ...overrides
    });
};