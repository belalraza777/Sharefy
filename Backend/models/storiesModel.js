import mongoose from 'mongoose';
import { cloudinary } from '../utils/cloudinary.js';

const storySchema = new mongoose.Schema({
    caption: { type: String },
    media: {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
        publicId: { type: String, required: true },
    },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

// Use MongoDB TTL index to auto-delete stories after 24 hours
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Middleware to delete media from Cloudinary when story is deleted (manual or TTL)
storySchema.post('remove', async function(doc) {
    try {
        await cloudinary.uploader.destroy(doc.media.publicId, {
            resource_type: doc.media.type === 'video' ? 'video' : 'image',
        });
        console.log(`Cloudinary media deleted: ${doc.media.publicId}`);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
});

// Middleware for findOneAndDelete (used in controller)
storySchema.pre('findOneAndDelete', async function(next) {
    try {
        const story = await this.model.findOne(this.getFilter());
        if (story && story.media.publicId) {
            await cloudinary.uploader.destroy(story.media.publicId, {
                resource_type: story.media.type === 'video' ? 'video' : 'image',
            });
            console.log(`Cloudinary media deleted: ${story.media.publicId}`);
        }
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
    next();
});

const Story = mongoose.model('Story', storySchema);

export default Story;