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
router.post("/", (req, res, next) => {
  console.log(req.headers, req.body);
  next();
}, upload.single("image"), insertProduct);


router.get("/:id", getProductById);
router.put("/update/:id", updateProductById);
router.delete("/delete/:id", deleteProductById);

export default router;
