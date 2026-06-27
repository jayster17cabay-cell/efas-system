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
  const [tripStarted, setTripStarted] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/drivers/scan/${qrCode}`)
      .then(res => {
        setDriver(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Hindi nahanap ang driver. Subukan ulit.');
        setLoading(false);
      });
  }, [qrCode]);

  const startTrip = async () => {
    if (!destination) return alert('Piliin ang iyong destinasyon!');
    await axios.post(`${API}/api/trips/start`, { qr_code: qrCode, destination });
    setTripStarted(true);
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
        <div style={{ fontSize:'12px', opacity:0.7, marginBottom:'8px' }}>DRIVER INFORMATION</div>
        <div style={{ width:'72px', height:'72px', background:'#F5C518', borderRadius:'18px', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'800', color:'#1A4A8A' }}>
          {driver.full_name.split(' ').map(n => n[0]).join('').slice(0,2)}
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
      <div style={{ margin:'-24px 14px 0', background:'white', borderRadius:'14px', boxShadow:'0 4px 16px rgba(0,0,0,0.12)', position:'relative', zIndex:10, overflow:'hidden' }}>
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

      {/* Trip Section */}
      <div style={{ padding:'14px' }}>
        {!tripStarted ? (
          <div style={{ background:'white', borderRadius:'14px', padding:'16px', marginTop:'4px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:'14px', fontWeight:'700', color:'#1F2937', marginBottom:'10px' }}>Saan ka pupunta?</div>
            <select value={destination} onChange={e => setDestination(e.target.value)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', marginBottom:'10px', background:'#F3F4F6' }}>
              <option value=''>-- Piliin ang destinasyon --</option>
              <option>Solano Town Center</option>
              <option>Maharlika Highway</option>
              <option>Solano Public Market</option>
              <option>Solano District Hospital</option>
              <option>Bambang Junction</option>
            </select>
            <button onClick={startTrip}
              style={{ width:'100%', background:'#F5C518', color:'#1A4A8A', border:'none', padding:'12px', borderRadius:'10px', fontWeight:'800', fontSize:'14px', cursor:'pointer' }}>
              🚀 Masakay Na!
            </button>
          </div>
        ) : (
          <div style={{ background:'#D1FAE5', borderRadius:'14px', padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'24px' }}>✅</div>
            <div style={{ fontWeight:'700', color:'#065F46', marginTop:'4px' }}>Trip nagsimula!</div>
            <div style={{ fontSize:'12px', color:'#065F46', marginTop:'4px' }}>Papunta sa: {destination}</div>
          </div>
        )}

        <button onClick={() => navigate(`/complaint/${qrCode}`)}
          style={{ width:'100%', background:'white', color:'#DC2626', border:'1.5px solid #DC2626', padding:'12px', borderRadius:'10px', fontWeight:'700', fontSize:'14px', cursor:'pointer', marginTop:'10px' }}>
          📢 Mag-file ng Complaint
        </button>
      </div>
    </div>
  );
}

export default ScanResult;