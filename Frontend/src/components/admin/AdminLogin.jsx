import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Logo from '../Logo';
import { portalLoginAction } from '../../store/User/user-action';
import '../../css/HostPortal.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@homelyhub.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, errors } = useSelector((state) => state.user);

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (errors) {
      setError(errors);
    }
  }, [errors]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both Admin Email and Password');
      return;
    }

    try {
      setLoading(true);
      await dispatch(portalLoginAction({ email: cleanEmail, password: cleanPassword }));
    } catch (err) {
      setError(err.message || 'Invalid Admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-login-container">
      <div className="host-login-card">
        <div className="host-login-header">
          <Logo />
          <h2 className="host-portal-title">ADMIN PORTAL</h2>
          <p className="host-portal-subtitle">Secure platform administration</p>
        </div>

        {error && <div className="host-error-alert">{error}</div>}

        <form onSubmit={handleAdminLogin} className="host-login-form">
          <div className="form-group">
            <label>Admin Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@homelyhub.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="host-login-btn" disabled={loading}>
            {loading ? 'Authenticating Admin...' : 'Secure Admin Login'}
          </button>
        </form>

        <div className="host-login-footer">
          <Link to="/login">User Login</Link>
          <span className="divider">•</span>
          <Link to="/login">Host Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
