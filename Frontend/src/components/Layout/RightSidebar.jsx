// components/layout/RightSidebar.jsx
import './RightSidebar.css';
import { useAuth } from '../../context/authContext'
import { useNavigate } from 'react-router-dom';
import SuggestedUsers from '../Discover/SuggestedUsers';

const RightSidebar = () => {
  const navigator = useNavigate();
  const { user } = useAuth();

  function handlePostClick() {
    navigator('/new-post');
  }


  return (
    <aside className="right-sidebar">
      {/* Create Post Card */}
      {/* <div className="sidebar-card">
        <h3 className="card-title">What is on your mind, @{user?.username}</h3>
        <button className="post-button" onClick={handlePostClick}>Post</button>
      </div> */}

     {/* suggested users */}
      <SuggestedUsers limit={10} />
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