// Importing the Mongoose library
import mongoose from "mongoose";

// Defining the schema for the Comment model
const commentSchema = new mongoose.Schema({
  // Reference to the Post model, which is the post that the comment belongs to
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  // Reference to the User model, which is the user who made the comment
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // The text content of the comment
  text: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true,
  },
}, 
// Adding timestamps for when the comment is created and updated
{ timestamps: true });


//Delete Comment remove from Post also
commentSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Post.findByIdAndUpdate(doc.post, {
      $pull: { comments: doc._id },
    });
  }
});


// Creating the Comment model from the schema
const Comment = mongoose.model("Comment", commentSchema);
// Exporting the Comment model
export default Comment;