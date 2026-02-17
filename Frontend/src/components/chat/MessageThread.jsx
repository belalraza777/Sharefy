// components/chat/MessageThread.jsx
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { useAuth } from '../../context/authContext';
import MessageBubble from './MessageBubble';
import Skeleton from '../Skeleton/Skeleton';
import './MessageThread.css';

const MessageThread = () => {
  // Get current chat user id from URL
  const { userId } = useParams();

  // Messages state from chat store
  const { messages, loading, markAsRead, unreadCounts } = useChatStore();

  // Logged-in user (to detect own messages)
  const { user } = useAuth();

  // Ref used to auto-scroll to bottom
  const messagesEndRef = useRef(null);

  // Messages for the active chat
  const currentMessages = messages[userId] || [];

  // Mark messages as read when thread is opened
  useEffect(() => {
    if (userId) {
      // Only mark as read if there are unread messages
      if (unreadCounts[userId] > 0) {
        markAsRead(userId);
      }
    }
  }, [userId, unreadCounts]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 100);
    }
  }, [currentMessages.length]);

  // Loading state (messages are being fetched)
  if (loading) {
    return (
      <div className="message-thread">
        <div className="message-loading" style={{ padding: '20px' }}>
          <Skeleton variant="text" width="60%" height="40px" />
          <Skeleton variant="text" width="80%" height="40px" />
          <Skeleton variant="text" width="50%" height="40px" />
          <Skeleton variant="text" width="70%" height="40px" />
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      {currentMessages.length === 0 ? (
        // Empty state when no messages exist
        <div className="message-empty">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {/* Messages list */}
          <div className="message-list">
            {currentMessages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                // Used to style own messages differently
                isMine={message.senderId === user.id}
              />
            ))}
          </div>

          {/* Scroll anchor */}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </>
      )}
    </div>
  );
};

export default MessageThread;
