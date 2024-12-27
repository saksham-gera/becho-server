import express from "express";
import { asyncHandler } from "../middlewares.js";
import { createUserToken, getCommissions, insertCommissionData } from "../controllers/commissionController.js";

const router = express.Router();

router.get('/', getCommissions);
// router.post("/", asyncHandler(insertCommissionData));
router.post("/", insertCommissionData);
router.get("/createUserToken/:userId", asyncHandler(createUserToken));

export default router;
