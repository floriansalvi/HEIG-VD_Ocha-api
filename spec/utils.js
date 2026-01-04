import Product from "../models/product.js";
import User from "../models/user.js";

export const cleanUpDatabase = async () => {
  await Promise.all([
    Product.deleteMany({}),
    User.deleteMany({})
  ]);
};