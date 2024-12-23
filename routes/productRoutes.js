import express from "express";
import {
    getProducts,
    insertProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    searchProducts,
  } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.post("/", insertProduct);
router.get("/:id", getProductById);
router.put("/update/:id", updateProductById);
router.delete("/delete/:id", deleteProductById);

export default router;
