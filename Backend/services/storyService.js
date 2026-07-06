import Story from "../models/storiesModel.js";
import User from "../models/userModel.js";
import Follow from "../models/followModel.js";
import { cloudinary } from "../utils/cloudinary.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";

// Create a new story
const createStoryService = async (userId, file, caption) => {
    // Validate file existence
    if (!file) {
        throw Object.assign(new Error("Media file is required"), { statusCode: 400 });
    }
    // Determine media type from file mimetype
    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
    });
    // Create new Story document
    const story = new Story({
        user: userId,
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
    // Invalidate stories cache for all followers
    await deleteCachePattern(`stories:*`);
    await deleteCachePattern(`userstories:*`);
    return story;
};

// Get all stories from users you follow + your own
const getAllStoriesService = async (userId) => {
    // Check cache first
    const cacheKey = `stories:${userId}`;
    const cachedStories = await getCache(cacheKey);
    if (cachedStories) {
        return cachedStories;
    }
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
    // Cache stories for 5 minutes
    await setCache(cacheKey, groupedStories, 300);
    return groupedStories;
};

// Get stories from a specific user
const getUserStoriesService = async (targetUserId, viewerId) => {
    // Check cache first
    const cacheKey = `userstories:${targetUserId}:${viewerId}`;
    const cachedStories = await getCache(cacheKey);
    if (cachedStories) {
        return cachedStories;
    }
    // Check if user exists
    const user = await User.findById(targetUserId);
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    // Get all stories from this user
    const stories = await Story.find({ user: targetUserId })
        .populate('user', 'username fullName profileImage')
        .sort({ createdAt: -1 })
        .lean();
    // Add view info (only show viewCount if viewing own stories)
    const isOwnStory = targetUserId === viewerId;
    const storiesWithViewInfo = stories.map(story => ({
        ...story,
        viewCount: isOwnStory ? story.viewers.length : undefined,
        hasViewed: story.viewers.some(viewerIdInList => viewerIdInList.toString() === viewerId),
    }));
    // Cache user stories for 5 minutes
    await setCache(cacheKey, storiesWithViewInfo, 300);
    return storiesWithViewInfo;
};

// View a story (mark as viewed)
const viewStoryService = async (storyId, userId) => {
    const story = await Story.findById(storyId);
    if (!story) {
        throw Object.assign(new Error("Story not found"), { statusCode: 404 });
    }
    // Check if user already viewed this story
    const alreadyViewed = story.viewers.includes(userId);
    if (!alreadyViewed) {
        story.viewers.push(userId);
        await story.save();
        // Invalidate caches when view count changes
        await deleteCachePattern(`stories:*`);
        await deleteCachePattern(`userstories:${story.user}:*`);
    }
    // Populate and return updated story
    await story.populate('user', 'username fullName profileImage');
    // Only show viewCount if it's the user's own story
    const isOwnStory = story.user._id.toString() === userId;
    return {
        alreadyViewed,
        data: {
            ...story.toObject(),
            viewCount: isOwnStory ? story.viewers.length : undefined,
        },
    };
};

// Delete a story own
const deleteStoryService = async (storyId, userId) => {
    const story = await Story.findById(storyId);
    if (!story) {
        throw Object.assign(new Error("Story not found"), { statusCode: 404 });
    }
    // Check if user owns this story
    if (story.user.toString() !== userId) {
        throw Object.assign(new Error("You can only delete your own stories"), { statusCode: 403 });
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
    // Invalidate caches
    await deleteCachePattern(`stories:*`);
    await deleteCachePattern(`userstories:${userId}:*`);
};

export default {
    createStoryService,
    getAllStoriesService,
    getUserStoriesService,
    viewStoryService,
    deleteStoryService,
};