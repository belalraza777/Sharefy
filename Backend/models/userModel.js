import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
    // select: false,
  },
  bio: {
    type: String,
    maxlength: 200,
    default: "",
  },
  profileImage: {
    type: String,
    default: function () {
      const name = this.fullName || "user";
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    }
  },
  coverImage: {
    type: String, // Optional banner image
  },
  otp: {        //otp feature
    code: String,
    expiresAt: Date,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// --- Virtuals with populate + count ---
// Number of followers (people who follow this user)
userSchema.virtual("followers", {
  ref: "Follow",
  localField: "_id",
  foreignField: "following",
  count: false,
});

// Number of people this user follows
userSchema.virtual("following", {
  ref: "Follow",
  localField: "_id",
  foreignField: "follower",
  count: false,
});

const User = mongoose.model("User", userSchema);
export default User;
