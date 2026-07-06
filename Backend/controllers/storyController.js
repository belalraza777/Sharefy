import storyService from "../services/storyService.js";

// Create a new story
export const createStory = async (req, res) => {
    const file = req.file;
    const { caption } = req.body;
    const story = await storyService.createStoryService(req.user.id, file, caption);
    res.status(201).json({
        success: true,
        message: "Story created successfully",
        data: story,
    });
};

// Get all stories from users you follow + your own
export const getAllStories = async (req, res) => {
    const groupedStories = await storyService.getAllStoriesService(req.user.id);
    res.status(200).json({
        success: true,
        message: "Stories fetched successfully",
        data: groupedStories,
    });
};

// Get stories from a specific user
export const getUserStories = async (req, res) => {
    const { userId } = req.params;
    const storiesWithViewInfo = await storyService.getUserStoriesService(userId, req.user.id);
    res.status(200).json({
        success: true,
        message: "User stories fetched successfully",
        data: storiesWithViewInfo,
    });
};

// View a story (mark as viewed)
export const viewStory = async (req, res) => {
    const { storyId } = req.params;
    const { alreadyViewed, data } = await storyService.viewStoryService(storyId, req.user.id);
    res.status(200).json({
        success: true,
        message: alreadyViewed ? "Story already viewed" : "Story viewed",
        data,
    });
};

// Delete a story (own)
export const deleteStory = async (req, res) => {
    const { storyId } = req.params;
    await storyService.deleteStoryService(storyId, req.user.id);
    res.status(200).json({
        success: true,
        message: "Story deleted successfully",
    });
};