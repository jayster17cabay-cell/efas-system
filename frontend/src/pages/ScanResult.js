import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://efas-system.onrender.com';

function ScanResult() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [destination, setDestination] = useState('');
  const [step, setStep] = useState('profile'); // profile → confirm → active
  const [tripId, setTripId] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/drivers/scan/${qrCode}`)
      .then(res => { setDriver(res.data.data); setLoading(false); })
      .catch(() => { setError('Hindi nahanap ang driver.'); setLoading(false); });
  }, [qrCode]);

  const confirmBoarding = async () => {
    if (!destination) return alert('Piliin ang iyong destinasyon!');
    setBtnLoading(true);
    try {
      const res = await axios.post(`${API}/api/trips/confirm-boarding`, {
        qr_code: qrCode, destination
      });
      setTripId(res.data.data.trip_id);
      setStep('active');
    } catch {
      alert('Error. Subukan ulit.');
    }
    setBtnLoading(false);
  };

  const endTrip = async () => {
    if (tripId) await axios.patch(`${API}/api/trips/${tripId}/end`);
    navigate(`/rate/${qrCode}/${tripId}`);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'white', fontSize:'16px' }}>⏳ Naglo-load...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'24px', textAlign:'center' }}>
        <div style={{ fontSize:'48px' }}>❌</div>
        <p style={{ color:'#DC2626', fontWeight:'700' }}>{error}</p>
        <button onClick={() => navigate('/')} style={{ background:'#1A4A8A', color:'white', border:'none', padding:'12px 24px', borderRadius:'10px', cursor:'pointer', fontWeight:'700' }}>Bumalik</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#F3F4F6', fontFamily:'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background:'#1A4A8A', padding:'20px 16px 50px', textAlign:'center', color:'white' }}>
        <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px' }}>Driver Information</div>
        <div style={{ width:'72px', height:'72px', background:'#F5C518', borderRadius:'18px', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800', color:'#1A4A8A' }}>
          {driver.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
        </div>
        <div style={{ fontSize:'20px', fontWeight:'800' }}>{driver.full_name}</div>
        <div style={{ background:'#F5C518', color:'#1A4A8A', display:'inline-block', padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', marginTop:'6px' }}>
          {driver.driver_code}
        </div>
        {driver.status === 'suspended' && (
          <div style={{ background:'#DC2626', color:'white', padding:'8px', borderRadius:'8px', marginTop:'10px', fontSize:'13px', fontWeight:'700' }}>
            ⚠️ SUSPENDED — Huwag sumakay!
          </div>
        )}
      </div>

      {/* Info Card */}
      <div style={{ margin:'-24px 14px 0', background:'white', borderRadius:'14px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)', position:'relative', zIndex:10, overflow:'hidden', marginBottom:'14px' }}>
        {[
          { icon:'🚖', label:'Plate Number', value: driver.plate_number },
          { icon:'📋', label:'Body Number', value: driver.body_number },
          { icon:'🗺️', label:'Assigned Route', value: driver.assigned_route },
          { icon:'⭐', label:'Rating', value: `${driver.avg_rating} / 5.0 (${driver.total_ratings} ratings)` },
          { icon:'📄', label:'LTFRB License', value: driver.ltfrb_license },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', borderBottom:'1px solid #F3F4F6' }}>
            <span style={{ fontSize:'18px' }}>{item.icon}</span>
            <div>
              <div style={{ fontSize:'10px', color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</div>
              <div style={{ fontSize:'14px', fontWeight:'600', color:'#1F2937' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'0 14px 24px' }}>
        {/* STEP 1 — Piliin destinasyon at confirm boarding */}
        {step === 'profile' && (
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'10px' }}>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'#1F2937', marginBottom:'10px' }}>🚀 Masakay</div>
            <select value={destination} onChange={e => setDestination(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', marginBottom:'10px', background:'#F3F4F6' }}>
              <option value=''>-- Piliin ang destinasyon --</option>
              <option>Solano Town Center</option>
              <option>Maharlika Highway</option>
              <option>Solano Public Market</option>
              <option>Solano District Hospital</option>
              <option>Bambang Junction</option>
            </select>
            <button onClick={() => {
              if (!destination) return alert('Piliin muna ang destinasyon!');
              setStep('confirm');
            }} style={{ width:'100%', background:'#F5C518', color:'#1A4A8A', border:'none', padding:'12px', borderRadius:'10px', fontWeight:'800', fontSize:'14px', cursor:'pointer' }}>
              Susunod →
            </button>
          </div>
        )}

        {/* STEP 2 — Boarding Confirmation */}
        {step === 'confirm' && (
          <div style={{ background:'white', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'10px', textAlign:'center' }}>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>🚖</div>
            <div style={{ fontSize:'16px', fontWeight:'800', color:'#1A4A8A', marginBottom:'8px' }}>Naka-sakay ka na ba?</div>
            <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'6px' }}>Driver: <strong>{driver.full_name}</strong></div>
            <div style={{ fontSize:'13px', color:'#6B7280', marginBottom:'20px' }}>Papunta sa: <strong>{destination}</strong></div>
            <div style={{ background:'#FEF3C7', borderRadius:'10px', padding:'12px', fontSize:'12px', color:'#92400E', marginBottom:'16px' }}>
              ⚠️ I-click ang button sa ibaba KAPAG naka-sakay ka na sa tricycle. Ito ang magiging official na simula ng iyong trip.
            </div>
            <button onClick={confirmBoarding} disabled={btnLoading}
              style={{ width:'100%', background: btnLoading ? '#9CA3AF' : '#1A4A8A', color:'white', border:'none', padding:'14px', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor: btnLoading ? 'not-allowed' : 'pointer', marginBottom:'8px' }}>
              {btnLoading ? '⏳ Nagko-confirm...' : '✅ Oo, Naka-sakay Na Ako!'}
            </button>
            <button onClick={() => setStep('profile')}
              style={{ width:'100%', background:'transparent', color:'#6B7280', border:'1.5px solid #E5E7EB', padding:'10px', borderRadius:'10px', fontWeight:'600', fontSize:'13px', cursor:'pointer' }}>
              ← Bumalik
            </button>
          </div>
        )}

        {/* STEP 3 — Active Trip */}
        {step === 'active' && (
          <div>
            <div style={{ background:'#D1FAE5', borderRadius:'14px', padding:'16px', textAlign:'center', marginBottom:'10px' }}>
              <div style={{ fontSize:'24px' }}>✅</div>
              <div style={{ fontWeight:'800', color:'#065F46', marginTop:'4px', fontSize:'16px' }}>Trip ID #{tripId} — Active!</div>
              <div style={{ fontSize:'12px', color:'#065F46', marginTop:'4px' }}>Papunta sa: {destination}</div>
            </div>
            <div style={{ background:'white', borderRadius:'14px', padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', marginBottom:'10px' }}>
              <div style={{ fontSize:'13px', color:'#6B7280', lineHeight:'1.6' }}>
                🔒 Ang iyong trip ay naka-record na. Kung hindi sumusunod ang driver sa tamang ruta, mag-report agad!
              </div>
            </div>
            <button onClick={endTrip}
              style={{ width:'100%', background:'#1A4A8A', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontWeight:'800', fontSize:'14px', cursor:'pointer', marginBottom:'10px' }}>
              🏁 Natapos na ang Trip
            </button>
            <button onClick={() => navigate(`/complaint/${qrCode}`)}
              style={{ width:'100%', background:'white', color:'#DC2626', border:'1.5px solid #DC2626', padding:'12px', borderRadius:'10px', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
              📢 Mag-file ng Complaint
            </button>
          </div>
        )}

        {/* Always visible — complaint button sa profile step */}
        {step === 'profile' && (
          <button onClick={() => navigate(`/complaint/${qrCode}`)}
            style={{ width:'100%', background:'white', color:'#DC2626', border:'1.5px solid #DC2626', padding:'12px', borderRadius:'10px', fontWeight:'700', fontSize:'14px', cursor:'pointer' }}>
            📢 Mag-file ng Complaint
          </button>
        )}
      </div>
    </div>
  );
}

export default ScanResult;