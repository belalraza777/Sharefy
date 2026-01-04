import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
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
    type: String
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
  provider: { type: String, default: "local" }, // local | google | facebook
  providerId: { type: String },                 // OAuth provider user id
},
  { // Schema Options
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to Object
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
