import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

/**
 * Connect to the in-memory database.
 * Creates a new MongoMemoryServer instance and connects mongoose to it.
 * 
 * @returns {Promise<void>}
 */
export const connectTestDb = async () => {
    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
};

/**
 * Drop database, close the connection and stop mongod.
 * 
 * @returns {Promise<void>}
 */
export const closeTestDb = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};

/**
 * Remove all data from all collections.
 * 
 * @returns {Promise<void>}
 */
export const clearTestDb = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};