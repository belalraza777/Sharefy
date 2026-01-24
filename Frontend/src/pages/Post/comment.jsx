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

  console.log("comment", comment); 
  

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

        {/* Robust check: comment.user may be populated object, an id string, or undefined.
            Normalize and compare to avoid reading `_id` of undefined which caused a crash. */}
        {(() => {
          const commentUserId = comment.user?._id || comment.user?.id || comment.user;
          return (user && commentUserId && String(user.id) === String(commentUserId));
        })() &&
          (
            <button
              className="delete-comment-btn"
              onClick={() => comment._id && onDelete(comment._id)}
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
