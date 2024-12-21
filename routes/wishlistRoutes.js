import express from "express"
import {getWishlist,toggleWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post('/handle', toggleWishlist);
// router.get('/')
router.get('/:userId', getWishlist);

// router.post('/remove', removeFromWishlist);

export default router;
