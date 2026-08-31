import React, { useEffect, useState } from "react";
import "../../css/MyBookings.css";
import ProgressSteps from "../ProgressSteps";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookingDetails,
  fetchUserBookings,
} from "../../store/Booking/booking-action";
import LoadingSpinner from "../LoadingSpinner";
import { downloadBookingPDF } from "../../utils/generatePdfInvoice";
import { FileText, Calendar, ArrowRight, MessageCircle, Clock, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Building2 } from "lucide-react";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' or 'inquiries'
  const [myInquiries, setMyInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [emailSending, setEmailSending] = useState({});

  // Cancellation Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationSuccessData, setCancellationSuccessData] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const fetchMyInquiries = async (showLoading = false) => {
    try {
      if (showLoading) setLoadingInquiries(true);
      const res = await axiosInstance.get("/v1/rent/user/my-inquiries");
      setMyInquiries(res.data.data || []);
    } catch (err) {
      console.error("Failed to load host replies:", err);
    } finally {
      if (showLoading) setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (activeTab === "inquiries") {
      fetchMyInquiries(true);
      const interval = setInterval(() => {
        fetchMyInquiries(false);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleBookingClick = (bookingId) => {
    dispatch(fetchBookingDetails(bookingId));
    navigate(`/user/myBookings/${bookingId}`);
  };

  const handleDownloadAndEmailReceipt = async (e, booking) => {
    e.stopPropagation();

    // 1. Download/Print PDF Receipt
    downloadBookingPDF(booking);

    // 2. Dispatch Email Receipt to User's Email Inbox
    try {
      setEmailSending((prev) => ({ ...prev, [booking._id]: true }));
      await axiosInstance.post("/v1/rent/user/email-receipt", { bookingId: booking._id });
      toast.success("📄 PDF Receipt & Check-in Voucher sent to your Email! 📧");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send receipt to email");
    } finally {
      setEmailSending((prev) => ({ ...prev, [booking._id]: false }));
    }
  };

  const isCancelEligible = (fromDate) => {
    if (!fromDate) return true;
    const now = new Date();
    const checkIn = new Date(fromDate);
    checkIn.setHours(23, 59, 59, 999);
    return now <= checkIn;
  };

  const handleConfirmCancelBooking = async () => {
    if (!cancelModalBooking) return;
    const targetBooking = cancelModalBooking;
    const propertyTitle = targetBooking.property?.propertyName || "Homely Hub Stay";
    const defaultRefund = targetBooking.price ? (targetBooking.price - Math.round(targetBooking.price * 0.15)) : 0;

    try {
      setCancelling(true);
      const res = await axiosInstance.post(`/v1/rent/user/booking/cancel/${targetBooking._id}`);
      
      const finalRefund = res.data?.refundAmount || defaultRefund;

      // Close warning modal and open Bank Credit Success Modal
      setCancelModalBooking(null);
      setCancellationSuccessData({
        propertyName: propertyTitle,
        refundAmount: finalRefund,
      });

      toast.success(`🎉 Refund initiated! ₹${finalRefund.toLocaleString('en-IN')} will be credited to your bank account soon.`);
      dispatch(fetchUserBookings());
    } catch (err) {
      console.error("Cancellation Error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <ProgressSteps />
      <div className="mybookings-page-wrapper" style={{ maxWidth: "1000px", margin: "2rem auto", padding: "0 1.25rem" }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--bg-card)", padding: "0.4rem", borderRadius: "16px", border: "1px solid var(--border-color)", marginBottom: "1.75rem", width: "fit-content" }}>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "0.55rem 1.35rem",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "bookings" ? "var(--accent-color)" : "transparent",
              color: activeTab === "bookings" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
            }}
          >
            <Calendar size={16} /> My Booked Stays ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            style={{
              padding: "0.55rem 1.35rem",
              borderRadius: "12px",
              border: "none",
              background: activeTab === "inquiries" ? "var(--accent-color)" : "transparent",
              color: activeTab === "inquiries" ? "#ffffff" : "var(--text-secondary)",
              fontWeight: "700",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              cursor: "pointer",
            }}
          >
            <MessageCircle size={16} /> Host Messages & Replies
          </button>
        </div>

        {/* TAB 1: MY BOOKED STAYS */}
        {activeTab === "bookings" && (
          <>
            {loading && <LoadingSpinner />}
            {!loading && bookings.length === 0 && (
              <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "50vh", textAlign: "center" }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: "1rem" }} />
                <h3>No Stays Reserved Yet</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                  Explore our handpicked luxury properties and book your first staycation!
                </p>
                <Link to="/" className="btn btn-danger mt-3" style={{ borderRadius: "30px", padding: "0.6rem 1.5rem", fontWeight: "700" }}>
                  Explore Accommodations
                </Link>
              </div>
            )}

            {!loading &&
              bookings.length > 0 &&
              bookings.map((booking) => {
                const canCancel = isCancelEligible(booking.fromDate);
                return (
                  <div className="wow-booking-card mb-4" key={booking._id}>
                    <div className="row g-0 align-items-stretch">
                      <div className="col-md-4 col-sm-12 image-column" onClick={() => handleBookingClick(booking._id)}>
                        <img
                          className="wow-booking-img"
                          src={
                            booking.property?.images && booking.property.images.length > 0
                              ? booking.property.images[0].url
                              : "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
                          }
                          alt="stay preview"
                        />
                      </div>
                      <div className="col-md-8 col-sm-12 p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                            <h4 className="wow-hotel-title" onClick={() => handleBookingClick(booking._id)}>
                              {booking.property?.propertyName || "Homely Hub Stay"}
                            </h4>
                            <span className="badge bg-success px-3 py-2" style={{ borderRadius: "12px", fontWeight: "800", fontSize: "0.8rem" }}>
                              <CheckCircle2 size={13} style={{ marginRight: "4px" }} /> Confirmed
                            </span>
                          </div>

                          <div className="wow-stay-dates">
                            <span className="date-pill">
                              <Calendar size={15} color="var(--accent-color)" />
                              {new Date(booking.fromDate).toLocaleDateString()}
                            </span>
                            <ArrowRight size={14} color="var(--text-muted)" />
                            <span className="date-pill">
                              <Calendar size={15} color="var(--accent-color)" />
                              {new Date(booking.toDate).toLocaleDateString()}
                            </span>
                            <span style={{ fontWeight: "700", color: "var(--text-secondary)" }}>
                              ({booking.numberOfnights || 1} Nights)
                            </span>
                          </div>
                        </div>

                        <div className="wow-card-footer">
                          <div>
                            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>
                              Total Paid
                            </span>
                            <h4 style={{ fontWeight: "900", color: "#10b981", margin: 0 }}>
                              ₹{booking.price?.toLocaleString("en-IN")}
                            </h4>
                          </div>

                          <div className="wow-btn-group">
                            <button
                              type="button"
                              onClick={(e) => handleDownloadAndEmailReceipt(e, booking)}
                              disabled={emailSending[booking._id]}
                              className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
                              style={{ borderRadius: "30px", fontWeight: "700", fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
                              title="Print PDF & Email to Inbox"
                            >
                              <FileText size={16} /> {emailSending[booking._id] ? "Emailing..." : "Receipt (PDF)"}
                            </button>

                            {/* CANCEL BOOKING BUTTON (Strict Check-In Date Policy) */}
                            {canCancel ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCancelModalBooking(booking);
                                }}
                                className="btn btn-outline-warning text-dark d-inline-flex align-items-center gap-1"
                                style={{ borderRadius: "30px", fontWeight: "700", fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
                              >
                                <XCircle size={16} color="#d97706" /> Cancel Stay
                              </button>
                            ) : (
                              <span
                                style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "700", background: "var(--bg-primary)", padding: "0.4rem 0.85rem", borderRadius: "20px", border: "1px solid var(--border-color)" }}
                                title="Cancellation closed on or after check-in date"
                              >
                                🔒 Check-in Reached
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleBookingClick(booking._id)}
                              className="btn btn-danger d-inline-flex align-items-center gap-1"
                              style={{ borderRadius: "30px", fontWeight: "700", fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
                            >
                              Details <ArrowRight size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* TAB 2: MY HOST MESSAGES & REPLIES */}
        {activeTab === "inquiries" && (
          <div style={{ background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: "800", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MessageCircle size={22} color="var(--accent-color)" /> My Host Inquiries & Responses
                </h4>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Track responses to questions you asked stay hosts
                </p>
              </div>
              <button
                type="button"
                onClick={fetchMyInquiries}
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                style={{ borderRadius: "20px" }}
              >
                Refresh Messages
              </button>
            </div>

            {loadingInquiries ? (
              <LoadingSpinner />
            ) : myInquiries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <MessageCircle size={40} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                <p>You haven't submitted any host inquiries yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {myInquiries.map((inq) => (
                  <div
                    key={inq._id}
                    style={{
                      background: "var(--bg-primary)",
                      borderRadius: "16px",
                      padding: "1.25rem",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                      <div>
                        <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)", display: "block" }}>
                          Property: {inq.propertyName}
                        </strong>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                          <span className="badge bg-primary" style={{ borderRadius: "10px", fontSize: "0.75rem" }}>
                            {inq.topic}
                          </span>
                          <span className={`badge ${inq.status === "Resolved" ? "bg-success" : "bg-warning text-dark"}`} style={{ borderRadius: "10px", fontSize: "0.75rem" }}>
                            {inq.status === "Resolved" ? "Host Replied" : "Pending Host Response"}
                          </span>
                        </div>
                      </div>

                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Clock size={13} /> {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ background: "var(--bg-card)", padding: "0.85rem", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                      <strong style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>YOUR INQUIRY:</strong>
                      "{inq.message}"
                    </div>

                    {/* Official Host Response */}
                    {inq.replyMessage ? (
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "0.85rem 1rem", borderRadius: "12px", borderLeft: "4px solid #10b981", fontSize: "0.88rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", flexWrap: "wrap", gap: "0.3rem" }}>
                          <strong style={{ color: "#166534", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <ShieldCheck size={16} /> OFFICIAL RESPONSE ({inq.repliedBy || 'Host'}):
                          </strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {inq.repliedAt ? new Date(inq.repliedAt).toLocaleString() : new Date(inq.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: "600", fontStyle: "italic" }}>"{inq.replyMessage}"</p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Host is reviewing your inquiry and will reply shortly.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: CANCELLATION WARNING MODAL (15% FEE POPUP) */}
      {cancelModalBooking && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "24px", maxWidth: "520px", width: "100%", padding: "1.75rem", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", border: "1px solid var(--border-color)" }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", background: "rgba(245, 158, 11, 0.15)", color: "#d97706", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                Confirm Booking Cancellation
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
                Are you sure you want to cancel your stay at <strong>{cancelModalBooking.property?.propertyName || "Homely Hub Stay"}</strong>?
              </p>
            </div>

            {/* 15% Fee Policy Warning Box */}
            <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "16px", padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
              <strong style={{ color: "#dc2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                <AlertTriangle size={16} /> CANCELLATION & REFUND POLICY:
              </strong>
              <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                As per Homely Hub stay policy, <strong style={{ color: "#dc2626" }}>15% of the total amount (₹{Math.round((cancelModalBooking.price || 0) * 0.15).toLocaleString("en-IN")}) will not be refunded</strong> as processing fee.
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px dashed rgba(239, 68, 68, 0.2)", fontSize: "0.85rem" }}>
                <span>Total Amount Paid:</span>
                <strong>₹{cancelModalBooking.price?.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#dc2626" }}>
                <span>15% Fee Retained:</span>
                <strong>- ₹{Math.round((cancelModalBooking.price || 0) * 0.15).toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: "800", color: "#10b981", marginTop: "0.35rem" }}>
                <span>85% Refund to Email/Bank:</span>
                <span>₹{(cancelModalBooking.price - Math.round((cancelModalBooking.price || 0) * 0.15)).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                disabled={cancelling}
                className="btn btn-outline-secondary"
                style={{ flex: 1, borderRadius: "30px", fontWeight: "700", padding: "0.65rem" }}
              >
                Keep My Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBooking}
                disabled={cancelling}
                className="btn btn-danger"
                style={{ flex: 1.3, borderRadius: "30px", fontWeight: "800", padding: "0.65rem", background: "#dc2626", border: "none" }}
              >
                {cancelling ? "Cancelling..." : `Confirm & Refund 85%`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: BANK ACCOUNT REFUND CONFIRMATION MODAL */}
      {cancellationSuccessData && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0, 0, 0, 0.65)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: "24px", maxWidth: "480px", width: "100%", padding: "2rem", boxShadow: "0 25px 50px rgba(0,0,0,0.35)", border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ width: "4rem", height: "4rem", background: "#dcfce7", color: "#10b981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-primary)", margin: 0 }}>
              Cancellation Confirmed!
            </h3>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "0.5rem", lineHeight: 1.5 }}>
              Your reservation for <strong>{cancellationSuccessData.propertyName}</strong> has been cancelled.
            </p>

            <div style={{ background: "var(--bg-primary)", borderRadius: "16px", padding: "1.25rem", margin: "1.25rem 0", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "800", textTransform: "uppercase" }}>85% Refund Amount</div>
              <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#10b981", margin: "0.2rem 0 0.5rem" }}>
                ₹{cancellationSuccessData.refundAmount?.toLocaleString("en-IN")}
              </h2>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: "700" }}>
                <Building2 size={16} color="var(--accent-color)" />
                The refund amount will be credited to your bank account / original payment method soon! 🏦⚡
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCancellationSuccessData(null)}
              className="btn btn-danger w-100"
              style={{ borderRadius: "30px", fontWeight: "800", padding: "0.75rem", fontSize: "1rem", background: "linear-gradient(135deg, #ff385c 0%, #e00b41 100%)", border: "none" }}
            >
              Done & Return to My Bookings
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MyBookings;
