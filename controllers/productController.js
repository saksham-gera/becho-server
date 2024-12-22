import db from "../db.js";

export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, ratings, discount, userId, searchQuery } = req.query;

  try {
    let query = `
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
        p.category, 
        p.image_link, 
        p.created_at, 
        p.updated_at,
        -- Check if the product is in the user's wishlist
        CASE WHEN w.product_id IS NOT NULL THEN TRUE ELSE FALSE END AS in_wishlist
      FROM products p
      LEFT JOIN wishlists w ON p.id = w.product_id AND w.user_id = $1
      WHERE 1=1
    `;

    const params = [userId]; // Add userId as the first parameter

    // Apply filters based on query parameters
    if (searchQuery) {
      const searchFilter = `%${searchQuery.toLowerCase()}%`;
      params.push(searchFilter, searchFilter, searchFilter);
      query += `
        AND (
          LOWER(p.title) LIKE $${params.length - 2} OR
          LOWER(p.description) LIKE $${params.length - 1} OR
          LOWER(p.category) LIKE $${params.length}
        )
      `;
    }

    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    if (minPrice) {
      params.push(minPrice);
      query += ` AND p.price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND p.price <= $${params.length}`;
    }

    if (ratings) {
      params.push(ratings);
      query += ` AND p.ratings >= $${params.length}`;
    }

    if (discount) {
      params.push(discount);
      query += ` AND p.discount >= $${params.length}`;
    }

    // Execute query and retrieve results
    const { rows } = await db.query(query, params);

    // Check if results are empty
    if (rows.length === 0) {
      return res.status(201).json({
        success: false,
        message: "No products found matching the criteria.",
      });
    }

    // Return results with in_wishlist flag
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
  const { userId } = req.query; 

  try {
    const query = `
      SELECT 
        p.*, 
        CASE 
          WHEN w.product_id IS NOT NULL THEN TRUE 
          ELSE FALSE 
        END AS in_wishlist
      FROM products p
      LEFT JOIN wishlists w ON p.id = w.product_id AND w.user_id = $2
      WHERE p.new_id = $1;
    `;
    const params = [new_id, userId];
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
  }catch (error) {
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

export const searchProducts = async (req, res) => {
  const { query: searchQuery } = req.query;

  try {
    // Check if the search query is provided
    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }

    const query = `
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
      WHERE 
        LOWER(title) LIKE LOWER($1) OR
        LOWER(description) LIKE LOWER($1) OR
        LOWER(category) LIKE LOWER($1);
    `;

    const params = [`%${searchQuery}%`];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(201).json({
        success: false,
        message: "No products found matching the query.",
      });
    }

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search products.",
      error: error.message,
    });
  }
};

