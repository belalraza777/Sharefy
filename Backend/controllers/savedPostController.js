import savedPostService from '../services/savedPostService.js';

// Save a post
export const savePost = async (req, res) => {
    const newSaved = await savedPostService.savePostService(req.user.id, req.params.id);
    res.status(201).json({ success: true, message: 'Post saved successfully', data: newSaved });
};
// Unsave a post
export const unsavePost = async (req, res) => {
    const unsaved = await savedPostService.unsavePostService(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Post unsaved successfully', data: unsaved });
};
// Get all saved posts for a user
export const getSavedPosts = async (req, res) => {
    const savedPosts = await savedPostService.getSavedPostsService(req.user.id);
    res.status(200).json({ success: true, message: 'Posts fetched successfully', data: savedPosts });
};