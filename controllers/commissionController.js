import db from "../db.js";
import { v4 as uuidv4 } from 'uuid';

export const getCommissions = async (req, res) => {
  try {
    const { userId, period, offset } = req.query;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({ error: 'userId is required.' });
    }

    if (!period || !['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({
        error: 'Invalid period. Please use "daily", "weekly", or "monthly".',
      });
    }

    const offsetValue = parseInt(offset, 10) || 0; // Ensure offset is an integer
    let dateCondition = '';
    let groupByClause = '';

    // Determine the SQL condition and grouping based on the period
    if (period === 'daily') {
      dateCondition = `DATE(created_at) = CURRENT_DATE - INTERVAL '${offsetValue} days'`;
      groupByClause = `DATE(created_at)`;
    } else if (period === 'weekly') {
      dateCondition = `
        created_at >= CURRENT_DATE - INTERVAL '${7 * offsetValue + 7} days' 
        AND created_at < CURRENT_DATE - INTERVAL '${7 * offsetValue} days'
      `;
      groupByClause = `DATE_TRUNC('week', created_at)`;
    } else if (period === 'monthly') {
      dateCondition = `
        created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${offsetValue} months'
        AND created_at < DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '${offsetValue - 1} months'
      `;
      groupByClause = `DATE_TRUNC('month', created_at)`;
    }

    // Query the database for the commissions
    const query = `
        SELECT 
            ${groupByClause} AS period_start,
            COALESCE(SUM(sales_generated), 0) AS total_sales_generated,
            COALESCE(SUM(sales_amount), 0) AS total_sales_amount,
            COALESCE(SUM(commission), 0) AS total_commission,
            COALESCE(SUM(clicks_generated), 0) AS total_clicks_generated
        FROM 
            commissions
        WHERE 
            user_id = $1 AND ${dateCondition}
        GROUP BY 
            ${groupByClause}
        ORDER BY 
            period_start DESC;
    `;

    const results = await db.query(query, [userId]);

    res.status(200).json({
      success: true,
      message: 'Commissions data fetched successfully.',
      data: results.rows,
    });
  } catch (error) {
    // Log detailed error information
    console.error('Error in getCommissions:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while fetching commissions data.',
    });
  }
};


export const incrementClickCount = async (req, res) => {
    const { user_token } = req.body;
  
    if (!user_token) {
      return res.status(400).json({ message: 'User token is required' });
    }
  
    try {
      const tokenQuery = 'SELECT user_id FROM user_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP';
      const tokenResult = await db.query(tokenQuery, [user_token]);
  
      if (tokenResult.rows.length === 0) {
        return res.status(404).json({ message: 'Invalid or expired token' });
      }
  
      const user_id = tokenResult.rows[0].user_id;
  
      const commissionQuery = 'SELECT * FROM commissions WHERE user_id = $1';
      const commissionResult = await db.query(commissionQuery, [user_id]);
  
      let commission;
  
      if (commissionResult.rows.length === 0) {
        const insertQuery = `
          INSERT INTO commissions (user_id, sales_generated, clicks_generated, earnings, created_at, updated_at)
          VALUES ($1, 0, 1, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *;
        `;
        const insertResult = await db.query(insertQuery, [user_id]);
        commission = insertResult.rows[0];
      } else {
        commission = commissionResult.rows[0];
        const newClicks = commission.clicks_generated + 1;
  
        const updateQuery = `
          UPDATE commissions
          SET clicks_generated = $1, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $2
          RETURNING *;
        `;
        const updateResult = await db.query(updateQuery, [newClicks, user_id]);
        commission = updateResult.rows[0];
      }
  
      return res.status(200).json({
        message: 'Click count updated successfully',
        commission,
      });
    } catch (error) {
      console.error('Error updating click count:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  export const createUserToken = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
  
    try {
      const token = uuidv4(); 
            const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const insertQuery = `
        INSERT INTO user_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      
      const result = await db.query(insertQuery, [userId, token, expiresAt]);
  
      return res.status(201).json({
        message: 'Token created successfully',
        token: result.rows[0].token,
        expires_at: result.rows[0].expires_at,
      });
    } catch (error) {
      console.error('Error creating user token:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }