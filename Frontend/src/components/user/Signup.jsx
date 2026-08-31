import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getSignup } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import LoadingSpinner from '../LoadingSpinner';
import { User, Mail, Smartphone, Lock, Eye, EyeOff, UserPlus, ArrowRight } from 'lucide-react';
import '../../css/Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, errors, loading, user } = useSelector((state) => state.user);

  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    passwordConfirm: '',
  });
  const { name, email, phoneNumber, password, passwordConfirm } = formData;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (errors) {
      toast.error(errors);
      dispatch(userActions.clearErrors());
    } else if (isAuthenticated && user) {
      toast.success(`Welcome to Homely Hub, ${user.name || 'User'}! 🎉`);
      navigate('/');
    }
  }, [isAuthenticated, user, errors, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Direct Registration Submit Handler
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const cleanPassword = password.trim();
    const cleanConfirm = passwordConfirm.trim();

    if (!cleanName || cleanName.length < 2) {
      toast.error('Please enter your full name / username');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile phone number');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const registeredUser = await dispatch(getSignup({
        name: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password: cleanPassword,
        passwordConfirm: cleanConfirm,
      }));

      if (registeredUser) {
        navigate('/');
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="login-card-container" style={{ padding: '40px 20px' }}>
      <div className="login-card-box" style={{ maxWidth: '500px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '2.25rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '3.75rem', height: '3.75rem', background: 'rgba(255, 56, 92, 0.1)', color: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <UserPlus size={26} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Create Account
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Register directly with your email & password
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <LoadingSpinner />
            </div>
          )}

          {!loading && (
            <form onSubmit={handleRegisterSubmit}>
              {/* Full Name / Username */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Full Name / Username
                </label>
                <div className="login-input-wrapper">
                  <User size={18} color="#94a3b8" className="login-left-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Rashil Kumar"
                    value={name}
                    onChange={handleChange}
                    className="login-input-field"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <Mail size={18} color="#94a3b8" className="login-left-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. user@homelyhub.com"
                    value={email}
                    onChange={handleChange}
                    className="login-input-field"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Mobile Phone Number
                </label>
                <div className="login-input-wrapper">
                  <Smartphone size={18} color="#94a3b8" className="login-left-icon" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    className="login-input-field"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Password
                </label>
                <div className="login-input-wrapper">
                  <Lock size={18} color="#94a3b8" className="login-left-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create password (min 6 chars)"
                    value={password}
                    onChange={handleChange}
                    className="login-input-field has-right-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-right-btn"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Confirm Password
                </label>
                <div className="login-input-wrapper">
                  <Lock size={18} color="#94a3b8" className="login-left-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="passwordConfirm"
                    placeholder="Re-enter password"
                    value={passwordConfirm}
                    onChange={handleChange}
                    className="login-input-field has-right-icon"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="login-right-btn"
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleRegisterSubmit}
                className="login-action-btn"
                style={{ background: 'var(--accent-color)', color: '#ffffff' }}
              >
                Create Account <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* Footer Link */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#ff385c', fontWeight: '800', textDecoration: 'none' }}>
                Log In Here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
