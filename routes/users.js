// import express from "express";

// const router = express.Router();

// router.get("/", function (req, res, next) {
//   res.send("Got a response from the users route");
// });

// export default router;

import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Créer un compte
router.post("/register", register);

// Se connecter
router.post("/login", login);

export default router;
