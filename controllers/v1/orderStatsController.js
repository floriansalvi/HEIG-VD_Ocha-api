import Order from "../../models/order.js";          

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
                    totalSpent: 1
                }
            }
        ]);

        return res.status(200).json({ stats });

    } catch (error) {
        return res.status(500).json({
            message: "An error occurred :",
            error: error.message
        });
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