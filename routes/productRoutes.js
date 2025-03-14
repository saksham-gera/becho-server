import express from "express";
import {
    getProducts,
    insertProduct,
    getProductById,
    updateProductById,
    deleteProductById,
    upload
  } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", upload.single("image"), insertProduct);
router.get("/:id", getProductById);
router.put("/update/:id", upload.single("image"), updateProductById);
router.delete("/delete/:id", deleteProductById);

export default router;
