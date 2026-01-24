// pages/Chat/ChatPage.jsx
// React hooks and router helpers
import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  // Chat store provides conversation list, messages and helpers
  const { setActiveUser, addIncomingMessage, getConversations, conversations, onlineUsers } = useChatStore();
  const location = useLocation();

  // Determine the user to show in the chat header.
  // - Prefer the conversation entry from `conversations` (existing chats).
  // - If there is no conversation yet (new chat started from a profile),
  //   use the `user` object passed via `location.state` (we set that in the Profile link).
  const locationUser = location.state?.user;
  // Find the conversation user if it exists in the conversations list. 
  // Fallback to location user if not found.
  const currentUser = conversations.find(u => u._id === userId) || locationUser;
  // Same online logic as ConversationListItem (map of userId -> true)
  const isOnline = !!(onlineUsers && typeof onlineUsers === 'object' && userId && onlineUsers[userId]);

  // Handle back navigation on mobile
  const handleBack = () => {
    navigate('/chat');
  };

  // Fetch the list of conversations once when the page mounts.
  // This populates the left-side conversation list.
  useEffect(() => {
    getConversations();
  }, [getConversations]);

  // When the URL route /chat/:userId changes we set the activeUser in the store.
  // The store will lazily load messages for that user if they haven't been fetched yet.
  useEffect(() => {
    if (userId) {
      setActiveUser(userId);
    }
  }, [userId, setActiveUser]);

  // Wire the socket to receive real-time incoming messages.
  // Incoming messages are appended into the store so the UI updates automatically.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      addIncomingMessage(message);
    };

    socket.on('newMessage', handleNewMessage);

    // Cleanup the listener when this component unmounts.
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
                {currentUser && (
                  <div className={`chat-header-avatar ${isOnline ? 'online' : ''}`}>
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt={currentUser.name || currentUser.username} />
                    ) : (
                      <div className="chat-header-avatar-placeholder">
                        {(currentUser.name?.[0] || currentUser.username?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div className="chat-header-info">
                  <h3>
                    {currentUser?.name || currentUser?.username || 'Chat'}
                    {isOnline && <span className="chat-online-chip">Online</span>}
                  </h3>
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
