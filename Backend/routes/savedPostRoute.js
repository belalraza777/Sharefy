import express from 'express';
import { savePost, unsavePost, getSavedPosts } from '../controllers/savedPostController.js';
import verifyAuth from "../middlewares/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";


const router = express.Router();

// Get all saved posts for a user
router.get('/', verifyAuth, asyncWrapper(getSavedPosts));

// Save a post
router.post('/:id/save', verifyAuth, asyncWrapper(savePost));

// Unsave a post
router.delete('/:id/save', verifyAuth, asyncWrapper(unsavePost));


export default router;
