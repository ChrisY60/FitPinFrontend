import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
import './App.css'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import Navbar from './components/Navbar'
import './colors.css'
import FeedPage from './components/FeedPage';
import ProfilePage from './components/ProfilePage';
import CreatePostForm from './components/CreatePostForm';
import NotificationsPage from './components/NotificationsPage';
import { UnsavedChangesProvider } from './context/UnsavedChangesContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';

const AUTH_ROUTES = ['/login', '/register'];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

function Layout() {
  const location = useLocation();
  const hideNavbar = AUTH_ROUTES.includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? 'auth-page' : 'with-navbar'}>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePostForm /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ConfirmDialogProvider>
        <UnsavedChangesProvider>
          <Layout />
        </UnsavedChangesProvider>
      </ConfirmDialogProvider>
    </BrowserRouter>
  );
}

export default App
