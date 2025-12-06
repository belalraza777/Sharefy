import express from "express";
import verifyAuth from "../middlewares/verifyAuth.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { profileUpdateValidation } from "../middlewares/joiValidation.js";
import {
    getUserProfile,
    updateProfile,
    uploadProfilePic,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from "../controllers/userController.js";
import upload from "../middlewares/uploadMiddleware.js"; 

const router = express.Router();


// Get user profile (with posts)
router.get('/:username', verifyAuth, asyncWrapper(getUserProfile));

//Update user profile details
router.patch('/', verifyAuth, profileUpdateValidation, asyncWrapper(updateProfile));

//Upload or update profile picture
router.post('/profile', verifyAuth, upload.single("file"), asyncWrapper(uploadProfilePic));

// Follow a user
router.post('/:id/follow', verifyAuth, asyncWrapper(followUser));

//Unfollow a user
router.post('/:id/unfollow', verifyAuth, asyncWrapper(unfollowUser));

// Get followers list
router.get('/:id/followers', verifyAuth, asyncWrapper(getFollowers));

// Get following list
router.get('/:id/following', verifyAuth, asyncWrapper(getFollowing));

export default router;
