import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import { cloudinary } from "../config/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Follow from "../models/followModel.js";
import { io, onlineUsers } from "../socket.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";

//Create a new post
const createPostService = async (userId, file, caption) => {
    if (caption.length > 2200) {
        throw Object.assign(new Error("Caption exceeds maximum length of 2200 characters"), { statusCode: 400 });
    }
    //Important: Validate file existence
    if (!file) {
        throw Object.assign(new Error("File is required"), { statusCode: 400 });
    }
    //Upload file to Cloudinary (auto-detects image/video/etc.)
    const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
    });
    //find User 
    const user = await User.findById(userId);
    if (!user) {
        throw Object.assign(new Error("User not found"), { statusCode: 404 });
    }
    // Create new Post document in MongoDB
    const post = new Post({
        user: user._id, // Who created the post
        media: {
            url: result.secure_url,     // Public URL
            type: result.resource_type, // e.g. "image", "video"
            publicId: result.public_id, // Needed for deletion later
        },
        caption,
    });
    // Save post in DB
    await post.save();
    // Invalidate feed caches for all followers
    await deleteCachePattern(`feed:*`);
    await deleteCache(`profile:${user.username}`);
    // 🔔 Create notifications for followers
    const followersRelationships = await Follow.find({ following: userId });
    const followers = followersRelationships.map(rel => rel.follower);
    if (followers.length > 0) {
        const notifications = followers.map(id => ({
            receiver: id,
            sender: userId,
            message: `created a new post`,
        }));
        const insertedNotifications = await Notification.insertMany(notifications);  // bulk insert
        // Emit real-time notifications to online followers
        for (const notification of insertedNotifications) {
            const recipientSocketId = onlineUsers[notification.receiver.toString()];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("new_notification", notification);
            }
        }
    }
    return post;
};

//Get a single post by ID
const getPostByIdService = async (postId) => {
    // Check cache first
    const cacheKey = `post:${postId}`;
    const cachedPost = await getCache(cacheKey);
    if (cachedPost) {
        return cachedPost;
    }
    // Populate: fetch user info + comments linked to this post
    const post = await Post.findById(postId).populate([
        { path: "user" },       // Post owner info
        {
            path: "comments",
            populate: {
                path: "user",
                select: "username profileImage",
            },
        },
    ]);
    if (!post) {
        throw Object.assign(new Error("Post not found"), { statusCode: 404 });
    }
    // Cache post for 5 minutes
    await setCache(cacheKey, post, 300);
    return post;
};

//Like a post
const likePostService = async (postId, userId) => {
    const post = await Post.findById(postId).populate("user");
    // Important: Prevent duplicate likes
    if (post.likes.includes(userId)) {
        throw Object.assign(new Error("You already liked this post"), { statusCode: 400 });
    }
    // Add user ID to post.likes
    post.likes.push(userId);
    await post.save();
    // Invalidate post cache
    await deleteCache(`post:${postId}`);
    // 🔔 Notify post owner
    if (post.user._id.toString() !== userId) {
        const newNotification = await Notification.create({
            receiver: post.user._id,
            sender: userId,
            message: `liked your post`,
        });
        // Emit a real-time notification to the post author if they are online
        const recipientSocketId = onlineUsers[post.user._id.toString()];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("new_notification", newNotification);
        }
    }
    return post;
};

//Unlike a post
const unlikePostService = async (postId, userId) => {
    const post = await Post.findById(postId);
    //  Important: Prevent unliking if not liked
    if (!post.likes.includes(userId)) {
        throw Object.assign(new Error("You haven't liked this post yet"), { statusCode: 400 });
    }
    // Remove user ID from post.likes
    post.likes.pull(userId);
    await post.save();
    // Invalidate post cache
    await deleteCache(`post:${postId}`);
    return post;
};

//Delete a post (only the owner can delete)
const deletePostService = async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw Object.assign(new Error("Post not found"), { statusCode: 404 });
    }
    //  Important: Authorization check
    if (post.user.toString() !== userId) {
        throw Object.assign(new Error("You are not authorized to delete this post"), { statusCode: 401 });
    }
    //  Delete file from Cloudinary (so storage is not wasted)
    await cloudinary.uploader.destroy(post.media.publicId);
    //  Delete post from MongoDB
    await Post.findByIdAndDelete(postId);
    //Delete all comments related to this post
    await Comment.deleteMany({ post: postId });
    // Invalidate caches
    await deleteCache(`post:${postId}`);
    await deleteCachePattern(`feed:*`);
};

export default {
    createPostService,
    getPostByIdService,
    likePostService,
    unlikePostService,
    deletePostService,
};