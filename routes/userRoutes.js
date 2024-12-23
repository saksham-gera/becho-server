import express from "express";
import { getUserData } from "../controllers/userController.js";
import { authenticateToken, asyncHandler } from "../middlewares.js";

const router = express.Router();

router.get("/verify", authenticateToken, asyncHandler(getUserData));

export default router;
