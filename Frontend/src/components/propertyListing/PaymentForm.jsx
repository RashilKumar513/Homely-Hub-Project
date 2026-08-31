import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { setPaymentDetails } from "../../store/Payment/payment-slice";
import { updateUser } from "../../store/User/user-action";
import { Lock, Sparkles, ShieldCheck, CheckCircle2, UserCheck, Moon, Sun, Clock, Gift, Zap, Home, LayoutDashboard, PlusSquare, Edit3 } from "lucide-react";
import "../../css/PropertyListing.css";

const ALL_TIME_SLOTS = [
  "12:00 AM (Midnight)",
  "01:00 AM",
  "02:00 AM",
  "03:00 AM",
  "04:00 AM",
  "05:00 AM",
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM (Standard Check-out)",
  "12:00 PM (Noon / Standard Check-in)",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
];

const PaymentForm = ({
  price = 0,
  propertyName = "",
  address = {},
  maximumGuest = 4,
  propertyId = "",
}) => {
  const [calculatedPrice, setCalulatedPrice] = useState(0);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [totalStayHours, setTotalStayHours] = useState(0);
  const [flexiNote, setFlexiNote] = useState("");
  const [checkinDate, setCheckinDate] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [checkinTime, setCheckinTime] = useState("12:00 PM (Noon / Standard Check-in)");
  const [checkoutTime, setCheckoutTime] = useState("11:00 AM (Standard Check-out)");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const todayStr = moment().format("YYYY-MM-DD");
  const isHost = user && user.role === 'host';
  const isAdmin = user && user.role === 'admin';

  const isGuestUser = !user || !user.name || user.name.startsWith('Guest') || user.name === 'Guest User' || !user.phoneNumber || user.phoneNumber === '0000000000';
  const isUserLocked = Boolean(isAuthenticated && user && !isGuestUser);

  // Auto-populate user details from logged-in user state for regular guests
  useEffect(() => {
    if (user) {
      if (user.name && !user.name.startsWith('Guest') && user.name !== 'Guest User') {
        const parts = user.name.trim().split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      } else {
        setFirstName('');
        setLastName('');
      }

      if (user.email) {
        setEmail(user.email);
      }

      if (user.phoneNumber && user.phoneNumber !== '0000000000') {
        setPhone(user.phoneNumber);
      } else {
        setPhone('');
      }
    }
  }, [user]);

  const cleanTimeString = (str) => {
    if (!str) return "12:00 PM";
    const parts = str.trim().split(" ");
    return `${parts[0]} ${parts[1]}`;
  };

  const calculateFlexiPrice = (newCheckin, newCheckout, inTimeStr, outTimeStr) => {
    setCheckinDate(newCheckin);
    setCheckoutDate(newCheckout);

    if (newCheckin && newCheckout && moment(newCheckout).isAfter(moment(newCheckin))) {
      const cleanInTime = cleanTimeString(inTimeStr);
      const cleanOutTime = cleanTimeString(outTimeStr);

      const startMoment = moment(`${newCheckin} ${cleanInTime}`, "YYYY-MM-DD hh:mm A");
      const endMoment = moment(`${newCheckout} ${cleanOutTime}`, "YYYY-MM-DD hh:mm A");

      const diffInHours = Math.max(1, endMoment.diff(startMoment, "hours", true));
      const roundedHours = Math.ceil(diffInHours);
      setTotalStayHours(roundedHours);

      const full24hCycles = Math.floor(roundedHours / 24);
      const extraHours = roundedHours % 24;

      let calculatedCost = 0;
      let note = "";

      if (full24hCycles >= 1 && extraHours === 0) {
        calculatedCost = full24hCycles * price;
        note = `${full24hCycles} Standard 24-hour Night(s)`;
      } else if (full24hCycles >= 1 && extraHours > 0) {
        const hourlyRate = (price / 24) * 1.15;
        const extraHoursCost = Math.round(extraHours * hourlyRate);
        calculatedCost = full24hCycles * price + extraHoursCost;
        note = `${full24hCycles} Night(s) + ${extraHours} Flexi-Stay Extra Hours`;
      } else {
        const hourlyRate = (price / 24) * 1.2;
        calculatedCost = Math.round(roundedHours * hourlyRate);
        note = `Flexi-Hourly Stay (${roundedHours} Hours)`;
      }

      setCalulatedPrice(calculatedCost);
      setFlexiNote(note);
      setNumberOfNights(full24hCycles);
      setNumberOfDays(Math.ceil(roundedHours / 24));
    } else {
      setCalulatedPrice(price);
      setFlexiNote("Standard 1 Night Stay");
      setNumberOfNights(1);
      setNumberOfDays(1);
      setTotalStayHours(24);
    }
  };

  const handleReserve = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert("Please log in with Email OTP first to continue with reservation.");
      navigate('/login');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter your First Name and Last Name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile phone number.");
      return;
    }

    if (!checkinDate || !checkoutDate) {
      alert("Please select both Check-in and Check-out dates.");
      return;
    }

    if (moment(checkoutDate).isSameOrBefore(moment(checkinDate))) {
      alert("Check-out date must be after Check-in date.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const totalGuests = Number(adults) + Number(children);

    dispatch(
      setPaymentDetails({
        checkinDate: `${checkinDate} (${cleanTimeString(checkinTime)})`,
        checkoutDate: `${checkoutDate} (${cleanTimeString(checkoutTime)})`,
        checkinTime: cleanTimeString(checkinTime),
        checkoutTime: cleanTimeString(checkoutTime),
        rawCheckinDate: checkinDate,
        rawCheckoutDate: checkoutDate,
        nights: numberOfNights,
        days: numberOfDays,
        totalStayHours,
        flexiNote,
        totalPrice: calculatedPrice,
        propertyName,
        address,
        guests: totalGuests,
        name: fullName,
        phoneNumber: cleanPhone,
        email: email || user?.email || "guest@homelyhub.com",
      })
    );
    navigate(`/payment/${propertyId}`);
  };

  // 1. HOST VIEW CARD
  if (isHost) {
    return (
      <div className="custom-booking-card" style={{ border: '2px solid rgba(255, 56, 92, 0.3)', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ background: 'rgba(255, 56, 92, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Home size={30} color="#ff385c" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Host Management
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            You are hosting <strong>{propertyName}</strong>
          </p>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', marginBottom: '1.2rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Current Nightly Tariff:</span>
            <span style={{ fontWeight: '800', color: '#ff385c' }}>₹{price}/night</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Guest Capacity:</span>
            <span style={{ fontWeight: '800' }}>Up to {maximumGuest} Guests</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/host/dashboard" className="custom-reserve-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LayoutDashboard size={18} /> Open Host Dashboard
          </Link>
          <Link to="/accomodationform" style={{ textDecoration: 'none', textAlign: 'center', padding: '12px', borderRadius: '12px', background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <PlusSquare size={18} /> Add Another Property
          </Link>
        </div>
      </div>
    );
  }

  // 2. ADMIN PREVIEW MODE CARD
  if (isAdmin) {
    return (
      <div className="custom-booking-card" style={{ border: '2px solid rgba(59, 130, 246, 0.3)', background: 'var(--bg-secondary)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Shield size={30} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Admin Preview Mode
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Viewing <strong>{propertyName}</strong> as Administrator
          </p>
        </div>

        <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', marginBottom: '1.2rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Nightly Price:</span>
            <span style={{ fontWeight: '800', color: '#3b82f6' }}>₹{price}/night</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Max Guests:</span>
            <span style={{ fontWeight: '800' }}>{maximumGuest} Guests</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link to="/admin/dashboard" className="custom-reserve-btn" style={{ background: '#3b82f6', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LayoutDashboard size={18} /> Open Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 3. REGULAR GUEST BOOKING FORM
  return (
    <div style={{ width: "100%" }}>
      <form className="custom-booking-card" onSubmit={handleReserve}>
        {/* Title */}
        <h3 className="custom-booking-title">
          {propertyName || "Accommodation"} Booking Form
        </h3>

        {/* Nightly Rate */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <div>
            <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--accent-color)" }}>₹{price}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.25rem" }}>/ night</span>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "0.3rem 0.6rem", borderRadius: "16px", display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <Zap size={14} /> Flexi-Stay Pricing
          </span>
        </div>

        {/* Name: First & Last */}
        <div>
          <label className="custom-form-label">Guest Reservation Name</label>
          <div className="custom-form-row">
            <input
              type="text"
              placeholder="First Name (e.g. Rashil)"
              className="custom-form-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name (e.g. Kumar)"
              className="custom-form-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="custom-form-label">Email Address</label>
          <input
            type="email"
            placeholder="example@domain.com"
            className="custom-form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={isUserLocked}
            style={{ background: isUserLocked ? "var(--bg-primary)" : "inherit", cursor: isUserLocked ? "not-allowed" : "text", opacity: isUserLocked ? 0.88 : 1 }}
            required
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="custom-form-label">Phone Number</label>
          <input
            type="tel"
            maxLength="10"
            placeholder="10-digit Mobile Number"
            className="custom-form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            readOnly={isUserLocked}
            style={{ background: isUserLocked ? "var(--bg-primary)" : "inherit", cursor: isUserLocked ? "not-allowed" : "text", opacity: isUserLocked ? 0.88 : 1 }}
            required
          />
        </div>

        {/* Check-in Date & Check-in Time */}
        <div>
          <div className="custom-form-row">
            <div>
              <label className="custom-form-label">Check-in Date</label>
              <input
                type="date"
                min={todayStr}
                className="custom-form-input"
                value={checkinDate}
                onChange={(e) => calculateFlexiPrice(e.target.value, checkoutDate, checkinTime, checkoutTime)}
                required
              />
            </div>
            <div>
              <label className="custom-form-label">Check-in Time</label>
              <select
                className="custom-form-input"
                value={checkinTime}
                onChange={(e) => {
                  setCheckinTime(e.target.value);
                  calculateFlexiPrice(checkinDate, checkoutDate, e.target.value, checkoutTime);
                }}
                required
              >
                {ALL_TIME_SLOTS.map((time) => (
                  <option key={`in-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Check-out Date & Check-out Time */}
        <div>
          <div className="custom-form-row">
            <div>
              <label className="custom-form-label">Check-out Date</label>
              <input
                type="date"
                min={checkinDate || todayStr}
                className="custom-form-input"
                value={checkoutDate}
                onChange={(e) => calculateFlexiPrice(checkinDate, e.target.value, checkinTime, checkoutTime)}
                required
              />
            </div>
            <div>
              <label className="custom-form-label">Check-out Time</label>
              <select
                className="custom-form-input"
                value={checkoutTime}
                onChange={(e) => {
                  setCheckoutTime(e.target.value);
                  calculateFlexiPrice(checkinDate, checkoutDate, checkinTime, e.target.value);
                }}
                required
              >
                {ALL_TIME_SLOTS.map((time) => (
                  <option key={`out-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Guests Count Selector */}
        <div>
          <label className="custom-form-label">Number of Guests</label>
          <div className="custom-form-row">
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>Adults</span>
              <select
                className="custom-form-input"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              >
                {[...Array(maximumGuest).keys()].map((n) => (
                  <option key={`adult-${n + 1}`} value={n + 1}>{n + 1} Adult{n > 0 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.2rem" }}>Children</span>
              <select
                className="custom-form-input"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={`child-${n}`} value={n}>{n} Child{n !== 1 ? "ren" : ""}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calculated Flexi Price Summary */}
        {calculatedPrice > 0 && (
          <div style={{ background: "var(--bg-primary)", padding: "0.85rem 1rem", borderRadius: "14px", border: "1px solid var(--border-color)", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Calculated Tariff ({flexiNote || "Stay"}):</span>
              <span style={{ fontWeight: "800", color: "var(--text-primary)" }}>₹{calculatedPrice}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span>Total Stay Duration:</span>
              <span style={{ fontWeight: "700" }}>{totalStayHours} Hours</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="custom-reserve-btn"
          style={{ marginTop: "0.75rem" }}
        >
          <Lock size={16} style={{ marginRight: "0.4rem" }} />
          Reserve Stay (₹{calculatedPrice || price})
        </button>

        <p className="custom-guarantee-text">
          <ShieldCheck size={14} color="#10b981" inline="true" style={{ marginRight: "0.3rem" }} />
          Guaranteed reservation with instant confirmation voucher
        </p>
      </form>
    </div>
  );
};

export default PaymentForm;
