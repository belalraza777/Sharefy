// pages/Chat/ChatPage.jsx
// React hooks and router helpers
import './ChatPage.css';
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { getSocket } from '../../socket';
import { FiArrowLeft } from 'react-icons/fi';
import ConversationList from '../../components/chat/ConversationList';
import MessageThread from '../../components/chat/MessageThread';
import MessageComposer from '../../components/chat/MessageComposer';

const ChatPage = () => {
  // Get chat user id from URL (/chat/:userId)
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Global chat state & actions
  const {
    setActiveUser,
    addIncomingMessage,
    getConversations,
    conversations,
    onlineUsers
  } = useChatStore();

  // User data when chat is opened from profile (new conversation)
  const locationUser = location.state?.user;

  // Resolve user for chat header (existing chat OR profile user)
  const currentUser =
    conversations.find(u => u._id === userId) || locationUser;

  // Online indicator for current chat user
  const isOnline = !!onlineUsers?.[userId];

  // Back navigation (mainly for mobile view)
  const handleBack = () => navigate('/chat');

  // Load conversation list once on mount
  useEffect(() => {
    getConversations();
  }, [getConversations]);

  // Update active chat when route changes
  useEffect(() => {
    if (userId) setActiveUser(userId);
  }, [userId, setActiveUser]);

  // Listen for real-time incoming messages
  // We use getSocket() to access the shared socket instance created in socket.js
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on('newMessage', addIncomingMessage);
    return () => socket.off('newMessage', addIncomingMessage);
  }, [addIncomingMessage]);

  
  return (
    <div className="chat-page">
      <div className={`chat-container ${userId ? 'show-thread' : 'show-list'}`}>
        
        {/* Left side: conversations list */}
        <ConversationList />

        <div className="chat-main">
          {userId ? (
            <>
              {/* Chat header: back button + user info */}
              <div className="chat-header">
                <button className="back-button" onClick={handleBack}>
                  <FiArrowLeft />
                </button>

                {/* User avatar & online status */}
                {currentUser && (
                  <div className={`chat-header-avatar ${isOnline ? 'online' : ''}`}>
                    {currentUser?.profileImage ? (
                      <img src={currentUser?.profileImage} alt="" />
                    ) : (
                      <div className="chat-header-avatar-placeholder">
                        {(currentUser.name?.[0] ||
                          currentUser.username?.[0] ||
                          'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* User name and username */}
                <div className="chat-header-info">
                  <h3>
                    {currentUser?.name || currentUser?.username || 'Chat'}
                    {isOnline && <span className="chat-online-chip">Online</span>}
                  </h3>

                  {currentUser?.username && (
                    <span className="chat-username">
                      @{currentUser.username}
                    </span>
                  )}
                </div>
              </div>

              {/* Messages list */}
              <MessageThread />

              {/* Message input box */}
              <MessageComposer />
            </>
          ) : (
            // Empty state when no chat is selected
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
