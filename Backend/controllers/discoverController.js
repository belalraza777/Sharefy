import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Follow from "../models/followModel.js";

//get discover posts
export const getDiscoverPosts = async (req, res) => {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    if (page < 1) {
        return res.status(400).json({ success: false, message: "Invalid page number" });
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    const userId = req.user.id;
    // Check user exists
    if (!userId) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

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

    res.status(200).json({
        success: true,
        message: "Discover posts fetched",
        data: posts
    });
};


//get suggested users to follow
export const getSuggestedUsers = async (req, res) => {
    const userId = req.user.id;
    // Check user exists
    if (!userId) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Users already followed
    const followingIds = await Follow.find({ follower: userId }).distinct("following");

    // Exclude followed + self
    const excludedIds = [...followingIds, userId];

    // Fetch suggested users
    const users = await User.find({
        _id: { $nin: excludedIds }
    })
        .select("username fullName profileImage bio")
        .limit(20)
        .lean();

    res.status(200).json({
        success: true,
        message: "Suggested users fetched",
        data: users
    });
};
