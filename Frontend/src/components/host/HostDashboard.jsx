import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PlusSquare, Eye, Users, Calendar, DollarSign, MessageSquare, Send, CheckCircle2, Clock, Trash2, UserCheck } from 'lucide-react';
import '../../css/HostPortal.css';

const HostDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');
  const [replyText, setReplyText] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHostStats(true);
    const interval = setInterval(() => {
      fetchHostStats(false);
    }, 4000); // REAL-TIME POLLING SYNC EVERY 4 SECONDS

    return () => clearInterval(interval);
  }, []);

  const fetchHostStats = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get('/api/v1/rent/user/host/stats', { withCredentials: true });
      if (res.data.status === 'success') {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching host stats:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleReplyInquiry = async (inquiryId) => {
    const text = replyText[inquiryId];
    if (!text || !text.trim()) {
      toast.error('Please write a reply message first');
      return;
    }

    try {
      setSendingReplyId(inquiryId);
      await axios.patch(
        `/api/v1/rent/user/host/inquiries/${inquiryId}`,
        { replyMessage: text.trim() },
        { withCredentials: true }
      );

      toast.success('Host reply sent & guest notified via email! 💬');
      setReplyText((prev) => ({ ...prev, [inquiryId]: '' }));

      if (stats && stats.hostInquiries) {
        const updatedInquiries = stats.hostInquiries.map((inq) =>
          inq._id === inquiryId
            ? { ...inq, status: 'Resolved', replyMessage: text.trim() }
            : inq
        );
        setStats({ ...stats, hostInquiries: updatedInquiries });
      }

      fetchHostStats(false);
    } catch (err) {
      console.error('Error sending host reply:', err);
      toast.error(err.response?.data?.message || 'Error sending host reply');
    } finally {
      setSendingReplyId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${userName || 'User'}"?`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      const res = await axios.delete(`/api/v1/rent/user/admin/user/${userId}`, { withCredentials: true });
      toast.success(`User account "${userName || 'Account'}" deleted successfully! 🗑️`);
      fetchHostStats(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user account');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading && !stats) {
    return <div className="host-loading" style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem', color: '#64748b' }}>Loading Host Portal Dashboard...</div>;
  }

  const pendingInquiriesCount = (stats?.hostInquiries || []).filter((i) => i.status === 'Pending').length;

  return (
    <div className="host-dashboard-container">
      {/* Clean Dashboard Top Bar */}
      <header className="host-dashboard-header">
        <div className="host-header-left">
          <div className="host-icon-badge" style={{ background: 'rgba(255, 56, 92, 0.1)', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Home size={28} color="#ff385c" />
          </div>
          <div>
            <h1 className="host-dashboard-title" style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              HOST PORTAL
            </h1>
            <p className="host-dashboard-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Host Management, Earnings & User Moderation
            </p>
          </div>
        </div>

        <div className="host-header-actions">
          <Link to="/accomodationform" className="btn-host-add-prop" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px', background: '#ff385c', color: 'white', fontWeight: '700' }}>
            <PlusSquare size={18} /> Add Property
          </Link>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="host-metrics-grid">
        <div className="metric-card border-red">
          <span className="metric-label">YOUR PROPERTIES</span>
          <div className="metric-value">{stats?.totalProperties || 0}</div>
          <span className="metric-sub">Active Staycations</span>
        </div>

        <div className="metric-card border-green">
          <span className="metric-label">HOST BOOKINGS</span>
          <div className="metric-value">{stats?.totalBookings || 0}</div>
          <span className="metric-sub">Guest Stays</span>
        </div>

        <div className="metric-card border-purple">
          <span className="metric-label">GROSS REVENUE</span>
          <div className="metric-value">₹{(stats?.grossEarnings || 0).toLocaleString('en-IN')}</div>
          <span className="metric-sub">Total Booking Value</span>
        </div>

        <div className="metric-card border-yellow">
          <span className="metric-label">NET HOST EARNINGS</span>
          <div className="metric-value">₹{(stats?.netEarnings || 0).toLocaleString('en-IN')}</div>
          <span className="metric-sub">After 10% Commission</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="host-content-box">
        <div className="host-tabs">
          <button className={activeTab === 'properties' ? 'active' : ''} onClick={() => setActiveTab('properties')}>
            My Properties ({stats?.totalProperties || 0})
          </button>
          <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
            Guest Bookings ({stats?.totalBookings || 0})
          </button>
          <button className={activeTab === 'inquiries' ? 'active' : ''} onClick={() => setActiveTab('inquiries')}>
            Guest Inquiries {pendingInquiriesCount > 0 ? `(${pendingInquiriesCount} Pending)` : `(${stats?.hostInquiries?.length || 0})`}
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            Platform Users ({stats?.allUsers?.length || 0})
          </button>
        </div>

        {activeTab === 'properties' && (
          <div className="host-properties-grid">
            {stats?.hostProperties?.map((prop) => (
              <div key={prop._id} className="host-prop-card">
                <img src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'} alt={prop.propertyName} />
                <div className="host-prop-info">
                  <h3>{prop.propertyName}</h3>
                  <p className="location">{prop.address?.city}, {prop.address?.state}</p>
                  <div className="price-row">
                    <span className="price">₹{prop.price}/night</span>
                    <span className="type">{prop.propertyType}</span>
                  </div>
                  <Link to={`/propertylist/${prop._id}`} className="btn-view-prop">
                    <Eye size={16} /> View Listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="host-bookings-table-container">
            {stats?.hostBookings?.length > 0 ? (
              <table className="host-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Property Name</th>
                    <th>Guest Name</th>
                    <th>Contact</th>
                    <th>Check-In / Out</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.hostBookings?.map((b) => (
                    <tr key={b._id}>
                      <td>#{b._id.slice(-6).toUpperCase()}</td>
                      <td>{b.property?.propertyName || 'Stay'}</td>
                      <td>{b.user?.name || 'Guest'}</td>
                      <td>{b.user?.phoneNumber || b.user?.email || 'N/A'}</td>
                      <td>{new Date(b.fromDate).toLocaleDateString()} - {new Date(b.toDate).toLocaleDateString()}</td>
                      <td>₹{b.price?.toLocaleString('en-IN')}</td>
                      <td><span className="badge-paid">Paid & Confirmed</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
                <Calendar size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3>No Guest Bookings Yet</h3>
                <p>When guests book your staycations, their reservations and check-in schedules will appear here in real time!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="inquiries-list">
            {stats?.hostInquiries?.length > 0 ? (
              stats?.hostInquiries?.map((inq) => (
                <div key={inq._id} className="inquiry-card" style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div className="inquiry-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      {inq.propertyName} — <span className="guest-name" style={{ color: 'var(--accent-color)' }}>{inq.guestName}</span> ({inq.guestEmail})
                    </h4>
                    <span className={`badge-status ${inq.status.toLowerCase()}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', background: inq.status === 'Resolved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: inq.status === 'Resolved' ? '#10b981' : '#d97706' }}>
                      {inq.status === 'Resolved' ? 'Replied' : 'Pending'}
                    </span>
                  </div>
                  <p className="inquiry-msg" style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    "{inq.message}"
                  </p>

                  {inq.replyMessage ? (
                    <div className="host-reply-box" style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem 1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={16} /> Replied by: {inq.repliedBy || 'Host'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {inq.repliedAt ? new Date(inq.repliedAt).toLocaleString() : new Date(inq.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <span style={{ fontStyle: 'italic', fontWeight: '600' }}>"{inq.replyMessage}"</span>
                    </div>
                  ) : (
                    <div className="reply-form" style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="Write host response to guest..."
                        value={replyText[inq._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [inq._id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReplyInquiry(inq._id);
                        }}
                        style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                      <button
                        onClick={() => handleReplyInquiry(inq._id)}
                        disabled={sendingReplyId === inq._id}
                        style={{ padding: '0.65rem 1.25rem', borderRadius: '12px', background: '#ff385c', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Send size={16} /> {sendingReplyId === inq._id ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
                <MessageSquare size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3>No Inquiries Yet</h3>
                <p>Guest questions regarding your staycation properties will appear here so you can respond directly.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PLATFORM USERS & MODERATION */}
        {activeTab === 'users' && (
          <div className="host-table-container">
            {stats?.allUsers?.length > 0 ? (
              <table className="host-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Account Role</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.allUsers?.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={u.avatar?.url || 'https://i.pravatar.cc/150?img=3'}
                            alt={u.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{u.name || 'Guest User'}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{u._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phoneNumber && u.phoneNumber !== '0000000000' ? `+91 ${u.phoneNumber}` : 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: u.role === 'admin' ? 'rgba(59, 130, 246, 0.15)' : u.role === 'host' ? 'rgba(255, 56, 92, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.role === 'admin' ? '#3b82f6' : u.role === 'host' ? '#ff385c' : '#10b981',
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u.role === 'admin' ? (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Protected Admin</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={deletingUserId === u._id}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '10px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Trash2 size={14} /> {deletingUserId === u._id ? 'Deleting...' : 'Delete User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#64748b' }}>
                <Users size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
                <h3>No Registered Users Found</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
