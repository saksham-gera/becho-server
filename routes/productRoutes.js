import express from "express";
import {
    getProducts,
    insertProduct,
    getProductByNewId,
    updateProductByNewId,
    deleteProductByNewId,
    // getfilteredProducts,
  } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", insertProduct);
router.get("/:new_id", getProductByNewId);
router.put("/update/:new_id", updateProductByNewId);
router.delete("/delete/:new_id", deleteProductByNewId);

export default router;
