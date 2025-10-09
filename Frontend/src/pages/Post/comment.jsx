import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../../assets/defaultAvatar.png';
import './singlePost.css';
import { useAuth } from "../../context/authContext";
import { MdDeleteForever } from "react-icons/md";



export default function Comment({ comment, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (comment.user?.username) {
      navigate(`/profile/${comment.user.username}`);
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-user">
          <img
            src={comment.user?.profileImage || defaultAvatar}
            alt={`${comment.user?.username || 'User'}'s avatar`}
            className="comment-avatar"
            onError={(e) => (e.currentTarget.src = defaultAvatar)}
            onClick={handleProfileClick}
          />
          <div className="comment-user-info">
            <span className="comment-username">{comment.user?.username || 'Unknown User'}</span>
            <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {(user && user.id === comment.user._id) &&
          (
            <button
              className="delete-comment-btn"
              onClick={() => onDelete(comment._id)}
              title="Delete comment" >
              <MdDeleteForever />
            </button>
          )
        }
      </div>
      <div className="comment-text">{comment.text}</div>
    </div>
  );
}
