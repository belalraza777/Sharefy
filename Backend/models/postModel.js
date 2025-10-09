import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  media: {
    url: { type: String, required: true }, // Cloudinary URL
    type: { type: String, enum: ["image", "video"], required: true },
    publicId: { type: String, required: true }, // Cloudinary public ID
  },
  caption: {
    type: String,
    maxlength: 2200,
    trim: true,
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Directly store user IDs
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;

