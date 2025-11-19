import Story from "../models/storiesModel.js";
import User from "../models/userModel.js";
import Follow from "../models/followModel.js";
import { cloudinary } from "../utils/cloudinary.js";

// Create a new story
export const createStory = async (req, res) => {
    const file = req.file;
    const { caption } = req.body;

    // Validate file existence
    if (!file) {
        return res.status(400).json({ success: false, message: "Media file is required" });
    }

    // Determine media type from file mimetype
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
    });

    // Create new Story document
    const story = new Story({
        user: req.user.id,
        caption: caption || "",
        media: {
            url: result.secure_url,
            type: mediaType,
            publicId: result.public_id,
        },
        viewers: [],
    });

    await story.save();

    // Populate user data before sending response
    await story.populate('user', 'username fullName profileImage');

    res.status(201).json({
        success: true,
        message: "Story created successfully",
        data: story,
    });
};

// Get all stories from users you follow + your own
export const getAllStories = async (req, res) => {
    const userId = req.user.id;

    // get following users + self
    const following = await Follow.find({ follower: userId }).distinct("following");
    const userIds = [...following, userId];

    const stories = await Story.find({ user: { $in: userIds } })
        .populate("user", "username fullName profileImage")
        .sort({ createdAt: -1 })
        .lean();

    // group by user
    const groups = {};

    stories.forEach((story) => {
        const uid = story.user._id.toString();

        if (!groups[uid]) {
            groups[uid] = {
                user: story.user,
                stories: [],
                hasUnseen: false,
                latestStoryAt: story.createdAt,
            };
        }

        // push story with hasViewed and viewCount for own stories
        const isOwnStory = uid === userId;
        const hasViewed = story.viewers.some((v) => v.toString() === userId);
        groups[uid].stories.push({
            ...story,
            hasViewed,
            viewCount: isOwnStory ? story.viewers.length : undefined,
        });

        // update group unseen flag
        if (!hasViewed) groups[uid].hasUnseen = true;

        // update group latest story timestamp
        if (story.createdAt > groups[uid].latestStoryAt) {
            groups[uid].latestStoryAt = story.createdAt;
        }
    });

    // convert object to array & sort
    const groupedStories = Object.values(groups).sort(
        (a, b) => b.latestStoryAt - a.latestStoryAt
    );

    res.status(200).json({
        success: true,
        message: "Stories fetched successfully",
        data: groupedStories,
    });
};

// Get stories from a specific user
export const getUserStories = async (req, res) => {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get all stories from this user
    const stories = await Story.find({ user: userId })
        .populate('user', 'username fullName profileImage')
        .sort({ createdAt: -1 })
        .lean();

    // Add view info (only show viewCount if viewing own stories)
    const isOwnStory = userId === req.user.id;
    const storiesWithViewInfo = stories.map(story => ({
        ...story,
        viewCount: isOwnStory ? story.viewers.length : undefined,
        hasViewed: story.viewers.some(viewerId => viewerId.toString() === req.user.id),
    }));

    res.status(200).json({
        success: true,
        message: "User stories fetched successfully",
        data: storiesWithViewInfo,
    });
};

// View a story (mark as viewed)
export const viewStory = async (req, res) => {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
        return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Check if user already viewed this story
    const alreadyViewed = story.viewers.includes(userId);

    if (!alreadyViewed) {
        story.viewers.push(userId);
        await story.save();
    }

    // Populate and return updated story
    await story.populate('user', 'username fullName profileImage');

    // Only show viewCount if it's the user's own story
    const isOwnStory = story.user._id.toString() === userId;

    res.status(200).json({
        success: true,
        message: alreadyViewed ? "Story already viewed" : "Story viewed",
        data: {
            ...story.toObject(),
            viewCount: isOwnStory ? story.viewers.length : undefined,
        },
    });
};

// Delete a story own
export const deleteStory = async (req, res) => {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
        return res.status(404).json({ success: false, message: "Story not found" });
    }

    // Check if user owns this story
    if (story.user.toString() !== userId) {
        return res.status(403).json({ success: false, message: "You can only delete your own stories" });
    }

    // Delete media from Cloudinary
    try {
        await cloudinary.uploader.destroy(story.media.publicId, {
            resource_type: story.media.type === 'video' ? 'video' : 'image',
        });
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        // Continue with deletion even if Cloudinary fails
    }

    // Delete story from database
    await Story.findByIdAndDelete(storyId);

    res.status(200).json({
        success: true,
        message: "Story deleted successfully",
    });
};
