import express from "express";
import verifyAuth from "../middlewares/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { commentValidation } from "../middlewares/joiValidation.js";
import { addComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

// Add a comment to a post
router.post("/:postId", verifyAuth, commentValidation, asyncWrapper(addComment));

// Delete a comment (only owner)
router.delete("/:postId/:commentId", verifyAuth, asyncWrapper(deleteComment));

export default router;
