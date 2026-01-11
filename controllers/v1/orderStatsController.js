import Order from "../../models/order.js";          
import { handleMongooseError } from "../../utils/errorHandler.js";

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
                    userId: "$_id",
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