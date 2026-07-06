import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import Notification from "../models/notificationModel.js";
import { io, onlineUsers } from "../socket.js";
import { deleteCache } from "../utils/cache.js";

// Add a comment to a post
const addCommentService = async (postId, userId, text) => {
    // Important: Validation check
    if (!text) {
        throw Object.assign(new Error("Comment text is required"), { statusCode: 400 });
    }
    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error("Post not found"), { statusCode: 404 });
    }
    // Create new comment
    const comment = new Comment({
        post: postId,
        user: userId, // The logged-in user
        text,
    });
    // Save comment + attach to post
    await comment.save();
    post.comments.push(comment._id);
    await post.save();
    // Invalidate post cache
    await deleteCache(`post:${postId}`);
    // 🔔 Notify post owner (if not commenting on own post)
    if (post.user._id.toString() !== userId) {
        const newNotification = await Notification.create({
            receiver: post.user._id,
            sender: userId,
            message: ` commented on your post`,
        });
        // Emit a real-time notification to the post author if they are online
        const recipientSocketId = onlineUsers[post.user._id.toString()];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("new_notification", newNotification);
        }
    }
    return comment;
};

// Delete a comment (only by the owner)
const deleteCommentService = async (commentId, postId, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw Object.assign(new Error("Comment not found"), { statusCode: 404 });
    }
    // Important: Authorization check
    if (comment.user.toString() !== userId) {
        throw Object.assign(new Error("You are not authorized to delete this comment"), { statusCode: 403 });
    }
    // Delete comment
    await Comment.findByIdAndDelete(commentId);
    // Remove reference from post.comments
    await Post.findByIdAndUpdate(postId, {
        $pull: { comments: commentId },
    });
    // Invalidate post cache
    await deleteCache(`post:${postId}`);
};

export default {
    addCommentService,
    deleteCommentService,
};