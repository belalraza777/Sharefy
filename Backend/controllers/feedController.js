import feedService from "../services/feedService.js";

// Get Feed
export const getFeed = async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Current page, default to 1
    const userId = req.user.id;
    const posts = await feedService.getFeedService(userId, page);
    res.status(200).json({ success: true, message: "Feed fetched", data: posts });
};