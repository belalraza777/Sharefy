import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { cloudinary } from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Follow from "../models/followModel.js";
import { io, onlineUsers } from "../socket.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";



//Get user profile with their posts
export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    // Check cache first
    const cacheKey = `profile:${username}`;
    const cachedProfile = await getCache(cacheKey);
    if (cachedProfile) {
        return res.status(200).json({
            success: true,
            message: "User and posts found",
            data: cachedProfile
        });
    }

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

    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const isOwnProfile = req.user?.id?.toString() === user._id.toString();

    if (!isOwnProfile) {
        user.followers = [];
        user.following = [];
    }

    const profileData = { user, posts, followersCount, followingCount };

    // Cache profile for 5 minutes
    await setCache(cacheKey, profileData, 300);

    res.status(200).json({
        success: true,
        message: "User and posts found",
        data: profileData
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

    // Invalidate profile cache
    await deleteCache(`profile:${user.username}`);

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

    // Invalidate profile cache
    await deleteCache(`profile:${user.username}`);

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

    // Invalidate caches
    await deleteCachePattern(`following:${currentUser._id}:*`);
    await deleteCachePattern(`followers:${userToFollow._id}:*`);
    await deleteCache(`profile:${currentUser.username}`);
    await deleteCache(`profile:${userToFollow.username}`);
    await deleteCachePattern(`feed:${currentUser._id}:*`);

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

    // Invalidate caches
    await deleteCachePattern(`following:${currentUser._id}:*`);
    await deleteCachePattern(`followers:${userToUnfollow._id}:*`);
    await deleteCache(`profile:${currentUser.username}`);
    await deleteCache(`profile:${userToUnfollow.username}`);
    await deleteCachePattern(`feed:${currentUser._id}:*`);

    res.status(200).json({ success: true, message: 'User unfollowed successfully' });
};


//Get followers list of a user
export const getFollowers = async (req, res) => {
    if (req.user?.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not allowed to view followers' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `followers:${req.params.id}:page:${page}:limit:${limit}`;
    const cachedFollowers = await getCache(cacheKey);
    if (cachedFollowers) {
        return res.status(200).json({ success: true, message: 'Followers fetched successfully', data: cachedFollowers });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const total = await Follow.countDocuments({ following: user._id });

    // Find all Follow documents where 'following' is the current user's ID
    const followerRelationships = await Follow.find({ following: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('follower', 'username profileImage _id')
        .lean();

    // Extract the follower user objects
    const followers = followerRelationships.map(rel => rel.follower);
    const payload = {
        users: followers,
        page,
        limit,
        total,
        hasMore: page * limit < total
    };

    // Cache followers list for 5 minutes
    await setCache(cacheKey, payload, 300);

    res.status(200).json({ success: true, message: 'Followers fetched successfully', data: payload });
};


//Get following list of a user
export const getFollowing = async (req, res) => {
    if (req.user?.id !== req.params.id) {
        return res.status(403).json({ success: false, message: 'Not allowed to view following' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;

    // Check cache first
    const cacheKey = `following:${req.params.id}:page:${page}:limit:${limit}`;
    const cachedFollowing = await getCache(cacheKey);
    if (cachedFollowing) {
        return res.status(200).json({ success: true, message: 'Following fetched successfully', data: cachedFollowing });
    }

    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const total = await Follow.countDocuments({ follower: user._id });

    // Find all Follow documents where 'follower' is the current user's ID
    const followingRelationships = await Follow.find({ follower: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('following', 'username profileImage _id')
        .lean();

    // Extract the following user objects
    const following = followingRelationships.map(rel => rel.following);
    const payload = {
        users: following,
        page,
        limit,
        total,
        hasMore: page * limit < total
    };

    // Cache following list for 5 minutes
    await setCache(cacheKey, payload, 300);

    res.status(200).json({ success: true, message: 'Following fetched successfully', data: payload });
};