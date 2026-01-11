import Order from "../../models/order.js";          
import Store from "../../models/store.js";
import OrderItem from "../../models/orderItem.js";
import Product from "../../models/product.js";
import mongoose from "mongoose";
import { handleMongooseError } from "../../utils/errorHandler.js";

/**
 * Create a new order for the authenticated user.
 *
 * This controller:
 * - validates request data
 * - verifies store existence
 * - creates the order and its items
 * - calculates the total order price
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the created order.
 */
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(400).json({
                message: "User id required"
            });
        }

        const { store_id, pickup, items } = req.body;

        if (!store_id || !pickup || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "store_id, pickup and items are required"
            });
        }

        const store = await Store.findById(store_id);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        const order = new Order({
            user_id: userId,
            store_id,
            pickup,
            total_price_chf: 0
        });

        await order.save();

        let total = 0;

        for (const item of items) {
            const { product_id, size, quantity } = item;

            if (!product_id || !size || !quantity) {
                return res.status(400).json({
                    message: "Each item must contain product_id, size and quantity"
                });
            }

            const product = await Product.findById(product_id);
            if (!product) return res.status(404).json({ message: "Product not found" });

            const price = product.basePriceCHF + (product.extra_chf[size] || 0);
            const finalPrice = parseFloat((price * quantity).toFixed(2))

            const orderItem = new OrderItem({
                order_id: order._id,
                product_id,
                size,
                quantity
            });

            await orderItem.save();

            total += finalPrice;
        }

        order.total_price_chf = total;
        await order.save();

        const populatedOrder = await Order.findById(order._id)
            .populate("store_id")
            .populate("user_id", "email display_name");

        return res.status(201).json({
            message: "Order successfully created",
            order: populatedOrder
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Retrieve the authenticated user's order history.
 *
 * Supports filtering and pagination.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing paginated orders.
 */
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;

        const { status, store_id } = req.query;

        let filter = { user_id: userId };
        if (status) filter.status = status;
        if (store_id) filter.store_id = store_id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("store_id");
        
        const totalOrders = await Order.countDocuments(filter);

        return res.status(200).json({
            message: "Your order history",
            page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            orders
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Retrieve a single order by its identifier.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the order.
 */
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
                
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const order = await Order.findById(id)
            .populate("store_id")
            .populate("user_id", "email display_name");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({
            message: "Order found",
            order
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Update the status of an existing order.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the updated order.
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "New status is required" });
        }

        const { id } = req.params;
                
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        try {
            await order.setStatus(status);
        } catch (err) {
            return handleMongooseError(res, error);
        }

        return res.status(200).json({
            message: "Order status updated",
            order
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Delete an order and its associated items.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @return {void}
 */
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
                
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await OrderItem.deleteMany({ order_id: order._id });

        return res.status(204).send();
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Order controller.
 *
 * Groups all order-related controller methods.
 */
export const orderController = {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};