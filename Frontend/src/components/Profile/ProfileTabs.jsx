import React from 'react';
import { MdOutlineGridOn } from 'react-icons/md';
import { FiBookmark } from 'react-icons/fi';

const ProfileTabs = ({ activeTab, onChange, isOwnProfile }) => {
  return (
    <div className="profile-tabs">
      <button
        className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
        onClick={() => onChange('posts')}
      >
        <MdOutlineGridOn /> Posts
      </button>
      {isOwnProfile && (
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => onChange('saved')}
        >
          <FiBookmark /> Saved
        </button>
      )}
    </div>
  );
};

export default ProfileTabs;
