import express from "express";
import multer from "multer";
import verifyAuth from "../utils/verifyAuth.js";
import { storage } from "../utils/cloudinary.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import {
    getUserProfile,
    updateProfile,
    uploadProfilePic,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ storage });


// Get user profile (with posts)
router.get('/:username', verifyAuth, asyncWrapper(getUserProfile));

//Update user profile details
router.patch('/', verifyAuth, asyncWrapper(updateProfile));

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
