import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import Product from "../../models/product.js";
import { connectTestDb, closeTestDb, clearTestDb } from "../setup/testDB.js";
import { createUserWithToken, getValidProductData, createProduct } from "../helpers/index.js";

// -------------------------
// SETUP: In-Memory MongoDB
// -------------------------

/**
 * Set up the test environment before all tests.
 */
beforeAll(async () => {
    await connectTestDb();
});

/**
 * Clean up after all tests.
 */
afterAll(async () => {
    await closeTestDb();
});

/**
 * Clear all data from the database before each test.
 */
beforeEach(async () => {
    await clearTestDb();
});

// -------------------------
// PRODUCT API TESTS
// -------------------------
describe("Product API", () => {
    let adminToken;
    let userToken;

    /**
     * Create test users before each test.
     */
    beforeEach(async () => {
        const admin = await createUserWithToken({ role: "admin" });
        const user = await createUserWithToken({ role: "user" });
        adminToken = admin.token;
        userToken = user.token;
    });

    // -------------------------
    // CREATE PRODUCT
    // -------------------------
    describe("POST /api/v1/products", () => {
        /**
         * Test: Successfully create a product with valid data.
         */
        it("should create a product with valid data", async () => {
            const productData = getValidProductData({ 
                slug: "product-1", 
                name: "Product 1" 
            });

            const res = await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(productData)
                .expect(201);

            expect(res.body).toHaveProperty("product");
            expect(res.body.product).toHaveProperty("_id");
            expect(res.body.product.name).toBe("Product 1");
            expect(res.body.product.slug).toBe("product-1");
        });

        /**
         * Test: Fail to create product when required fields are missing.
         */
        it("should fail with missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ basePriceCHF: 5 })
                .expect(400);

            expect(res.body.message).toContain("required");
        });

        /**
         * Test: Fail to create product with duplicate slug.
         */
        it("should fail with duplicate slug", async () => {
            await createProduct({ slug: "duplicate-slug" });

            const res = await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(getValidProductData({ slug: "duplicate-slug" }))
                .expect(409);

            expect(res.body.message).toContain("Slug already used");
        });

        /**
         * Test: Fail without authentication.
         */
        it("should fail without authentication", async () => {
            await request(app)
                .post("/api/v1/products")
                .send(getValidProductData())
                .expect(401);
        });

        /**
         * Test: Fail with non-admin role.
         */
        it("should fail with user role (not admin)", async () => {
            await request(app)
                .post("/api/v1/products")
                .set("Authorization", `Bearer ${userToken}`)
                .send(getValidProductData())
                .expect(403);
        });
    });

    // -------------------------
    // GET PRODUCT LIST
    // -------------------------
    describe("GET /api/v1/products", () => {
        /**
         * Test: Return empty list when no products exist.
         */
        it("should return empty list when no products exist", async () => {
            const res = await request(app)
                .get("/api/v1/products")
                .expect(200);

            expect(res.body.products).toEqual([]);
            expect(res.body.totalProducts).toBe(0);
        });

        /**
         * Test: Return list containing existing products.
         */
        it("should return list of existing products", async () => {
            await createProduct({ 
                slug: "prod-1", 
                name: "Product 1" 
            });

            const res = await request(app)
                .get("/api/v1/products")
                .expect(200);

            expect(res.body.products).toHaveLength(1);
            expect(res.body.products[0].name).toBe("Product 1");
            expect(res.body.totalProducts).toBe(1);
        });

        /**
         * Test: Filter active products only.
         */
        it("should filter active products only", async () => {
            await createProduct({ slug: "active", isActive: true });
            await createProduct({ slug: "inactive", isActive: false });

            const res = await request(app)
                .get("/api/v1/products?active=true")
                .expect(200);

            expect(res.body.products).toHaveLength(1);
            expect(res.body.products[0].slug).toBe("active");
        });

        /**
         * Test: Paginate results correctly.
         */
        it("should paginate results correctly", async () => {
            // Create 15 products
            for (let i = 0; i < 15; i++) {
                await createProduct({ 
                    slug: `prod-${i}`, 
                    name: `Product ${i}` 
                });
            }

            const res = await request(app)
                .get("/api/v1/products?page=2&limit=10")
                .expect(200);

            expect(res.body.products).toHaveLength(5);
            expect(res.body.page).toBe(2);
            expect(res.body.totalPages).toBe(2);
            expect(res.body.totalProducts).toBe(15);
        });
    });

    // -------------------------
    // GET SINGLE PRODUCT
    // -------------------------
    describe("GET /api/v1/products/:id", () => {
        /**
         * Test: Retrieve a single product by its ID.
         */
        it("should retrieve product by id", async () => {
            const product = await createProduct({ 
                slug: "prod-3", 
                name: "Product 3" 
            });

            const res = await request(app)
                .get(`/api/v1/products/${product._id}`)
                .expect(200);
            
            expect(res.body.product.name).toBe("Product 3");
            expect(res.body.product._id).toBe(product._id.toString());
        });

        /**
         * Test: Return 404 when product doesn't exist.
         */
        it("should return 404 for non-existent product", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/v1/products/${fakeId}`)
                .expect(404);

            expect(res.body.message).toBe("Product not found");
        });

        /**
         * Test: Return 400 for invalid product ID format.
         */
        it("should return 400 for invalid id format", async () => {
            const res = await request(app)
                .get("/api/v1/products/invalid-id")
                .expect(400);

            expect(res.body.message).toContain("Invalid");
        });
    });

    // -------------------------
    // UPDATE PRODUCT
    // -------------------------
    describe("PATCH /api/v1/products/:id", () => {
        /**
         * Test: Successfully update an existing product.
         */
        it("should update product successfully", async () => {
            const product = await createProduct({ 
                slug: "prod-4", 
                basePriceCHF: 40 
            });

            const res = await request(app)
                .patch(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ basePriceCHF: 50 })
                .expect(200);

            expect(res.body.product.basePriceCHF).toBe(50);
        });

        /**
         * Test: Update multiple fields at once.
         */
        it("should update multiple fields", async () => {
            const product = await createProduct({ slug: "multi-update" });

            const res = await request(app)
                .patch(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ 
                    name: "Updated Name",
                    basePriceCHF: 99,
                    isActive: false 
                })
                .expect(200);

            expect(res.body.product.name).toBe("Updated Name");
            expect(res.body.product.basePriceCHF).toBe(99);
            expect(res.body.product.isActive).toBe(false);
        });

        /**
         * Test: Return 404 when updating non-existent product.
         */
        it("should return 404 for non-existent product", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .patch(`/api/v1/products/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ basePriceCHF: 60 })
                .expect(404);

            expect(res.body.message).toBe("Product not found");
        });

        /**
         * Test: Fail without authentication.
         */
        it("should fail without authentication", async () => {
            const product = await createProduct();

            await request(app)
                .patch(`/api/v1/products/${product._id}`)
                .send({ basePriceCHF: 50 })
                .expect(401);
        });

        /**
         * Test: Fail with non-admin role.
         */
        it("should fail with user role", async () => {
            const product = await createProduct();

            await request(app)
                .patch(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ basePriceCHF: 50 })
                .expect(403);
        });
    });

    // -------------------------
    // DELETE PRODUCT
    // -------------------------
    describe("DELETE /api/v1/products/:id", () => {
        /**
         * Test: Successfully delete an existing product.
         */
        it("should delete product successfully", async () => {
            const product = await createProduct({ slug: "to-delete" });

            await request(app)
                .delete(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(204);
        
            const deletedProduct = await Product.findById(product._id);
            expect(deletedProduct).toBeNull();
        });

        /**
         * Test: Return 404 when deleting non-existent product.
         */
        it("should return 404 for non-existent product", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/v1/products/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(404);

            expect(res.body.message).toBe("Product not found");
        });

        /**
         * Test: Fail without authentication.
         */
        it("should fail without authentication", async () => {
            const product = await createProduct();

            await request(app)
                .delete(`/api/v1/products/${product._id}`)
                .expect(401);
        });

        /**
         * Test: Fail with non-admin role.
         */
        it("should fail with user role", async () => {
            const product = await createProduct();

            await request(app)
                .delete(`/api/v1/products/${product._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(403);
        });

        /**
         * Test: Return 400 for invalid ID format.
         */
        it("should return 400 for invalid id format", async () => {
            const res = await request(app)
                .delete("/api/v1/products/invalid-id")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(400);

            expect(res.body.message).toContain("Invalid");
        });
    });
});