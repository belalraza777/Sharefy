import React, { useState } from 'react';
import UpdateProfileForm from '../../components/user/UpdateProfileForm';
import UpdateProfilePicForm from '../../components/user/UpdateProfilePicForm';
import './Settings.css';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../../components/Buttons/logout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileView, setProfileView] = useState('info'); // 'info' or 'photo'

  const navigate = useNavigate();
  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account confirmed');
      // Add delete account logic here
    }
  };


  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and security</p>
      </div>

      {/* Compact Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user-cog"></i>
          Profile
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i>
          Security
        </button>
        <button
          className={`tab ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <i className="fas fa-cog"></i>
          Account
        </button>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        {/* Profile Tab - With Toggle */}
        {activeTab === 'profile' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Profile Settings</h2>
              <p>Manage your profile information and photo</p>

              {/* Toggle Switch */}
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

            {/* Profile Info View */}
            {profileView === 'info' && (
              <div className="profile-view">
                <UpdateProfileForm />
              </div>
            )}

            {/* Profile Photo View */}
            {profileView === 'photo' && (
              <div className="profile-view">
                <UpdateProfilePicForm />
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Security Settings</h2>
              <p>Manage your password and account security</p>
            </div>

            <div className="security-grid">
              <div className="security-card">
                <div className="card-icon">
                  <i className="fas fa-lock"></i>
                </div>
                <div className="card-content">
                  <h3>Change Password</h3>
                  <p>Update your password to keep your account secure</p>
                  <button className="btn btn-primary" onClick={handleResetPassword}>
                    Reset Password
                  </button>
                </div>
              </div>

              <div className="security-card">
                <div className="card-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="card-content">
                  <h3>Two-Factor Auth [Demo]</h3>
                  <p>Add an extra layer of security to your account</p>
                  <button className="btn btn-outline">
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="security-card">
                <div className="card-icon">
                  <i className="fas fa-desktop"></i>
                </div>
                <div className="card-content">
                  <h3>Active Sessions [Demo]</h3>
                  <p>Manage your active login sessions and devices</p>
                  <button className="btn btn-outline">
                    View Sessions
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="settings-section">
            <div className="section-header">
              <h2>Account Management</h2>
              <p>Manage your account status and data</p>
            </div>

            <div className="action-grid">
              <div className="action-card warning">
                <div className="card-icon">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <div className="card-content">
                  <h3>Logout</h3>
                  <p>Sign out </p>
                  <LogoutButton />
                </div>
              </div>

              <div className="action-card danger">
                <div className="card-icon">
                  <i className="fas fa-trash"></i>
                </div>
                <div className="card-content">
                  <h3>Delete Account</h3>
                  <p>Permanently delete your account and all data</p>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;