import db from "../db.js";

export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, ratings, discount } = req.query;

  try {
    let query = `
      SELECT 
        id, 
        new_id,
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
    console.log(rows);

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

///
export const insertProduct = async (req, res) => {
  const {
    title,
    description,
    price,
    ratings,
    discount,
    link,
    video_link,
    category,
    image_link,
  } = req.body;

  try {
    // if (!title || !price || !category) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Title, price, and category are required fields."
    //   });
    // }

    const query = `
      INSERT INTO products (
        title, description, price, ratings, discount, link, video_link, category, image_link
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *;
    `;

    const params = [
      title,
      description || null,
      price,
      ratings || null,
      discount || null,
      link || null,
      video_link || null,
      category,
      image_link || null,
    ];

    const { rows } = await db.query(query, params);

    res.status(201).json({
      success: true,
      message: "Product inserted successfully.",
      product: rows[0],
    });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to insert product.",
      error: error.message,
    });
  }
};

///
export const getProductByNewId = async (req, res) => {
  const { new_id } = req.params;

  try {
    const query = `SELECT * FROM products WHERE new_id = $1`;
    const params = [new_id];
    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product: rows[0],
    });
  } catch (error) {
    console.error("Error retrieving product by new_id:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
};

///
export const updateProductByNewId = async (req, res) => {
  const { new_id } = req.params;
  const {
    title,
    description,
    price,
    ratings,
    discount,
    link,
    video_link,
    category,
    image_link,
  } = req.body;

  try {
    const query = `
      UPDATE products SET 
        title = $1, 
        description = $2, 
        price = $3, 
        ratings = $4, 
        discount = $5, 
        link = $6, 
        video_link = $7, 
        category = $8, 
        image_link = $9,
        updated_at = NOW()
      WHERE new_id = $10
      RETURNING *;
    `;

    const params = [
      title,
      description || null,
      price,
      ratings || null,
      discount || null,
      link || null,
      video_link || null,
      category,
      image_link || null,
      new_id,
    ];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: rows[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product.",
      error: error.message,
    });
  }
};

///
export const deleteProductByNewId = async (req, res) => {
  const { new_id } = req.params;

  try {
    const query = `DELETE FROM products WHERE new_id = $1 RETURNING *`;
    const params = [new_id];
    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      product: rows[0],
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: error.message,
    });
  }
};

