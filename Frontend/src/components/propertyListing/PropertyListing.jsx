import React, { useEffect, useState } from 'react';
import PropertyImg from './PropertyImg';
import PropertyAmenities from './PropertyAmenities';
import PropertyMapInfo from './PropertyMapInfo';
import PaymentForm from './PaymentForm';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPropertyDetails } from '../../store/PropertyDetails/propertyDetails-action';
import { toggleWishlistApi } from '../../store/Wishlist/wishlist-action';
import { axiosInstance } from '../../utils/axios';
import toast from 'react-hot-toast';
import { capitalizeText, formatLocation, formatTime } from '../../utils/formatText';
import {
  Star,
  MapPin,
  Heart,
  ShieldCheck,
  MessageSquare,
  Send,
  AlertCircle,
  Shield,
  LayoutDashboard,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  CornerDownRight,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import '../../css/PropertyListing.css';

const defaultPositiveReviews = [
  {
    name: 'Aarav Sharma',
    rating: 5,
    comment: 'Absolutely loved our stay! The location was breathtaking and the host went above and beyond to make us feel at home. Super clean and highly recommended! 🌟',
    likes: 18,
    dislikes: 1,
    createdAt: new Date(Date.now() - 3 * 86400000),
    adminReply: 'Thank you Aarav! We are delighted you enjoyed your stay at Homely Hub. We look forward to hosting you again soon!',
    adminReplyDate: new Date(Date.now() - 2 * 86400000),
  },
  {
    name: 'Priya Patel',
    rating: 5,
    comment: 'Exceptional property! The amenities were top-notch, check-in was seamless, and the ambiance was peaceful yet accessible to all main attractions. ✨',
    likes: 14,
    dislikes: 0,
    createdAt: new Date(Date.now() - 7 * 86400000),
  },
  {
    name: 'Rohan Gupta',
    rating: 5,
    comment: 'Top-tier stay! Perfect for a relaxing weekend getaway with family. Cozy interiors, comfortable beds, and super fast Wi-Fi. Will definitely book again!',
    likes: 22,
    dislikes: 2,
    createdAt: new Date(Date.now() - 12 * 86400000),
  },
];

const PropertyListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { propertyDetails, loading, error } = useSelector((state) => state.propertyDetails);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsList, setReviewsList] = useState(defaultPositiveReviews);

  // Single-vote per review tracking
  const [userVotes, setUserVotes] = useState({});

  // Admin reply states
  const [activeReplyIndex, setActiveReplyIndex] = useState(null);
  const [replyInput, setReplyInput] = useState('');

  // Detailed Host Inquiry Modal State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: user?.phoneNumber || '',
    topic: 'Early Check-In / Late Check-Out',
    checkInDate: '',
    checkOutDate: '',
    message: '',
  });
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (id) {
      dispatch(getPropertyDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (propertyDetails && Array.isArray(propertyDetails.reviews) && propertyDetails.reviews.length > 0) {
      const formatted = propertyDetails.reviews.map((r, i) => ({
        ...r,
        likes: r.likes !== undefined ? r.likes : 14 + i * 3,
        dislikes: r.dislikes !== undefined ? r.dislikes : 0,
      }));
      setReviewsList(formatted);
    } else if (propertyDetails) {
      setReviewsList(defaultPositiveReviews);
    }
  }, [propertyDetails]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p style={{ marginTop: '1.25rem', fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
          Loading property details...
        </p>
      </div>
    );
  }

  if (error || !propertyDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h3 style={{ fontWeight: '700' }}>Property Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          {error || 'Unable to load property details. Please try again.'}
        </p>
        <a href="/" className="btn btn-danger mt-3" style={{ borderRadius: '30px', padding: '0.6rem 1.5rem', fontWeight: '700' }}>
          Back to Stays
        </a>
      </div>
    );
  }

  const {
    propertyName,
    description,
    images,
    address,
    price,
    extraInfo,
    maximumGuest,
    amenities,
    checkInTime,
    checkOutTime,
    currentBookings,
    propertyType,
    ratings,
  } = propertyDetails;

  const isWishlisted = wishlistItems.some((item) => item._id === id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    dispatch(toggleWishlistApi(propertyDetails));
  };

  const handleDeletePropertyAdmin = async () => {
    if (!window.confirm(`Are you sure you want to delete property "${propertyName}"?`)) return;
    try {
      await axiosInstance.delete(`/v1/rent/listing/${id}`);
      toast.success(`Property "${propertyName}" deleted successfully`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete property');
    }
  };

  const handleOpenInquiryModal = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the property host 🔐');
      navigate('/login');
      return;
    }
    setShowInquiryModal(true);
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryForm.guestName.trim() || !inquiryForm.guestEmail.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }
    if (!inquiryForm.message.trim()) {
      toast.error('Please enter your inquiry message');
      return;
    }

    try {
      setSendingInquiry(true);
      await axiosInstance.post('/v1/rent/user/inquiry', {
        ...inquiryForm,
        propertyId: id,
        propertyName,
      });
      toast.success('Inquiry sent to Host & Admin Dashboard! They will respond shortly. 💬');
      setInquiryForm({
        guestName: user?.name || '',
        guestEmail: user?.email || '',
        guestPhone: user?.phoneNumber || '',
        topic: 'Early Check-In / Late Check-Out',
        checkInDate: '',
        checkOutDate: '',
        message: '',
      });
      setShowInquiryModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await axiosInstance.post(`/v1/rent/listing/${id}/review`, {
        rating: Number(rating),
        comment,
      });
      toast.success('Review posted successfully!');
      setComment('');
      if (res.data.reviews && res.data.reviews.length > 0) {
        setReviewsList(res.data.reviews);
      }
      dispatch(getPropertyDetails(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // User voting logic: Single vote per review
  const handleVoteHelpful = (index, isHelpful) => {
    if (userVotes[index]) {
      toast.error('You have already voted on this review! 🛑');
      return;
    }

    setUserVotes((prev) => ({ ...prev, [index]: isHelpful ? 'useful' : 'unuseful' }));
    setReviewsList((prev) =>
      prev.map((rev, i) => {
        if (i === index) {
          if (isHelpful) {
            toast.success('Marked review as Useful! 👍');
            return { ...rev, likes: (rev.likes || 0) + 1 };
          } else {
            toast.error('Marked review as Unuseful! 👎');
            return { ...rev, dislikes: (rev.dislikes || 0) + 1 };
          }
        }
        return rev;
      })
    );
  };

  // Admin reply logic
  const handlePostAdminReply = (index) => {
    if (!replyInput.trim()) {
      toast.error('Please enter a response to the review');
      return;
    }

    setReviewsList((prev) =>
      prev.map((rev, i) => {
        if (i === index) {
          return {
            ...rev,
            adminReply: replyInput.trim(),
            adminReplyDate: new Date(),
          };
        }
        return rev;
      })
    );

    toast.success('Host reply posted successfully! 💬');
    setActiveReplyIndex(null);
    setReplyInput('');
  };

  const formattedCheckin = formatTime(checkInTime, '12:00 PM');
  const formattedCheckout = formatTime(checkOutTime, '11:00 AM');

  return (
    <div className="property-container" style={{ maxWidth: '1280px', margin: '1.5rem auto', padding: '0 1rem' }}>
      {/* Title & Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            {capitalizeText(propertyName)}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '700', color: '#f59e0b' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              {ratings ? ratings.toFixed(1) : '5.0'} ({reviewsList.length} reviews)
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <MapPin size={16} />
              {formatLocation(address?.city, address?.state)}
            </span>
            {propertyType && (
              <>
                <span>•</span>
                <span className="badge bg-secondary" style={{ borderRadius: '12px' }}>{capitalizeText(propertyType)}</span>
              </>
            )}
          </div>
        </div>

        {/* Wishlist Button (Hide for Admin) */}
        {!isAdmin && (
          <button
            type="button"
            onClick={handleWishlistToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1.25rem',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: '600',
              height: '40px',
              minHeight: '40px',
              maxHeight: '40px',
              alignSelf: 'center',
              flexShrink: 0,
              color: isWishlisted ? '#ff385c' : 'var(--text-primary)',
              transition: 'all 0.2s ease',
            }}
          >
            <Heart size={18} fill={isWishlisted ? '#ff385c' : 'none'} color={isWishlisted ? '#ff385c' : 'currentColor'} />
            {isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
          </button>
        )}
      </div>

      {/* Hero Images */}
      {images && images.length > 0 && <PropertyImg images={images} />}

      {/* Main Content & Right Panel */}
      <div className="middle-container row mt-4">
        <div className="col-lg-8 col-md-7 col-12">
          {/* Host Info Badge & Inquiry Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 56, 92, 0.1)', color: 'var(--accent-color)', borderRadius: '50%', padding: '0.75rem' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <h5 style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>Hosted by Homely Hub Superhost</h5>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Check-in: <strong>{formattedCheckin}</strong> | Check-out: <strong>{formattedCheckout}</strong> | Max Guests: <strong>{maximumGuest}</strong>
                </p>
              </div>
            </div>

            {!isAdmin && (
              <button
                type="button"
                onClick={handleOpenInquiryModal}
                className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
                style={{ borderRadius: '30px', fontWeight: '700', padding: '0.45rem 1.1rem', fontSize: '0.88rem' }}
              >
                <MessageCircle size={16} /> Contact Host
              </button>
            )}
          </div>

          {/* Property Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>About This Space</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{description}</p>
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

          {/* Amenities */}
          <PropertyAmenities amenities={amenities || []} />

          <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

          {/* Reviews & Ratings Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="var(--accent-color)" /> Guest Reviews & Ratings ({reviewsList.length})
            </h3>

            {/* Post Review Form (Only for Regular Users) */}
            {!isAdmin && isAuthenticated && (
              <form
                onSubmit={handleReviewSubmit}
                style={{
                  background: 'var(--bg-card)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h5 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>Leave a Review</h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '36px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Rating:</span>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="form-select style-select"
                    style={{ width: 'auto', borderRadius: '8px', padding: '0.3rem 0.6rem', fontSize: '0.85rem', height: '36px', minHeight: '36px', maxHeight: '36px' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5 Exceptional)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5 Great)</option>
                    <option value="3">⭐⭐⭐ (3/3 Average)</option>
                    <option value="2">⭐⭐ (2/5 Below Average)</option>
                    <option value="1">⭐ (1/5 Poor)</option>
                  </select>
                </div>

                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Share details of your stay..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ borderRadius: '12px', fontSize: '0.9rem', height: '90px', minHeight: '90px', maxHeight: '110px' }}
                />

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-danger d-inline-flex align-items-center justify-content-center gap-2"
                  style={{
                    borderRadius: '30px',
                    padding: '0 1.25rem',
                    fontWeight: '700',
                    background: 'var(--accent-color)',
                    border: 'none',
                    height: '42px',
                    minHeight: '42px',
                    maxHeight: '42px',
                    alignSelf: 'flex-start',
                    flexShrink: 0,
                    width: 'auto',
                    color: '#ffffff',
                  }}
                >
                  <Send size={16} /> {submittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {!isAuthenticated && !isAdmin && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Please <a href="/login" style={{ color: 'var(--accent-color)', fontWeight: '700' }}>login</a> to write a guest review.
              </p>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewsList.map((rev, index) => {
                const votedState = userVotes[index];
                return (
                  <div
                    key={index}
                    style={{
                      background: 'var(--bg-card)',
                      padding: '1.25rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff385c 0%, #e00b41 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                          {rev.name ? rev.name[0].toUpperCase() : 'G'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>{rev.name || 'Verified Guest'}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Verified Guest Stay • {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: '700', fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '12px' }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> {rev.rating || 5}.0
                      </span>
                    </div>

                    <p style={{ margin: '0.5rem 0 0.85rem', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{rev.comment}</p>

                    {/* Official Admin / Host Reply Box (If Exists) */}
                    {rev.adminReply && (
                      <div style={{ background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem', marginTop: '0.75rem', marginBottom: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Shield size={14} color="#3b82f6" /> Homely Hub Host Response
                          </strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(rev.adminReplyDate || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                          "{rev.adminReply}"
                        </p>
                      </div>
                    )}

                    {/* REGULAR USER: Single-Vote Helpful/Unhelpful Bar */}
                    {!isAdmin && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>Was this review helpful?</span>
                        <button
                          type="button"
                          onClick={() => handleVoteHelpful(index, true)}
                          disabled={votedState !== undefined}
                          style={{
                            background: votedState === 'useful' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                            border: votedState === 'useful' ? '2px solid #10b981' : '1px solid var(--border-color)',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: votedState ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            color: votedState === 'useful' ? '#10b981' : 'var(--text-primary)',
                            fontWeight: '700',
                            opacity: votedState && votedState !== 'useful' ? 0.5 : 1,
                          }}
                        >
                          <ThumbsUp size={14} color="#10b981" /> Useful ({rev.likes || 14})
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVoteHelpful(index, false)}
                          disabled={votedState !== undefined}
                          style={{
                            background: votedState === 'unuseful' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-primary)',
                            border: votedState === 'unuseful' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: votedState ? 'not-allowed' : 'pointer',
                            fontSize: '0.8rem',
                            color: votedState === 'unuseful' ? '#ef4444' : 'var(--text-primary)',
                            fontWeight: '700',
                            opacity: votedState && votedState !== 'unuseful' ? 0.5 : 1,
                          }}
                        >
                          <ThumbsDown size={14} color="#ef4444" /> Unuseful ({rev.dislikes || 0})
                        </button>
                      </div>
                    )}

                    {/* ADMIN USER: Reply to Review Option */}
                    {isAdmin && (
                      <div style={{ paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)' }}>
                        {activeReplyIndex === index ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <textarea
                              rows="2"
                              className="form-control"
                              placeholder="Write an official host response..."
                              value={replyInput}
                              onChange={(e) => setReplyInput(e.target.value)}
                              style={{ borderRadius: '10px', fontSize: '0.85rem', padding: '0.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setActiveReplyIndex(null)}
                                className="btn btn-sm btn-outline-secondary"
                                style={{ borderRadius: '20px', fontSize: '0.8rem' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePostAdminReply(index)}
                                className="btn btn-sm btn-primary"
                                style={{ borderRadius: '20px', fontSize: '0.8rem', background: '#3b82f6', border: 'none' }}
                              >
                                <Send size={12} style={{ marginRight: '4px' }} /> Post Host Response
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyIndex(index);
                              setReplyInput('');
                            }}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                            style={{ borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}
                          >
                            <CornerDownRight size={14} /> Reply to Guest Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Admin Management Card OR User Booking Card */}
        <div className="col-lg-4 col-md-5 col-12">
          {isAdmin ? (
            /* Admin Control Card */
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Shield size={24} color="#3b82f6" />
                <div>
                  <h4 style={{ margin: 0, fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Admin Listing Control</h4>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>● Active Platform Listing</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Nightly Rate:</span>
                  <strong style={{ color: 'var(--accent-color)' }}>₹{price}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max Guests:</span>
                  <strong>{maximumGuest} Guests</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Check-in / Out:</span>
                  <strong>{formattedCheckin} / {formattedCheckout}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Link
                  to="/admin/dashboard"
                  className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '30px', height: '44px', minHeight: '44px', maxHeight: '44px', fontWeight: '700', background: '#3b82f6', border: 'none', color: '#ffffff' }}
                >
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleDeletePropertyAdmin}
                  className="btn btn-outline-danger d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '30px', height: '44px', minHeight: '44px', maxHeight: '44px', fontWeight: '700' }}
                >
                  <Trash2 size={18} /> Delete Listing
                </button>
              </div>
            </div>
          ) : (
            /* Regular User Booking Card */
            <PaymentForm
              price={price}
              propertyName={propertyName}
              address={address}
              maximumGuest={maximumGuest}
              propertyId={id}
              currentBookings={currentBookings}
            />
          )}
        </div>
      </div>

      {/* DETAILED HOST INQUIRY MODAL */}
      {showInquiryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', width: '100%', maxWidth: '540px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} color="var(--accent-color)" /> Contact Host & Admin
              </h4>
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Inquiring about <strong>{propertyName}</strong>. Messages are delivered to the Host & Admin Control Center.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Your Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Guest Name"
                    value={inquiryForm.guestName}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, guestName: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="email@domain.com"
                    value={inquiryForm.guestEmail}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, guestEmail: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Mobile Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={inquiryForm.guestPhone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, guestPhone: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Inquiry Topic</label>
                  <select
                    className="form-select"
                    value={inquiryForm.topic}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, topic: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  >
                    <option value="Early Check-In / Late Check-Out">Early Check-In / Late Out</option>
                    <option value="Pet Policy & House Rules">Pet Policy & House Rules</option>
                    <option value="Airport Shuttle & Parking">Airport Shuttle & Parking</option>
                    <option value="Pricing & Discounts">Pricing & Discounts</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Intended Check-In</label>
                  <input
                    type="date"
                    className="form-control"
                    value={inquiryForm.checkInDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, checkInDate: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Intended Check-Out</label>
                  <input
                    type="date"
                    className="form-control"
                    value={inquiryForm.checkOutDate}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, checkOutDate: e.target.value })}
                    style={{ borderRadius: '10px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.2rem', display: 'block' }}>Message Details</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Ask the host any question about your upcoming stay..."
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  style={{ borderRadius: '12px', padding: '0.6rem', fontSize: '0.88rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  className="btn btn-secondary w-50"
                  style={{ borderRadius: '30px', fontWeight: '700', height: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="btn btn-danger w-50"
                  style={{ borderRadius: '30px', fontWeight: '700', height: '42px', background: 'var(--accent-color)', border: 'none' }}
                >
                  {sendingInquiry ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extra Info & Things to Know */}
      <hr style={{ borderColor: 'var(--border-color)', margin: '2.5rem 0' }} />
      <PropertyMapInfo
        extraInfo={extraInfo}
        checkInTime={checkInTime}
        checkOutTime={checkOutTime}
        address={address}
      />
    </div>
  );
};

export default PropertyListing;
