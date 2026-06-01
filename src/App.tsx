import React from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import Navbar from './components/Navbar'
import './colors.css'
import FeedPage from './components/FeedPage';
import ProfilePage from './components/ProfilePage';
import CreatePostForm from './components/CreatePostForm';

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
      {!hideNavbar && <Navbar />}
      <div className={hideNavbar ? 'auth-page' : 'with-navbar'}>
        <Routes>
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/create-post" element={<ProtectedRoute><CreatePostForm /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App
