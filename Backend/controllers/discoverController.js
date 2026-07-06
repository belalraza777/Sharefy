import discoverService from "../services/discoverService.js";

// Get discover posts
export const getDiscoverPosts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const userId = req.user.id;
    const posts = await discoverService.getDiscoverPostsService(userId, page);
    res.status(200).json({ success: true, message: "Discover posts fetched", data: posts });
};

// Get suggested users to follow
export const getSuggestedUsers = async (req, res) => {
    const userId = req.user.id;
    const users = await discoverService.getSuggestedUsersService(userId);
    res.status(200).json({ success: true, message: "Suggested users fetched", data: users });
};