import express from "express";
import {
    getProducts,
    insertProduct,
    getProductByNewId,
    updateProductByNewId,
    deleteProductByNewId,
    searchProducts,
  } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.post("/", insertProduct);
router.get("/:new_id", getProductByNewId);
router.put("/update/:new_id", updateProductByNewId);
router.delete("/delete/:new_id", deleteProductByNewId);

export default router;
