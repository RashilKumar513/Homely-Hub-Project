import React from 'react';
import ProgressSteps from '../ProgressSteps';
import { Link } from 'react-router-dom';
import '../../css/Profile.css';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../LoadingSpinner';
import moment from 'moment';
import { Shield, User, Mail, Calendar, Edit3, Key, LayoutDashboard } from 'lucide-react';
import { capitalizeText } from '../../utils/formatText';

const Profile = () => {
  const { user, loading } = useSelector((state) => state.user);

  return (
    <>
      <ProgressSteps profile />
      <div className="container my-5" style={{ maxWidth: '850px' }}>
        {loading && <LoadingSpinner />}
        {user && !loading && (
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-lg)',
              padding: '2.5rem 2rem',
            }}
          >
            {/* Admin Badge Banner */}
            {user.role === 'admin' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#fff',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.6rem', borderRadius: '12px' }}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontWeight: '800' }}>Logged in as System Administrator</h5>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>You have full administrative control over Homely Hub.</span>
                  </div>
                </div>

                <Link
                  to="/admin/dashboard"
                  className="btn btn-primary d-flex align-items-center gap-2"
                  style={{ borderRadius: '30px', padding: '0.6rem 1.5rem', fontWeight: '700', background: '#3b82f6', border: 'none' }}
                >
                  <LayoutDashboard size={18} /> Admin Control Dashboard
                </Link>
              </div>
            )}

            <div className="row align-items-center">
              {/* Left Column: Avatar & Welcome */}
              <div className="col-md-5 text-center mb-4 mb-md-0 border-end" style={{ borderColor: 'var(--border-color)' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.25rem' }}>
                  <img
                    src={user.avatar?.url || 'https://i.pravatar.cc/150?img=3'}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-color)', boxShadow: 'var(--shadow-md)' }}
                  />
                  {user.role === 'admin' && (
                    <span
                      style={{ position: 'absolute', bottom: '0', right: '0', background: '#3b82f6', color: '#fff', borderRadius: '50%', padding: '0.4rem', boxShadow: 'var(--shadow-sm)' }}
                      title="Admin User"
                    >
                      <Shield size={18} />
                    </span>
                  )}
                </div>
                <h3 style={{ fontWeight: '800', fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
                  Welcome, {capitalizeText(user.name)}!
                </h3>
                <span className="badge bg-secondary mt-2" style={{ textTransform: 'uppercase', borderRadius: '10px' }}>
                  Role: {user.role || 'USER'}
                </span>
              </div>

              {/* Right Column: User Details */}
              <div className="col-md-7 ps-md-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} /> FULL NAME
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{capitalizeText(user.name)}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} /> EMAIL ADDRESS
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{user.email}</strong>
                  </div>

                  {user.phoneNumber && (
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>MOBILE NUMBER</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>+91 {user.phoneNumber}</strong>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} /> JOINED ON
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {moment(user.createdAt).format('MMMM Do YYYY')}
                    </strong>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <Link
                      to="/editprofile"
                      className="btn btn-outline-primary d-flex align-items-center gap-2"
                      style={{ borderRadius: '30px', padding: '0.5rem 1.25rem', fontWeight: '600' }}
                    >
                      <Edit3 size={16} /> Edit Profile
                    </Link>

                    <Link
                      to="/user/updatepassword"
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      style={{ borderRadius: '30px', padding: '0.5rem 1.25rem', fontWeight: '600' }}
                    >
                      <Key size={16} /> Change Password
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;
