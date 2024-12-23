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
router.get("/:new_id", getProductById);
router.put("/update/:new_id", updateProductById);
router.delete("/delete/:new_id", deleteProductById);

export default router;
