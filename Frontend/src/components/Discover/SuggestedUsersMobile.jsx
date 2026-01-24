import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDiscoverStore from '../../store/discoverStore.js';
import FollowButton from '../../components/Buttons/followButton.jsx';
import './SuggestedMobile.css';

const SuggestedUsersMobile = () => {
  const navigate = useNavigate();
  const { suggestedUsers, fetchSuggestedUsers, loadingUsers } = useDiscoverStore();

  useEffect(() => {
    fetchSuggestedUsers(8);
  }, []);

  if (loadingUsers || !suggestedUsers || suggestedUsers.length === 0) return null;

  return (
    <div className="suggested-mobile">
      <div className="s-header">
        <div className="s-title">Suggested Users</div>
      </div>
      <ul className="suggested-mobile-list">
        {suggestedUsers.map((u) => (
          <li
            key={u._id}
            className="suggested-mobile-item"
            onClick={() => navigate(`/profile/${u.username}`)}
          >
            <div className="s-avatar">
              <img src={u.profileImage} alt={u.username} />
            </div>
            <div className="s-username">@{u.username}</div>
            <div
              className="s-action"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <FollowButton userId={u._id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedUsersMobile;
