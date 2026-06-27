import React from 'react';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#1A4A8A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#F5C518',
        borderRadius: '16px',
        padding: '12px 24px',
        marginBottom: '20px',
        fontWeight: '800',
        color: '#1A4A8A',
        fontSize: '13px'
      }}>
        🚖 SOLANO, NUEVA VIZCAYA
      </div>
      <h1 style={{
        color: 'white',
        fontSize: '28px',
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: '8px'
      }}>
        E.F.A.S.
      </h1>
      <p style={{
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontSize: '14px',
        marginBottom: '40px',
        lineHeight: '1.5'
      }}>
        Electronic Feedback and<br/>Accountability System
      </p>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
        <h2 style={{ color: '#1A4A8A', fontSize: '18px', marginBottom: '8px' }}>
          I-scan ang QR Code
        </h2>
        <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>
          Hanapin ang QR Code sa harap ng tricycle at i-scan gamit ang iyong camera.
        </p>
        <a href="/login" style={{
          display: 'block',
          background: '#1A4A8A',
          color: 'white',
          padding: '12px',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '14px'
        }}>
          Admin Login
        </a>
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px',
        marginTop: '24px'
      }}>
        Solano Tricycle Operators & Drivers Association
      </p>
    </div>
  );
}

export default Home;