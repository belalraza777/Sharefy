import React, { useState } from 'react';
import UpdateProfileForm from '../user/UpdateProfileForm';
import UpdateProfilePicForm from '../user/UpdateProfilePicForm';

const ProfileSettings = () => {
  const [profileView, setProfileView] = useState('info'); // 'info' or 'photo'

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Profile Settings</h2>
        <p>Manage your profile information and photo</p>

        <div className="profile-toggle">
          <button
            className={`toggle-btn ${profileView === 'info' ? 'active' : ''}`}
            onClick={() => setProfileView('info')}
          >
            <i className="fas fa-user-edit"></i>
            Profile Info
          </button>
          <button
            className={`toggle-btn ${profileView === 'photo' ? 'active' : ''}`}
            onClick={() => setProfileView('photo')}
          >
            <i className="fas fa-camera"></i>
            Profile Photo
          </button>
        </div>
      </div>

      {profileView === 'info' && (
        <div className="profile-view">
          <UpdateProfileForm />
        </div>
      )}

      {profileView === 'photo' && (
        <div className="profile-view">
          <UpdateProfilePicForm />
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
