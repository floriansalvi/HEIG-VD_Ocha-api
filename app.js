import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import storeRouter from "./routes/store.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
import orderItemRouter from "./routes/orderItem.js";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/stores", storeRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/order-items", orderItemRouter);

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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB...", err));

// Start the server
// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;
