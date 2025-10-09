// components/layout/RightSidebar.jsx
import './RightSidebar.css';
import { useAuth } from '../../context/authContext'
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {
  const navigator = useNavigate();
  const { user } = useAuth();

  function handlePostClick() {
    navigator('/new-post');
  }


  const friendRequests = [
    { name: 'Beeb', mutualFriends: 8 },
    { name: 'Dodo', mutualFriends: 25 },
  ];

  const trendingPosts = [
    { title: 'Komeni For this Programming. I must chop! #Coding', comments: 33 },
  ];

  return (
    <aside className="right-sidebar">
      {/* Create Post Card */}
      <div className="sidebar-card">
        <h3 className="card-title">What is on your mind, @{user?.username}</h3>
        <button className="post-button" onClick={handlePostClick}>Post</button>
      </div>

      {/* Friend Requests */}
      <div className="sidebar-card">
        <h3 className="card-title">Requests</h3>
        <div className="requests-list">
          {friendRequests.map((request, index) => (
            <div key={index} className="request-item">
              <div className="request-info">
                <div className="request-name">{request.name}</div>
                <div className="mutual-friends">{request.mutualFriends} mutual friends</div>
              </div>
              <div className="request-actions">
                <button className="accept-btn">Accept</button>
                <button className="decline-btn">Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Post */}
      <div className="sidebar-card">
        <div className="trending-post">
          <div className="post-stats">Used by you and T790 others...</div>
          <div className="post-content">
            Komeni For this Programming. I must chop! #Coding
          </div>
          <div className="post-comments">View all 33 comments</div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;