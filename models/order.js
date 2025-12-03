import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },
    status: {
        type: String,
        enum: ["en préparation", "prête", "récupérée"],
        default: "en préparation"
    },
    pickup: {
        type: Date,
        required: [ true, "Date et heure de ramassage requises"],
    },
    total_price_chf: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

//Changement du statut de la commande
orderSchema.methods.setStatus = function (newStatus) {
    const allowed = ["en préparation", "prête", "récupérée"];

    if (!allowed.includes(newStatus)) {
        throw new Error(`Statut invalide: ${newStatus}`);
    }

    this.status = newStatus;
    return this.save();
};

export default mongoose.model("Order", orderSchema);