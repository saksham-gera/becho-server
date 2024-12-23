import express from "express";
import { register, login } from "../controllers/authController.js";
import { asyncHandler } from "../middlewares.js";

const router = express.Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

export default router;
