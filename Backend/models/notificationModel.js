import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  receiver: {  // recipient (who receives the notification)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sender: {   // who sent the notification (e.g., who liked the post)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  message: { type: String, required: true }, // notification text
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes: efficient retrieval of notifications for a user and unread counts
notificationSchema.index({ receiver: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
