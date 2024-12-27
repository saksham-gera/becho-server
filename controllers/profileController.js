import db from "../db.js";

export const getProfile = async (req, res) => {
    const { userId } = req.params;
  
    try {
        const query = `
            SELECT 
              u.id AS user_id, 
              u.username, 
              u.email, 
              u.role, 
              u.created_at, 
              u.updated_at, 
              SUM(c.sales_count) AS sales_generated, 
              SUM(c.clicks_count) AS clicks_generated, 
              SUM(c.earnings) AS earnings
            FROM users u
            LEFT JOIN commissions c ON u.id = c.user_id
            WHERE u.id = $1
            GROUP BY u.id
        `;

        const { rows } = await db.query(query, [userId]);
  
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            profile: rows[0],
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user profile.",
            error: error.message,
        });
    }
};
