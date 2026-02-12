import React, { useState } from 'react';
import UpdateProfileForm from '../settingsForm/UpdateProfileForm';
import UpdateProfilePicForm from '../settingsForm/UpdateProfilePicForm';

const ProfileSettings = () => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditPhoto, setShowEditPhoto] = useState(false);

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <p>Manage your profile information and photo</p>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <div className="card-icon">
            <i className="fas fa-user-edit"></i>
          </div>
          <div className="card-content">
            <h3>Profile Info</h3>
            <p>Update your name, username, and bio</p>
            <button className="btn btn-primary" onClick={() => setShowEditProfile(true)}>
              Edit Profile
            </button>
          </div>
        </div>

        <div className="security-card">
          <div className="card-icon">
            <i className="fas fa-camera"></i>
          </div>
          <div className="card-content">
            <h3>Profile Photo</h3>
            <p>Change your profile picture</p>
            <button className="btn btn-primary" onClick={() => setShowEditPhoto(true)}>
              Change Photo
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UpdateProfileForm
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
      <UpdateProfilePicForm
        isOpen={showEditPhoto}
        onClose={() => setShowEditPhoto(false)}
      />
    </div>
  );
};

export default ProfileSettings;
