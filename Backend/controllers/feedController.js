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

export default async function getFeed(req, res) {

    // Validate page number if provided
    if (req.query.page < 1) {
        return res.status(400).json({ success: false, message: "Invalid page number" });
    }

    // Setup pagination variables
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Current page, default to 1
    const limit = 20; // Number of posts per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip

    // Check cache first
    // const cacheKey = `feed:${req.user.id}:${page}`;
    // const cachedFeed = await getCache(cacheKey);
    // if (cachedFeed) {
    //     return res.status(200).json({ success: true, message: "Feed fetched", data: cachedFeed });
    // }

    // Find the currently authenticated user
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Cache following list
    // const followingCacheKey = `following:${req.user.id}`;
    // let followingIds = await getCache(followingCacheKey);

    // Since cache is not used, always fetch followingIds
    const followingIds = await Follow.find({ follower: user._id }).distinct("following");
    // await setCache(followingCacheKey, followingIds, 600); // 10 minutes

    // Find all posts from the users they are following
    const posts = await Post.find({ user: { $in: followingIds } })
        .populate('user', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Cache feed for 3 minutes
    // await setCache(cacheKey, posts, 180);

    // Send the feed posts as a response
    res.status(200).json({ success: true, message: "Feed fetched", data: posts });
};