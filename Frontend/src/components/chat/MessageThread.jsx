// components/chat/MessageThread.jsx
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { useAuth } from '../../context/authContext';
import MessageBubble from './MessageBubble';
import './MessageThread.css';

const MessageThread = () => {
  const { userId } = useParams();
  const { messages, loading } = useChatStore();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const currentMessages = messages[userId] || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [currentMessages.length]);

  if (loading) {
    return (
      <div className="message-thread">
        <div className="message-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      {currentMessages.length === 0 ? (
        <div className="message-empty">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          <div className="message-list">
            {currentMessages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isMine={message.senderId === user.id}
              />
            ))}
          </div>
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </>
      )}
    </div>
  );
};

export default MessageThread;
