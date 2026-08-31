import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, Home } from 'lucide-react';
import { userActions } from '../../store/User/user-slice';
import { portalLoginAction } from '../../store/User/user-action';
import '../../css/HostPortal.css';

const HostLogin = () => {
  const [email, setEmail] = useState('rashidrashil2006@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, errors } = useSelector((state) => state.user);

  // If user is already logged in as Host or Admin, immediately direct to Host Dashboard!
  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'host' || user.role === 'admin')) {
      navigate('/host/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (errors) {
      setError(errors);
    }
  }, [errors]);

  const handleHostLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both Email and Password');
      return;
    }

    try {
      setLoading(true);
      await dispatch(portalLoginAction({ email: cleanEmail, password: cleanPassword }));
    } catch (err) {
      setError(err.message || 'Invalid Host credentials. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-login-container">
      <div className="host-login-card">
        <div className="host-login-header">
          <div style={{ background: 'rgba(255, 56, 92, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Home size={32} color="#ff385c" />
          </div>
          <h2 className="host-portal-title">HOST PORTAL</h2>
          <p className="host-portal-subtitle">Manage your properties & grow your stay business</p>
        </div>

        {error && <div className="host-error-alert">{error}</div>}

        <form onSubmit={handleHostLogin} className="host-login-form">
          <div className="form-group">
            <label>Host Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="host@homelyhub.com"
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your host password"
                required
                autoComplete="current-password"
                style={{ paddingLeft: '40px', paddingRight: '42px' }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="host-login-btn" disabled={loading}>
            {loading ? 'Authenticating Host...' : 'Login as Host'}
          </button>
        </form>

        <div className="host-login-footer">
          <Link to="/login">Standard User Login</Link>
          <span className="divider">•</span>
          <Link to="/login">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
};

export default HostLogin;
