import redis from './redisClient'; 
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
