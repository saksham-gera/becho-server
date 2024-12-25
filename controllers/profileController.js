import db from "../db.js";

export const getProfile = async (req, res) => {
    const { userId } = req.params;
  
    try {
        // console.log("aa");
      const query = `
        SELECT 
          u.id AS user_id, 
          u.username, 
          u.email, 
          u.role, 
          u.created_at, 
          u.updated_at, 
          c.sales_generated, 
          c.clicks_generated, 
          c.earnings
        FROM users u
        LEFT JOIN commissions c ON u.id = c.user_id
        WHERE u.id = $1;
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