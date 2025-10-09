import SavedPost from '../models/savedPostModel.js';

export const savePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    const saved = await SavedPost.findOne({ user: userId, post: postId });
    if (saved) return res.status(400).json({ message: 'Post already saved' });

    const newSaved = new SavedPost({ user: userId, post: postId });
    await newSaved.save();
    await newSaved.populate('post');

    res.status(201).json({ success: true, message: 'Post saved successfully', data: newSaved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unsavePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.id;

  try {
    const unsaved = await SavedPost.findOneAndDelete({ user: userId, post: postId });
    res.status(200).json({ success: true, message: 'Post unsaved successfully', data: unsaved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSavedPosts = async (req, res) => {

  try {
    const savedPosts = await SavedPost.find({ user: req.user.id }).populate('post').lean();
    res.status(200).json({ success: true, message: 'Posts fetched successfully', data: savedPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
