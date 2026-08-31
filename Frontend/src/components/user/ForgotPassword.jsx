import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import '../../css/HostPortal.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error('Please enter your registered email address');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/v1/rent/user/forgotPassword', { email: cleanEmail });

      if (res.data.status === 'success' || res.data.message) {
        // Display requested popup / toast
        toast.success(res.data.message || 'reset link has been sent to email', {
          duration: 6000,
          icon: '📧',
        });
        alert('reset link has been sent to email');
        setSubmitted(true);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to send reset link';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-login-container" style={{ background: 'var(--bg-primary)', padding: '40px 20px' }}>
      <div className="host-login-card" style={{ maxWidth: '480px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <div className="host-login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255, 56, 92, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <KeyRound size={32} color="#ff385c" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Forgot Password?
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your registered email address and we'll send you an official link to reset your password.
          </p>
        </div>

        {error && <div className="host-error-alert">{error}</div>}

        {submitted ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
            <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: '10px' }} />
            <h4 style={{ color: '#166534', margin: '0 0 6px 0', fontWeight: '800' }}>Reset Link Sent!</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              We've dispatched an official password reset link to <strong>{email}</strong> via Gmail SMTP. Please check your inbox (or spam folder) and click the link to set a new password.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="btn btn-sm btn-outline-secondary mt-3"
              style={{ borderRadius: '20px', fontSize: '12px' }}
            >
              Resend to another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="host-login-form">
            <div className="form-group">
              <label>Registered Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@homelyhub.com"
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="host-login-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loading ? (
                'Sending Reset Email...'
              ) : (
                <>
                  <Send size={16} /> Send Reset Link
                </>
              )}
            </button>
          </form>
        )}

        <div className="host-login-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Remembered your password? <Link to="/login" style={{ color: '#ff385c', fontWeight: '700' }}>Log In</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
