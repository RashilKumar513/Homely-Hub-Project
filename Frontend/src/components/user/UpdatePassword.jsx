import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProgressSteps from '../ProgressSteps';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import '../../css/Profile.css';

const UpdatePassword = () => {
  const { errors, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordCurrent) {
      toast.error('Please enter your current password');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (password !== passwordConfirm) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(updatePassword({ passwordCurrent, password, passwordConfirm }));
      toast.success('Password updated successfully! Security email sent. 🔒');
      alert('Password updated successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'Failed to update password. Check current password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProgressSteps profile />

      <div className="container my-4" style={{ maxWidth: '600px' }}>
        {/* Back Link */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={18} /> Back to Profile
          </Link>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2.25rem 2rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255, 56, 92, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <KeyRound size={32} color="#ff385c" />
            </div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                margin: 0,
                color: 'var(--text-primary)',
              }}
            >
              Change Account Password
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Update your password to keep your Homely Hub account secure
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Input 1: Current Password */}
            <div style={{ marginBottom: '1.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem', display: 'block' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.8rem 0.75rem 2.5rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Input 2: New Password */}
            <div style={{ marginBottom: '1.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem', display: 'block' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.8rem 0.75rem 2.5rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Input 3: Confirm New Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.45rem', display: 'block' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to="/profile"
                className="btn btn-outline-secondary w-50"
                style={{ borderRadius: '30px', fontWeight: '700', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || loading}
                className="btn btn-primary w-50"
                style={{
                  borderRadius: '30px',
                  fontWeight: '700',
                  height: '46px',
                  background: 'var(--accent-color)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 6px 18px rgba(255, 56, 92, 0.3)',
                }}
              >
                <CheckCircle2 size={18} /> {submitting || loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdatePassword;
