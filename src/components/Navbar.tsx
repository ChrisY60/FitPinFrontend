import { NavLink } from 'react-router-dom';
import homeIcon from '../assets/home_icon.png';
import searchIcon from '../assets/search_icon.png';
import notificationsIcon from '../assets/notifications_icon.png';
import profileIcon from '../assets/profile_icon.png';
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
  return (
    <nav className="navbar">
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
        >
          <img src={icon} alt={label} className="navbar-icon" />
          <span className="navbar-label">{label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/create-post"
        className={({ isActive }) => `navbar-item navbar-item-create${isActive ? ' active' : ''}`}
      >
        <PlusIcon />
        <span className="navbar-label">Post</span>
      </NavLink>
    </nav>
  );
}

export default Navbar;
