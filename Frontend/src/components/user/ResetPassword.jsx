import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import '../../css/HostPortal.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPass = password.trim();
    const cleanConfirm = passwordConfirm.trim();

    if (!cleanPass || cleanPass.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.patch(`/api/v1/rent/user/resetPassword/${token}`, {
        password: cleanPass,
        passwordConfirm: cleanConfirm,
      });

      if (res.data.status === 'success' || res.data.user) {
        toast.success('Password reset successfully! Logged in automatically 🎉');
        alert('Password reset successfully!');
        navigate('/');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Token is invalid or has expired';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="host-login-container" style={{ background: 'var(--bg-primary)', padding: '40px 20px' }}>
      <div className="host-login-card" style={{ maxWidth: '480px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
        <div className="host-login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <ShieldCheck size={32} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Enter your new password below to secure your Homely Hub account.
          </p>
        </div>

        {error && <div className="host-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="host-login-form">
          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
                style={{ paddingLeft: '40px', paddingRight: '42px' }}
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

          <div className="form-group">
            <label>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Re-enter new password"
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button type="submit" className="host-login-btn" disabled={loading} style={{ background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? (
              'Resetting Password...'
            ) : (
              <>
                <CheckCircle2 size={16} /> Confirm & Reset Password
              </>
            )}
          </button>
        </form>

        <div className="host-login-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Back to <Link to="/login" style={{ color: '#ff385c', fontWeight: '700' }}>Login Portal</Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
