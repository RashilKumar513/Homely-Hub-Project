import React from "react";
import { MapPin } from "lucide-react";

export const AddressField = ({ form }) => {
  return (
    <div>
      <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
        <MapPin size={20} color="var(--accent-color)" /> Property Address
      </h4>
      <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
        Full location address details for guests and map placement
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <form.Field name="address.area">
          {(field) => (
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Area / Locality</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Bandra West"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ borderRadius: "10px", padding: "0.6rem" }}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="address.city">
          {(field) => (
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>City</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Mumbai"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ borderRadius: "10px", padding: "0.6rem" }}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="address.state">
          {(field) => (
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>State</label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Maharashtra"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ borderRadius: "10px", padding: "0.6rem" }}
                required
              />
            </div>
          )}
        </form.Field>

        <form.Field name="address.pincode">
          {(field) => (
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.3rem", display: "block" }}>Pincode</label>
              <input
                className="form-control"
                type="number"
                placeholder="e.g. 400050"
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
                style={{ borderRadius: "10px", padding: "0.6rem" }}
                required
              />
            </div>
          )}
        </form.Field>
      </div>
    </div>
  );
};
