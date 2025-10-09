import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { cloudinary } from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Follow from "../models/followModel.js";
import { io, onlineUsers } from "../socket.js";



//Get user profile with their posts
export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    // Find user by username (excluding password)
    const user = await User.findOne({ username }).select('-passwordHash')
        .populate({
            path: "followers",
            populate: {
                path: "follower", // user who follows
                select: "username profileImage _id",
            },
        })
        .populate({
            path: "following",
            populate: {
                path: "following", // user being followed
                select: "username profileImage _id",
            },
        })
        .lean();


    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get posts of this user
    const posts = await Post.find({ user: user._id }).lean();

    res.status(200).json({
        success: true,
        message: "User and posts found",
        data: { user, posts }
    });
};


//Update user profile (bio, username, fullname, email, etc.)
export const updateProfile = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ success: false, message: 'No data provided' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
};


// Upload or update profile picture
export const uploadProfilePic = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, message: "File is required" });
    }

    // Find logged-in user
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });

    // Save image URL in DB
    user.profileImage = result.secure_url;
    await user.save();

    res.status(200).json({ success: true, message: 'Profile image updated successfully', data: user });
};


//Follow another user
export const followUser = async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);

    // Check if already following using the Follow model
    const existingFollow = await Follow.findOne({
        follower: currentUser._id,
        following: userToFollow._id,
    });

    if (existingFollow) {
        return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    // Create new follow relationship
    await Follow.create({
        follower: currentUser._id,
        following: userToFollow._id,
    });

    // 🔔 Notify the user being followed
    const newNotification = await Notification.create({
        receiver: userToFollow._id,
        sender: currentUser._id,
        message: `started following you`,
    });

    // Emit a real-time notification to the user who was followed
    const recipientSocketId = onlineUsers[userToFollow._id.toString()];
    if (recipientSocketId) {
        io.to(recipientSocketId).emit("new_notification", newNotification);
    }

    res.status(200).json({ success: true, message: 'User followed successfully' });
};


//Unfollow a user
export const unfollowUser = async (req, res) => {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);

    // Check if user is currently following using the Follow model
    const deletedFollow = await Follow.findOneAndDelete({
        follower: currentUser._id,
        following: userToUnfollow._id,
    });

    if (!deletedFollow) {
        return res.status(400).json({ success: false, message: 'Not following this user' });
    }

    res.status(200).json({ success: true, message: 'User unfollowed successfully' });
};


//Get followers list of a user
export const getFollowers = async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all Follow documents where 'following' is the current user's ID
    const followerRelationships = await Follow.find({ following: user._id }).populate('follower', '-passwordHash').lean();

    // Extract the follower user objects
    const followers = followerRelationships.map(rel => rel.follower);

    res.status(200).json({ success: true, message: 'Followers fetched successfully', data: followers });
};


//Get following list of a user
export const getFollowing = async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find all Follow documents where 'follower' is the current user's ID
    const followingRelationships = await Follow.find({ follower: user._id }).populate('following', '-passwordHash').lean();

    // Extract the following user objects
    const following = followingRelationships.map(rel => rel.following);

    res.status(200).json({ success: true, message: 'Following fetched successfully', data: following });
};