import React from 'react';
import LogoutButton from '../../components/Buttons/logout';

const AccountSettings = () => {
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Delete account confirmed');
      // Add delete account logic here
    }
  };

  return (
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
            <p>Sign out</p>
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
  );
};

export default AccountSettings;
