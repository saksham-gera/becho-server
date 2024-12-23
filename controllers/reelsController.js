import redis from '../redisClient.js'; 
import db from "../db.js";

export const getRandomReels = async (req, res) => {
  const userId = req.user.id; 
  try {
    const seenReelsKey = `seen_reels:${userId}`;
    const seenReels = await redis.smembers(seenReelsKey);

    const seenReelsArray = seenReels.length ? seenReels : [''];

    const query = `
      SELECT * FROM reels 
      WHERE id != ALL($1::uuid[]) 
      ORDER BY RANDOM() 
      LIMIT 10
    `;
    const params = [seenReelsArray];

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

    rows.forEach((reel) => {
      redis.sadd(seenReelsKey, reel.id);
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
      VALUES ($1, $2, $3, $4) 
      RETURNING id, product_id, url, description, wishlisted, created_at, updated_at;
    `;
    const params = [product_id, url, description || null, wishlisted || 0];

    const { rows } = await db.query(query, params);

    const newReel = rows[0];

    res.status(201).json({
      success: true,
      message: 'Reel added successfully.',
      reel: newReel,
    });
  } catch (error) {
    console.error("Error adding reel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reel.",
      error: error.message,
    });
  }
};