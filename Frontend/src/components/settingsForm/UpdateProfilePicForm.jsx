import React, { useState, useRef, useEffect } from 'react';
import { uploadProfilePic } from '../../api/userApi';
import './UpdateProfilePicForm.css';
import { toast } from 'sonner';

const UpdateProfilePicForm = ({ isOpen, onClose }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Create / revoke blob preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setIsDragOver(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (file) {
      const { success, message } = await uploadProfilePic(file);

      if (success) {
        toast.success('Profile picture updated successfully!');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
      } else {
        toast.error(message || 'Upload failed. Please try again.');
      }
    } else {
      toast.error('Please select a file to upload.');
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Update Profile Picture</h2>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
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
                {file ? 'File Selected' : 'Click to upload or drag and drop'}
              </div>
              <div className="upload-subtext">
                PNG, JPG, JPEG up to 5MB
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
            </div>

            {previewUrl && (
              <div className="file-preview">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="preview-image"
                />
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="profile-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!file || isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Picture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfilePicForm;