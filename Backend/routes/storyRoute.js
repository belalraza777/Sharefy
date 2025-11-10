import express from "express";
import verifyAuth from "../utils/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import upload from "../utils/uploadMiddleware.js";
import { storyValidation } from "../utils/joiValidation.js";

import {
    createStory,
    getAllStories,
    getUserStories,
    viewStory,
    deleteStory,
} from "../controllers/storyController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

// Create a new story (with media upload)
router.post("/", upload.single("file"), storyValidation, asyncWrapper(createStory));

// Get all stories from users you follow
router.get("/", asyncWrapper(getAllStories));

// Get stories from a specific user
router.get("/user/:userId", asyncWrapper(getUserStories));

// Mark a story as viewed
router.post("/:storyId/view", asyncWrapper(viewStory));

// Delete your own story
router.delete("/:storyId", asyncWrapper(deleteStory));

export default router;
