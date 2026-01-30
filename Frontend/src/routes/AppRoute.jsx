import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';
import ScrollToTop from './ScrollToTop';
import Skeleton from '../components/Skeleton/Skeleton';
import OAuthSuccess from '../pages/oauth/oAuth-success';
import Feed from '../pages/Feed/Feed';
import LoginPage from '../pages/Auth/login';
const SignupPage = lazy(() => import('../pages/Auth/signup'));
const SinglePost = lazy(() => import('../pages/Post/SinglePost'));
const CreatePost = lazy(() => import('../pages/New_Post/CreatePost'));
const Profile = lazy(() => import('../pages/User_Profile/Profile'));
const Notification = lazy(() => import('../pages/Notification/Notification'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const Explore = lazy(() => import('../pages/Explore/Explore'));
const ResetPasswordForm = lazy(() => import('../components/user/ResetPasswordForm'));
const SavedPost = lazy(() => import('../pages/SavedPost/SavedPost'));
const Search = lazy(() => import('../pages/Search/Search'));
const ChatPage = lazy(() => import('../pages/Chat/ChatPage'));
const ThemePage = lazy(() => import('../pages/Theme/Theme'));

const AppRoute = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Skeleton />}>
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
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
          />
          <Route path="/chat/:userId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
          />
          <Route path="/theme" element={
            <ProtectedRoute>
              <ThemePage />
            </ProtectedRoute>
          }
          />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoute;
