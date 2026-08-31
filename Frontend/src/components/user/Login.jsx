import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { sendEmailOTPAction, verifyEmailOTPAction, portalLoginAction, updateUser } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import LoadingSpinner from '../LoadingSpinner';
import { Mail, Shield, ArrowRight, RefreshCw, CheckCircle2, Lock, User as UserIcon, Smartphone, UserCheck, Eye, EyeOff, Home } from 'lucide-react';
import '../../css/Login.css';

const Login = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'portal'
  const [step, setStep] = useState('email'); // 'email', 'otp', 'profile_setup'

  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Profile Setup State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Host & Admin Portal State
  const [portalEmail, setPortalEmail] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, errors, loading, otpSent } = useSelector((state) => state.user);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    if (otpSent && step === 'email') {
      setStep('otp');
    }
  }, [otpSent, step]);

  useEffect(() => {
    if (errors) {
      toast.error(errors);
      dispatch(userActions.clearErrors());
    } else if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'host') {
        navigate('/host/dashboard');
      } else if (
        step !== 'profile_setup' &&
        (!user.name || user.name.startsWith('Guest') || !user.phoneNumber || user.phoneNumber === '0000000000')
      ) {
        setStep('profile_setup');
        setProfileName(user.name?.startsWith('Guest') ? '' : (user.name || ''));
        setProfilePhone(user.phoneNumber === '0000000000' ? '' : (user.phoneNumber || ''));
      } else if (step !== 'profile_setup') {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, errors, navigate, dispatch, step]);

  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    if (!userEmail || !userEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    dispatch(sendEmailOTPAction(userEmail.trim().toLowerCase()));
    setTimer(60);
    setCanResend(false);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }
    dispatch(verifyEmailOTPAction(userEmail.trim().toLowerCase(), otp));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || profileName.length < 2) {
      toast.error('Please enter your full name');
      return;
    }
    const cleanPhone = profilePhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile phone number');
      return;
    }

    try {
      setSavingProfile(true);
      await dispatch(updateUser({ name: profileName.trim(), phoneNumber: cleanPhone }));
      toast.success(`Welcome to Homely Hub, ${profileName}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error('Failed to update profile details');
    } finally {
      setSavingProfile(false);
    }
  };

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
              setStep('email');
              dispatch(userActions.clearErrors());
            }}
            className="login-tab-btn"
            style={{
              background: activeTab === 'user' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'user' ? 'var(--accent-color)' : 'var(--text-muted)',
              borderBottom: activeTab === 'user' ? '3px solid var(--accent-color)' : 'none',
            }}
          >
            <Mail size={18} /> User Login (Email OTP)
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
              borderBottom: activeTab === 'portal' ? '3px solid #3b82f6' : 'none',
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

          {!loading && activeTab === 'user' && (
            <div>
              {/* STEP 1 & 2 HEADER */}
              {step !== 'profile_setup' ? (
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', background: 'rgba(255, 56, 92, 0.1)', color: 'var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <Mail size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    Email OTP Verification
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    {step === 'email' ? 'Enter your email address to receive a 6-digit verification OTP code' : `Enter the 6-digit OTP code sent to ${userEmail}`}
                  </p>
                </div>
              ) : (
                /* STEP 3 HEADER: PROFILE SETUP (NAME & PHONE) */
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                    <UserCheck size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    Complete Your Account Profile
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Email Verified! Please enter your name and mobile phone number to complete your profile.
                  </p>
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                      Email Address
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)', height: '44px', padding: '0 0.85rem' }}>
                      <Mail size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="login-input-field"
                        style={{ border: 'none', background: 'transparent' }}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="login-action-btn"
                    style={{ background: 'var(--accent-color)', color: '#ffffff' }}
                  >
                    Send Email OTP Code <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                        Enter 6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('email');
                          dispatch(userActions.setOtpSent(false));
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Change Email
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength="6"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="login-input-field"
                      style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.4rem', fontWeight: '800', border: '2px solid var(--accent-color)', marginBottom: '1.25rem' }}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="login-action-btn"
                    style={{ background: 'var(--accent-color)', color: '#ffffff', marginBottom: '1rem' }}
                  >
                    <CheckCircle2 size={18} /> Verify OTP & Login
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {!canResend ? (
                      <span>Resend OTP in <strong>{timer}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <RefreshCw size={14} /> Resend OTP Code
                      </button>
                    )}
                  </div>
                </form>
              )}

              {step === 'profile_setup' && (
                <form onSubmit={handleSaveProfile}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                      Full Name
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)', height: '44px', padding: '0 0.85rem' }}>
                      <UserIcon size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                      <input
                        type="text"
                        placeholder="e.g. Rashil Kumar"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="login-input-field"
                        style={{ border: 'none', background: 'transparent' }}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                      Mobile Phone Number
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-primary)', height: '44px' }}>
                      <span style={{ padding: '0 1rem', background: 'var(--border-color)', fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-secondary)', height: '100%', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Smartphone size={16} /> +91
                      </span>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="9876543210"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ''))}
                        className="login-input-field"
                        style={{ border: 'none', background: 'transparent' }}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="login-action-btn"
                    style={{ background: '#10b981', color: '#ffffff' }}
                  >
                    <UserCheck size={18} /> {savingProfile ? 'Updating Profile...' : 'Save Profile & Continue'}
                  </button>
                </form>
              )}
            </div>
          )}

          {!loading && activeTab === 'portal' && (
            /* Combined Host & Admin Portal Login */
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
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="host@gmail.com / admin@homelyhub.com"
                    value={portalEmail}
                    onChange={(e) => setPortalEmail(e.target.value)}
                    className="login-input-field"
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={portalPassword}
                      onChange={(e) => setPortalPassword(e.target.value)}
                      className="login-input-field"
                      style={{ paddingRight: '42px' }}
                      required
                    />
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

                <button
                  type="submit"
                  className="login-action-btn"
                  style={{ background: '#3b82f6', color: '#ffffff' }}
                >
                  <Lock size={18} /> Login to Management Portal
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Portal Access Accounts:</strong>
                <div style={{ marginTop: '0.35rem', fontFamily: 'monospace' }}>🏡 <strong>Host:</strong> rashidrashil2006@gmail.com</div>
                <div style={{ fontFamily: 'monospace' }}>🛡️ <strong>Admin:</strong> admin@homelyhub.com</div>
                <div style={{ marginTop: '0.2rem', fontFamily: 'monospace' }}>🔑 <strong>Password:</strong> Rashil2006@1</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
