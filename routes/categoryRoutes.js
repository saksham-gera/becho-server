import express from "express"
import {getCategories, addCategory, deleteCategory, updateCategory, getCategoryById} from "../controllers/categoryController.js";

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', addCategory);
router.post('/delete', deleteCategory);
router.post('/update', updateCategory);

export default router;
