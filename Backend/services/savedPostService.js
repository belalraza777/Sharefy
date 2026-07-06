import SavedPost from '../models/savedPostModel.js';
import { getCache, setCache, deleteCache } from '../utils/cache.js';

// Save a post 
const savePostService = async (userId, postId) => {
    const saved = await SavedPost.findOne({ user: userId, post: postId });
    if (saved) {
        throw Object.assign(new Error('Post already saved'), { statusCode: 400 });
    }
    const newSaved = new SavedPost({ user: userId, post: postId });
    await newSaved.save();
    await newSaved.populate('post');
    // Invalidate saved posts cache
    await deleteCache(`saved:${userId}`);
    return newSaved;
};

// Unsave a post
const unsavePostService = async (userId, postId) => {
    const unsaved = await SavedPost.findOneAndDelete({ user: userId, post: postId });
    // Invalidate saved posts cache
    await deleteCache(`saved:${userId}`);
    return unsaved;
};

// Get all saved posts for a user
const getSavedPostsService = async (userId) => {
    // Check cache first
    const cacheKey = `saved:${userId}`;
    const cachedSavedPosts = await getCache(cacheKey);
    if (cachedSavedPosts) {
        return cachedSavedPosts;
    }
    const savedPosts = await SavedPost.find({ user: userId }).populate('post').lean();
    // Cache saved posts for 10 minutes
    await setCache(cacheKey, savedPosts, 600);
    return savedPosts;
};

export default {
    savePostService,
    unsavePostService,
    getSavedPostsService,
};