import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAccomodation } from "../../store/Accomodation/Accomodation-action";
import toast from "react-hot-toast";
import {
  Building,
  FileText,
  Home,
  Layers,
  Clock,
  PlusCircle,
  Info,
  MapPin,
  Camera,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Wifi,
  Utensils,
  Car,
  Tv,
  Waves,
  Wind,
} from "lucide-react";

const initialAmenities = [
  { id: "wifi", value: "Wifi", icon: <Wifi size={18} color="#3b82f6" />, rawIcon: "wifi" },
  { id: "kitchen", value: "Kitchen", icon: <Utensils size={18} color="#f59e0b" />, rawIcon: "kitchen" },
  { id: "parking", value: "Free Parking", icon: <Car size={18} color="#10b981" />, rawIcon: "garage_home" },
  { id: "washingmachine", value: "Washing Machine", icon: <Sparkles size={18} color="#ec4899" />, rawIcon: "local_laundry_service" },
  { id: "tv", value: "Tv", icon: <Tv size={18} color="#8b5cf6" />, rawIcon: "tv" },
  { id: "pool", value: "Pool", icon: <Waves size={18} color="#0284c7" />, rawIcon: "pool" },
  { id: "ac", value: "Ac", icon: <Wind size={18} color="#06b6d4" />, rawIcon: "air" },
];

const inputStyle = {
  height: "44px",
  minHeight: "44px",
  maxHeight: "44px",
  borderRadius: "10px",
  padding: "0.5rem 0.85rem",
  fontSize: "0.9rem",
  width: "100%",
};

const textareaStyle = {
  height: "100px",
  minHeight: "100px",
  maxHeight: "120px",
  borderRadius: "12px",
  padding: "0.75rem",
  fontSize: "0.9rem",
  width: "100%",
};

const AccomodationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const isAdmin = user && user.role === "admin";

  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState("");

  const [formData, setFormData] = useState({
    propertyName: "",
    description: "",
    propertyType: "House",
    roomType: "Entire Home",
    extraInfo: "",
    images: [],
    amenities: [
      { name: "Wifi", icon: "wifi" },
      { name: "Free Parking", icon: "garage_home" },
    ],
    address: {
      area: "",
      city: "",
      state: "",
      pincode: "",
    },
    checkInTime: "12:00",
    checkOutTime: "11:00",
    maximumGuest: 4,
    price: 2500,
  });

  const handleAddImageLink = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { url: imageInput.trim(), public_id: `url_${Date.now()}` }],
      }));
      setImageInput("");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { url: event.target.result, public_id: `file_${Date.now()}` }],
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAmenityToggle = (amenity) => {
    const exists = formData.amenities.some((item) => item.name === amenity.value);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.filter((item) => item.name !== amenity.value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, { name: amenity.value, icon: amenity.rawIcon }],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.propertyName.trim()) {
      toast.error("Please enter a property title");
      return;
    }
    if (!formData.address.city.trim() || !formData.address.state.trim()) {
      toast.error("Please enter property city and state");
      return;
    }

    try {
      setLoading(true);
      await dispatch(
        createAccomodation({
          propertyName: formData.propertyName,
          description: formData.description || "Beautiful property with modern amenities.",
          propertyType: formData.propertyType,
          roomType: formData.roomType,
          extraInfo: formData.extraInfo,
          images: formData.images,
          address: formData.address,
          amenities: formData.amenities,
          checkInTime: formData.checkInTime,
          checkOutTime: formData.checkOutTime,
          maximumGuest: Number(formData.maximumGuest) || 2,
          price: Number(formData.price) || 2000,
        })
      );
      toast.success("New Accommodation Published Successfully 🎉");
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/accomodation");
      }
    } catch (error) {
      toast.error(error.message || "Failed to publish property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1.5rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "#fff",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "var(--shadow-lg)",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div style={{ background: "rgba(255, 255, 255, 0.2)", padding: "0.85rem", borderRadius: "16px" }}>
          <Building size={32} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", margin: 0 }}>List Your Accommodation</h2>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.9, fontSize: "0.9rem" }}>
            Add property details, amenities, photos, pricing, and house rules.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-card)",
          borderRadius: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-lg)",
          padding: "2.5rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* SECTION 1: TITLE */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <Home size={20} color="var(--accent-color)" /> Property Title
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", display: "block" }}>
            Catchy title for your place (e.g. Luxury Sea View Villa in Goa)
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Property Title..."
            value={formData.propertyName}
            onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        {/* SECTION 2: ADDRESS */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <MapPin size={20} color="var(--accent-color)" /> Property Address
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
            Full location details for guest map placement
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Area / Locality</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bandra West"
                value={formData.address.area}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, area: e.target.value } })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>City</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Mumbai"
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>State</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Maharashtra"
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Pincode</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 400050"
                value={formData.address.pincode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                style={inputStyle}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PHOTOS */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <Camera size={20} color="var(--accent-color)" /> Property Photos
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
            Add image links or upload local images (6 photos recommended)
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", height: "42px" }}>
            <div style={{ position: "relative", flex: 1, height: "42px" }}>
              <LinkIcon size={16} color="var(--text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="form-control"
                type="text"
                placeholder="Paste image link URL (e.g. https://domain.com/photo.jpg)"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                style={{ ...inputStyle, height: "42px", minHeight: "42px", maxHeight: "42px", paddingLeft: "2.5rem" }}
              />
            </div>
            <button
              type="button"
              onClick={handleAddImageLink}
              className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-1"
              style={{ borderRadius: "12px", padding: "0 1.25rem", fontWeight: "700", background: "var(--accent-color)", border: "none", height: "42px", minHeight: "42px", maxHeight: "42px", alignSelf: "center", flexShrink: 0, color: "#ffffff" }}
            >
              <Plus size={16} /> Add Link
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {formData.images.map((imgObj, index) => (
              <div
                key={index}
                style={{ position: "relative", width: "120px", height: "100px", borderRadius: "14px", overflow: "hidden", border: "1px solid var(--border-color)" }}
              >
                <img src={imgObj.url} alt={`img-${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(239, 68, 68, 0.9)", color: "#fff", border: "none", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            <label
              style={{ width: "120px", height: "100px", background: "var(--bg-card)", border: "2px dashed var(--border-color)", borderRadius: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: "600" }}
            >
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
              <Upload size={22} color="var(--accent-color)" style={{ marginBottom: "0.3rem" }} />
              <span>Upload File</span>
            </label>
          </div>
        </div>

        {/* SECTION 4: DESCRIPTION */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <FileText size={20} color="var(--accent-color)" /> Property Description
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", display: "block" }}>
            Detailed description of spaces, views, neighborhood, and special features
          </label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Describe your accommodation..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={textareaStyle}
            required
          ></textarea>
        </div>

        {/* SECTION 5: PROPERTY & ROOM TYPE */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>
            <Layers size={20} color="var(--accent-color)" /> Category & Space Type
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.4rem", display: "block", color: "var(--text-primary)" }}>
                Property Type
              </label>
              <select
                className="form-select"
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="House">House</option>
                <option value="Flat">Flat / Apartment</option>
                <option value="Guest House">Guest House</option>
                <option value="Hotel">Hotel / Resort</option>
                <option value="Villa">Villa</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", marginBottom: "0.4rem", display: "block", color: "var(--text-primary)" }}>
                Room Type
              </label>
              <select
                className="form-select"
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                style={inputStyle}
                required
              >
                <option value="Anytype">Anytype</option>
                <option value="Entire Home">Entire Home</option>
                <option value="Room">Private Room</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: AMENITIES */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <Sparkles size={20} color="var(--accent-color)" /> Amenities & Perks
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
            Select all features available for guests at this property
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.85rem" }}>
            {initialAmenities.map((amenity) => {
              const isChecked = formData.amenities.some((item) => item.name === amenity.value);
              return (
                <label
                  key={amenity.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "14px",
                    border: isChecked ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                    background: isChecked ? "rgba(255, 56, 92, 0.06)" : "var(--bg-card)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleAmenityToggle(amenity)}
                    style={{ accentColor: "var(--accent-color)", width: "16px", height: "16px" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {amenity.icon}
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "var(--text-primary)" }}>
                      {amenity.value}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 7: EXTRA INFO */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
            <Info size={20} color="var(--accent-color)" /> House Rules & Extra Info
          </h4>
          <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.75rem", display: "block" }}>
            Add check-in guidelines, quiet hours, early check-in fees, or house rules.
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="House rules, late checkout policy..."
            value={formData.extraInfo}
            onChange={(e) => setFormData({ ...formData, extraInfo: e.target.value })}
            style={textareaStyle}
          ></textarea>
        </div>

        {/* SECTION 8: TIMES, GUESTS & PRICING */}
        <div style={{ background: "var(--bg-primary)", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>
            <Clock size={20} color="var(--accent-color)" /> Times, Guests & Pricing
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Check In Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Check Out Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Max Guests</label>
              <input
                type="number"
                min="1"
                className="form-control"
                placeholder="e.g. 4"
                value={formData.maximumGuest}
                onChange={(e) => setFormData({ ...formData, maximumGuest: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Price / Night (₹)</label>
              <input
                type="number"
                min="100"
                className="form-control"
                placeholder="e.g. 2500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={{ ...inputStyle, fontWeight: "700", color: "#10b981" }}
                required
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="btn btn-success w-100 d-inline-flex align-items-center justify-content-center gap-2"
          disabled={loading}
          style={{
            borderRadius: "30px",
            height: "48px",
            minHeight: "48px",
            maxHeight: "48px",
            alignSelf: "center",
            flexShrink: 0,
            fontWeight: "800",
            fontSize: "1.05rem",
            background: "#10b981",
            border: "none",
            boxShadow: "var(--shadow-md)",
            color: "#ffffff",
          }}
        >
          <PlusCircle size={20} /> {loading ? "Publishing Property..." : "Publish Property Listing"}
        </button>
      </form>
    </div>
  );
};

export default AccomodationForm;
