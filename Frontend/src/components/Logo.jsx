import React from 'react';
import { Home, Sparkles } from 'lucide-react';

const Logo = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #ff385c 0%, #e00b41 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(255, 56, 92, 0.45)',
          position: 'relative',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease',
        }}
      >
        <Home size={22} strokeWidth={2.5} color="#ffffff" />
        <Sparkles size={11} color="#ffe4e6" style={{ position: 'absolute', top: '5px', right: '5px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justify: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Homely
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ff385c', letterSpacing: '-0.03em', marginLeft: '3px' }}>
            Hub
          </span>
        </div>
        <span style={{ fontSize: '0.62rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.12em', marginTop: '2px', textTransform: 'uppercase' }}>
          STAYS & LUXURY VILLAS
        </span>
      </div>
    </div>
  );
};

export default Logo;
