import express from "express"
import { addToWishlist,getWishlist,removeFromWishlist } from "../controllers/wishlistController.js";

const router = express.Router();

router.post('/add', addToWishlist);

router.get('/:userId', getWishlist);

router.post('/remove', removeFromWishlist);

export default router;
