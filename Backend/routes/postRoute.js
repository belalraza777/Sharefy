import express from "express";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";
import verifyAuth from "../utils/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
    getFeed,
    createPost,
    getPostById,
    likePost,
    unlikePost,
    deletePost
} from "../controllers/postController.js";

const router = express.Router();
const upload = multer({ storage });

// Routes (clean + error-safe with asyncWrapper)
//Get feed
router.get("/feed", verifyAuth, asyncWrapper(getFeed));
//Create post
router.post("/", verifyAuth, upload.single("file"), asyncWrapper(createPost));
//Get post by id
router.get("/:id", verifyAuth, asyncWrapper(getPostById));
//Like and unlike post
router.post("/:id/like", verifyAuth, asyncWrapper(likePost));
router.post("/:id/unlike", verifyAuth, asyncWrapper(unlikePost));
//Delete post
router.delete("/:id", verifyAuth, asyncWrapper(deletePost));

export default router;
