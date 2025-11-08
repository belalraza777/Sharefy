// components/chat/MessageComposer.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import { FiSend } from 'react-icons/fi';
import './MessageComposer.css';

const MessageComposer = () => {
  const { userId } = useParams();
  const { sendMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || !userId) return;

    setSending(true);
    const result = await sendMessage(userId, message.trim());
    if (result.success) {
      setMessage('');
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending}
        className="message-input"
      />
      <button
        type="submit"
        disabled={!message.trim() || sending}
        className="send-button"
      >
        <FiSend />
      </button>
    </form>
  );
};

export default MessageComposer;
