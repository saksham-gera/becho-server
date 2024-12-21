import db from "../db.js"; 

export const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlistQuery = await db.query(`
      SELECT 
        p.id,  
        p.new_id,  
        p.title,  
        p.description,  
        p.price,  
        p.ratings,  
        p.discount,  
        p.link,  
        p.video_link,  
        p.image_link,  
        p.category,  
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
  const { userId, new_id } = req.body;

  try {
    const productQuery = await db.query('SELECT id FROM products WHERE new_id = $1', [new_id]);

    if (productQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productId = productQuery.rows[0].id;

    const wishlistQuery = await db.query(
      'SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (wishlistQuery.rows.length > 0) {
      await db.query(
        'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      return res.status(200).json({ message: 'Product removed from wishlist' });
    } else {
      await db.query(
        'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)',
        [userId, productId]
      );
      return res.status(201).json({ message: 'Product added to wishlist' });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
