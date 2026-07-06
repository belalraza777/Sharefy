import commentService from "../services/commentService.js";

// Add a comment to a post
export const addComment = async (req, res) => {
    const postId  = req.params.postId;
    const userId  = req.user.id;        // The logged-in user
    const text    = req.body.text;

    const comment = await commentService.addCommentService(postId, userId, text);

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
};

// Delete a comment (only by the owner)
export const deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
    const postId    = req.params.postId;
    const userId    = req.user.id;

    await commentService.deleteCommentService(commentId, postId, userId);

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
};