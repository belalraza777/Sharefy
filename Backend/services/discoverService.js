import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Follow from "../models/followModel.js";
import { getCache, setCache } from "../utils/cache.js";

// Get discover posts
const getDiscoverPostsService = async (userId, page) => {
    // Pagination
    if (page < 1) {
        throw Object.assign(new Error("Invalid page number"), { statusCode: 400 });
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    // Check user exists
    if (!userId) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    // Check cache first
    const cacheKey = `discover:${userId}:${page}`;
    const cachedPosts = await getCache(cacheKey);
    if (cachedPosts) return cachedPosts;
    // Get followed IDs
    const followingIds = await Follow.find({ follower: userId }).distinct("following");
    // Exclude followed + self
    const excludedIds = [...followingIds, userId];
    // Fetch discover posts
    const posts = await Post.find({ user: { $nin: excludedIds } })
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    // Cache discover posts for 10 minutes
    await setCache(cacheKey, posts, 600);
    return posts;
};

// Get suggested users to follow
const getSuggestedUsersService = async (userId) => {
    // Check user exists
    if (!userId) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    // Check cache first
    const cacheKey = `suggested:${userId}`;
    const cachedUsers = await getCache(cacheKey);
    if (cachedUsers) return cachedUsers;
    // Users already followed
    const followingIds = await Follow.find({ follower: userId }).distinct("following");
    // Exclude followed + self
    const excludedIds = [...followingIds, userId];
    // Fetch suggested users
    const users = await User.find({ _id: { $nin: excludedIds } })
        .select("username fullName profileImage bio")
        .limit(50)
        .lean();
    // Cache suggested users for 30 minutes
    await setCache(cacheKey, users, 1800);
    return users;
};

export default {
    getDiscoverPostsService,
    getSuggestedUsersService,
};