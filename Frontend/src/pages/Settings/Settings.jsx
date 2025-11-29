import React, { useState } from 'react';
import './Settings.css';
import ProfileSettings from '../../components/settings/ProfileSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import AccountSettings from '../../components/settings/AccountSettings';
import AppearanceSettings from '../../components/settings/AppearanceSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

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
          className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <i className="fas fa-paint-brush"></i>
          Appearance
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
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'account' && <AccountSettings />}
      </div>
    </div>
  );
};

export default Settings;