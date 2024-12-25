import redis from '../redisClient.js'; 
import db from "../db.js";

export const getRandomReels = async (req, res) => {
  const { userId } = req.params;
  try {
    const seenReelsKey = `seen_reels:${userId}`;
    const seenReels = await redis.sMembers(seenReelsKey);

    const seenReelsArray = seenReels.length ? seenReels : [];

    // Conditionally build the query based on whether there are seen reels
    let query = `
      SELECT r.*, p.title AS title, 
             EXISTS (SELECT 1 FROM wishlists w WHERE w.user_id = $1 AND w.product_id = r.product_id) AS in_wishlist,
             (SELECT COUNT(*) FROM wishlists w WHERE w.product_id = r.product_id) AS wishlisted
      FROM reels r
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.id != ALL($2::uuid[]) 
      ORDER BY RANDOM() 
      LIMIT 10
    `;
    let params = [userId, seenReelsArray];

    if (seenReelsArray.length === 0) {
      query = `
        SELECT r.*, p.title AS title, 
               EXISTS (SELECT 1 FROM wishlists w WHERE w.user_id = $1 AND w.product_id = r.product_id) AS is_wishlist,
               (SELECT COUNT(*) FROM wishlists w WHERE w.product_id = r.product_id) AS wishlisted
        FROM reels r
        LEFT JOIN products p ON r.product_id = p.id
        ORDER BY RANDOM() 
        LIMIT 10
      `;
      params = [userId];
    }

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      const totalReelsQuery = `SELECT COUNT(*) FROM reels`;
      const totalReelsResult = await db.query(totalReelsQuery);
      const totalReelsCount = parseInt(totalReelsResult.rows[0].count, 10);

      if (seenReels.length >= totalReelsCount) {
        await redis.del(seenReelsKey);
        return res.status(200).json({
          success: true,
          message: "All reels have been seen. Resetting seen list.",
          data: [],
        });
      }

      return res.status(404).json({
        success: false,
        message: "No more random reels available.",
      });
    }

    // Add the seen reels to the Redis set
    rows.forEach((reel) => {
      redis.sAdd(seenReelsKey, reel.id);
    });

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching random reels:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch random reels.",
      error: error.message,
    });
  }
};


export const addReel = async (req, res) => {
  const { product_id, url, description } = req.body; 

  if (!product_id || !url) {
    return res.status(400).json({ error: 'Product ID and URL are required.' });
  }

  try {
    const query = `
      INSERT INTO reels (product_id, url, description) 
      VALUES ($1, $2, $3) 
      RETURNING id, product_id, url, description, created_at, updated_at;
    `;
    const params = [
      product_id,
      url,
      description || null,
    ];

    const { rows } = await db.query(query, params);

    const newReel = rows[0];

    res.status(201).json({
      success: true,
      message: 'Reel added successfully.',
      reel: newReel,
    });
  } catch (error) {
    console.error('Error adding reel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reel.',
      error: error.message,
    });
  }
};
