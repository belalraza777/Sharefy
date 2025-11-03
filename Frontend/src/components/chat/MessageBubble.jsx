// components/chat/MessageBubble.jsx
import './MessageThread.css';

const MessageBubble = ({ message, isMine }) => {
  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-content">
        <p>{message.message}</p>
      </div>
      <span className="message-time">
        {formatTime(message.createdAt || new Date())}
      </span>
    </div>
  );
};

export default MessageBubble;
