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
  { to: '/profile',        icon: profileIcon,       label: 'Profile'       },
];

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
    </nav>
  );
}

export default Navbar;
