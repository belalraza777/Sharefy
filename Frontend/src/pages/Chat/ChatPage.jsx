// pages/Chat/ChatPage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { getSocket } from '../../socket';
import { FiArrowLeft } from 'react-icons/fi';
import ConversationList from '../../components/chat/ConversationList';
import MessageThread from '../../components/chat/MessageThread';
import MessageComposer from '../../components/chat/MessageComposer';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { setActiveUser, addIncomingMessage, getConversations, conversations } = useChatStore();

  // Get current user info for mobile header
  const currentUser = conversations.find(u => u._id === userId);

  // Handle back navigation on mobile
  const handleBack = () => {
    navigate('/chat');
  };

  // Fetch conversations on mount
  useEffect(() => {
    getConversations();
  }, [getConversations]);

  // Set active user when route changes
  useEffect(() => {
    if (userId) {
      setActiveUser(userId);
    }
  }, [userId, setActiveUser]);

  // Wire socket for realtime messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      addIncomingMessage(message);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [addIncomingMessage]);

  return (
    <div className="chat-page">
      <div className={`chat-container ${userId ? 'show-thread' : 'show-list'}`}>
        <ConversationList />
        <div className="chat-main">
          {userId ? (
            <>
              <div className="chat-header">
                <button className="back-button" onClick={handleBack}>
                  <FiArrowLeft />
                </button>
                <div className="chat-header-info">
                  <h3>{currentUser?.name || currentUser?.username || 'Chat'}</h3>
                  {currentUser?.username && (
                    <span className="chat-username">@{currentUser.username}</span>
                  )}
                </div>
              </div>
              <MessageThread />
              <MessageComposer />
            </>
          ) : (
            <div className="chat-empty-state">
              <h3>Select a conversation to start messaging</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
