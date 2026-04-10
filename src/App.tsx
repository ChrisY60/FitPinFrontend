import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import Navbar from './components/Navbar'
import './colors.css'

const AUTH_ROUTES = ['/login', '/register'];

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
