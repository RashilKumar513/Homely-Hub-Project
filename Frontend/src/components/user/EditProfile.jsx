import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../store/User/user-action';
import { userActions } from '../../store/User/user-slice';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProgressSteps from '../ProgressSteps';
import { User, Smartphone, Mail, Camera, ArrowLeft, CheckCircle2, ShieldCheck, UploadCloud, RefreshCw } from 'lucide-react';
import '../../css/Profile.css';

const EditProfile = () => {
  const { user, errors, loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar?.url || 'https://i.pravatar.cc/150?img=3'
  );
  const [avatarBase64, setAvatarBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name === 'Guest User' ? '' : user.name || '');
      setPhoneNumber(user.phoneNumber === '0000000000' ? '' : user.phoneNumber || '');
      setAvatarPreview(user.avatar?.url || 'https://i.pravatar.cc/150?img=3');
    }
  }, [user]);

  useEffect(() => {
    if (errors && errors.length > 0) {
      toast.error(errors);
      dispatch(userActions.clearErrors());
    }
  }, [errors, dispatch]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatarBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      toast.error('Please enter a valid full name');
      return;
    }

    const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    if (cleanPhone && cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile phone number');
      return;
    }

    const updatedFields = {};
    if (cleanName !== user?.name) {
      updatedFields.name = cleanName;
    }
    if (cleanPhone && cleanPhone !== user?.phoneNumber) {
      updatedFields.phoneNumber = cleanPhone;
    }
    if (avatarBase64) {
      updatedFields.avatar = avatarBase64;
    }

    if (Object.keys(updatedFields).length === 0) {
      toast('No changes were made', { icon: 'ℹ️' });
      navigate('/profile');
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(updateUser(updatedFields));
      toast.success('Profile updated successfully! 🎉');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ProgressSteps profile />

      <div className="container my-4" style={{ maxWidth: '640px' }}>
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
              transition: 'color 0.2s ease',
            }}
          >
            <ArrowLeft size={18} /> Back to My Profile
          </Link>
        </div>

        {/* Card Box */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            padding: '2.25rem 2rem',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                margin: 0,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Update Account Profile
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Personalize your account details for seamless staycation bookings
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Avatar Selection */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto' }}>
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--accent-color)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <label
                  htmlFor="avatar-upload-input"
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                    transition: 'transform 0.2s ease',
                  }}
                  title="Upload New Profile Picture"
                >
                  <Camera size={18} />
                </label>
                <input
                  type="file"
                  id="avatar-upload-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.6rem' }}>
                Click the camera icon to upload custom photo (JPG/PNG max 5MB)
              </span>
            </div>

            {/* Input 1: Full Name */}
            <div style={{ marginBottom: '1.35rem' }}>
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <User size={16} color="var(--accent-color)" /> Full Name
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  background: 'var(--bg-primary)',
                  height: '48px',
                  padding: '0 1rem',
                }}
              >
                <input
                  type="text"
                  placeholder="e.g. Rashil Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                  }}
                  required
                />
              </div>
            </div>

            {/* Input 2: Mobile Phone Number */}
            <div style={{ marginBottom: '1.35rem' }}>
              <label
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: '0.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Smartphone size={16} color="#10b981" /> Mobile Phone Number
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'var(--bg-primary)',
                  height: '48px',
                }}
              >
                <span
                  style={{
                    padding: '0 1rem',
                    background: 'var(--border-color)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    padding: '0 1rem',
                  }}
                />
              </div>
            </div>

            {/* Input 3: Email Address (Read-Only Verified) */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Mail size={16} color="#3b82f6" /> Email Address
                </label>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <ShieldCheck size={14} /> Verified Account
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  background: 'var(--bg-primary)',
                  height: '48px',
                  padding: '0 1rem',
                  opacity: 0.85,
                  cursor: 'not-allowed',
                }}
              >
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  style={{
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link
                to="/profile"
                className="btn btn-outline-secondary w-50"
                style={{
                  borderRadius: '30px',
                  fontWeight: '700',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
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
                {submitting || loading ? (
                  <>
                    <RefreshCw size={18} className="spinner-border-sm" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
