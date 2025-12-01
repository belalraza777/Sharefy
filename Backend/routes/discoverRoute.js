import express from "express";
const router = express.Router();
import verifyAuth from "../utils/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import {getDiscoverPosts,getSuggestedUsers} from "../controllers/discoverController.js";

//Discover content route (e.g., trending posts, suggested users)
router.get("/posts", verifyAuth, asyncWrapper(getDiscoverPosts));
router.get("/users", verifyAuth, asyncWrapper(getSuggestedUsers));
export default router;