import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { updateProfile } from '../../api/userApi';
import { toast } from 'sonner';
import './UpdateProfileForm.css';

const UpdateProfileForm = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form data from user when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        bio: user.bio || '',
      });
    }
  }, [isOpen, user]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, message } = await updateProfile(formData);

      if (success) {
        toast.success('Profile updated successfully!');
        onClose();
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="profile-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="profile-modal-body">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Your username"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                disabled={isLoading}
              ></textarea>
            </div>
          </div>
          <div className="profile-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileForm;