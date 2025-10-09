import mongoose from "mongoose";

const feedSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Index on user for fast lookups
    },
    posts: [
        {
            post: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post",
            },
            postedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: {
                type: Date,
            },
        },
    ],
});

// Limit the number of posts in the feed to 500 to prevent the document from growing too large
feedSchema.pre("save", function (next) {
    const feed = this;
    if (feed.posts.length > 500) {
        feed.posts = feed.posts.slice(0, 500);
    }
    next();
});

const Feed = mongoose.model("Feed", feedSchema);

export default Feed;
