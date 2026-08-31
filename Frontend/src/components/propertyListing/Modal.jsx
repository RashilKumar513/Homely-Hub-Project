import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../../css/Modal.css";
import gsap from "gsap";
import { X, Camera } from "lucide-react";

const fallbackImg = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80';

const Modal = ({ images = [], onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    gsap.fromTo(
      modalRef.current,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );

    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  return (
    <div className="photo-modal-backdrop" onClick={onClose}>
      <div className="photo-modal-wrapper" ref={modalRef} onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header Bar */}
        <div className="photo-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            <Camera size={20} color="var(--accent-color)" /> Photo Gallery ({images.length})
          </div>
          <button className="photo-modal-close-btn" onClick={onClose} title="Close photos">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Photos Grid */}
        <div className="photo-modal-body">
          {images.map((image, index) => {
            const imgUrl = typeof image === 'string' ? image : (image?.url || image?.public_id || fallbackImg);
            return (
              <div key={index} className="photo-modal-item">
                <img
                  src={imgUrl}
                  alt={`Property Photo ${index + 1}`}
                  onError={(e) => { e.target.src = fallbackImg; }}
                />
                <span className="photo-modal-caption">Photo {index + 1} of {images.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  images: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
