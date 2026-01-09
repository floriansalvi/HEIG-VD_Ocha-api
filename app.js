import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import yaml from "js-yaml";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import indexRouter from "./routes/v1/index.js";
import ordersRouter from "./routes/v1/orders.js";
import productsRouter from "./routes/v1/products.js";
import storesRouter from "./routes/v1/stores.js";
import authRouter from "./routes/v1/auth.js";
import usersRouter from "./routes/v1/users.js";
import orderStatsRouter from "./routes/v1/orderStats.js";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// complete
app.use(cors());

const openApiDocument = yaml.load(fs.readFileSync("./docs/v1/openapi.yml", "utf8"));
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/v1", indexRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/stores", storesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/order-stats", orderStatsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB...", err));

export default app;