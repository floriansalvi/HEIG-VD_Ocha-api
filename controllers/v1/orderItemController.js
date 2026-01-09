import OrderItem from "../../models/orderItem.js";
import Order from "../../models/order.js";

/**
 * Handle Mongoose-related errors and return an appropriate HTTP response.
 *
 * @param {Object} res Express response object.
 * @param {Error} error Mongoose error instance.
 * @return {Object} JSON response with an appropriate HTTP status code.
 */
const handleMongooseError = (res, error) => {
    if (error.name === "ValidationError") {
        return res.status(422).json({
            message: "Invalid data",
            error: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Data conflict",
            error: error.message
        });
    }

    return res.status(500).json({
        message: "An unexpected error occurred",
        error: error.message
    });
};

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
 * @param {string} req.params.orderId Order identifier.
 *
 * @param {Object} res Express response object.
 * @return {Object} JSON response containing the order items.
 */
export const getItemsByOrder = async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const items = await OrderItem
            .find({ order_id: orderId })
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