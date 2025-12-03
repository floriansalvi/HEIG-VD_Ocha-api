import OrderItem from "../models/orderItem.js";
import Order from "../models/order.js";

export const getItemsByOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        const items = await OrderItem.find({ order_id: orderId }).populate("product_id");

        return res.status(200).json({
            message: "Liste des items de la commande",
            items
        });
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

export const orderItemController = {
    getItemsByOrder
};
