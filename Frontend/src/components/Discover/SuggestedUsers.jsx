import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDiscoverStore from '../../store/discoverStore';
import { SkeletonUser } from '../../components/Skeleton/Skeleton';
import FollowButton from '../Buttons/followButton.jsx';
import './Suggested.css';

const SuggestedUsers = ({ limit = 20 }) => {
    const navigator = useNavigate();
    const { suggestedUsers, fetchSuggestedUsers, loadingUsers } = useDiscoverStore();

    useEffect(() => {
        fetchSuggestedUsers(limit);
    }, [limit]);

    function handleProfileClick(username) {
        navigator(`/profile/${username}`);
    }

    if (loadingUsers) {
        return (
            <div className="suggested-block">
                <h4 className="suggested-title">Suggested users</h4>
                <div className="suggested-loading">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonUser key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!suggestedUsers || suggestedUsers.length === 0) return null;

    return (
        <div className="suggested-block">
            <h4 className="suggested-title">Suggested users</h4>
            <ul className="suggested-list">
                {suggestedUsers.map((u) => (
                    <li key={u._id} className="suggested-item">
                        <div className="suggested-avatar" onClick={() => handleProfileClick(u.username)}>
                            <img src={u.profileImage} alt={u.username} />
                        </div>
                        <div className="suggested-meta">
                            <div className="suggested-name">{u.fullName}</div>
                            <div className="suggested-username">@{u.username}</div>
                        </div>
                        <div className="suggested-action">
                            <FollowButton userId={u._id} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SuggestedUsers;
