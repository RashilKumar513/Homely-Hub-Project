import React from "react";
import {
  Wifi,
  Utensils,
  Car,
  Sparkles,
  Tv,
  Waves,
  Wind,
  CheckCircle,
} from "lucide-react";

const initialamenities = [
  { id: "wifi", value: "Wifi", icon: <Wifi size={18} color="#3b82f6" />, rawIcon: "wifi" },
  { id: "kitchen", value: "Kitchen", icon: <Utensils size={18} color="#f59e0b" />, rawIcon: "kitchen" },
  { id: "parking", value: "Free Parking", icon: <Car size={18} color="#10b981" />, rawIcon: "garage_home" },
  { id: "washingmachine", value: "Washing Machine", icon: <Sparkles size={18} color="#ec4899" />, rawIcon: "local_laundry_service" },
  { id: "tv", value: "Tv", icon: <Tv size={18} color="#8b5cf6" />, rawIcon: "tv" },
  { id: "pool", value: "Pool", icon: <Waves size={18} color="#0284c7" />, rawIcon: "pool" },
  { id: "ac", value: "Ac", icon: <Wind size={18} color="#06b6d4" />, rawIcon: "air" },
];

const AmenitiesField = ({ form }) => {
  return (
    <div>
      <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
        <Sparkles size={20} color="var(--accent-color)" /> Amenities & Perks
      </h4>
      <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
        Select all features available for guests at this property
      </label>

      <form.Field name="amenities">
        {(field) => {
          const selected = field.state.value || [];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.85rem" }}>
              {initialamenities.map((amenity) => {
                const isChecked = selected.some((item) => item.name === amenity.value);
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
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.handleChange([...selected, { name: amenity.value, icon: amenity.rawIcon }]);
                        } else {
                          field.handleChange(selected.filter((item) => item.name !== amenity.value));
                        }
                      }}
                      style={{ accentColor: "var(--accent-color)" }}
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
          );
        }}
      </form.Field>
    </div>
  );
};

export default AmenitiesField;
