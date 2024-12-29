import express from "express";
import { getUserData, getAllUsers } from "../controllers/userController.js";
import { authenticateToken, asyncHandler } from "../middlewares.js";

const router = express.Router();

router.get("/verify", authenticateToken, asyncHandler(getUserData));
router.get("/", asyncHandler(getAllUsers));
export default router;
