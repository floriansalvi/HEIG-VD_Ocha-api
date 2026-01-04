import Product from "../../models/product.js";
import User from "../../models/user.js";
import Store from "../../models/store.js";
import Order from "../../models/order.js";
import OrderItem from "../../models/orderItem.js";

/**
 * Clean up all database collections.
 * 
 * @returns {Promise<void>}
 */
export const cleanUpDatabase = async () => {
    await Promise.all([
        Product.deleteMany({}),
        User.deleteMany({}),
        Store.deleteMany({}),
        Order.deleteMany({}),
        OrderItem.deleteMany({})
    ]);
};

/**
 * Clean up specific collections.
 * 
 * @param {Array<string>} collections - Names of collections to clean
 * @returns {Promise<void>}
 */
export const cleanUpCollections = async (collections = []) => {
    const cleanupMap = {
        products: () => Product.deleteMany({}),
        users: () => User.deleteMany({}),
        stores: () => Store.deleteMany({}),
        orders: () => Order.deleteMany({}),
        orderItems: () => OrderItem.deleteMany({})
    };

    const cleanupPromises = collections
        .filter(col => cleanupMap[col])
        .map(col => cleanupMap[col]());

    await Promise.all(cleanupPromises);
};