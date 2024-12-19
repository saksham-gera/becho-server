import db from "../db.js";

export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, ratings, discount } = req.query;

  try {
    let query = `
      SELECT 
        id, 
        title, 
        description, 
        price, 
        ratings, 
        discount, 
        link, 
        video_link, 
        category, 
        image_link, 
        created_at, 
        updated_at 
      FROM products 
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (minPrice) {
      params.push(minPrice);
      query += ` AND price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND price <= $${params.length}`;
    }

    if (ratings) {
      params.push(ratings);
      query += ` AND ratings >= $${params.length}`;
    }

    if (discount) {
      params.push(discount);
      query += ` AND discount >= $${params.length}`;
    }

    const { rows } = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
};
