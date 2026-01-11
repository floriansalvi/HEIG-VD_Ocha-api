import request from "supertest";
import mongoose from "mongoose";
import app from "../../app.js";
import Store from "../../models/store.js";
import { connectTestDb, closeTestDb, clearTestDb } from "../setup/testDB.js";
import { createUserWithToken, getValidStoreData, createStore } from "../helpers/index.js";

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
// STORE API TESTS
// -------------------------
describe("Store API", () => {
    let adminToken;
    let userToken;

    beforeEach(async () => {
        const admin = await createUserWithToken({ role: "admin" });
        const user = await createUserWithToken({ role: "user" });
        adminToken = admin.token;
        userToken = user.token;
    });

    // -------------------------
    // CREATE STORE
    // -------------------------
    describe("POST /api/v1/stores", () => {
        it("should create a store with valid data", async () => {
            const storeData = getValidStoreData({ slug: "store-1", name: "Store 1" });

            const res = await request(app)
                .post("/api/v1/stores")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(storeData)
                .expect(201);

            expect(res.body).toHaveProperty("store");
            expect(res.body.store).toHaveProperty("_id");
            expect(res.body.store.name).toBe("Store 1");
            expect(res.body.store.slug).toBe("store-1");
        });

        it("should fail with missing required fields", async () => {
            const res = await request(app)
                .post("/api/v1/stores")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ phone: "+41234567890" })
                .expect(400);

            expect(res.body.message).toContain("required");
        });

        it("should fail without authentication", async () => {
            await request(app)
                .post("/api/v1/stores")
                .send(getValidStoreData())
                .expect(401);
        });

        it("should fail with non-admin role", async () => {
            await request(app)
                .post("/api/v1/stores")
                .set("Authorization", `Bearer ${userToken}`)
                .send(getValidStoreData())
                .expect(403);
        });
    });

    // -------------------------
    // GET STORE LIST
    // -------------------------
    describe("GET /api/v1/stores", () => {
        it("should return empty list when no stores exist", async () => {
            const res = await request(app).get("/api/v1/stores").expect(200);
            expect(res.body.stores).toEqual([]);
            expect(res.body.totalStores).toBe(0);
        });

        it("should return list containing existing stores", async () => {
            await createStore({ slug: "store-1", name: "Store 1" });
            const res = await request(app).get("/api/v1/stores").expect(200);
            expect(res.body.stores).toHaveLength(1);
            expect(res.body.stores[0].name).toBe("Store 1");
            expect(res.body.totalStores).toBe(1);
        });

        it("should filter stores by near parameter", async () => {
            await createStore({
                name: "Nearby Store",
                location: { type: "Point", coordinates: [6.629, 46.522] }
            });

            const res = await request(app)
                .get("/api/v1/stores?near=6.629,46.522&radius=1000")
                .expect(200);

            expect(res.body.stores).toHaveLength(1);
            expect(res.body.stores[0].name).toBe("Nearby Store");
        });

        it("should paginate results correctly", async () => {
            for (let i = 0; i < 15; i++) {
                await createStore({ slug: `store-${i}`, name: `Store ${i}` });
            }

            const res = await request(app)
                .get("/api/v1/stores?page=2&limit=10")
                .expect(200);

            expect(res.body.stores).toHaveLength(5);
            expect(res.body.page).toBe(2);
            expect(res.body.totalPages).toBe(2);
            expect(res.body.totalStores).toBe(15);
        });
    });

    // -------------------------
    // GET SINGLE STORE
    // -------------------------
    describe("GET /api/v1/stores/:id", () => {
        it("should retrieve store by id", async () => {
            const store = await createStore({ name: "Store X" });

            const res = await request(app)
                .get(`/api/v1/stores/${store._id}`)
                .expect(200);

            expect(res.body.store.name).toBe("Store X");
            expect(res.body.store._id).toBe(store._id.toString());
        });

        it("should return 404 for non-existent store", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .get(`/api/v1/stores/${fakeId}`)
                .expect(404);

            expect(res.body.message).toBe("Store not found");
        });

        it("should return 400 for invalid id format", async () => {
            const res = await request(app)
                .get("/api/v1/stores/invalid-id")
                .expect(400);

            expect(res.body.message).toContain("Invalid");
        });
    });

    // -------------------------
    // PATCH STORE
    // -------------------------
    describe("PATCH /api/v1/stores/:id", () => {
        it("should update store successfully", async () => {
            const store = await createStore({ name: "Store Update" });

            const res = await request(app)
                .patch(`/api/v1/stores/${store._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ phone: "+41214445555" })
                .expect(200);

            expect(res.body.store.phone).toBe("+41214445555");
        });

        it("should update multiple fields", async () => {
            const store = await createStore({ name: "Multi Update", slug: "multi-update" });

            const res = await request(app)
                .patch(`/api/v1/stores/${store._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Updated Name", phone: "+41210000000" })
                .expect(200);

            expect(res.body.store.name).toBe("Updated Name");
            expect(res.body.store.slug).toBe("updated-name");
            expect(res.body.store.phone).toBe("+41210000000");
        });

        it("should fail for non-admin role", async () => {
            const store = await createStore();

            await request(app)
                .patch(`/api/v1/stores/${store._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ phone: "+41214445555" })
                .expect(403);
        });

        it("should return 404 for non-existent store", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .patch(`/api/v1/stores/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ phone: "+41214445555" })
                .expect(404);

            expect(res.body.message).toBe("Store not found");
        });

        it("should fail without authentication", async () => {
            const store = await createStore();

            await request(app)
                .patch(`/api/v1/stores/${store._id}`)
                .send({ phone: "+41214445555" })
                .expect(401);
        });
    });

    // -------------------------
    // DELETE STORE
    // -------------------------
    describe("DELETE /api/v1/stores/:id", () => {
        it("should delete store successfully", async () => {
            const store = await createStore({ name: "Store Delete" });

            await request(app)
                .delete(`/api/v1/stores/${store._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(204);

            const deletedStore = await Store.findById(store._id);
            expect(deletedStore).toBeNull();
        });

        it("should fail with non-admin role", async () => {
            const store = await createStore();

            await request(app)
                .delete(`/api/v1/stores/${store._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .expect(403);
        });

        it("should return 404 for non-existent store", async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .delete(`/api/v1/stores/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(404);

            expect(res.body.message).toBe("Store not found");
        });

        it("should return 400 for invalid id format", async () => {
            const res = await request(app)
                .delete("/api/v1/stores/invalid-id")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(400);

            expect(res.body.message).toContain("Invalid");
        });

        it("should fail without authentication", async () => {
            const store = await createStore();

            await request(app)
                .delete(`/api/v1/stores/${store._id}`)
                .expect(401);
        });
    });
});