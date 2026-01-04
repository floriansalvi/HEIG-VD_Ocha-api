import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Product from "../models/product.js";
import User from "../models/user.js";

// --- Global variable for the in-memory MongoDB server ---
let mongoServer;

// -------------------------
// SETUP: In-Memory MongoDB
// -------------------------

/**
 * Set up the test environment before all tests.
 * Creates an in-memory MongoDB instance and connects mongoose to it.
 */
beforeAll(async () => {
    // Disconnect mongoose if already connected to avoid conflicts
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
  
    // Create an in-memory MongoDB server for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect mongoose to the in-memory database
    await mongoose.connect(uri);
});

/**
 * Clean up after all tests.
 * Disconnects mongoose and stops the in-memory MongoDB server.
 */
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// -------------------------
// CLEANUP: Clear database before each test
// -------------------------

/**
 * Clear all data from the database before each test.
 * Ensures test isolation and reproducibility.
 */
beforeEach(async () => {
    await Promise.all([
        Product.deleteMany({}),
        User.deleteMany({})
    ]);
});

// -------------------------
// UTILITY FUNCTIONS
// -------------------------

/**
 * Creates a new user and returns the user object along with a JWT token.
 * 
 * The password is automatically hashed by the User model's pre-save hook.
 * A login request is performed to obtain a valid JWT token.
 * 
 * @param {string} role - The role of the user ('admin' or 'user'). Defaults to 'admin'.
 * @returns {Promise<Object>} Object containing user instance and authentication token.
 */
async function createUser(role = "admin") {
    const user = new User({ 
        display_name: "Test User",
        email: `${role}@test.com`,
        password: "Password-123",
        role 
    });
    await user.save();

    // Perform login to obtain a valid JWT token
    const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({ email: user.email, password: "Password-123" });

    return { user, token: loginRes.body.token };
}

/**
 * Returns a valid product object for testing purposes.
 * 
 * Provides default values for all required fields and allows
 * overriding specific fields as needed.
 * 
 * @param {Object} overrides - Fields to override in the default product data.
 * @returns {Object} Complete product data object with all required fields.
 */
function getValidProductData(overrides = {}) {
    return {
        slug: "test-product",
        name: "Test Product",
        category: "Test Category",
        description: "Test Description",
        basePriceCHF: 10,
        image: "https://example.com/image.jpg",
        ...overrides
    };
}

