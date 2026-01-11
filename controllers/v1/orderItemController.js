import OrderItem from "../../models/orderItem.js";
import Order from "../../models/order.js";
import mongoose from "mongoose";
import { handleMongooseError } from "../../utils/errorHandler.js";

/**
 * Retrieve all items associated with a specific order.
 *
 * This controller:
 * - verifies the existence of the order
 * - retrieves all related order items
 * - populates associated product data
 *
 * @param {Object} req Express request object.
 * @param {Object} req.params Route parameters.
 * @param {string} req.params.id Order identifier.
 *
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the order items.
 */
export const getItemsByOrder = async (req, res) => {
    try {
        const { id } = req.params;
                        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const items = await OrderItem
            .find({ order_id: id })
            .populate("product_id");

        return res.status(200).json({
            message: "List of items in the order",
            items
        });
    } catch (error) {
        return handleMongooseError(res, error);
    }
};

/**
 * Order item controller.
 *
 * Groups all order-item-related controller methods.
 */
export const orderItemController = {
    getItemsByOrder
};