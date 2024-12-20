import db from "../db.js"; // Assuming you have db.js configured for database connection

// Add a product to the wishlist
export const addToWishlist = async (req, res) => {
  const { userId, new_id } = req.body;

  try {
    // Resolve new_id to id
    const productQuery = await db.query('SELECT id FROM products WHERE new_id = $1', [new_id]);

    if (productQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productId = productQuery.rows[0].id;

    // Insert into wishlist
    await db.query('INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)', [userId, productId]);
    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a user's wishlist
export const getWishlist = async (req, res) => {
  const { userId } = req.params;

  try {
    const wishlistQuery = await db.query(`
      SELECT p.new_id, p.title, p.id AS product_id
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `, [userId]);

    res.status(200).json(wishlistQuery.rows);
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove a product from the wishlist
export const removeFromWishlist = async (req, res) => {
  const { userId, new_id } = req.body;

  try {
    // Resolve new_id to id
    const productQuery = await db.query('SELECT id FROM products WHERE new_id = $1', [new_id]);
    if (productQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productId = productQuery.rows[0].id;

    // Delete from wishlist
    const deleteQuery = await db.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    if (deleteQuery.rowCount === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
