import mongoose from "mongoose";
import Product from "./product.model.js";

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    product_name: {
        type: String,  // snapshot du nom du produit
        required: true
    },
    size: {
        type: String,
        enum: ["S", "M", "L"],
        required: true
    },
    base_price_chf: {
        type: Number,
        required: true
    },
    extra_chf: {
        type: Number,
        default: 0
    },
    final_price_chf: {
        type: Number,
        required: true
    }
}, { timestamps: true });


orderItemSchema.pre("validate", async function (next) {
    // récupérer le produit
    const product = await Product.findById(this.product_id);

    if (!product) {
        return next(new Error("Produit introuvable"));
    }

    // snapshot du nom
    this.product_name = product.name;

    // calcul des prix
    this.base_price_chf = product.basePriceCHF;
    this.extra_chf = product.extra_chf?.[this.size] || 0;
    this.final_price_chf = this.base_price_chf + this.extra_chf;

    next();
});


export default mongoose.model("OrderItem", orderItemSchema);