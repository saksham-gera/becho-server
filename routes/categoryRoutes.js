import express from "express"
import {getCategories, addCategory, deleteCategory, updateCategory} from "../controllers/categoryController.js";

const router = express.Router();

router.get('/', getCategories);
router.post('/', addCategory);
router.post('/delete', deleteCategory);
router.post('/update', updateCategory);

export default router;
