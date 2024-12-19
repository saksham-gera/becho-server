import express from "express";
import { getProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", insertProduct);

export default router;
