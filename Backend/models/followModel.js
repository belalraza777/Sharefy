import mongoose from "mongoose";

// Defining the schema for the Follow model
const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
},
  { timestamps: true });

// Creating a unique index on the follower and following fields to prevent duplicate follow relationships
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model("Follow", followSchema);
export default Follow;