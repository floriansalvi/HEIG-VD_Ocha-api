import express from "express";
import createError from "http-errors";
import logger from "morgan";
import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';

import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import orderItemsRouter from "./routes/orderItems.js";
import productsRouter from "./routes/products.js";
import storesRouter from "./routes/stores.js";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/orders", ordersRouter);
app.use("/order-items", orderItemsRouter);
app.use("/products", productsRouter);
app.use("/stores", storesRouter);

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

//picture cloud
(async function() {

    cloudinary.config({
      secure: true
    });
    
    // Upload an image
    const images = [
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/classic-matcha-latte.png',
    id: 'classic-matcha-latte'
  },    
  {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369785/vailla-matcha-latte.png',
    id: 'vailla-matcha-latte'
  },
  {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369785/mango-matcha-latte.png',
    id: 'mango-matcha-latte'
  },
  {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369785/blueberry-matcha-latte.png',
    id: 'blueberry-matcha-latte'
  },
  {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369785/lavender-matcha-latte.png',
    id: 'lavender-matcha-latte'
  },
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/mixed-berries-matcha-latte.png',
    id: 'mixed-berries-matcha-latte'
  },
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/strawberry-matcha-latte.png',
    id: 'strawberry-matcha-latte'
  },
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/acai-matcha-latte.png',
    id: 'acai-matcha-latte'
  },
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/apricot-matcha-latte.png',
    id: 'apricot-matcha-latte'
  },
   {
    url: 'https://res.cloudinary.com/dabosy2w2/image/upload/v1765369784/coconut-matcha-latte.png',
    id: 'coconut-matcha-latte'
  }

];

for (const img of images) {
  try {
    const result = await cloudinary.uploader.upload(img.url, {
      public_id: img.id
    });
    console.log("Uploaded:", result.secure_url);
  } catch (err) {
    console.error("Error uploading", img.id, err);
  }
}
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();

//Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app;