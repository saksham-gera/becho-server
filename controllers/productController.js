import db from "../db.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });


export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, ratings, discount, userId, searchQuery } = req.query;

  try {
    let query = `
      SELECT 
        p.id, 
        p.title, 
        p.description, 
        p.price, 
        p.ratings, 
        p.discount, 
        p.link, 
        p.category_id, 
        p.image_link, 
        p.created_at, 
        p.updated_at,
        -- Check if the product is in the user's wishlist
        CASE WHEN w.product_id IS NOT NULL THEN TRUE ELSE FALSE END AS in_wishlist
      FROM products p
      LEFT JOIN wishlists w ON p.id = w.product_id AND w.user_id = $1
      LEFT JOIN categories c ON p.category_id::uuid = c.id  -- Cast category_id to uuid for comparison
      WHERE 1=1
    `;

    const params = [userId]; // Add userId as the first parameter

    // Apply search query if provided
    if (searchQuery) {
      const keywords = searchQuery.trim().toLowerCase().split(/\s+/); // Split search query into individual keywords
      let searchConditions = []; // Array to hold the OR conditions for each keyword

      keywords.forEach((keyword, index) => {
        const searchFilter = `%${keyword}%`;
        searchConditions.push(`
          LOWER(p.title) LIKE $${params.length + 1} OR
          LOWER(p.description) LIKE $${params.length + 2} OR
          LOWER(c.title) LIKE $${params.length + 3}
        `);
        params.push(searchFilter, searchFilter, searchFilter); // Push search filter for each column
      });

      // Join the search conditions using OR
      query += ` AND (${searchConditions.join(' OR ')})`;
    }

    // Apply category filter
    if (category) {
      params.push(category.toLowerCase());  // Make category case-insensitive
      query += ` AND LOWER(c.title) = $${params.length}`;  // Filter by category title
    }

    // Apply price range filter
    if (minPrice) {
      params.push(minPrice);
      query += ` AND p.price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND p.price <= $${params.length}`;
    }

    // Apply ratings filter
    if (ratings) {
      params.push(ratings);
      query += ` AND p.ratings >= $${params.length}`;
    }

    // Apply discount filter
    if (discount) {
      params.push(discount);
      query += ` AND p.discount >= $${params.length}`;
    }

    console.log('Final SQL Query:', query); // Log the query for debugging

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
  const { title, description, price, ratings, discount, link, category_id } = req.body;
  const imageFile = req.file;
  if (!imageFile) {
    return res.status(400).json({
      success: false,
      message: "Image file is required.",
    });
  }
  if (!title || !price || !category_id) {
    return res.status(400).json({ success: false, message: "Title, price, and category are required fields." });
  }

  try {
    let cloudinaryImageUrl = null;

    if (imageFile) {
      // Upload image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(imageFile.buffer);
      });
      cloudinaryImageUrl = uploadResult.secure_url;
    }

    const query = `
      INSERT INTO products (
        id, title, description, price, ratings, discount, link, category_id, image_link, created_at, updated_at
      ) VALUES (
        DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, DEFAULT, DEFAULT
      ) RETURNING *;
    `;
    const params = [title, description || null, price, ratings || null, discount || null, link || null, category_id, cloudinaryImageUrl || null];

    const { rows } = await db.query(query, params);

    res.status(201).json({ success: true, message: "Product inserted successfully.", product: rows[0] });
  } catch (error) {
    console.error("Error inserting product:", error);
    res.status(500).json({ success: false, message: "Failed to insert product.", error: error.message });
  }
};


///
export const getProductById = async (req, res) => {
  const { id } = req.params;
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
      WHERE p.id = $1;
    `;
    const params = [id, userId];
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
    console.error("Error retrieving product by id:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product",
      error: error.message,
    });
  }
};


///
export const updateProductById = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, ratings, discount, link, category_id, image_link} = req.body;
  const imageFile = req.file;

  try {
    let cloudinaryImageUrl = null;

    if (imageFile) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(imageFile.buffer);
      });
      cloudinaryImageUrl = uploadResult.secure_url;
    }

    const query = `
      UPDATE products SET 
        title = $1, 
        description = $2, 
        price = $3, 
        ratings = $4, 
        discount = $5, 
        link = $6, 
        category_id = $7, 
        image_link = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *;
    `;
    const params = [title, description || null, price, ratings || null, discount || null, link || null, category_id, cloudinaryImageUrl || image_link, id];

    const { rows } = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully.", product: rows[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product.", error: error.message });
  }
};

///
export const deleteProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM products WHERE id = $1 RETURNING *`;
    const params = [id];
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