// -------------------------
// PRODUCT API TESTS
// -------------------------
describe("Product API", () => {
    let token;

    /**
     * Create an admin user and obtain authentication token before each test.
     */
    beforeEach(async () => {
        const auth = await createUser("admin");
        token = auth.token;
    });

    // -------------------------
    // CREATE PRODUCT
    // -------------------------
    describe("POST /api/v1/products", () => {
        /**
         * Test: Successfully create a product with valid data.
         * 
         * Verifies that:
         * - Status code is 201 (Created)
         * - Response contains a product object with an _id
         * - Product name matches the input
         */
        it("should create a product", async () => {
            const res = await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${token}`)
                .send(getValidProductData({ slug: "product-1", name: "Product 1" }))
                .expect(201);

            expect(res.body).toHaveProperty("product");
            expect(res.body.product).toHaveProperty("_id");
            expect(res.body.product.name).toBe("Product 1");
        });

        /**
         * Test: Fail to create product when required fields are missing.
         * 
         * Verifies that:
         * - Status code is 400 (Bad Request)
         * - Error message contains "required"
         */
        it("should fail to create product with missing fields", async () => {
            const res = await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${token}`)
                .send({ basePriceCHF: 5 })
                .expect(400);

            expect(res.body).toHaveProperty("message");
            expect(res.body.message).toContain("required");
        });
    });

    // -------------------------
    // GET PRODUCT LIST
    // -------------------------
    describe("GET /api/v1/products", () => {
        /**
         * Test: Return empty list when no products exist.
         * 
         * Verifies that:
         * - Status code is 200 (OK)
         * - Products array is empty
         * - Total count is 0
         */
        
        it("should return empty list if no products", async () => {
            const res = await request(app).get("/api/v1/products").expect(200);

            expect(res.body.products).toEqual([]);
            expect(res.body.totalProducts).toBe(0);
        });

        /**
         * Test: Return list containing existing products.
         * 
         * Verifies that:
         * - Status code is 200 (OK)
         * - Products array contains the created product
         * - Product data matches input
         */
        it("should return list of products", async () => {
            const product = new Product(getValidProductData({ 
                slug: "prod2", 
                name: "Prod2", 
                basePriceCHF: 20 
            }));
            
            await product.save();

            const res = await request(app).get("/api/v1/products").expect(200);
            expect(res.body.products.length).toBe(1);
            expect(res.body.products[0].name).toBe("Prod2");
        });
    });

    // -------------------------
    // GET SINGLE PRODUCT
    // -------------------------
    describe("GET /api/v1/products/:id", () => {
        /**
         * Test: Retrieve a single product by its ID.
         * 
         * Verifies that:
         * - Status code is 200 (OK)
         * - Response contains the correct product
         * - Product data matches the stored data
         */
        it("should get product by id", async () => {
            const product = new Product(getValidProductData({ 
                slug: "prod3", 
                name: "Prod3", 
                basePriceCHF: 30 
            }));

            await product.save();

            const res = await request(app)
                .get(`/api/v1/products/${product._id}`)
                .expect(200);
            
            expect(res.body.product.name).toBe("Prod3");
        });

        /**
         * Test: Return 404 when product doesn't exist.
         * 
         * Verifies that:
         * - Status code is 404 (Not Found)
         * - Response contains an error message
         */
        it("should return 404 for non-existent product", async () => {
            const res = await request(app)
                .get(`/api/v1/products/${new mongoose.Types.ObjectId()}`)
                .expect(404);

            expect(res.body).toHaveProperty("message");
        });
    });

    // -------------------------
    // UPDATE PRODUCT
    // -------------------------
    describe("PATCH /api/v1/products/:id", () => {
        /**
         * Test: Successfully update an existing product.
         * 
         * Verifies that:
         * - Status code is 200 (OK)
         * - Updated field reflects the new value
         * - Other fields remain unchanged
         */
        it("should update a product", async () => {
            const product = new Product(getValidProductData({ 
                slug: "prod4", 
                name: "Prod4", 
                basePriceCHF: 40 
            }));

            await product.save();

            const res = await request(app)
                .patch(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ basePriceCHF: 50 })
                .expect(200);

            expect(res.body.product.basePriceCHF).toBe(50);
        });

        /**
         * Test: Return 404 when updating non-existent product.
         * 
         * Verifies that:
         * - Status code is 404 (Not Found)
         * - Response contains an error message
         */
        it("should return 404 when updating non-existent product", async () => {
            const res = await request(app)
                .patch(`/api/v1/products/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ basePriceCHF: 60 })
                .expect(404);

            expect(res.body).toHaveProperty("message");
        });
    });

    // -------------------------
    // DELETE PRODUCT
    // -------------------------
    describe("DELETE /api/v1/products/:id", () => {
        /**
         * Test: Successfully delete an existing product.
         * 
         * Verifies that:
         * - Status code is 204 (No Content)
         * - Product is removed from the database
         */
        it("should delete a product", async () => {
            const product = new Product(getValidProductData({ 
                slug: "prod5", 
                name: "Prod5", 
                basePriceCHF: 50 
            }));

            await product.save();

            await request(app)
                .delete(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        
            // Verify that the product was actually removed from the database
            const deletedProduct = await Product.findById(product._id);
            expect(deletedProduct).toBeNull();
        });

        /**
         * Test: Return 404 when deleting non-existent product.
         * 
         * Verifies that:
         * - Status code is 404 (Not Found)
         * - Response contains an error message
         */
        it("should return 404 when deleting non-existent product", async () => {
            const res = await request(app)
                .delete(`/api/v1/products/${new mongoose.Types.ObjectId()}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(404);

            expect(res.body).toHaveProperty("message");
        });
    });
});