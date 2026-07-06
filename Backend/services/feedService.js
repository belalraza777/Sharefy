import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Follow from "../models/followModel.js";

/* Get Feed
Fan-out Design:
Two approaches to feed generation:
1.Pull Model: Fetch posts from followed users on-the-fly (simpler but slower for many follows)
2.Push Model: Pre-generate feed when followed users post (faster reads but complex writes)
Here, we implement a Pull Model with caching for simplicity and performance.
*/
const getFeedService = async (userId, page) => {
    // Validate page number if provided
    if (page < 1) {
        throw Object.assign(new Error("Invalid page number"), { statusCode: 400 });
    }
    // Setup pagination variables
    const limit = 20; // Number of posts per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip
    // Check cache first
    // const cacheKey = `feed:${userId}:${page}`;
    // const cachedFeed = await getCache(cacheKey);
    // if (cachedFeed) {
    //     return cachedFeed;
    // }
    // Find the currently authenticated user
    const user = await User.findById(userId).lean();
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    // Cache following list
    // const followingCacheKey = `following:${userId}`;
    // let followingIds = await getCache(followingCacheKey);
    // Since cache is not used, always fetch followingIds
    const followingIds = await Follow.find({ follower: user._id }).distinct("following");
    // await setCache(followingCacheKey, followingIds, 600); // 10 minutes
    // Find all posts from the users they are following
    const posts = await Post.find({ user: { $in: followingIds } })
        .populate("user", "username profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    // Cache feed for 3 minutes
    // await setCache(cacheKey, posts, 180);
    return posts;
};

export default {
    getFeedService,
};