import { validate as isUuid } from 'uuid';
import db from "../db.js";

export const getWishlist = async (req, res) => {
  const { userId } = req.query;

  try {
    const wishlistQuery = await db.query(`
      SELECT 
        p.id,  
        p.title,  
        p.description,  
        p.price,  
        p.ratings,  
        p.discount,  
        p.link,  
        p.image_link,  
        p.category_id,  
        p.created_at,  
        p.updated_at
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `, [userId]);

    res.status(200).json({
      success: true,
      wishlist: wishlistQuery.rows,
    });
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
      error: error.message,
    });
  }
};

export const toggleWishlist = async (req, res) => {
  console.log("aa")
  const { userId, id } = req.body;
  console.log(userId);
  if (!userId || !id) {
    return res.status(400).json({
      success: false,
      message: "User ID and Product ID are required to toggle wishlist.",
    });
  }

  try {
    const wishlistQuery = await db.query(
      'SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, id]
    );

    if (wishlistQuery.rows.length > 0) {
      await db.query(
        'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
        [userId, id]
      );
      return res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } else {
      await db.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)',
        [userId, id]
      );
      return res.status(201).json({ success: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle wishlist",
      error: error.message,
    });
  }
};
