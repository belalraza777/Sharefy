import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";
import { cloudinary } from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Follow from "../models/followModel.js";
import { io, onlineUsers } from "../socket.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";


/* Get Feed
Fan-out Design:
Two approaches to feed generation:
1.Pull Model: Fetch posts from followed users on-the-fly (simpler but slower for many follows)
2.Push Model: Pre-generate feed when followed users post (faster reads but complex writes)
Here, we implement a Pull Model with caching for simplicity and performance.
*/

export const getFeed = async (req, res) => {

    // Validate page number if provided
    if (req.query.page < 1) {
        return res.status(400).json({ success: false, message: "Invalid page number" });
    }

    // Setup pagination variables
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Current page, default to 1
    const limit = 20; // Number of posts per page
    const skip = (page - 1) * limit; // Calculate the number of posts to skip

    // Check cache first
    const cacheKey = `feed:${req.user.id}:${page}`;
    const cachedFeed = await getCache(cacheKey);
    if (cachedFeed) {
        return res.status(200).json({ success: true, message: "Feed fetched", data: cachedFeed });
    }

    // Find the currently authenticated user
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Cache following list
    const followingCacheKey = `following:${req.user.id}`;
    let followingIds = await getCache(followingCacheKey);
    
    if (!followingIds) {
        followingIds = await Follow.find({ follower: user._id }).distinct("following");
        await setCache(followingCacheKey, followingIds, 600); // 10 minutes
    }

    // Find all posts from the users they are following
    const posts = await Post.find({ user: { $in: followingIds } })
        .populate('user', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Cache feed for 3 minutes
    await setCache(cacheKey, posts, 180);

    // Send the feed posts as a response
    res.status(200).json({ success: true, message: "Feed fetched", data: posts });
};



//Create a new post
export const createPost = async (req, res) => {
    const file = req.file; // Multer provides this
    const caption = req.body?.caption || "";
    if (caption.length > 2200) {
        return res.status(400).json({ success: false, message: "Caption exceeds maximum length of 2200 characters" });
    }
    //Important: Validate file existence
    if (!file) {
        return res.status(400).json({ success: false, message: "File is required" });
    }
    //Upload file to Cloudinary (auto-detects image/video/etc.)
    const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto",
    });

    // Create new Post document in MongoDB
    const post = new Post({
        user: req.user.id, // Who created the post
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

    // 🔔 Create notifications for followers
    const followersRelationships = await Follow.find({ following: req.user.id });
    const followers = followersRelationships.map(rel => rel.follower);
    if (followers.length > 0) {
        const notifications = followers.map(id => ({
            receiver: id,
            sender: req.user.id,
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

    // Respond to client
    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
    });
};



//Get a single post by ID
export const getPostById = async (req, res) => {
    // Check cache first
    const cacheKey = `post:${req.params.id}`;
    const cachedPost = await getCache(cacheKey);
    if (cachedPost) {
        return res.status(200).json({
            success: true,
            message: "Post fetched successfully",
            data: cachedPost,
        });
    }

    // Populate: fetch user info + comments linked to this post
    const post = await Post.findById(req.params.id).populate([
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
        return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Cache post for 5 minutes
    await setCache(cacheKey, post, 300);

    res.status(200).json({
        success: true,
        message: "Post fetched successfully",
        data: post,
    });
};


//Like a post
export const likePost = async (req, res) => {
    const post = await Post.findById(req.params.id).populate("user");
    // Important: Prevent duplicate likes
    if (post.likes.includes(req.user.id)) {
        return res.status(400).json({ success: false, message: "You already liked this post" });
    }
    // Add user ID to post.likes
    post.likes.push(req.user.id);
    await post.save();

    // Invalidate post cache
    await deleteCache(`post:${req.params.id}`);

    // 🔔 Notify post owner
    if (post.user._id.toString() !== req.user.id) {
        const newNotification = await Notification.create({
            receiver: post.user._id,
            sender: req.user.id,
            message: `liked your post`,
        });

        // Emit a real-time notification to the post author if they are online
        const recipientSocketId = onlineUsers[post.user._id.toString()];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("new_notification", newNotification);
        }
    }

    res.status(200).json({
        success: true,
        message: "Post liked successfully",
        data: post,
    });
};


//Unlike a post
export const unlikePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    //  Important: Prevent unliking if not liked
    if (!post.likes.includes(req.user.id)) {
        return res.status(400).json({ success: false, message: "You haven't liked this post yet" });
    }
    // Remove user ID from post.likes
    post.likes.pull(req.user.id);
    await post.save();

    // Invalidate post cache
    await deleteCache(`post:${req.params.id}`);

    res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        data: post,
    });
};


//Delete a post (only the owner can delete)
export const deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ success: false, message: "Post not found" });
    }
    //  Important: Authorization check
    if (post.user.toString() !== req.user.id) {
        return res.status(401).json({
            success: false,
            message: "You are not authorized to delete this post",
        });
    }
    //  Delete file from Cloudinary (so storage is not wasted)
    await cloudinary.uploader.destroy(post.media.publicId);
    //  Delete post from MongoDB
    await Post.findByIdAndDelete(req.params.id);
    //Delete all comments related to this post
    await Comment.deleteMany({ post: req.params.id });

    // Invalidate caches
    await deleteCache(`post:${req.params.id}`);
    await deleteCachePattern(`feed:*`);

    res.status(200).json({ success: true, message: "Post deleted successfully" });
};
