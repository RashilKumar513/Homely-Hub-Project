import React, { useEffect } from "react";
import "../../css/BookingDetails.css";
import PropertyImg from "../propertyListing/PropertyImg";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchBookingDetails } from "../../store/Booking/booking-action";
import LoadingSpinner from "../LoadingSpinner";
import { downloadBookingPDF } from "../../utils/generatePdfInvoice";
import { FileText, MapPin, Calendar, CheckCircle } from "lucide-react";

const BookingDetails = () => {
  const dispatch = useDispatch();
  const { bookingId } = useParams();

  const { bookingDetails } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchBookingDetails(bookingId));
  }, [dispatch, bookingId]);

  if (!bookingDetails || !bookingDetails.property) {
    return (
      <div className="row justify-content-around mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  const { property } = bookingDetails;
  const address = property.address || {};

  return (
    <div className="details-container" style={{ maxWidth: "1080px", margin: "2rem auto", padding: "0 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <span className="badge bg-success mb-2" style={{ borderRadius: "10px", padding: "0.35rem 0.75rem" }}>
            <CheckCircle size={14} style={{ marginRight: "4px" }} /> CONFIRMED STAY
          </span>
          <h2 className="details-header" style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0, color: "var(--text-primary)" }}>
            {property.propertyName}
          </h2>
          <h6 className="details-location mt-1" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <MapPin size={16} color="var(--accent-color)" />
            {address.area}, {address.city}, {address.state} {address.pincode}
          </h6>
        </div>

        <button
          type="button"
          onClick={() => downloadBookingPDF(bookingDetails)}
          className="btn btn-danger d-inline-flex align-items-center gap-2"
          style={{ borderRadius: "30px", fontWeight: "700", padding: "0.6rem 1.5rem", height: "44px" }}
        >
          <FileText size={18} /> Download Receipt (PDF)
        </button>
      </div>

      <div className="details-information-container row mb-4" style={{ background: "var(--bg-card)", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <div className="details-information col-md-8">
          <h5 style={{ fontWeight: "800", color: "var(--text-primary)" }}>Stay Dates & Duration</h5>
          <section className="booking-stay-information mt-3" style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.95rem" }}>
            <span className="details" style={{ fontWeight: "700" }}>
              <Calendar size={18} color="var(--accent-color)" style={{ marginRight: "6px" }} />
              {new Date(bookingDetails.fromDate).toLocaleDateString()} (Check-in 12:00 PM)
            </span>
            <span>→</span>
            <span className="details" style={{ fontWeight: "700" }}>
              <Calendar size={18} color="var(--accent-color)" style={{ marginRight: "6px" }} />
              {new Date(bookingDetails.toDate).toLocaleDateString()} (Check-out 11:00 AM)
            </span>
            <span>({bookingDetails.numberOfnights || 1} Nights)</span>
          </section>
        </div>

        <div className="details-total-price-container col-md-4 text-md-end mt-3 mt-md-0">
          <div className="details-total-price">
            <p className="price-header m-0" style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "700" }}>TOTAL AMOUNT PAID</p>
            <span className="price-in-number" style={{ fontSize: "1.8rem", fontWeight: "800", color: "#10b981" }}>
              ₹{bookingDetails.price}
            </span>
          </div>
        </div>
      </div>

      {property.images && property.images.length > 0 && <PropertyImg images={property.images} />}
    </div>
  );
};

export default BookingDetails;
