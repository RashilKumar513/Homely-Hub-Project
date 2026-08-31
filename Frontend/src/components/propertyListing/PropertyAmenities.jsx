import React from 'react';
import {
  Wifi,
  Utensils,
  Wind,
  Tv,
  Car,
  Waves,
  Sparkles,
  CheckCircle,
  Home,
} from 'lucide-react';
import { capitalizeText } from '../../utils/formatText';

const getAmenityIcon = (name, rawIcon) => {
  const cleanName = (name || '').toLowerCase();
  if (cleanName.includes('wifi')) return <Wifi size={20} color="#3b82f6" />;
  if (cleanName.includes('kitchen')) return <Utensils size={20} color="#f59e0b" />;
  if (cleanName.includes('ac') || cleanName.includes('air')) return <Wind size={20} color="#06b6d4" />;
  if (cleanName.includes('tv') || cleanName.includes('television')) return <Tv size={20} color="#8b5cf6" />;
  if (cleanName.includes('parking')) return <Car size={20} color="#10b981" />;
  if (cleanName.includes('pool') || cleanName.includes('bath')) return <Waves size={20} color="#0284c7" />;
  if (cleanName.includes('wash') || cleanName.includes('laundry')) return <Sparkles size={20} color="#ec4899" />;
  return <CheckCircle size={20} color="#10b981" />;
};

const PropertyAmenities = ({ amenities = [] }) => {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        What This Place Offers
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {amenities.map((amenity, index) => {
          const name = typeof amenity === 'string' ? amenity : amenity.name;
          const rawIcon = typeof amenity === 'object' ? amenity.icon : '';

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1.1rem',
                background: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-primary)',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getAmenityIcon(name, rawIcon)}
              </div>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {capitalizeText(name)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyAmenities;
