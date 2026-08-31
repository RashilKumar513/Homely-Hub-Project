import React from 'react';
import MapComponent from './MapComponent';
import { Clock, Info, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../../utils/formatText';

const PropertyMapInfo = ({ address, extraInfo, checkInTime, checkOutTime }) => {
  const formattedCheckin = formatTime(checkInTime, '12:00 PM');
  const formattedCheckout = formatTime(checkOutTime, '11:00 AM');

  const defaultInfo =
    `- Check-in time is ${formattedCheckin} & Check-out time is ${formattedCheckout}. Early check-in or late checkout is permitted based on availability and prior intimation. *Based on availability, early checkin is permitted from 10:00 AM onwards. If you wish to check-in early, an early checkin fee may apply. *Late checkout is permitted based on availability and prior host approval.`;

  const textToDisplay = extraInfo || defaultInfo;

  const infoPoints = textToDisplay
    .split(/(?=\*|-)/)
    .map((point) => point.replace(/^[\*-]\s*/, '').trim())
    .filter(Boolean);

  return (
    <div className="row w-100 g-4 my-2">
      {/* Map Section */}
      <div className="col-lg-6 col-md-12 col-12">
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', height: '100%' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Where you'll be
          </h3>
          <MapComponent address={address} />
        </div>
      </div>

      {/* Extra Info & House Rules Card */}
      <div className="col-lg-6 col-md-12 col-12">
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '10px', padding: '0.5rem' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Things to Know & Extra Info
            </h3>
          </div>

          {/* Quick Check-in/out badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#10b981" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>CHECK-IN</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formattedCheckin}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#ef4444" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>CHECK-OUT</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{formattedCheckout}</strong>
              </div>
            </div>
          </div>

          {/* Rules & Policy List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {infoPoints.map((point, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-primary)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}
              >
                {index === 0 ? (
                  <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>Have special requests? Contact host after booking for early arrival confirmation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMapInfo;
