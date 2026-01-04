import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import User from "../../../models/user.js";
import { connectTestDb, closeTestDb, clearTestDb } from "../../setup/testDB.js";
import { createUserWithToken } from "../../helpers/index.js";
import { validateDisplayName } from "../../../middleware/validateDisplayName.js";
import { validateEmail } from "../../../middleware/validateEmail.js";
import { validatePassword } from "../../../middleware/validatePassword";
import { validatePhone } from "../../../middleware/validatePhone.js";

let req, res, next;

beforeAll(async () => {
    await connectTestDb();
});

afterAll(async () => {
    await closeTestDb();
});

beforeEach(async () => {
    await clearTestDb();

    req = { body: {} };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    next = jest.fn();

    const user = await createUserWithToken({ role: "user" });
    userToken = user.token;
});

describe("validateDisplayName middleware", () => {

    it("should pass with valid display name", async () => {
        req.body.display_name = "Valid_Name";

        await validateDisplayName(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 for empty display name", async () => {
        req.body.display_name = "  ";

        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Display name is required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 for too short display name", async () => {
        req.body.display_name = "ab";

        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Display name must be between 3 and 30 characters" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 for too long display name", async () => {
        req.body.display_name = "a".repeat(31);

        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Display name must be between 3 and 30 characters" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid characters", async () => {
        req.body.display_name = "Invalid Name!";

        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Display name can only contain letters, numbers, and underscores" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 409 if display name is already used", async () => {
        // Crée un utilisateur avec ce display name
        await User.create({ display_name: "Taken_Name", email: "taken@test.com", password: "Password123!" });

        req.body.display_name = "Taken_Name";
        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Display name already used" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 if DB fails", async () => {
        // Simuler une erreur DB en patchant User.findOne
        const originalFindOne = User.findOne;
        User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

        req.body.display_name = "Any_Name";
        await validateDisplayName(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json.mock.calls[0][0].message).toBe("Error during display name validation");
        expect(next).not.toHaveBeenCalled();

        // Rétablir le findOne original
        User.findOne = originalFindOne;
    });
});

describe("validateEmail middleware", () => {

    it("should pass with valid email", async () => {
        req.body.email = "Test@Example.COM ";

        await validateEmail(req, res, next);

        expect(req.body.email).toBe("test@example.com");
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 if email is missing", async () => {
        await validateEmail(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if email is empty", async () => {
        req.body.email = "   ";

        await validateEmail(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Email is required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid email format", async () => {
        req.body.email = "invalid-email";

        await validateEmail(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid email" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 409 if email already exists", async () => {
        await User.create({
            display_name: "User1",
            email: "taken@example.com",
            password: "Password123!"
        });

        req.body.email = "taken@example.com";

        await validateEmail(req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: "Email already used" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 if DB fails", async () => {
        const spy = jest
            .spyOn(User, "findOne")
            .mockRejectedValue(new Error("DB error"));

        req.body.email = "test@example.com";

        await validateEmail(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Error during email validation"
            })
        );
        expect(next).not.toHaveBeenCalled();

        spy.mockRestore();
    });
});

describe("validatePassword middleware", () => {

    it("should pass with valid password", () => {
        req.body.password = "ValidPass1!";

        validatePassword(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 if password is missing", () => {
        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password is required"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password is empty", () => {
        req.body.password = "   ";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password is required"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password is too short", () => {
        req.body.password = "Aa1!";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least 8 characters"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password has no lowercase letter", () => {
        req.body.password = "PASSWORD1!";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password has no uppercase letter", () => {
        req.body.password = "password1!";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password has no number", () => {
        req.body.password = "Password!";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if password has no special character", () => {
        req.body.password = "Password1";

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 500 if an unexpected error occurs", () => {
        // Forcer une erreur en cassant req.body
        req.body = null;

        validatePassword(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Error during password validation"
            })
        );
        expect(next).not.toHaveBeenCalled();
    });
});

describe("validatePhone middleware", () => {

    it("should pass when phone is not provided", async () => {
        await validatePhone(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should pass when phone is empty", async () => {
        req.body.phone = "   ";

        await validatePhone(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should pass with valid phone number", async () => {
        req.body.phone = "+41 79 123 45 67";

        await validatePhone(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 400 for phone number with less than 8 digits", async () => {
        req.body.phone = "123-45";

        await validatePhone(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Invalid phone number"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should pass for phone number with exactly 8 digits", async () => {
        req.body.phone = "12345678";

        await validatePhone(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 500 if an unexpected error occurs", async () => {
        req.body.phone = "12345678";

        const originalReplace = String.prototype.replace;
        String.prototype.replace = () => {
            throw new Error("Unexpected error");
        };

        await validatePhone(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Error during phone number validation"
            })
        );
        expect(next).not.toHaveBeenCalled();

        // Restore
        String.prototype.replace = originalReplace;
    });
});