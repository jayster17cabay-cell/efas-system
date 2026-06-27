import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://efas-system.onrender.com';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Ilagay ang email at password!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/login`, form);
      localStorage.setItem('efas_token', res.data.token);
      localStorage.setItem('efas_user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch {
      setError('Mali ang email o password. Subukan ulit.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'system-ui, sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'400px' }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'64px', height:'64px', background:'#F5C518', borderRadius:'16px', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', fontWeight:'900', color:'#1A4A8A' }}>E</div>
          <h1 style={{ color:'white', fontSize:'24px', fontWeight:'800', margin:'0 0 4px' }}>E.F.A.S.</h1>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', margin:0 }}>Solano, Nueva Vizcaya</p>
        </div>

        {/* Card */}
        <div style={{ background:'white', borderRadius:'16px', padding:'28px', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color:'#1A4A8A', fontSize:'18px', fontWeight:'700', marginBottom:'4px' }}>Admin Login</h2>
          <p style={{ color:'#9CA3AF', fontSize:'13px', marginBottom:'20px' }}>Para sa Admin at SuperAdmin lamang</p>

          {error && (
            <div style={{ background:'#FEE2E2', color:'#DC2626', padding:'10px 12px', borderRadius:'8px', fontSize:'13px', marginBottom:'14px', fontWeight:'600' }}>
              ❌ {error}
            </div>
          )}

          <div style={{ marginBottom:'12px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>Email</label>
            <input type='email' value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              placeholder='admin@efas.gov.ph'
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6', boxSizing:'border-box' }} />
          </div>

          <div style={{ marginBottom:'20px' }}>
            <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>Password</label>
            <input type='password' value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              placeholder='••••••••'
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6', boxSizing:'border-box' }} />
          </div>

          <button onClick={handleLogin} disabled={loading}
            style={{ width:'100%', background: loading ? '#9CA3AF' : '#1A4A8A', color:'white', border:'none', padding:'13px', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? '⏳ Naglo-login...' : '🔐 Mag-login'}
          </button>
        </div>

        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'11px', textAlign:'center', marginTop:'20px' }}>
          Para sa passenger — i-scan ang QR Code sa tricycle
        </p>
      </div>
    </div>
  );
}

export default Login;