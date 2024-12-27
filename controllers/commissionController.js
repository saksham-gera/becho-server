import db from "../db.js";
import { v4 as uuidv4 } from 'uuid';

export const getCommissions = async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  try {
    let start = new Date(startDate).toISOString(); // Convert to ISO format
    let end = new Date(endDate).toISOString();

    // Log the dates
    console.log("Formatted Dates:", { start, end });

    // Ensure startDate is always earlier than endDate
    if (new Date(start) > new Date(end)) {
      // Swap the dates if start is later than end
      [start, end] = [end, start];
    }

    console.log("Adjusted Dates:", { start, end });

    // Query 1: Get commission data for the given date range
    const commissionQuery = `
        SELECT 
            COALESCE(SUM(sales_count), 0) AS total_sales_count,
            COALESCE(SUM(clicks_count), 0) AS total_clicks_count,
            COALESCE(SUM(earnings), 0.00) AS total_earnings,
            COALESCE(SUM(commission), 0.00) AS total_commission,
            COALESCE(SUM(sales_amount), 0.00) AS total_sales_amount
        FROM commissions
        WHERE user_id = $1
          AND event_timestamp BETWEEN $2 AND $3;
    `;

    const commissionResult = await db.query(commissionQuery, [userId, start, end]);

    // Query 2: Get lifetime totals for the user
    const lifetimeQuery = `
        SELECT 
            COALESCE(SUM(sales_count), 0) AS lifetime_sales_count,
            COALESCE(SUM(clicks_count), 0) AS lifetime_clicks_count,
            COALESCE(SUM(earnings), 0.00) AS lifetime_earnings,
            COALESCE(SUM(commission), 0.00) AS lifetime_commission,
            COALESCE(SUM(sales_amount), 0.00) AS lifetime_sales_amount
        FROM commissions
        WHERE user_id = $1;
    `;

    const lifetimeResult = await db.query(lifetimeQuery, [userId]);

    // Combine results into a single response
    res.status(200).json({
      commissionData: commissionResult.rows[0], // Date range data
      lifetimeData: lifetimeResult.rows[0],    // Lifetime totals
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Error fetching data" });
  }
};



// commissionController.js
export const insertCommissionData = async (req, res) => {
  const { user_token, salesAmount } = req.body;

  if (!user_token) {
    return res.status(400).json({ message: 'User token is required' });
  }

  try {
    // Get userId from the user_token
    const queryToken = `
      SELECT user_id 
      FROM user_tokens 
      WHERE token = $1 AND expires_at > NOW()
    `;
    const tokenResult = await db.query(queryToken, [user_token]);

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userId = tokenResult.rows[0].user_id;

    // Determine event type based on salesAmount
    const eventType = salesAmount > 0 ? 'sales' : 'click';

    // Prepare the dynamic fields to insert into the database
    const fields = ['user_id', 'clicks_count', 'event_type', 'event_timestamp'];
    const values = [userId, 1, eventType, new Date()];

    if (salesAmount > 0) {
      fields.push('sales_count', 'sales_amount');
      values.push(1, salesAmount);
    }

    const query = `
      INSERT INTO commissions (${fields.join(', ')})
      VALUES (${fields.map((_, i) => `$${i + 1}`).join(', ')})
      RETURNING id;
    `;

    const result = await db.query(query, values);

    // Respond with the ID of the inserted record
    res.status(201).json({
      id: result.rows[0].id,
      message: 'Commission data inserted successfully',
    });
  } catch (error) {
    console.error('Error inserting commission data:', error);
    res.status(500).json({ message: 'Error inserting commission data' });
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