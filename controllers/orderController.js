import Order from "../models/order.js";          
import Store from "../models/store.js";
import OrderItem from "../models/orderItem.js";

const handleMongooseError = (res, error) => {
    if (error.name === "ValidationError") {
        return res.status(422).json({
            message: "Données invalides",
            error: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Conflit de données",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "Erreur interne du serveur",
        error: error.message
    });
};

// POST /orders
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                message: "Authentification requise"
            });
        }

        if (!userId) {
            return res.status(401).json({
                message: "Authentification requise"
            });
        }

        const { store_id, pickup, items } = req.body;

        if (!store_id || !pickup || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "store_id, pickup et items sont requis"
            });
        }

        const store = await Store.findById(store_id);
        if (!store) {
            return res.status(404).json({ message: "Magasin introuvable" });
        }

        // Créer la commande avec un total à 0 pour commencer
        const order = new Order({
            user_id: userId,
            store_id,
            pickup,
            total_price_chf: 0
        });

        await order.save();

        let total = 0;

        for (const item of items) {
            const { product_id, size } = item;

            if (!product_id || !size) {
                return res.status(400).json({
                    message: "Chaque item doit contenir product_id et size"
                });
            }

            const orderItem = new OrderItem({
                order_id: order._id,
                product_id,
                size
            });

            await orderItem.save(); // le pre('validate') calcule les prix

            total += orderItem.final_price_chf;
        }

        order.total_price_chf = total;
        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate("store_id")
            .populate("user_id", "email display_name");

        return res.status(201).json({
            message: "Commande créée",
            order: populatedOrder
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// GET /orders/me
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Authentification requise"
            });
        }

        const orders = await Order.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .populate("store_id");

        return res.status(200).json({
            message: "Historique de vos commandes",
            orders
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erreur interne du serveur",
            error: error.message
        });
    }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("store_id")
            .populate("user_id", "email display_name");

        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        return res.status(200).json({
            message: "Commande trouvée",
            order
        });
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

// PATCH /orders/:id/status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Nouveau statut requis" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        try {
            await order.setStatus(status);
        } catch (err) {
            // erreur venant de la méthode setStatus (statut invalide)
            return res.status(400).json({
                message: err.message
            });
        }

        return res.status(200).json({
            message: "Statut de la commande mis à jour",
            order
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

// DELETE /orders/:id
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Commande introuvable" });
        }

        // On supprime aussi les OrderItems associés
        await OrderItem.deleteMany({ order_id: order._id });

        return res.status(204).send();
    } catch (error) {
        return res.status(400).json({
            message: "Requête invalide (id incorrect)",
            error: error.message
        });
    }
};

export const orderController = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};