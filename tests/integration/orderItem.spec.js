import request from "supertest";
import app from "../../app.js";
import Order from "../../models/order.js";
import OrderItem from "../../models/orderItem.js";
import { connectTestDb, closeTestDb, clearTestDb } from "../setup/testDB.js";
import { createStore, createMultipleProducts, createUserWithToken } from "../helpers/index.js";

describe("OrderItem API", () => {
    let order;
    let store;
    let products;
    let product1;
    let product2;
    let user;
    let userToken;

    // -------------------------
    // Connect / Disconnect DB
    // -------------------------
    beforeAll(async () => {
        await connectTestDb();
    });

    afterAll(async () => {
        await closeTestDb();
    });

    // -------------------------
    // Clear DB before each test
    // -------------------------
    beforeEach(async () => {
        await clearTestDb();

        const createdUser = await createUserWithToken({ role: "user" });
        user = createdUser.user;
        userToken = createdUser.token;

        store = await createStore();
        products = await createMultipleProducts(2);
        product1 = products[0];
        product2 = products[1];

        order = await Order.create({
            user_id: user._id,
            store_id: store._id,
            total_price_chf: 15,
            status: "en préparation",
            pickup: new Date(Date.now() + 3600 * 1000)
        });

        await OrderItem.create({
            order_id: order._id,
            product_id: product1._id,
            quantity: 2,
            total_price_chf: 10,
            size: "M"
        });
        await OrderItem.create({
            order_id: order._id,
            product_id: product2._id,
            quantity: 1,
            total_price_chf: 5,
            size: "L"
        });
    });

    // -------------------------
    // Tests
    // -------------------------
    it("should retrieve all items for a given order", async () => {
        const res = await request(app)
            .get(`/api/v1/orders/${order._id}/items`)
            .set("Authorization", `Bearer ${userToken}`)
            .expect(200);

        expect(res.body.message).toBe("List of items in the order");
        expect(res.body.items).toHaveLength(2);

        expect(res.body.items[0].product_id.name).toBeDefined();
        expect(res.body.items[1].product_id.name).toBeDefined();
    });

    it("should return 404 if order does not exist", async () => {
        const fakeId = "64c1f1f1f1f1f1f1f1f1f1f9";
        const res = await request(app)
            .get(`/api/v1/orders/${fakeId}/items`)
            .set("Authorization", `Bearer ${userToken}`)
            .expect(404);

        expect(res.body.message).toBe("Order not found");
    });

    it("should return 400 for invalid order ID", async () => {
        const res = await request(app)
            .get(`/api/v1/orders/invalid-id/items`)
            .set("Authorization", `Bearer ${userToken}`)
            .expect(400);

        expect(res.body.message).toBe("Invalid ID format");
    });
});