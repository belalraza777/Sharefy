// components/layout/Layout.jsx
import { useLocation } from 'react-router-dom';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import './Layout.css';
import MobileBottomNav from './MobileBottomNav';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <div className="auth-layout">
        {children}
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="main-container">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Center Feed */}
        <main className="feed-area">
          {children}
        </main>
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav/>
    </div>
  );
};

export default Layout;