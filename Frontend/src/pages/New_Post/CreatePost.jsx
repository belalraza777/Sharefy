import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../../store/postStore';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import './CreatePost.css';

export default function CreatePost() {
    const navigate = useNavigate();
    const { createPost } = usePostStore();

    // State for form data and UI
    const [caption, setCaption] = useState(''); // Post caption text
    const [mediaFile, setMediaFile] = useState(null); // Selected file object
    const [mediaPreview, setMediaPreview] = useState(null); // URL for file preview
    const [mediaType, setMediaType] = useState('image'); // Type: 'image' or 'video'
    const [loading, setLoading] = useState(false); // Loading state during upload
    const [isDragging, setIsDragging] = useState(false); // Drag & drop state

    // Clean up preview URL when component unmounts or preview changes
    useEffect(() => {
        return () => {
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview); // Free memory
            }
        };
    }, [mediaPreview]);

    // Handle file selection with validation
    const handleMediaChange = (file) => {
        if (!file) return;

        // Check if file is image or video
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            toast.error('Please select an image or video file');
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // Set file data and create preview
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaType(type);
        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file)); // Create preview URL
    };

    // Handle file input from browse button
    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleMediaChange(file);
    };

    // Drag and drop event handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true); // Show drag visual feedback
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false); // Hide drag visual feedback
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0]; // Get dropped file
        handleMediaChange(file);
    };

    // Remove selected media and reset
    const removeMedia = () => {
        if (mediaPreview) {
            URL.revokeObjectURL(mediaPreview); // Clean up memory
        }
        setMediaFile(null);
        setMediaPreview(null);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate that a file is selected
        if (!mediaFile) {
            toast.error('Please select an image or video');
            return;
        }

        // Prepare form data for API
        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('file', mediaFile);

        // Send to backend
        setLoading(true);
        const result = await createPost(formData);
        setLoading(false);
        
        // Handle response
        if (result.success) {
            toast.success('Post created successfully!');
            navigate('/'); // Go to feed on success
        } else {
            toast.error(result.message || 'Error creating post'); // Show error
        }
    };

    // Get character counter class based on length
    const getCharacterCounterClass = () => {
        if (caption.length > 1800) return 'create-post-page__character-counter--danger';
        if (caption.length > 1500) return 'create-post-page__character-counter--warning';
        return '';
    };

    return (
        <div className="create-post-page">
            {/* Header with title and close button */}
            <div className="create-post-page__header">
                <h2 className="create-post-page__title">Create New Post</h2>
                <button 
                    className="create-post-page__close-btn"
                    onClick={() => navigate('/')} // Go back to feed
                    disabled={loading}
                >
                    <FaTimes />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="create-post-page__form">
                {/* Caption input section */}
                <div className="create-post-page__caption-section">
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)} // Update caption state
                        placeholder="Write a caption..."
                        className="create-post-page__caption-input"
                        maxLength={2000} // Instagram-like character limit
                        rows={3}
                        disabled={loading} // Disable input during upload
                    />
                    {/* Character counter */}
                    <div className={`create-post-page__character-counter ${getCharacterCounterClass()}`}>
                        {caption.length}/2000
                    </div>
                </div>

                {/* Media upload section with drag & drop */}
                <div 
                    className={`create-post-page__media-upload ${isDragging ? 'create-post-page__media-upload--dragging' : ''} ${mediaPreview ? 'create-post-page__media-upload--has-media' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* Show upload area if no media selected */}
                    {!mediaPreview ? (
                        <div className="create-post-page__upload-area">
                            <div className="create-post-page__upload-icon">
                                {mediaType === 'image' ? <FaImage /> : <FaVideo />}
                            </div>
                            <h3 className="create-post-page__upload-title">Upload Photo or Video</h3>
                            <p className="create-post-page__upload-subtitle">Drag and drop or click to browse</p>
                            {/* Hidden file input triggered by label */}
                            <label className="create-post-page__browse-btn">
                                <input
                                    type="file"
                                    accept="image/*,video/*" // Accept images and videos
                                    onChange={handleFileInputChange}
                                    className="create-post-page__file-input"
                                />
                                Select from device
                            </label>
                        </div>
                    ) : (
                        /* Show media preview when file is selected */
                        <div className="create-post-page__media-preview">
                            <button 
                                type="button"
                                className="create-post-page__remove-media-btn"
                                onClick={removeMedia} // Remove selected media
                                disabled={loading}
                            >
                                <FaTimes />
                            </button>
                            {/* Show image or video based on file type */}
                            {mediaType === 'image' ? (
                                <img src={mediaPreview} alt="Preview" className="create-post-page__preview-image" />
                            ) : (
                                <video src={mediaPreview} controls className="create-post-page__preview-video">
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    )}
                </div>

                {/* Form action buttons */}
                <div className="create-post-page__form-actions">
                    <button
                        type="button"
                        className="create-post-page__cancel-btn"
                        onClick={() => navigate('/')} // Cancel and go back
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="create-post-page__submit-btn"
                        disabled={loading || !mediaFile} // Disable if loading or no file
                    >
                        {loading ? (
                            // Show loading state
                            <>
                                <div className="create-post-page__loading-spinner"></div>
                                Posting...
                            </>
                        ) : (
                            'Share Post'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );               
}