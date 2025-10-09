import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import Notification from "../models/notificationModel.js";
import { io, onlineUsers } from "../socket.js";


//Add a comment to a post
export const addComment = async (req, res) => {
    // Important: Validation check
    if (!req.body.text) {
        return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    //Find the post
    const post = await Post.findById(req.params.postId);
    if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Create new comment
    const comment = new Comment({
        post: req.params.postId,
        user: req.user.id,   // The logged-in user
        text: req.body.text,
    });

    //Save comment + attach to post
    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    // 🔔 Notify post owner (if not commenting on own post)
    if (post.user._id.toString() !== req.user.id) {
        const newNotification = await Notification.create({
            receiver: post.user._id,
            sender: req.user.id,
            message: ` commented on your post`,
        });

        // Emit a real-time notification to the post author if they are online
        const recipientSocketId = onlineUsers[post.user._id.toString()];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("new_notification", newNotification);
        }
    }

    res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
    });
};


// Delete a comment (only by the owner)
export const deleteComment = async (req, res) => {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
        return res.status(404).json({ success: false, message: "Comment not found" });
    }

    //Important: Authorization check
    if (comment.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to delete this comment",
        });
    }

    // Delete comment
    await Comment.findByIdAndDelete(req.params.commentId);

    // remove reference from post.comments
    await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { comments: req.params.commentId },
    });

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
};
