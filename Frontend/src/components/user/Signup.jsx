import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getSignup, sendEmailOTPAction, verifyEmailOTPAction } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import LoadingSpinner from '../LoadingSpinner';
import { User, Mail, Smartphone, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, UserPlus } from 'lucide-react';
import '../../css/Login.css';

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, errors, loading, otpSent } = useSelector((state) => state.user);

  const [step, setStep] = useState('details'); // 'details' or 'otp'

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
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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
    if (otpSent && step === 'details') {
      setStep('otp');
    }
  }, [otpSent, step]);

  useEffect(() => {
    if (errors) {
      toast.error(errors);
      dispatch(userActions.clearErrors());
    } else if (isAuthenticated) {
      toast.success('Registration successful! Welcome to Homely Hub 🎉');
      navigate('/');
    }
  }, [isAuthenticated, errors, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Submit Form & Send Email OTP
  const handleSendOtp = (e) => {
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

    dispatch(sendEmailOTPAction(cleanEmail));
    setTimer(60);
    setCanResend(false);
  };

  // Step 2: Verify Email OTP & Complete Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();

    if (!otp || otp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP code sent to your email');
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      dispatch(getSignup({
        name: name.trim(),
        email: cleanEmail,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        password: password.trim(),
        passwordConfirm: passwordConfirm.trim(),
        otp: otp.trim(),
      }));
    } catch (err) {
      toast.error('Registration failed. Please check your OTP code.');
    }
  };

  return (
    <div className="login-card-container" style={{ padding: '40px 20px' }}>
      <div className="login-card-box" style={{ maxWidth: '520px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
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
              {step === 'details'
                ? 'Fill in your details below to receive your Email verification OTP'
                : `Enter the 6-digit OTP code sent to ${email}`}
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <LoadingSpinner />
            </div>
          )}

          {/* STEP 1: REGISTRATION DETAILS FORM */}
          {!loading && step === 'details' && (
            <form onSubmit={handleSendOtp}>
              {/* Full Name / Username */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Full Name / Username
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Rashil Kumar"
                    value={name}
                    onChange={handleChange}
                    className="login-input-field"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Email Address */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. user@homelyhub.com"
                    value={email}
                    onChange={handleChange}
                    className="login-input-field"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Mobile Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    name="phoneNumber"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
                    className="login-input-field"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Smartphone size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Create account password (min 6 chars)"
                    value={password}
                    onChange={handleChange}
                    className="login-input-field"
                    style={{ paddingLeft: '40px', paddingRight: '42px' }}
                    required
                  />
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="passwordConfirm"
                    placeholder="Re-enter account password"
                    value={passwordConfirm}
                    onChange={handleChange}
                    className="login-input-field"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="login-action-btn"
                style={{ background: 'var(--accent-color)', color: '#ffffff' }}
              >
                Send Verification OTP <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* STEP 2: EMAIL OTP VERIFICATION FORM */}
          {!loading && step === 'otp' && (
            <form onSubmit={handleVerifyAndRegister}>
              <div style={{ background: 'rgba(255, 56, 92, 0.08)', border: '1px solid rgba(255, 56, 92, 0.25)', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>
                  We sent an official 6-digit OTP code to:
                </span>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{email}</strong>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.4rem', display: 'block' }}>
                  Enter 6-Digit Email Verification Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="login-input-field"
                  style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px', fontWeight: '800' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  {timer > 0 ? `Resend OTP code in ${timer}s` : 'OTP code expired'}
                </span>
                <button
                  type="button"
                  disabled={!canResend}
                  onClick={handleSendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canResend ? 'var(--accent-color)' : 'var(--text-muted)',
                    fontWeight: '700',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <RefreshCw size={14} /> Resend OTP
                </button>
              </div>

              <button
                type="submit"
                className="login-action-btn"
                style={{ background: 'var(--accent-color)', color: '#ffffff' }}
              >
                <CheckCircle2 size={18} /> Verify & Complete Registration
              </button>

              <button
                type="button"
                onClick={() => setStep('details')}
                className="btn btn-link w-100 mt-2"
                style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                ← Edit Registration Details
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
