import React, { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { updateProfile } from '../../api/userApi';
import { toast } from 'sonner';
import './UpdateProfileForm.css';

const UpdateProfileForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { success, message } = await updateProfile(formData);

    if (success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="update-profile-form">
      <h2>Update Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
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
            value={formData.bio}
            onChange={handleChange}
            disabled={isLoading}
          ></textarea>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProfileForm;