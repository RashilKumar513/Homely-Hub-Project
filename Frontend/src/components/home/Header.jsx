import React from 'react';
import '../../css/Home.css';
import Search from './Search';
import Filter from './Filter';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/User/user-action';
import { propertyAction } from '../../store/Property/property-slice';
import { getAllProperties } from '../../store/Property/property-action';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { Heart, Sun, Moon, User, LogOut, PlusSquare, Shield, LayoutDashboard, Home } from 'lucide-react';

import Logo from '../Logo';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const isAdmin = user && user.role === 'admin';
  const isHost = user && user.role === 'host';

  const logoutUser = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    window.location.href = '/'; // IMMEDIATELY REDIRECT TO HOME PAGE
  };

  const refreshFunction = () => {
    if (isAdmin) {
      navigate('/admin/dashboard');
    } else if (isHost) {
      navigate('/host/dashboard');
    } else {
      dispatch(propertyAction.updateSearchParams({}));
      dispatch(getAllProperties());
    }
  };

  const isPathActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="header">
      <Link to={isAdmin ? '/admin/dashboard' : isHost ? '/host/dashboard' : '/'} onClick={refreshFunction} className="logo-container" style={{ textDecoration: 'none' }}>
        <Logo />
      </Link>

      {/* Show Search & Filter ONLY for normal users */}
      {!isAdmin && !isHost ? (
        <div className="search_filter">
          <Search />
          <Filter />
        </div>
      ) : isHost ? (
        <div className="admin-header-title d-flex align-items-center gap-2 px-3 py-1" style={{ background: 'rgba(255, 56, 92, 0.1)', borderRadius: '30px', border: '1px solid rgba(255, 56, 92, 0.2)' }}>
          <Home size={20} color="#ff385c" />
          <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
            HOST PORTAL DASHBOARD
          </span>
        </div>
      ) : (
        <div className="admin-header-title d-flex align-items-center gap-2 px-3 py-1" style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Shield size={20} color="#3b82f6" />
          <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
            ADMIN CONTROL PORTAL
          </span>
        </div>
      )}

      <div className="header-actions">
        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Wishlist Link (Hide for Admin & Host) */}
        {!isAdmin && !isHost && (
          <Link to="/user/wishlist" className="wishlist-nav-btn" title="Saved Wishlist">
            <Heart size={18} fill={wishlistItems.length > 0 ? '#ff385c' : 'none'} color="#ff385c" />
            {wishlistItems.length > 0 && <span className="wishlist-badge">{wishlistItems.length}</span>}
          </Link>
        )}

        {/* User Account / Auth Dropdown */}
        {!isAuthenticated && !user && (
          <Link to="/login" className="user-avatar-btn">
            <User size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Login</span>
          </Link>
        )}

        {isAuthenticated && user && (
          <div className="user-dropdown dropdown">
            <div
              className="user-avatar-btn dropdown-toggle"
              role="button"
              id="dropdownMenuLink"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {user.avatar?.url ? (
                <img src={user.avatar.url} className="user-avatar-img" alt="avatar" />
              ) : (
                <User size={18} />
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </span>
            </div>

            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" aria-labelledby="dropdownMenuLink" style={{ borderRadius: '14px', padding: '0.5rem', minWidth: '210px' }}>
              {isAdmin ? (
                /* Admin Options */
                <>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2 fw-bold text-primary active" to="/admin/dashboard">
                      <LayoutDashboard size={16} color="#3b82f6" /> Admin Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                      <User size={16} /> Admin Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/accomodationform">
                      <PlusSquare size={16} /> Add Property
                    </Link>
                  </li>
                </>
              ) : isHost ? (
                /* Host Options */
                <>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2 fw-bold text-danger active" to="/host/dashboard">
                      <Home size={16} color="#ff385c" /> Host Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                      <User size={16} /> Host Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/accomodationform">
                      <PlusSquare size={16} /> Add Property
                    </Link>
                  </li>
                </>
              ) : (
                /* Regular User Options */
                <>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                      <User size={16} /> My Account
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/user/wishlist">
                      <Heart size={16} /> My Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/user/mybookings">
                      <User size={16} /> My Bookings
                    </Link>
                  </li>
                </>
              )}

              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger d-flex align-items-center gap-2 py-2" type="button" onClick={logoutUser}>
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
