import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reelsRoutes from "./routes/reelRotes.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
// const client = redis.createClient();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/category', categoryRoutes);
app.use('/reels', reelsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal error occurred",
    error: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
