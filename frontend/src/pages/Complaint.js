import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://efas-system.onrender.com';

function Complaint() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    complaint_type: '',
    description: '',
    incident_date: '',
    incident_time: '',
    contact_number: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.complaint_type || !form.description || !form.incident_date) {
      alert('Kumpletuhin ang mga required fields!');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/api/complaints`, {
        qr_code: qrCode,
        ...form
      });
      setSubmitted(true);
    } catch {
      alert('Error sa pag-submit. Subukan ulit.');
    }
    setLoading(false);
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'white', borderRadius:'16px', padding:'32px', textAlign:'center', maxWidth:'360px', width:'100%' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>✅</div>
        <h2 style={{ color:'#1A4A8A', marginBottom:'8px' }}>Natanggap ang Complaint!</h2>
        <p style={{ color:'#6B7280', fontSize:'13px', lineHeight:'1.6', marginBottom:'20px' }}>
          Ipoproseso ng admin ang inyong reklamo sa loob ng 3 araw na trabaho.
        </p>
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
        <button onClick={() => navigate(-1)}
          style={{ background:'none', border:'none', color:'white', fontSize:'20px', cursor:'pointer' }}>←</button>
        <div>
          <div style={{ color:'white', fontWeight:'700', fontSize:'15px' }}>Mag-file ng Complaint</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:'11px' }}>QR: {qrCode}</div>
        </div>
      </div>

      <div style={{ padding:'14px' }}>
        {/* Warning */}
        <div style={{ background:'#FEF3C7', border:'1px solid #F5C518', borderRadius:'10px', padding:'12px', marginBottom:'14px', fontSize:'12px', color:'#92400E' }}>
          ⚠️ Ang inyong complaint ay direktang mapupunta sa admin para sa aksyon. Mangyaring maging tapat.
        </div>

        {/* Form */}
        <div style={{ background:'white', borderRadius:'14px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
          
          {/* Complaint Type */}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>
              Uri ng Problema *
            </label>
            <select value={form.complaint_type} onChange={e => setForm({...form, complaint_type: e.target.value})}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6' }}>
              <option value=''>-- Piliin --</option>
              <option value='rude_behavior'>Bastos / Rude na Ugali</option>
              <option value='wrong_route'>Mali ang Ruta</option>
              <option value='overcharging'>Overcharging</option>
              <option value='unsafe_driving'>Hindi Ligtas ang Pagmamaneho</option>
              <option value='other'>Iba pa</option>
            </select>
          </div>

          {/* Date */}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>
              Petsa ng Nangyari *
            </label>
            <input type='date' value={form.incident_date} onChange={e => setForm({...form, incident_date: e.target.value})}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6' }} />
          </div>

          {/* Time */}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>
              Oras
            </label>
            <input type='time' value={form.incident_time} onChange={e => setForm({...form, incident_time: e.target.value})}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6' }} />
          </div>

          {/* Description */}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>
              Ilarawan ang Nangyari *
            </label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder='Ipaliwanag ng detalyado kung ano ang nangyari...'
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6', minHeight:'80px', resize:'vertical' }} />
          </div>

          {/* Contact */}
          <div style={{ marginBottom:'16px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>
              Contact Number (opsyonal)
            </label>
            <input type='tel' value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})}
              placeholder='09XX-XXX-XXXX'
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:'100%', background: loading ? '#9CA3AF' : '#F5C518', color:'#1A4A8A', border:'none', padding:'12px', borderRadius:'10px', fontWeight:'800', fontSize:'14px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Nagsu-submit...' : '📤 I-submit ang Complaint'}
          </button>
        </div>

        <p style={{ fontSize:'11px', color:'#9CA3AF', textAlign:'center', marginTop:'12px', lineHeight:'1.6' }}>
          Ang inyong complaint ay mapupunta sa Solano Tricycle Admin at mapoproseso sa loob ng 3 araw na trabaho.
        </p>
      </div>
    </div>
  );
}

export default Complaint;