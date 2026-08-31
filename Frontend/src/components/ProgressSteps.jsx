import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../css/ProgressSteps.css';
import { User, Calendar, Heart, Shield, LayoutDashboard, PlusSquare, Home } from 'lucide-react';

const ProgressSteps = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);

  const isAdmin = user && user.role === 'admin';
  const isHost = user && user.role === 'host';

  if (isAdmin) {
    return (
      <div className="checkout-progress d-flex justify-content-center mt-4 mb-2 gap-2">
        <NavLink
          to="/profile"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/profile' ? 'active-button' : ''}`}
        >
          <Shield size={16} /> Admin Profile
        </NavLink>

        <NavLink
          to="/admin/dashboard"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/admin/dashboard' ? 'active-button' : ''}`}
        >
          <LayoutDashboard size={16} /> Admin Control Dashboard
        </NavLink>

        <NavLink
          to="/accomodationform"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/accomodationform' ? 'active-button' : ''}`}
        >
          <PlusSquare size={16} /> Add Property
        </NavLink>
      </div>
    );
  }

  if (isHost) {
    return (
      <div className="checkout-progress d-flex justify-content-center mt-4 mb-2 gap-2">
        <NavLink
          to="/profile"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/profile' ? 'active-button' : ''}`}
        >
          <User size={16} /> Host Profile
        </NavLink>

        <NavLink
          to="/host/dashboard"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/host/dashboard' ? 'active-button' : ''}`}
        >
          <Home size={16} /> Host Dashboard
        </NavLink>

        <NavLink
          to="/accomodationform"
          className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/accomodationform' ? 'active-button' : ''}`}
        >
          <PlusSquare size={16} /> Add Property
        </NavLink>
      </div>
    );
  }

  return (
    <div className="checkout-progress d-flex justify-content-center mt-4 mb-2 gap-2">
      <NavLink
        to="/profile"
        className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/profile' ? 'active-button' : ''}`}
      >
        <User size={16} /> My Profile
      </NavLink>

      <NavLink
        to="/user/mybookings"
        className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/user/mybookings' ? 'active-button' : ''}`}
      >
        <Calendar size={16} /> My Bookings
      </NavLink>

      <NavLink
        to="/user/wishlist"
        className={`progress-button d-inline-flex align-items-center gap-2 ${location.pathname === '/user/wishlist' ? 'active-button' : ''}`}
      >
        <Heart size={16} /> My Wishlist
      </NavLink>
    </div>
  );
};

export default ProgressSteps;
