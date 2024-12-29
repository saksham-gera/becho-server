import express from "express";
import {
    putFCMToken,
    sendNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/putFCMToken", putFCMToken);
router.post("/send", sendNotification);

export default router;