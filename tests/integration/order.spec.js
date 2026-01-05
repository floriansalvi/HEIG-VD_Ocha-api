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

beforeAll(async () => {
    await connectTestDb();
});

afterAll(async () => {
    await closeTestDb();
});

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

        it("should fail without authentication", async () => {
            await request(app)
                .post("/api/v1/orders")
                .send({})
                .expect(401);
        });

        it("should fail with missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .send({})
                .expect(400);

            expect(res.body.message).toContain("store_id");
        });

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
    // GET MY ORDERS (via users route)
    // -------------------------
    describe("GET /api/v1/users/me/orders", () => {
        it("should return empty list when user has no orders", async () => {
            const res = await request(app)
                .get("/api/v1/users/me/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.orders).toEqual([]);
            expect(res.body.totalOrders).toBe(0);
        });

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
                .get("/api/v1/users/me/orders")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(res.body.orders).toHaveLength(1);
            expect(res.body.orders[0].user_id).toBe(normalUser._id.toString());
        });

        it("should fail without authentication", async () => {
            await request(app)
                .get("/api/v1/users/me/orders")
                .expect(401);
        });
    });

    // -------------------------
    // GET ORDER BY ID
    // -------------------------
    describe("GET /api/v1/orders/:id", () => {
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

        it("should return 404 for non-existent order", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/v1/orders/${fakeId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(404);

            expect(res.body.message).toBe("Order not found");
        });

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
    describe("PATCH /api/v1/orders/:id", () => {
        it("should update order status as admin", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 40
            });

            const res = await request(app)
                .patch(`/api/v1/orders/${order._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "prête" })
                .expect(200);

            expect(res.body.order.status).toBe("prête");
        });

        it("should fail for non-admin user", async () => {
            const order = await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 40
            });

            await request(app)
                .patch(`/api/v1/orders/${order._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ status: "prête" })
                .expect(403);
        });
    });

    // -------------------------
    // GET ORDER STATS (ADMIN)
    // -------------------------
    describe("GET /api/v1/order-stats", () => {
        it("should return order statistics for admin", async () => {
            await Order.create({
                user_id: normalUser._id,
                store_id: store._id,
                pickup: new Date(),
                total_price_chf: 10
            });

            const res = await request(app)
                .get("/api/v1/order-stats")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(res.body.stats).toBeInstanceOf(Array);
            expect(res.body.stats[0]).toHaveProperty("totalOrders");
        });

        it("should fail for non-admin user", async () => {
            await request(app)
                .get("/api/v1/order-stats")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(403);
        });
    });

    // -------------------------
    // DELETE ORDER
    // -------------------------
    describe("DELETE /api/v1/orders/:id", () => {
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
