import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reelsRoutes from "./routes/reelRoutes.js"
import profileRoutes from"./routes/profileRoutes.js"
import commissionRoutes from "./routes/commissionRoutes.js"
// import

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/category', categoryRoutes);
app.use('/reels', reelsRoutes);
app.use('/profile', profileRoutes);
app.use('/commissions', commissionRoutes);



// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An internal error occurred",
    error: err.message,
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});