// components/chat/ConversationListItem.jsx
import { useNavigate, useParams } from 'react-router-dom';
import './ConversationList.css';

const ConversationListItem = ({ user }) => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isActive = userId === user._id;

  const handleClick = () => {
    navigate(`/chat/${user._id}`);
  };

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className="conversation-avatar">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">
            {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="conversation-info">
        <h4>{user.name || user.username}</h4>
        <p className="conversation-username">@{user.username}</p>
      </div>
    </div>
  );
};

export default ConversationListItem;
