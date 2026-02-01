// ConversationListItem: one row in chat list showing avatar, name, and online state.
import { useNavigate, useParams } from 'react-router-dom';
import './ConversationList.css';
import useChatStore from '../../store/chatStore';

const ConversationListItem = ({ user }) => {
  const { onlineUsers } = useChatStore();
  
  // onlineUsers may be an object map of userId->true; check safely
  const isOnline = !!(onlineUsers && typeof onlineUsers === 'object' && onlineUsers[user._id]);

  const navigate = useNavigate();
  const { userId } = useParams();
  const isActive = userId === user._id;

  // Navigate to this user's chat thread
  const handleClick = () => {
    navigate(`/chat/${user._id}`);
  };

  return (
    <div
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
    >
      <div className={`conversation-avatar ${isOnline ? 'online' : ''}`}>
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">
            {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <div className="conversation-info">
        <h4>
          {user.name || user.username}
          {/* {isOnline && <span className="online-chip" aria-label="Online now">Online</span>} */}
        </h4>
        <p className="conversation-username">@{user.username}</p>
      </div>
    </div>
  );
};

export default ConversationListItem;
