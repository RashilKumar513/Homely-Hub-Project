import React, { useState } from "react";
import { Camera, Link as LinkIcon, Upload, Trash2, Plus } from "lucide-react";

const ImagesUploading = ({ field }) => {
  const [imageInput, setImageInput] = useState("");

  const handleImageInputChange = (event) => {
    setImageInput(event.target.value);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          public_id: `file_${Date.now()}`,
          url: e.target.result,
        };
        field.handleChange([...field.state.value, newImage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      const newImage = {
        public_id: `url_${Date.now()}`,
        url: imageInput.trim(),
      };
      field.handleChange([...field.state.value, newImage]);
      setImageInput("");
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...field.state.value];
    updatedImages.splice(index, 1);
    field.handleChange(updatedImages);
  };

  return (
    <div>
      <h4 style={{ fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", color: "var(--text-primary)" }}>
        <Camera size={20} color="var(--accent-color)" /> Property Photos
      </h4>
      <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", display: "block" }}>
        Add high-quality photos using image URLs or upload local images (More photos = Higher booking rates)
      </label>

      {/* Image Link Input Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", height: "42px" }}>
        <div style={{ position: "relative", flex: 1, height: "42px" }}>
          <LinkIcon size={16} color="var(--text-muted)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            className="form-control"
            type="text"
            placeholder="Paste image link URL (e.g. https://domain.com/photo.jpg)"
            onChange={handleImageInputChange}
            value={imageInput}
            style={{ borderRadius: "12px", paddingLeft: "2.5rem", fontSize: "0.9rem", height: "42px", minHeight: "42px", maxHeight: "42px" }}
          />
        </div>
        <button
          className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-1"
          type="button"
          onClick={handleAddImage}
          style={{ borderRadius: "12px", padding: "0 1.25rem", fontWeight: "700", background: "var(--accent-color)", border: "none", height: "42px", minHeight: "42px", maxHeight: "42px", alignSelf: "center", flexShrink: 0, color: "#ffffff" }}
        >
          <Plus size={16} /> Add Link
        </button>
      </div>

      {/* Upload Button & Preview List */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {field.state.value.map((imageObj, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              width: "120px",
              height: "100px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <img
              alt={`Image-${index}`}
              src={imageObj.url}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button
              type="button"
              onClick={() => handleDeleteImage(index)}
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                background: "rgba(239, 68, 68, 0.9)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "26px",
                height: "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
              title="Delete Photo"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <label
          style={{
            width: "120px",
            height: "100px",
            background: "var(--bg-card)",
            border: "2px dashed var(--border-color)",
            borderRadius: "14px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            fontWeight: "600",
            transition: "all 0.2s ease",
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Upload size={22} color="var(--accent-color)" style={{ marginBottom: "0.3rem" }} />
          <span>Upload File</span>
        </label>
      </div>
    </div>
  );
};

export default ImagesUploading;
