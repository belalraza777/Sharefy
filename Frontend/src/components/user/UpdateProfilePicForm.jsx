import React, { useState, useRef } from 'react';
import { uploadProfilePic } from '../../api/userApi';
import './UpdateProfilePicForm.css';
import { toast } from 'sonner';

const UpdateProfilePicForm = () => {
  // State management
  const [file, setFile] = useState(null); // Store selected file
  const [isLoading, setIsLoading] = useState(false); // Loading state for upload
  const [isDragOver, setIsDragOver] = useState(false); // Drag and drop visual state
  const fileInputRef = useRef(null); // Reference to hidden file input

  // Handle file selection from input
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true); // Visual feedback when dragging over
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false); // Remove visual feedback when leaving
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    // Validate that dropped file is an image
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  };

  // Click handler for upload area (triggers hidden file input)
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (file) {
      // Call API to upload profile picture
      const { success, message } = await uploadProfilePic(file);
      
      if (success) {
        toast.success('Profile picture updated successfully!');
        setFile(null); // Reset file state
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(message || 'Upload failed. Please try again.');
      }
    } else {
      toast.error('Please select a file to upload.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="update-profile-pic-form">
      <h2>Update Profile Picture</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Upload Area - Handles both click and drag/drop */}
        <div 
          className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
          onClick={handleUploadAreaClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>
          <div className="upload-text">
            {/* Dynamic text based on file selection */}
            {file ? 'File Selected' : 'Click to upload or drag and drop'}
          </div>
          <div className="upload-subtext">
            PNG, JPG, JPEG up to 5MB
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*" // Only accept image files
            className="file-input"
          />
        </div>

        {/* File Preview Section - Only shows when file is selected */}
        {file && (
          <div className="file-preview">
            {/* Preview image with object URL */}
            <img 
              src={URL.createObjectURL(file)} 
              alt="Preview" 
              className="preview-image"
            />
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-size">
                {/* Convert bytes to MB for display */}
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
          </div>
        )}

        {/* Upload Button - Disabled when no file or loading */}
        <button 
          type="submit" 
          className="upload-btn"
          disabled={!file || isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload Picture'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfilePicForm;