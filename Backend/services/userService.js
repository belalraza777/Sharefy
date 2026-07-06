import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { cloudinary } from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Follow from "../models/followModel.js";
import { io, onlineUsers } from "../socket.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";

//Get user profile with their posts
const getUserProfileService = async (username, requestingUserId) => {
    // Check cache first
    const cacheKey = `profile:${username}`;
    const cachedProfile = await getCache(cacheKey);
    if (cachedProfile) {
        return cachedProfile;
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
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    // Get posts of this user
    const posts = await Post.find({ user: user._id }).lean();
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const isOwnProfile = requestingUserId?.toString() === user._id.toString();
    if (!isOwnProfile) {
        user.followers = [];
        user.following = [];
    }
    const profileData = { user, posts, followersCount, followingCount };
    // Cache profile for 5 minutes
    await setCache(cacheKey, profileData, 300);
    return profileData;
};

//Update user profile (bio, username, fullname, email, etc.)
const updateProfileService = async (userId, body) => {
    if (!body) {
        throw Object.assign(new Error('No data provided'), { statusCode: 400 });
    }
    const user = await User.findByIdAndUpdate(userId, body, { new: true });
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    // Invalidate profile cache
    await deleteCache(`profile:${user.username}`);
    return user;
};

// Upload or update profile picture
const uploadProfilePicService = async (userId, file) => {
    if (!file) {
        throw Object.assign(new Error("File is required"), { statusCode: 400 });
    }
    // Find logged-in user
    const user = await User.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, { resource_type: 'image' });
    // Save image URL in DB
    user.profileImage = result.secure_url;
    await user.save();
    // Invalidate profile cache
    await deleteCache(`profile:${user.username}`);
    return user;
};

//Follow another user
const followUserService = async (targetUserId, currentUserId) => {
    const userToFollow = await User.findById(targetUserId);
    if (!userToFollow) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    const currentUser = await User.findById(currentUserId);
    // Check if already following using the Follow model
    const existingFollow = await Follow.findOne({
        follower: currentUser._id,
        following: userToFollow._id,
    });
    if (existingFollow) {
        throw Object.assign(new Error('Already following this user'), { statusCode: 400 });
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
};

//Unfollow a user
const unfollowUserService = async (targetUserId, currentUserId) => {
    const userToUnfollow = await User.findById(targetUserId);
    if (!userToUnfollow) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    const currentUser = await User.findById(currentUserId);
    // Check if user is currently following using the Follow model
    const deletedFollow = await Follow.findOneAndDelete({
        follower: currentUser._id,
        following: userToUnfollow._id,
    });
    if (!deletedFollow) {
        throw Object.assign(new Error('Not following this user'), { statusCode: 400 });
    }
    // Invalidate caches
    await deleteCachePattern(`following:${currentUser._id}:*`);
    await deleteCachePattern(`followers:${userToUnfollow._id}:*`);
    await deleteCache(`profile:${currentUser.username}`);
    await deleteCache(`profile:${userToUnfollow.username}`);
    await deleteCachePattern(`feed:${currentUser._id}:*`);
};

//Get followers list of a user
const getFollowersService = async (targetUserId, requestingUserId, rawPage, rawLimit) => {
    if (requestingUserId !== targetUserId) {
        throw Object.assign(new Error('Not allowed to view followers'), { statusCode: 403 });
    }
    const page = Math.max(parseInt(rawPage, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;
    // Check cache first
    const cacheKey = `followers:${targetUserId}:page:${page}:limit:${limit}`;
    const cachedFollowers = await getCache(cacheKey);
    if (cachedFollowers) {
        return cachedFollowers;
    }
    const user = await User.findById(targetUserId).select('-passwordHash');
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
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
    return payload;
};

//Get following list of a user
const getFollowingService = async (targetUserId, requestingUserId, rawPage, rawLimit) => {
    if (requestingUserId !== targetUserId) {
        throw Object.assign(new Error('Not allowed to view following'), { statusCode: 403 });
    }
    const page = Math.max(parseInt(rawPage, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(rawLimit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;
    // Check cache first
    const cacheKey = `following:${targetUserId}:page:${page}:limit:${limit}`;
    const cachedFollowing = await getCache(cacheKey);
    if (cachedFollowing) {
        return cachedFollowing;
    }
    const user = await User.findById(targetUserId).select('-passwordHash');
    if (!user) {
        throw Object.assign(new Error('User not found'), { statusCode: 404 });
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
    return payload;
};

export default {
    getUserProfileService,
    updateProfileService,
    uploadProfilePicService,
    followUserService,
    unfollowUserService,
    getFollowersService,
    getFollowingService,
};