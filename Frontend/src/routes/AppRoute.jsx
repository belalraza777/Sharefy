import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/login';
import SignupPage from '../pages/auth/signup';
import Feed from '../pages/Feed/feed';
import ProtectedRoute from './ProtectedRoute';
import SinglePost from '../pages/Post/singlePost';
import CreatePost from '../pages/New_Post/CreatePost';
import Profile from '../pages/User_Profile/Profile';
import Notification from '../pages/Notification/Notification';
import Settings from '../pages/Settings/Settings';
import Explore from '../pages/Explore/Explore';
import ResetPasswordForm from '../components/user/ResetPasswordForm';
import SavedPost from '../pages/SavedPost/SavedPost';
import Search from '../pages/Search/Search';

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />


      <Route path="/post/:postId" element={
        <ProtectedRoute>
          <SinglePost />
        </ProtectedRoute>
      }
      />

      <Route path="/new-post" element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      }
      />

      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
      />

      <Route path="/notifications" element={
        <ProtectedRoute>
          <Notification />
        </ProtectedRoute>
      }
      />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
      />

      <Route path="/explore" element={
        <ProtectedRoute>
          <Explore />
        </ProtectedRoute>
      }
      />

      <Route path="/reset-password" element={
        <ProtectedRoute>
          <ResetPasswordForm />
        </ProtectedRoute>
      }
      />

      <Route path="/saved" element={
        <ProtectedRoute>
          <SavedPost />
        </ProtectedRoute>
      }
      />

      <Route path="/search" element={
        <ProtectedRoute>
          <Search />
        </ProtectedRoute>
      }
      />

    </Routes>
  );
};

export default AppRoute;
