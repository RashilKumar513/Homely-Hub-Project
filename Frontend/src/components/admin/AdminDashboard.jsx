import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../utils/axios';
import toast from 'react-hot-toast';
import { capitalizeText, formatLocation } from '../../utils/formatText';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getAllProperties } from '../../store/Property/property-action';
import {
  Shield,
  Building,
  Users,
  Calendar,
  IndianRupee,
  Trash2,
  PlusSquare,
  Star,
  MapPin,
  RefreshCw,
  Search,
  CheckCircle,
  Eye,
  Edit,
  UserCheck,
  UserX,
  X,
  FileSpreadsheet,
  MessageCircle,
  Clock,
  Send,
  Mail,
  Phone,
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'users', 'inquiries'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick Edit Modal State
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({
    propertyName: '',
    price: '',
    maximumGuest: '',
    propertyType: 'House',
    checkInTime: '12:00',
    checkOutTime: '11:00',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Admin Reply to Guest Inquiry state
  const [activeInquiryReply, setActiveInquiryReply] = useState(null);
  const [inquiryReplyText, setInquiryReplyText] = useState('');

  const fetchAdminData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const res = await axiosInstance.get('/v1/rent/user/admin/stats');
      setStats(res.data.data);
    } catch (error) {
      if (isInitial) toast.error(error.response?.data?.message || 'Failed to fetch admin stats');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(true);

    // Real-Time 5s Background Polling (Silent & Flicker-Free)
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get('/v1/rent/user/admin/stats');
        const newData = res.data.data;
        setStats((prevStats) => {
          if (prevStats && newData) {
            const oldPending = (prevStats.inquiriesList || []).filter((i) => i.status === 'Pending').length;
            const newPending = (newData.inquiriesList || []).filter((i) => i.status === 'Pending').length;
            if (newPending > oldPending) {
              toast('🔔 New Guest Inquiry Received in Real-Time!', {
                icon: '📩',
                style: {
                  borderRadius: '16px',
                  background: '#0f172a',
                  color: '#ffffff',
                  fontWeight: '700',
                },
                duration: 4000,
              });
            }
          }
          return newData;
        });
      } catch (err) {
        // Silent background catch
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    if (!stats) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'HOMELY HUB ADMIN SYSTEM REPORT\n';
    csvContent += `Generated At,${new Date().toLocaleString()}\n`;
    csvContent += `Total Revenue,INR ${stats.totalRevenue}\n`;
    csvContent += `Total Properties,${stats.totalProperties}\n`;
    csvContent += `Total Users,${stats.totalUsers}\n`;
    csvContent += `Total Bookings,${stats.totalBookings}\n\n`;

    csvContent += 'PROPERTY LISTINGS\n';
    csvContent += 'ID,Property Name,City,State,Price,Rating,Type\n';
    (stats.recentProperties || []).forEach((p) => {
      csvContent += `"${p._id}","${p.propertyName}","${p.address?.city || ''}","${p.address?.state || ''}",${p.price},${p.ratings || 5},"${p.propertyType || 'House'}"\n`;
    });

    csvContent += '\nUSER DIRECTORY\n';
    csvContent += 'ID,Name,Email,Mobile,Role,Joined Date\n';
    (stats.usersList || []).forEach((u) => {
      csvContent += `"${u._id}","${u.name}","${u.email}","${u.phoneNumber || ''}","${u.role || 'user'}","${new Date(u.createdAt).toLocaleDateString()}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `homely_hub_admin_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Admin CSV Report Downloaded Successfully! 📊');
  };

  const handleDeleteProperty = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/v1/rent/listing/${id}`);
      toast.success(`Property "${name}" deleted`);
      fetchAdminData();
      dispatch(getAllProperties());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleToggleUserRole = async (id, currentRole, name) => {
    const newRole = currentRole === 'admin' ? 'User' : 'Admin';
    if (!window.confirm(`Are you sure you want to change role for "${name}" to ${newRole}?`)) return;
    try {
      await axiosInstance.patch(`/v1/rent/user/admin/user/${id}/toggle-role`);
      toast.success(`Role updated to ${newRole}`);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/v1/rent/user/admin/user/${id}`);
      toast.success(`User "${name}" removed`);
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleOpenEditModal = (prop) => {
    setEditingProperty(prop);
    setEditForm({
      propertyName: prop.propertyName || '',
      price: prop.price || '',
      maximumGuest: prop.maximumGuest || 2,
      propertyType: prop.propertyType || 'House',
      checkInTime: prop.checkInTime || '12:00',
      checkOutTime: prop.checkOutTime || '11:00',
    });
  };

  const dispatch = useDispatch();

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    try {
      setSavingEdit(true);
      await axiosInstance.put(`/v1/rent/listing/${editingProperty._id}`, editForm);
      toast.success('Property updated successfully in Database!');
      setEditingProperty(null);
      fetchAdminData();
      dispatch(getAllProperties());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update property');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResolveInquiry = async (id) => {
    try {
      await axiosInstance.patch(`/v1/rent/user/admin/inquiries/${id}`, {
        replyMessage: inquiryReplyText || 'Thank you for your message. Host has addressed your inquiry.',
      });
      toast.success('Inquiry resolved and guest notified! 💬');
      setActiveInquiryReply(null);
      setInquiryReplyText('');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve inquiry');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this guest inquiry?')) return;
    try {
      await axiosInstance.delete(`/v1/rent/user/admin/inquiries/${id}`);
      toast.success('Inquiry deleted');
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete inquiry');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading Admin Control Dashboard...</p>
      </div>
    );
  }

  const filteredProperties = (stats?.recentProperties || []).filter(
    (p) =>
      p.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = (stats?.usersList || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phoneNumber?.includes(searchTerm)
  );

  const filteredInquiries = (stats?.inquiriesList || []).filter(
    (inq) =>
      inq.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingInquiriesCount = (stats?.inquiriesList || []).filter((i) => i.status === 'Pending').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          borderRadius: '20px',
          padding: '1.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.85rem', borderRadius: '16px' }}>
            <Shield size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Admin Control Center</h2>
              <span className="badge bg-primary" style={{ borderRadius: '12px', fontSize: '0.75rem' }}>SYSTEM ADMIN</span>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
              Full system control over properties, users, reservations, guest inquiries, and platform analytics.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'center', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn btn-outline-success d-inline-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '30px', fontWeight: '600', height: '40px', minHeight: '40px', maxHeight: '40px', width: 'auto', alignSelf: 'center', flexShrink: 0, padding: '0 1.25rem' }}
          >
            <FileSpreadsheet size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={fetchAdminData}
            className="btn btn-outline-light d-inline-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '30px', fontWeight: '600', height: '40px', minHeight: '40px', maxHeight: '40px', width: 'auto', alignSelf: 'center', flexShrink: 0, padding: '0 1.25rem' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <Link
            to="/accomodationform"
            className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2"
            style={{ borderRadius: '30px', fontWeight: '600', background: '#3b82f6', border: 'none', height: '40px', minHeight: '40px', maxHeight: '40px', width: 'auto', alignSelf: 'center', flexShrink: 0, padding: '0 1.25rem', color: '#ffffff' }}
          >
            <PlusSquare size={16} /> Add Property
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.25rem 0 0', color: '#10b981' }}>
                ₹{(stats?.totalRevenue || 0).toLocaleString()}
              </h3>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '14px' }}>
              <IndianRupee size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>PROPERTIES</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-primary)' }}>
                {stats?.totalProperties || 0}
              </h3>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '14px' }}>
              <Building size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>REGISTERED USERS</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.25rem 0 0', color: 'var(--text-primary)' }}>
                {stats?.totalUsers || 0}
              </h3>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '0.75rem', borderRadius: '14px' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>GUEST INQUIRIES</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.25rem 0 0', color: pendingInquiriesCount > 0 ? '#ff385c' : 'var(--text-primary)' }}>
                {stats?.inquiriesList?.length || 0}
              </h3>
            </div>
            <div style={{ background: 'rgba(255, 56, 92, 0.1)', color: '#ff385c', padding: '0.75rem', borderRadius: '14px' }}>
              <MessageCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.35rem', borderRadius: '14px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Properties', icon: <Building size={16} /> },
            { id: 'bookings', label: 'Bookings', icon: <Calendar size={16} /> },
            { id: 'users', label: 'User Directory', icon: <Users size={16} /> },
            { id: 'inquiries', label: `Guest Messages (${pendingInquiriesCount})`, icon: <MessageCircle size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0 1.25rem',
                height: '38px',
                minHeight: '38px',
                maxHeight: '38px',
                width: 'auto',
                alignSelf: 'center',
                flexShrink: 0,
                border: 'none',
                borderRadius: '10px',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '0 1rem', width: '280px', height: '40px' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--text-primary)', height: '100%' }}
          />
        </div>
      </div>

      {/* TAB 1: ALL PROPERTIES */}
      {activeTab === 'overview' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: '800', fontSize: '1.1rem' }}>
            System Property Listings ({filteredProperties.length})
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ color: 'var(--text-primary)', width: '100%' }}>
              <thead style={{ background: 'var(--bg-primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem' }}>Property</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price / Night</th>
                  <th>Rating</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((prop) => (
                  <tr key={prop._id}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <img
                          src={prop.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'}
                          alt={prop.propertyName}
                          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block' }}>{capitalizeText(prop.propertyName)}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prop._id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                        <MapPin size={14} />
                        {formatLocation(prop.address?.city, prop.address?.state)}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary" style={{ borderRadius: '8px', fontSize: '0.75rem' }}>
                        {capitalizeText(prop.propertyType || 'House')}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent-color)' }}>₹{prop.price}</strong>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        {prop.ratings ? prop.ratings.toFixed(1) : '4.8'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/propertylist/${prop._id}`}
                          className="btn btn-sm btn-outline-primary"
                          style={{ width: '34px', minWidth: '34px', maxWidth: '34px', height: '34px', minHeight: '34px', maxHeight: '34px', borderRadius: '8px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="View Listing"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(prop)}
                          className="btn btn-sm btn-outline-secondary"
                          style={{ width: '34px', minWidth: '34px', maxWidth: '34px', height: '34px', minHeight: '34px', maxHeight: '34px', borderRadius: '8px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Edit Property Details"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(prop._id, prop.propertyName)}
                          className="btn btn-sm btn-outline-danger"
                          style={{ width: '34px', minWidth: '34px', maxWidth: '34px', height: '34px', minHeight: '34px', maxHeight: '34px', borderRadius: '8px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKINGS OVERVIEW */}
      {activeTab === 'bookings' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: '800', fontSize: '1.1rem' }}>
            All System Reservations ({stats?.recentBookings?.length || 0})
          </div>
          {stats?.recentBookings?.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0" style={{ color: 'var(--text-primary)', width: '100%' }}>
                <thead style={{ background: 'var(--bg-primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <tr>
                    <th style={{ padding: '1rem 1.5rem' }}>Guest</th>
                    <th>Property Name</th>
                    <th>Stay Dates</th>
                    <th>Guests</th>
                    <th>Paid Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id}>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{b.user?.name || 'Guest User'}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user?.email || b.user?.phoneNumber || ''}</span>
                      </td>
                      <td>
                        <strong>{capitalizeText(b.property?.propertyName || 'Stay Booking')}</strong>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(b.fromDate).toLocaleDateString()} → {new Date(b.toDate).toLocaleDateString()}
                      </td>
                      <td>{b.guests || 1} Guests</td>
                      <td>
                        <strong style={{ color: '#10b981' }}>₹{b.price}</strong>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', borderRadius: '8px', padding: '0.35rem 0.65rem', fontWeight: '700', fontSize: '0.78rem' }}>
                          💳 {b.paymentMethod || 'Razorpay Gateway'}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-success" style={{ borderRadius: '8px' }}>
                          <CheckCircle size={12} style={{ marginRight: '4px' }} /> Confirmed & Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: '800', fontSize: '1.1rem' }}>
            System User Directory & Roles ({filteredUsers.length})
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ color: 'var(--text-primary)', width: '100%' }}>
              <thead style={{ background: 'var(--bg-primary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem' }}>User Name</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Admin Privileges & Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar?.url || 'https://i.pravatar.cc/150?img=3'}
                          alt="user"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <strong style={{ fontSize: '0.9rem' }}>{u.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td style={{ fontSize: '0.85rem' }}>{u.phoneNumber || 'N/A'}</td>
                    <td>
                      <span
                        className={`badge ${u.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}
                        style={{ borderRadius: '8px', textTransform: 'uppercase' }}
                      >
                        {u.role || 'USER'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleUserRole(u._id, u.role, u.name)}
                          className={`btn btn-sm ${u.role === 'admin' ? 'btn-outline-warning' : 'btn-outline-primary'}`}
                          style={{ borderRadius: '8px', height: '34px', minHeight: '34px', maxHeight: '34px', width: 'auto', alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0 0.85rem' }}
                          title={u.role === 'admin' ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                        >
                          {u.role === 'admin' ? <UserX size={14} /> : <UserCheck size={14} />}
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>

                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius: '8px', height: '34px', minHeight: '34px', maxHeight: '34px', width: 'auto', alignSelf: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.85rem' }}
                            title="Delete User Account"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GUEST MESSAGES & HOST INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={22} color="var(--accent-color)" /> Guest Host Inquiries ({filteredInquiries.length})
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Messages submitted by guests from property listing pages</span>
            </div>
            <span className="badge bg-danger" style={{ borderRadius: '12px', padding: '0.4rem 0.8rem' }}>
              {pendingInquiriesCount} Pending Action
            </span>
          </div>

          {filteredInquiries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <MessageCircle size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>No guest inquiries received yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredInquiries.map((inq) => (
                <div
                  key={inq._id}
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{inq.guestName}</strong>
                        <span className="badge bg-primary" style={{ borderRadius: '10px', fontSize: '0.75rem' }}>
                          {inq.topic || 'General Inquiry'}
                        </span>
                        <span className={`badge ${inq.status === 'Resolved' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ borderRadius: '10px', fontSize: '0.75rem' }}>
                          {inq.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={13} /> {inq.guestEmail}
                        </span>
                        {inq.guestPhone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={13} /> {inq.guestPhone}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={13} /> Received: {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge bg-secondary" style={{ borderRadius: '8px', fontSize: '0.8rem' }}>
                        Property: {inq.propertyName}
                      </span>
                      {inq.checkInDate && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          Stay: {inq.checkInDate} → {inq.checkOutDate || 'TBD'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message Box */}
                  <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                    "{inq.message}"
                  </div>

                  {/* Existing Reply if Resolved */}
                  {inq.replyMessage && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem 1rem', borderRadius: '12px', borderLeft: '4px solid #10b981', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <strong style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={16} /> Replied by: {inq.repliedBy || 'Management'}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {inq.repliedAt ? new Date(inq.repliedAt).toLocaleString() : new Date(inq.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontWeight: '600' }}>"{inq.replyMessage}"</span>
                    </div>
                  )}

                  {/* Admin Reply & Action Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!inq.replyMessage && inq.status !== 'Resolved' ? (
                        activeInquiryReply === inq._id ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type official host response..."
                              value={inquiryReplyText}
                              onChange={(e) => setInquiryReplyText(e.target.value)}
                              style={{ borderRadius: '20px', fontSize: '0.85rem', width: '280px' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleResolveInquiry(inq._id)}
                              className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                              style={{ borderRadius: '20px', fontWeight: '700' }}
                            >
                              <Send size={12} /> Send Response
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveInquiryReply(null)}
                              className="btn btn-sm btn-outline-secondary"
                              style={{ borderRadius: '20px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveInquiryReply(inq._id);
                              setInquiryReplyText('');
                            }}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            style={{ borderRadius: '20px', fontWeight: '700' }}
                          >
                            <MessageCircle size={14} /> Respond & Resolve
                          </button>
                        )
                      ) : (
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={14} /> Response Sent — Query Locked
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteInquiry(inq._id)}
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                      style={{ borderRadius: '20px' }}
                    >
                      <Trash2 size={14} /> Delete Inquiry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUICK EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '100%', maxWidth: '520px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={20} color="#3b82f6" /> Quick Edit Property
              </h4>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Property Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.propertyName}
                  onChange={(e) => setEditForm({ ...editForm, propertyName: e.target.value })}
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Nightly Rate (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    style={{ borderRadius: '10px', fontWeight: '700', color: '#10b981' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Max Guests</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.maximumGuest}
                    onChange={(e) => setEditForm({ ...editForm, maximumGuest: e.target.value })}
                    style={{ borderRadius: '10px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Check-In Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={editForm.checkInTime}
                    onChange={(e) => setEditForm({ ...editForm, checkInTime: e.target.value })}
                    style={{ borderRadius: '10px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Check-Out Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={editForm.checkOutTime}
                    onChange={(e) => setEditForm({ ...editForm, checkOutTime: e.target.value })}
                    style={{ borderRadius: '10px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', display: 'block' }}>Property Type</label>
                <select
                  className="form-select"
                  value={editForm.propertyType}
                  onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
                  style={{ borderRadius: '10px' }}
                >
                  <option value="House">House</option>
                  <option value="Flat">Flat / Apartment</option>
                  <option value="Guest House">Guest House</option>
                  <option value="Hotel">Hotel / Resort</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="btn btn-secondary w-50"
                  style={{ borderRadius: '30px', fontWeight: '700', height: '44px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-50"
                  disabled={savingEdit}
                  style={{ borderRadius: '30px', fontWeight: '700', height: '44px', background: '#3b82f6', border: 'none' }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
