import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'https://efas-system.onrender.com';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('efas_token');

  useEffect(() => {
    const savedUser = localStorage.getItem('efas_user');
    if (!token || !savedUser) { navigate('/login'); return; }
    setUser(JSON.parse(savedUser));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, driversRes, complaintsRes, concernsRes] = await Promise.all([
        axios.get(`${API}/api/stats`, { headers }),
        axios.get(`${API}/api/drivers`, { headers }),
        axios.get(`${API}/api/complaints`, { headers }),
        axios.get(`${API}/api/concerns`, { headers }),
      ]);
      setStats(statsRes.data.data);
      setDrivers(driversRes.data.data);
      setComplaints(complaintsRes.data.data);
      setConcerns(concernsRes.data.data);
    } catch { navigate('/login'); }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('efas_token');
    localStorage.removeItem('efas_user');
    navigate('/login');
  };

  const updateComplaint = async (id, status) => {
    await axios.patch(`${API}/api/complaints/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const updateDriverStatus = async (id, status) => {
    await axios.patch(`${API}/api/drivers/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const respondConcern = async (id, response) => {
    await axios.patch(`${API}/api/concerns/${id}`, { status: 'resolved', admin_response: response }, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#1A4A8A', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'white', fontSize:'16px' }}>⏳ Naglo-load...</div>
    </div>
  );

  const tabStyle = (t) => ({
    padding:'12px 20px', cursor:'pointer', fontWeight:'600', fontSize:'13px',
    borderBottom: tab === t ? '3px solid #F5C518' : '3px solid transparent',
    color: tab === t ? '#1A4A8A' : '#6B7280', background:'none', border:'none',
    borderBottom: tab === t ? '3px solid #F5C518' : '3px solid transparent',
  });

  const statusColor = (s) => {
    if (s === 'new') return { bg:'#FEE2E2', color:'#DC2626' };
    if (s === 'under_review') return { bg:'#FEF3C7', color:'#D97706' };
    if (s === 'resolved') return { bg:'#D1FAE5', color:'#059669' };
    return { bg:'#F3F4F6', color:'#6B7280' };
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F3F4F6', fontFamily:'system-ui, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ background:'#1A4A8A', padding:'0 24px', height:'56px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', background:'#F5C518', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px', color:'#1A4A8A' }}>E</div>
          <div>
            <div style={{ color:'white', fontWeight:'700', fontSize:'14px' }}>E.F.A.S.</div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'10px' }}>Solano, Nueva Vizcaya</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ background:'#F5C518', color:'#1A4A8A', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>
            {user?.role?.toUpperCase()}
          </div>
          <span style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px' }}>{user?.full_name}</span>
          <button onClick={logout} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'none', padding:'6px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background:'white', borderBottom:'1px solid #E5E7EB', display:'flex', padding:'0 24px', overflowX:'auto' }}>
        {[
          { key:'overview', label:'📊 Overview' },
          { key:'drivers', label:'🚖 Drivers' },
          { key:'complaints', label:'📋 Complaints' },
          { key:'concerns', label:'💬 Driver Concerns' },
          ...(user?.role === 'superadmin' ? [{ key:'enroll', label:'➕ Enroll Driver' }] : [{ key:'enroll', label:'➕ Enroll Driver' }])
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(t.key)}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:'20px 24px', maxWidth:'1200px', margin:'0 auto' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <h2 style={{ color:'#1A4A8A', marginBottom:'16px', fontSize:'20px' }}>Dashboard Overview</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'12px', marginBottom:'20px' }}>
              {[
                { label:'Total Drivers', value: stats.total_drivers, color:'#1A4A8A' },
                { label:'Active Drivers', value: stats.active_drivers, color:'#059669' },
                { label:'Total Complaints', value: stats.total_complaints, color:'#DC2626' },
                { label:'New Complaints', value: stats.new_complaints, color:'#D97706' },
                { label:'Driver Concerns', value: stats.new_concerns, color:'#7C3AED' },
                { label:'QR Scans Today', value: stats.scans_today, color:'#2563EB' },
              ].map((s, i) => (
                <div key={i} style={{ background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', textAlign:'center' }}>
                  <div style={{ fontSize:'28px', fontWeight:'800', color: s.color }}>{s.value ?? 0}</div>
                  <div style={{ fontSize:'11px', color:'#9CA3AF', marginTop:'4px', textTransform:'uppercase', letterSpacing:'0.4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background:'#EFF6FF', borderRadius:'12px', padding:'16px', fontSize:'13px', color:'#1A4A8A' }}>
              🔒 <strong>Privacy Policy:</strong> Ang real-time na lokasyon ng driver ay hindi available para sa admin. Ang route map ay para lamang sa passenger habang aktibo ang trip.
            </div>
          </div>
        )}

        {/* DRIVERS */}
        {tab === 'drivers' && (
          <div>
            <h2 style={{ color:'#1A4A8A', marginBottom:'16px', fontSize:'20px' }}>Mga Driver</h2>
            <div style={{ display:'grid', gap:'10px' }}>
              {drivers.map(d => (
                <div key={d.driver_id} style={{ background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'46px', height:'46px', background:'#1A4A8A', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:'700', fontSize:'14px', flexShrink:0 }}>
                    {d.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:'700', color:'#1F2937', fontSize:'14px' }}>{d.full_name}</div>
                    <div style={{ fontSize:'12px', color:'#6B7280' }}>{d.plate_number} · {d.driver_code} · ⭐{d.avg_rating}</div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                    <span style={{ background: d.status==='active' ? '#D1FAE5' : d.status==='suspended' ? '#FEE2E2' : '#F3F4F6', color: d.status==='active' ? '#059669' : d.status==='suspended' ? '#DC2626' : '#6B7280', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>
                      {d.status.toUpperCase()}
                    </span>
                    {d.status !== 'suspended' ? (
                      <button onClick={() => updateDriverStatus(d.driver_id, 'suspended')}
                        style={{ background:'#FEE2E2', color:'#DC2626', border:'none', padding:'5px 10px', borderRadius:'8px', cursor:'pointer', fontSize:'11px', fontWeight:'700' }}>
                        Suspindihin
                      </button>
                    ) : (
                      <button onClick={() => updateDriverStatus(d.driver_id, 'active')}
                        style={{ background:'#D1FAE5', color:'#059669', border:'none', padding:'5px 10px', borderRadius:'8px', cursor:'pointer', fontSize:'11px', fontWeight:'700' }}>
                        I-activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPLAINTS */}
        {tab === 'complaints' && (
          <div>
            <h2 style={{ color:'#1A4A8A', marginBottom:'16px', fontSize:'20px' }}>Mga Complaint</h2>
            <div style={{ display:'grid', gap:'10px' }}>
              {complaints.map(c => {
                const sc = statusColor(c.status);
                return (
                  <div key={c.id} style={{ background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:`4px solid ${sc.color}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div>
                        <div style={{ fontWeight:'700', color:'#1F2937', fontSize:'14px' }}>{c.driver_name} ({c.plate_number})</div>
                        <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{c.incident_date} · {c.complaint_type.replace('_',' ').toUpperCase()}</div>
                      </div>
                      <span style={{ background: sc.bg, color: sc.color, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>
                        {c.status.replace('_',' ').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize:'13px', color:'#4B5563', marginBottom:'10px', lineHeight:'1.5' }}>{c.description}</div>
                    {c.complaint_level === 'unverified' && (
                      <div style={{ background:'#FEF3C7', padding:'6px 10px', borderRadius:'8px', fontSize:'11px', color:'#92400E', marginBottom:'8px' }}>
                        ⚠️ Unverified — walang Trip ID
                      </div>
                    )}
                    {c.status === 'new' && (
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => updateComplaint(c.id, 'under_review')}
                          style={{ background:'#FEF3C7', color:'#D97706', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                          Under Review
                        </button>
                        <button onClick={() => updateComplaint(c.id, 'resolved')}
                          style={{ background:'#D1FAE5', color:'#059669', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                          Resolve
                        </button>
                        <button onClick={() => updateComplaint(c.id, 'dismissed')}
                          style={{ background:'#F3F4F6', color:'#6B7280', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                          Dismiss
                        </button>
                      </div>
                    )}
                    {c.status === 'under_review' && (
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={() => updateComplaint(c.id, 'resolved')}
                          style={{ background:'#D1FAE5', color:'#059669', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                          ✓ Resolve
                        </button>
                        <button onClick={() => updateComplaint(c.id, 'dismissed')}
                          style={{ background:'#F3F4F6', color:'#6B7280', border:'none', padding:'6px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {complaints.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF' }}>
                  <div style={{ fontSize:'40px' }}>📋</div>
                  <div>Walang complaints pa</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRIVER CONCERNS */}
        {tab === 'concerns' && (
          <div>
            <h2 style={{ color:'#1A4A8A', marginBottom:'16px', fontSize:'20px' }}>Driver Concerns</h2>
            <div style={{ display:'grid', gap:'10px' }}>
              {concerns.map(c => (
                <div key={c.id} style={{ background:'white', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', borderLeft:'4px solid #7C3AED' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <div>
                      <div style={{ fontWeight:'700', color:'#1F2937', fontSize:'14px' }}>{c.driver_name} ({c.plate_number})</div>
                      <div style={{ fontSize:'11px', color:'#9CA3AF' }}>{c.concern_type.replace('_',' ').toUpperCase()}</div>
                    </div>
                    <span style={{ background: c.status==='new' ? '#FEE2E2' : c.status==='resolved' ? '#D1FAE5' : '#FEF3C7', color: c.status==='new' ? '#DC2626' : c.status==='resolved' ? '#059669' : '#D97706', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize:'13px', color:'#4B5563', marginBottom:'10px', lineHeight:'1.5' }}>{c.description}</div>
                  {c.admin_response && (
                    <div style={{ background:'#EFF6FF', padding:'10px', borderRadius:'8px', fontSize:'12px', color:'#1A4A8A', marginBottom:'8px' }}>
                      <strong>Admin Response:</strong> {c.admin_response}
                    </div>
                  )}
                  {c.status !== 'resolved' && (
                    <div style={{ display:'flex', gap:'8px' }}>
                      <input placeholder='I-type ang response...'
                        id={`concern-${c.id}`}
                        style={{ flex:1, padding:'8px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px' }} />
                      <button onClick={() => {
                        const val = document.getElementById(`concern-${c.id}`).value;
                        if (val) respondConcern(c.id, val);
                      }} style={{ background:'#1A4A8A', color:'white', border:'none', padding:'8px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700' }}>
                        Sagutin
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {concerns.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px', color:'#9CA3AF' }}>
                  <div style={{ fontSize:'40px' }}>💬</div>
                  <div>Walang concerns pa</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ENROLL DRIVER */}
        {tab === 'enroll' && <EnrollDriver token={token} onSuccess={loadData} />}
      </div>
    </div>
  );
}

function EnrollDriver({ token, onSuccess }) {
  const [form, setForm] = useState({
    full_name:'', email:'', password:'',
    plate_number:'', body_number:'', ltfrb_license:'',
    contact_number:'', assigned_route:'', date_enrolled:''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!form.full_name || !form.email || !form.password || !form.plate_number || !form.body_number || !form.ltfrb_license) {
      setError('Kumpletuhin ang lahat ng required fields!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/drivers`, form, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(`✅ Driver na-enroll! QR Code: ${res.data.data.qrCode}`);
      setForm({ full_name:'', email:'', password:'', plate_number:'', body_number:'', ltfrb_license:'', contact_number:'', assigned_route:'', date_enrolled:'' });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error sa pag-enroll.');
    }
    setLoading(false);
  };

  const inp = (label, key, type='text', placeholder='') => (
    <div style={{ marginBottom:'12px' }}>
      <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder={placeholder}
        style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6', boxSizing:'border-box' }} />
    </div>
  );

  return (
    <div>
      <h2 style={{ color:'#1A4A8A', marginBottom:'16px', fontSize:'20px' }}>Mag-enroll ng Bagong Driver</h2>
      {error && <div style={{ background:'#FEE2E2', color:'#DC2626', padding:'12px', borderRadius:'8px', marginBottom:'14px', fontSize:'13px', fontWeight:'600' }}>❌ {error}</div>}
      {success && <div style={{ background:'#D1FAE5', color:'#065F46', padding:'12px', borderRadius:'8px', marginBottom:'14px', fontSize:'13px', fontWeight:'600' }}>{success}</div>}
      <div style={{ background:'white', borderRadius:'14px', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', maxWidth:'600px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <div>{inp('Buong Pangalan *', 'full_name', 'text', 'Juan dela Cruz')}</div>
          <div>{inp('Email *', 'email', 'email', 'driver@efas.gov.ph')}</div>
          <div>{inp('Password *', 'password', 'password', '••••••••')}</div>
          <div>{inp('Plate Number *', 'plate_number', 'text', 'TRK-XXX')}</div>
          <div>{inp('Body Number *', 'body_number', 'text', 'BDY-XXX')}</div>
          <div>{inp('LTFRB License *', 'ltfrb_license', 'text', 'LIC-2024-XXXXX')}</div>
          <div>{inp('Contact Number', 'contact_number', 'tel', '09XX-XXX-XXXX')}</div>
          <div>{inp('Date Enrolled', 'date_enrolled', 'date', '')}</div>
        </div>
        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'11px', fontWeight:'600', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.4px', display:'block', marginBottom:'5px' }}>Assigned Route</label>
          <select value={form.assigned_route} onChange={e => setForm({...form, assigned_route: e.target.value})}
            style={{ width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1.5px solid #E5E7EB', fontSize:'13px', background:'#F3F4F6' }}>
            <option value=''>-- Piliin ang ruta --</option>
            <option>Solano Town Center – Maharlika Hwy</option>
            <option>Solano – Bambang Junction</option>
            <option>Solano Market – Solano Hospital</option>
            <option>Barrio Loop – Solano Terminal</option>
          </select>
        </div>
        <button onClick={submit} disabled={loading}
          style={{ width:'100%', background: loading ? '#9CA3AF' : '#F5C518', color:'#1A4A8A', border:'none', padding:'13px', borderRadius:'10px', fontWeight:'800', fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Nagpo-proseso...' : '📲 I-enroll at Gumawa ng QR Code'}
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;