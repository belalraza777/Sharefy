// components/chat/ConversationList.jsx
import useChatStore from '../../store/chatStore';
import ConversationListItem from './ConversationListItem';
import './ConversationList.css';

const ConversationList = () => {
  const { conversations, loading } = useChatStore();
  

  if (loading) {
    return (
      <div className="conversation-list">
        <div className="conversation-list-header">
          <h2>Messages</h2>
        </div>
        <div className="conversation-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Messages</h2>
      </div>
      <div className="conversation-items">
        {conversations.length === 0 ? (
          <div className="conversation-empty">
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((user) => (
            <ConversationListItem key={user._id} user={user} />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
