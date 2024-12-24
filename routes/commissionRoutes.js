import express from "express";
import { asyncHandler } from "../middlewares.js";
import { createUserToken, incrementClickCount } from "../controllers/commissionController.js";

const router = express.Router();

router.post("/", asyncHandler(incrementClickCount));
router.get("/createUserToken/:userId", asyncHandler(createUserToken));

export default router;
