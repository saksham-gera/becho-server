import express from "express";
import { getUserData, getAllUsers, deleteUser } from "../controllers/userController.js";
import { authenticateToken, asyncHandler } from "../middlewares.js";

const router = express.Router();

router.get("/verify", authenticateToken, asyncHandler(getUserData));
router.get("/", asyncHandler(getAllUsers));
router.delete("/delete/:id", asyncHandler(deleteUser));
export default router;
