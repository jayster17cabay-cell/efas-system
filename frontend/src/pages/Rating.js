import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://efas-system.onrender.com';

function Rating() {
  const { qrCode, tripId } = useParams();
  const navigate = useNavigate();
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    if (stars === 0) return alert('Pumili ng rating!');
    setLoading(true);
    try {
      await axios.post(`${API}/api/ratings`, {
        qr_code: qrCode,
        trip_id: tripId,
        stars,
        comment
      });
      setSubmitted(true);
    } catch {
      alert('Error. Subukan ulit.');
    }
    setLoading(false);
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'32px', textAlign:'center', maxWidth:'360px', width:'100%' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>🎉</div>
        <h2 style={{ color:'#1A4A8A', marginBottom:'8px' }}>Salamat sa Rating!</h2>
        <p style={{ color:'#6B7280', fontSize:'13px', marginBottom:'20px' }}>Nakatulong ang iyong feedback para mapabuti ang serbisyo.</p>
        <button onClick={() => navigate('/')}
          style={{ width:'100%', background:'#F5C518', color:'#1A4A8A', border:'none', padding:'12px', borderRadius:'10px', fontWeight:'800', fontSize:'14px', cursor:'pointer' }}>
          Bumalik sa Home
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F3F4F6', fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'#1A4A8A', padding:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ color:'white', fontWeight:'700', fontSize:'15px' }}>I-rate ang Driver</div>
      </div>

      <div style={{ padding:'20px 14px' }}>
        <div style={{ background:'white', borderRadius:'16px', padding:'24px', textAlign:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', marginBottom:'14px' }}>
          <div style={{ fontSize:'40px', marginBottom:'10px' }}>⭐</div>
          <div style={{ fontSize:'16px', fontWeight:'800', color:'#1A4A8A', marginBottom:'20px' }}>
            Paano ang iyong karanasan?
          </div>

          {/* Stars */}
          <div style={{ display:'flex', justifyContent:'center', gap:'12px', marginBottom:'16px' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => setStars(n)}
                style={{ fontSize:'40px', cursor:'pointer', color: n <= stars ? '#F5C518' : '#E5E7EB', transition:'color 0.15s' }}>
                ★
              </span>
            ))}
          </div>

          <div style={{ fontSize:'14px', fontWeight:'700', color:'#1A4A8A', marginBottom:'16px' }}>
            {stars === 0 && 'Pumili ng rating'}
            {stars === 1 && '😞 Hindi Maganda'}
            {stars === 2 && '😐 Pwede Na'}
            {stars === 3 && '🙂 Okay'}
            {stars === 4 && '😊 Maganda'}
            {stars === 5 && '🤩 Napakaganda!'}
          </div>

          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder='Komento (opsyonal)...'
            style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6', minHeight:'80px', resize:'vertical', boxSizing:'border-box', marginBottom:'16px' }} />

          <button onClick={submitRating} disabled={loading}
            style={{ width:'100%', background: loading ? '#9CA3AF' : '#F5C518', color:'#1A4A8A', border:'none', padding:'13px', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Nagsu-submit...' : '⭐ I-submit ang Rating'}
          </button>
        </div>

        <button onClick={() => navigate('/')}
          style={{ width:'100%', background:'transparent', color:'#6B7280', border:'none', padding:'10px', fontSize:'13px', cursor:'pointer' }}>
          Laktawan
        </button>
      </div>
    </div>
  );
}

export default Rating;