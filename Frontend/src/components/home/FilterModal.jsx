import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "../../css/FilterModal.css";
import {
  SlidersHorizontal,
  X,
  Home,
  Building,
  Hotel,
  Building2,
  BedDouble,
  Wifi,
  Utensils,
  Wind,
  Tv,
  Waves,
  Car,
  Check,
  RotateCcw
} from "lucide-react";

const FilterModal = ({ selectedFilters = {}, onFilterChange, onClose }) => {
  const [minPrice, setMinPrice] = useState(selectedFilters.minPrice || 500);
  const [maxPrice, setMaxPrice] = useState(selectedFilters.maxPrice || 25000);
  const [propertyType, setPropertyType] = useState(selectedFilters.propertyType || "");
  const [roomType, setRoomType] = useState(selectedFilters.roomType || "");
  const [amenities, setAmenities] = useState(selectedFilters.amenities || []);

  useEffect(() => {
    setMinPrice(selectedFilters.minPrice || 500);
    setMaxPrice(selectedFilters.maxPrice || 25000);
    setPropertyType(selectedFilters.propertyType || "");
    setRoomType(selectedFilters.roomType || "");
    setAmenities(selectedFilters.amenities || []);
  }, [selectedFilters]);

  const propertyTypeOptions = [
    { value: "House", label: "House", icon: Home },
    { value: "Flat", label: "Flat", icon: Building },
    { value: "Guest House", label: "Guest House", icon: Hotel },
    { value: "Hotel", label: "Hotel", icon: Building2 },
    { value: "Villa", label: "Villa", icon: Home },
  ];

  const roomTypeOptions = [
    { value: "Entire Home", label: "Entire Home", icon: Home },
    { value: "Room", label: "Room", icon: BedDouble },
    { value: "Anytype", label: "Any Type", icon: Building },
  ];

  const amenitiesOptions = [
    { value: "Wifi", label: "Wi-Fi", icon: Wifi },
    { value: "Kitchen", label: "Kitchen", icon: Utensils },
    { value: "Ac", label: "Air Conditioning", icon: Wind },
    { value: "Washing Machine", label: "Washing Machine", icon: Wind },
    { value: "Tv", label: "TV", icon: Tv },
    { value: "Pool", label: "Pool", icon: Waves },
    { value: "Free Parking", label: "Free Parking", icon: Car },
  ];

  const handlePropertyTypeToggle = (val) => {
    setPropertyType((prev) => (prev === val ? "" : val));
  };

  const handleRoomTypeToggle = (val) => {
    setRoomType((prev) => (prev === val ? "" : val));
  };

  const handleAmenityToggle = (val) => {
    setAmenities((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const handleClearFilters = () => {
    setMinPrice(500);
    setMaxPrice(25000);
    setPropertyType("");
    setRoomType("");
    setAmenities([]);
    onFilterChange("clearAll", null);
    if (onClose) onClose();
  };

  const handleApply = (e) => {
    e.preventDefault();
    onFilterChange("minPrice", minPrice);
    onFilterChange("maxPrice", maxPrice);
    onFilterChange("propertyType", propertyType);
    onFilterChange("roomType", roomType);
    onFilterChange("amenities", amenities);
    if (onClose) onClose();
  };

  return (
    <div className="filter-modal-backdrop" onClick={onClose}>
      <div className="filter-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="filter-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.1rem", fontWeight: "800", color: "var(--text-primary)" }}>
            <SlidersHorizontal size={20} color="var(--accent-color)" /> Filter Places
          </div>
          <button type="button" className="filter-modal-close-btn" onClick={onClose} title="Close filters">
            <X size={18} />
          </button>
        </div>

        {/* Body Container */}
        <div className="filter-modal-body">
          {/* Price Range Section */}
          <div className="filter-modal-section">
            <h5 className="filter-section-title">Price Range per Night</h5>
            <div className="filter-price-grid">
              <div>
                <label className="filter-input-label">Minimum Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="filter-modal-input"
                />
              </div>
              <div>
                <label className="filter-input-label">Maximum Price (₹)</label>
                <input
                  type="number"
                  min={minPrice}
                  max="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="filter-modal-input"
                />
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

          {/* Property Type Section */}
          <div className="filter-modal-section">
            <h5 className="filter-section-title">Property Type</h5>
            <div className="filter-pills-grid">
              {propertyTypeOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = propertyType.toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handlePropertyTypeToggle(opt.value)}
                    className={`filter-pill-card ${isSelected ? "active" : ""}`}
                  >
                    <IconComponent size={18} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

          {/* Room Type Section */}
          <div className="filter-modal-section">
            <h5 className="filter-section-title">Room Type</h5>
            <div className="filter-pills-grid">
              {roomTypeOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = roomType.toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleRoomTypeToggle(opt.value)}
                    className={`filter-pill-card ${isSelected ? "active" : ""}`}
                  >
                    <IconComponent size={18} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ borderColor: "var(--border-color)", margin: "1rem 0" }} />

          {/* Amenities Section */}
          <div className="filter-modal-section">
            <h5 className="filter-section-title">Amenities</h5>
            <div className="filter-amenities-grid">
              {amenitiesOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = amenities.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleAmenityToggle(opt.value)}
                    className={`filter-amenity-card ${isSelected ? "active" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <IconComponent size={18} />
                      <span>{opt.label}</span>
                    </div>
                    {isSelected && <Check size={16} color="var(--accent-color)" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="filter-modal-footer">
          <button type="button" className="filter-clear-btn" onClick={handleClearFilters}>
            <RotateCcw size={16} /> Clear All
          </button>

          <button type="button" className="filter-apply-btn" onClick={handleApply}>
            Show Properties
          </button>
        </div>
      </div>
    </div>
  );
};

FilterModal.propTypes = {
  selectedFilters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FilterModal;
