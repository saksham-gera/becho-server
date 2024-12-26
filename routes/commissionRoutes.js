import express from "express";
import { asyncHandler } from "../middlewares.js";
import { createUserToken, getCommissions, incrementClickCount } from "../controllers/commissionController.js";

const router = express.Router();

router.get('/', getCommissions);
router.post("/", asyncHandler(incrementClickCount));
router.get("/createUserToken/:userId", asyncHandler(createUserToken));

export default router;
