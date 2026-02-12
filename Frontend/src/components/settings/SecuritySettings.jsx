import React, { useState } from 'react';
import ResetPasswordForm from '../settingsForm/ResetPasswordForm';

const SecuritySettings = () => {
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
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
            <button className="btn btn-primary" onClick={() => setShowResetPassword(true)}>
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
            <button className="btn btn-outline">Enable 2FA</button>
          </div>
        </div>

        <div className="security-card">
          <div className="card-icon">
            <i className="fas fa-desktop"></i>
          </div>
          <div className="card-content">
            <h3>Active Sessions [Demo]</h3>
            <p>Manage your active login sessions and devices</p>
            <button className="btn btn-outline">View Sessions</button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <ResetPasswordForm
        isOpen={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />
    </div>
  );
};

export default SecuritySettings;
