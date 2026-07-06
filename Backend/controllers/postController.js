import postService from "../services/postService.js";

//Create a new post
export const createPost = async (req, res) => {
    const file = req.file; // Multer provides this
    const caption = req.body?.caption || "";
    const post = await postService.createPostService(req.user.id, file, caption);
    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
    });
};

//Get a single post by ID
export const getPostById = async (req, res) => {
    const post = await postService.getPostByIdService(req.params.id);
    res.status(200).json({
        success: true,
        message: "Post fetched successfully",
        data: post,
    });
};

//Like a post
export const likePost = async (req, res) => {
    const post = await postService.likePostService(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Post liked successfully",
        data: post,
    });
};

//Unlike a post
export const unlikePost = async (req, res) => {
    const post = await postService.unlikePostService(req.params.id, req.user.id);
    res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        data: post,
    });
};

//Delete a post (only the owner can delete)
export const deletePost = async (req, res) => {
    await postService.deletePostService(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "Post deleted successfully" });
};