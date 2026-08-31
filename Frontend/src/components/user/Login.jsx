import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getLogin, portalLoginAction } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import LoadingSpinner from '../LoadingSpinner';
import { Mail, Shield, ArrowRight, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import '../../css/Login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'portal'

  // User Login State (Email & Password)
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showUserPassword, setShowUserPassword] = useState(false);

  // Host & Admin Portal State
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [showPortalPassword, setShowPortalPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, errors, loading } = useSelector((state) => state.user);

  useEffect(() => {
    if (errors) {
      toast.error(errors);
      dispatch(userActions.clearErrors());
    } else if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'host') {
        navigate('/host/dashboard');
      } else {
        toast.success(`Welcome back, ${user.name || 'User'}! 🎉`);
        navigate('/');
      }
    }
  }, [isAuthenticated, user, errors, navigate, dispatch]);

  // Handle User Login (Email + Password)
  const handleUserLoginSubmit = async (e) => {
    if (e) e.preventDefault();

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanPassword = userPassword.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!cleanPassword) {
      toast.error('Please enter your account password');
      return;
    }

    try {
      const loggedUser = await dispatch(getLogin({ email: cleanEmail, password: cleanPassword }));
      if (loggedUser) {
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (loggedUser.role === 'host') {
          navigate('/host/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login submit error:', err);
    }
  };

  // Handle Host & Admin Portal Login
  const handlePortalSubmit = (e) => {
    e.preventDefault();
    if (!portalEmail.trim() || !portalPassword.trim()) {
      toast.error('Please enter both Email and Password');
      return;
    }
    dispatch(portalLoginAction({ email: portalEmail.trim(), password: portalPassword.trim() }));
  };

  return (
    <div className="login-card-container">
      <div className="login-card-box">
        {/* Navigation Tabs */}
        <div className="login-tabs-header">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user');
              dispatch(userActions.clearErrors());
            }}
            className="login-tab-btn"
            style={{
              background: activeTab === 'user' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'user' ? 'var(--accent-color)' : 'var(--text-muted)',
              boxShadow: activeTab === 'user' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Mail size={18} /> User Login
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('portal');
              dispatch(userActions.clearErrors());
            }}
            className="login-tab-btn"
            style={{
              background: activeTab === 'portal' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'portal' ? '#3b82f6' : 'var(--text-muted)',
              boxShadow: activeTab === 'portal' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Shield size={18} /> Host & Admin Portal
          </button>
        </div>

        <div style={{ padding: '2rem 1.75rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <LoadingSpinner />
            </div>
          )}

          {/* TAB 1: USER LOGIN (EMAIL & PASSWORD) */}
          {!loading && activeTab === 'user' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', background: 'rgba(255, 56, 92, 0.1)', color: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <LogIn size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  User Account Login
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Log in with your registered email & password
                </p>
              </div>

              <form onSubmit={handleUserLoginSubmit}>
                {/* Email Address */}
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Email Address
                  </label>
                  <div className="login-input-wrapper">
                    <Mail size={18} color="#94a3b8" className="login-left-icon" />
                    <input
                      type="email"
                      placeholder="e.g. user@homelyhub.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="login-input-field"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Password
                  </label>
                  <div className="login-input-wrapper">
                    <Lock size={18} color="#94a3b8" className="login-left-icon" />
                    <input
                      type={showUserPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      className="login-input-field has-right-icon"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPassword(!showUserPassword)}
                      className="login-right-btn"
                      title={showUserPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showUserPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#ff385c', fontWeight: '700', textDecoration: 'none' }}>
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handleUserLoginSubmit}
                  className="login-action-btn"
                  style={{ background: 'var(--accent-color)', color: '#ffffff' }}
                >
                  Log In to Account <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <Link to="/signup" style={{ color: '#ff385c', fontWeight: '800', textDecoration: 'none' }}>
                    Register / Sign Up Now <UserPlus size={14} />
                  </Link>
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: COMBINED HOST & ADMIN PORTAL LOGIN */}
          {!loading && activeTab === 'portal' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <Shield size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Host & Admin Authorization Portal
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Property Host & Platform Administrator Login
                </p>
              </div>

              <form onSubmit={handlePortalSubmit}>
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Account Email Address
                  </label>
                  <div className="login-input-wrapper">
                    <Mail size={18} color="#94a3b8" className="login-left-icon" />
                    <input
                      type="email"
                      placeholder="host@gmail.com / admin@homelyhub.com"
                      value={portalEmail}
                      onChange={(e) => setPortalEmail(e.target.value)}
                      className="login-input-field"
                      required
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Password
                  </label>
                  <div className="login-input-wrapper">
                    <Lock size={18} color="#94a3b8" className="login-left-icon" />
                    <input
                      type={showPortalPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                      className="login-input-field has-right-icon"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPortalPassword(!showPortalPassword)}
                      className="login-right-btn"
                      title={showPortalPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPortalPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#ff385c', fontWeight: '700', textDecoration: 'none' }}>
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-action-btn"
                  style={{ background: '#3b82f6', color: '#ffffff', boxShadow: '0 6px 20px rgba(59, 130, 246, 0.25)' }}
                >
                  <Lock size={18} /> Login to Management Portal
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Portal Access Accounts:</strong>
                <div style={{ marginTop: '0.35rem', fontFamily: 'monospace' }}>🏡 <strong>Host:</strong> rashidrashil2006@gmail.com</div>
                <div style={{ fontFamily: 'monospace' }}>🛡️ <strong>Admin:</strong> admin@homelyhub.com</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
