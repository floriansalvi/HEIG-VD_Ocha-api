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
 * Retrieve stats regarding orders.
 *
 * @return {Object} JSON response containing stats.
 */
const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: "$user_id",
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$total_price_chf" }
                }
            },
            {
                $lookup: {
                    from: Order.db.model("User").collection.name,
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    _id: 0,
                    user: "$user.display_name",
                    totalOrders: 1,
                    totalSpent: { $round: ["$totalSpent", 2] }
                }
            }
        ]);

        return res.status(200).json({ stats });

    } catch (error) {
        return handleMongooseError(res, error);
    }
}

/**
 * OrderStats controller.
 *
 * Groups all order-stats-related controller methods.
 */
export const orderStatsController = {
    getOrderStats,
};