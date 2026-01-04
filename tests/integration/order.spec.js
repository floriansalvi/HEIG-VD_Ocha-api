import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import Order from "../../models/order.js";
import OrderItem from "../../models/orderItem.js";
import { connectTestDb, closeTestDb, clearTestDb } from "../setup/testDB.js";
import { createUserWithToken, createProduct, createStore } from "../helpers/index.js";

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
// ORDER API TESTS
// -------------------------
describe("Order API", () => {
    let adminToken;
    let userToken;
    let adminUser;
    let normalUser;
    let store;
    let product;

    /**
     * Create test users, store, and product before each test.
     */
    beforeEach(async () => {
        const admin = await createUserWithToken({ role: "admin" });
        const user = await createUserWithToken({ role: "user" });
        
        adminToken = admin.token;
        userToken = user.token;
        adminUser = admin.user;
        normalUser = user.user;

        store = await createStore();
        product = await createProduct();
    });

    // -------------------------
    // CREATE ORDER
    // -------------------------
    describe("POST /api/v1/orders", () => {
        /**
         * Test: Successfully create an order with valid data.
         * 
         * Verifies that:
         * - Status code is 201 (Created)
         * - Order is created with correct user_id
         * - Total price is calculated
         * - OrderItems are created
         */
        it("should create an order with valid data", async () => {
            const res = await request(app)
                .post("/api/v1/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    store_id: store._id,
                    pickup: new Date(),
                    items: [
                        {
                            product_id: product._id,
                            size: "M"
                        }
                    ]
                })
                .expect(201);

            expect(res.body.order).toBeDefined();
            expect(res.body.order.user_id._id).toBe(normalUser._id.toString());
            expect(res.body.order.total_price_chf).toBeGreaterThan(0);

            const orderItems = await OrderItem.find({
                order_id: res.body.order._id
            });
            expect(orderItems).toHaveLength(1);
        });

        /**
         * Test: Fail to create order without authentication.
         */
        it("should fail without authentication", async () => {
            await request(app)
                .post("/api/v1/orders")
                .send({})
                .expect(401);
        });

        /**
         * Test: Fail to create order with missing required fields.
         */
        it("should fail with missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({})
                .expect(400);

            expect(res.body.message).toContain("store_id");
        });

        /**
         * Test: Fail to create order if store does not exist.
         */
        it("should fail if store does not exist", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post("/api/v1/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    store_id: fakeId,
                    pickup: new Date(),
                    items: [
                        {
                            product_id: product._id,
                            size: "M"
                        }
                    ]
                })
                .expect(404);

            expect(res.body.message).toBe("Store not found");
        });
    });

    // -------------------------
    // GET MY ORDERS
    // -------------------------
    describe("GET /api/v1/orders/me", () => {
        /**
         * Test: Return empty list when user has no orders.
         */
        it("should return empty list when user has no orders", async () => {
            const res = await request(app)
                .get("/api/v1/orders/me")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.orders).toEqual([]);
            expect(res.body.totalOrders).toBe(0);
        });

        /**
         * Test: Return only the authenticated user's orders.
         * 
         * Verifies that:
         * - User sees only their own orders
         * - Other users' orders are not included
         */
        it("should return user's orders only", async () => {
            await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 20
            });

            await Order.create({
                user_id: adminUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 30
            });

            const res = await request(app)
                .get("/api/v1/orders/me")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.orders).toHaveLength(1);
            expect(res.body.orders[0].user_id).toBe(normalUser._id.toString());
        });

        /**
         * Test: Fail without authentication.
         */
        it("should fail without authentication", async () => {
            await request(app)
                .get("/api/v1/orders/me")
                .expect(401);
        });
    });

    // -------------------------
    // GET ORDER BY ID
    // -------------------------
    describe("GET /api/v1/orders/:id", () => {
        /**
         * Test: Retrieve a single order by its ID.
         */
        it("should retrieve an order by id", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 25
            });

            const res = await request(app)
                .get(`/api/v1/orders/${order._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.order._id).toBe(order._id.toString());
        });

        /**
         * Test: Return 404 for non-existent order.
         */
        it("should return 404 for non-existent order", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/v1/orders/${fakeId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(404);

            expect(res.body.message).toBe("Order not found");
        });

        /**
         * Test: Return 400 for invalid ID format.
         */
        it("should return 400 for invalid id format", async () => {
            const res = await request(app)
                .get("/api/v1/orders/invalid-id")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(400);

            expect(res.body.message).toContain("invalid");
        });
    });

    // -------------------------
    // UPDATE ORDER STATUS (ADMIN)
    // -------------------------
    describe("PATCH /api/v1/orders/:id/status", () => {
        /**
         * Test: Admin can update order status.
         */
        it("should update order status as admin", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 40
            });

            const res = await request(app)
                .patch(`/api/v1/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "prête" })
                .expect(200);

            expect(res.body.order.status).toBe("prête");
        });

        /**
         * Test: Non-admin user cannot update order status.
         */
        it("should fail for non-admin user", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 40
            });

            await request(app)
                .patch(`/api/v1/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ status: "prête" })
                .expect(403);
        });
    });

    // -------------------------
    // GET ORDER STATS (ADMIN)
    // -------------------------
    describe("GET /api/v1/orders/stats", () => {
        /**
         * Test: Admin can retrieve order statistics.
         */
        it("should return order statistics for admin", async () => {
            await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 10
            });

            const res = await request(app)
                .get("/api/v1/orders/stats")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.stats).toBeInstanceOf(Array);
            expect(res.body.stats[0]).toHaveProperty("totalOrders");
        });

        /**
         * Test: Non-admin user cannot access statistics.
         */
        it("should fail for non-admin user", async () => {
            await request(app)
                .get("/api/v1/orders/stats")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(403);
        });
    });

    // -------------------------
    // DELETE ORDER
    // -------------------------
    describe("DELETE /api/v1/orders/:id", () => {
        /**
         * Test: Successfully delete an order and its associated items.
         * 
         * Verifies that:
         * - Order is deleted from database
         * - Associated OrderItems are also deleted
         */
        it("should delete an order and its items", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 30
            });

            await OrderItem.create({
                order_id: order._id,
                product_id: product._id,
                size: "M"
            });

            await request(app)
                .delete(`/api/v1/orders/${order._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(204);

            const deletedOrder = await Order.findById(order._id);
            const deletedItems = await OrderItem.find({ order_id: order._id });

            expect(deletedOrder).toBeNull();
            expect(deletedItems).toHaveLength(0);
        });

        /**
         * Test: Return 404 when deleting non-existent order.
         */
        it("should return 404 for non-existent order", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/v1/orders/${fakeId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(404);

            expect(res.body.message).toBe("Order not found");
        });
    });
});