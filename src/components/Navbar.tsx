import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import homeIcon from '../assets/home_icon.png';
import searchIcon from '../assets/search_icon.png';
import notificationsIcon from '../assets/notifications_icon.png';
import profileIcon from '../assets/profile_icon.png';
import { getUnreadNotificationCount } from '../api/fitPinBackendApi';
import { useUnsavedChanges } from '../context/UnsavedChangesContext';
import './Navbar.css';


const NAV_ITEMS = [
  { to: '/',               icon: homeIcon,          label: 'Home'          },
  { to: '/search',         icon: searchIcon,        label: 'Search'        },
  { to: '/notifications',  icon: notificationsIcon, label: 'Notifications' },
  { to: `/profile/${localStorage.getItem("username") ?? ""}`, icon: profileIcon, label: 'Profile' },
];

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="navbar-icon navbar-icon-svg" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

function Navbar() {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDirty, confirmDiscard } = useUnsavedChanges();

  function handleNavClick(e: React.MouseEvent, to: string) {
    if (isDirty) {
      e.preventDefault();
      confirmDiscard(() => navigate(to));
    }
  }

  // While the user is looking at the notifications page, the badge should be 0 —
  // they can already see the notifications, so showing a count is misleading.
  const displayCount = location.pathname === '/notifications' ? 0 : unreadCount;

  React.useEffect(() => {
    // Fetch the count once immediately so the badge appears before the WebSocket connects.
    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});

    // brokerURL uses a native WebSocket (ws://) directly — no SockJS needed.
    // The browser automatically sends cookies with the WebSocket upgrade request,
    // which is how the backend authenticates the connection via JwtHandshakeInterceptor.
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        // Subscribe to our private notification channel.
        // /user/queue/notifications is specific to the currently logged-in user —
        // Spring routes messages here based on the Principal set during the handshake.
        client.subscribe('/user/queue/notifications', (message) => {
          const data = JSON.parse(message.body);
          setUnreadCount(data.count);
        });
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, []);

  return (
    <nav className="navbar">
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={(e) => handleNavClick(e, to)}
          className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
        >
          <span className="navbar-icon-wrapper">
            <img src={icon} alt={label} className="navbar-icon" />
            {label === 'Notifications' && displayCount > 0 && (
              <span className="navbar-badge">{displayCount > 9 ? '9+' : displayCount}</span>
            )}
          </span>
          <span className="navbar-label">{label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/create-post"
        onClick={(e) => handleNavClick(e, "/create-post")}
        className={({ isActive }) => `navbar-item navbar-item-create${isActive ? ' active' : ''}`}
      >
        <PlusIcon />
        <span className="navbar-label">Post</span>
      </NavLink>
    </nav>
  );
}

export default Navbar;
