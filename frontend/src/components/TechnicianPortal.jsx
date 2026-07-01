import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  Calendar, MapPin, Phone, User, CheckCircle2, Clock,
  Wrench, DollarSign, CheckCircle, RefreshCw, Package,
  Star, Award, Edit2 as Edit3, Mail, Home, Shield, Activity,
  ClipboardList, ChevronRight, X, Eye, Save
} from '../Icons';

const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n||0);

export default function TechnicianPortal({ currentUser, onLogout }) {
  const techId = currentUser?.id || 1;

  const [schedules,   setSchedules]   = useState([]);
  const [products,    setProducts]    = useState([]);
  const [services,    setServices]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [message,     setMessage]     = useState(null);
  const [activeTab,   setActiveTab]   = useState('dashboard'); // 'dashboard'|'profile'|'jobs'|'catalog'
  const [detailSched, setDetailSched] = useState(null); // selected schedule for detail modal
  const [editProfile, setEditProfile] = useState(false);

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name:      currentUser?.name     || 'Trần Văn Bình',
    phone:     currentUser?.phone    || '0912.345.678',
    email:     currentUser?.email    || 'tech@gmail.com',
    address:   currentUser?.address  || '12 Trần Phú, Đông Triều, Quảng Ninh',
    specialty: 'Điều hòa & Máy lạnh',
    bio:       'Kỹ thuật viên có 5 năm kinh nghiệm lắp đặt, sửa chữa các thiết bị điện lạnh dân dụng và công nghiệp.',
  });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [schRes, prodRes, servRes, catRes] = await Promise.all([
        api.getSchedulesByTechnician(techId),
        api.getProducts(),
        api.getServices(),
        api.getCategories(),
      ]);
      setSchedules(schRes?.data || schRes || []);
      setProducts(prodRes.data || []);
      setServices(servRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const notify = (text, type='success') => { setMessage({text,type}); setTimeout(()=>setMessage(null),3000); };

  const handleUpdateStatus = async (schedule, nextStatus) => {
    try {
      const upd = { status: nextStatus };
      if (nextStatus==='COMPLETED') upd.completedAt = new Date().toISOString();
      await api.updateSchedule(schedule.id, upd);
      const orderStatus = nextStatus==='COMPLETED' ? 'COMPLETED' : 'INSTALLING_REPAIRING';
      await api.updateOrder(schedule.orderId, { status: orderStatus });
      if (nextStatus==='COMPLETED') {
        try { const pmt = await api.getPaymentByOrder(schedule.orderId); if (pmt?.data) await api.updatePaymentStatus(pmt.data.id,{status:'COMPLETED'}); } catch {}
      }
      notify(`Đã cập nhật: ${nextStatus}!`);
      setDetailSched(null);
      fetchData();
    } catch { notify('Lỗi cập nhật trạng thái','error'); }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setEditProfile(false);
    notify('Đã lưu thông tin cá nhân!');
  };

  /* ── Stats ─── */
  const completedJobs = schedules.filter(s=>s.status==='COMPLETED').length;
  const pendingJobs   = schedules.filter(s=>s.status==='SCHEDULED').length;
  const activeJobs    = schedules.filter(s=>s.status==='IN_PROGRESS').length;

  const TABS = [
    { id:'dashboard', icon:Activity,     label:'Dashboard' },
    { id:'jobs',      icon:ClipboardList,label:'Nhiệm vụ' },
    { id:'profile',   icon:User,         label:'Trang cá nhân' },
    { id:'catalog',   icon:Package,      label:'Danh mục SP/DV' },
  ];

  const getStatusBadge = (status) => {
    const map = {
      SCHEDULED:   { label:'Đã lên lịch', bg:'var(--brand-blue-light)',    color:'var(--brand-blue)' },
      IN_PROGRESS: { label:'Đang thực hiện', bg:'var(--brand-yellow-light)',color:'var(--warning)' },
      COMPLETED:   { label:'Hoàn thành', bg:'var(--success-bg)',            color:'var(--success)' },
    };
    return map[status] || { label:status, bg:'var(--bg-page)', color:'var(--text-secondary)' };
  };

  return (
    <div className="tech-portal-main-grid animate-fade-in">

      {/* Toast */}
      {message && <div className={`toast ${message.type==='error'?'toast-error':'toast-success'}`}><CheckCircle2 size={17}/><span>{message.text}</span></div>}

      {/* ── Left Sidebar ─────────────────────────── */}
      <div className="portal-sidebar-wrapper">

        {/* Profile mini card */}
        <div className="card-flat sidebar-header" style={{ padding:20, textAlign:'center' }}>
          <div className="flex-center" style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand-blue),#0099E5)', color:'#fff', fontSize:'1.8rem', fontWeight:800, margin:'0 auto 12px' }}>
            {profileForm.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text-primary)', marginBottom:3 }}>{profileForm.name}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:10 }}>{profileForm.specialty}</div>
          <span className="badge badge-green" style={{ margin:'0 auto' }}>🔧 Kỹ Thuật Viên</span>
          <div style={{ marginTop:14, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { v:completedJobs, l:'Hoàn thành', c:'var(--success)' },
              { v:activeJobs,    l:'Đang làm',   c:'var(--warning)' },
              { v:pendingJobs,   l:'Chờ xử lý',  c:'var(--brand-blue)' },
            ].map(s=>(
              <div key={s.l} style={{ background:'var(--bg-page)', borderRadius:'var(--r-md)', padding:'8px 4px' }}>
                <div style={{ fontWeight:800, fontSize:'1.1rem', color:s.c }}>{s.v}</div>
                <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontWeight:600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav */}
        <div className="card-flat sidebar-nav-card" style={{ padding:'14px 10px' }}>
          <nav className="sidebar-nav">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} className={`sidebar-nav-item ${activeTab===tab.id?'active':''}`} onClick={()=>setActiveTab(tab.id)}>
                  <Icon size={15}/> {tab.label}
                  {tab.id==='jobs' && pendingJobs > 0 && (
                    <span style={{ marginLeft:'auto', background:'var(--warning)', color:'#fff', borderRadius:'var(--r-full)', fontSize:'0.65rem', fontWeight:800, padding:'1px 6px' }}>{pendingJobs}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer" style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
            <button onClick={fetchData} disabled={loading} className="btn btn-secondary btn-sm" style={{ width:'100%', gap:6, marginBottom:8 }}>
              <RefreshCw size={13} className={loading?'animate-spin':''}/> Tải lại
            </button>
            <button onClick={onLogout} className="btn btn-ghost btn-sm" style={{ width:'100%', gap:6, color:'var(--danger)' }}>
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────── */}
      <div>

        {/* ═══ DASHBOARD ════════════════════════════ */}
        {activeTab==='dashboard' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:20 }}>Dashboard Kỹ Thuật Viên</h2>

            {/* KPI row */}
            <div className="kpi-grid">
              {[
                { l:'VIỆC HOÀN THÀNH', v:completedJobs, sub:'Tổng tích lũy', c:'green',  icon:<CheckCircle size={20}/> },
                { l:'ĐANG THỰC HIỆN', v:activeJobs,    sub:'Cần cập nhật',   c:'yellow', icon:<Activity size={20}/> },
                { l:'CHỜ XỬ LÝ',      v:pendingJobs,   sub:'Mới được giao',  c:'blue',   icon:<Calendar size={20}/> },
                { l:'ĐÁNH GIÁ TB',     v:'4.8 ⭐',      sub:'Từ khách hàng',  c:'purple', icon:<Star size={20}/> },
              ].map(k => {
                const colorMap = { blue:'#0052CC', green:'#00875A', yellow:'#FF8B00', red:'#DE350B', purple:'#6554C0' };
                const bgMap    = { blue:'#EBF2FF',  green:'#E3FCEF',  yellow:'#FFF7E6',  red:'#FFEBE6',  purple:'#EAE6FF' };
                return (
                  <div key={k.l} className={`kpi-card kpi-${k.c}`}>
                    <div className="flex-between">
                      <div>
                        <div className="kpi-label">{k.l}</div>
                        <div className="kpi-value" style={{ color:colorMap[k.c] }}>{k.v}</div>
                        <div className="kpi-sub">{k.sub}</div>
                      </div>
                      <div className="flex-center" style={{ width:40, height:40, borderRadius:'var(--r-md)', background:bgMap[k.c], color:colorMap[k.c] }}>{k.icon}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent schedules */}
            <div className="card-flat" style={{ padding:24 }}>
              <div className="flex-between" style={{ marginBottom:16 }}>
                <h4 style={{ fontWeight:700 }}>Lịch Làm Việc Gần Đây</h4>
                <button onClick={()=>setActiveTab('jobs')} className="btn btn-ghost btn-sm" style={{ gap:5 }}>Xem tất cả <ChevronRight size={13}/></button>
              </div>
              {schedules.length===0 ? (
                <div className="empty-state"><Calendar size={48}/><p style={{ marginTop:10 }}>Chưa có lịch làm việc nào</p></div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead><tr><th>Mã lịch</th><th>Đơn hàng</th><th>Ngày hẹn</th><th>Khung giờ</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                      {schedules.slice(0,5).map(sch => {
                        const s = getStatusBadge(sch.status);
                        return (
                          <tr key={sch.id}>
                            <td style={{ fontWeight:700, color:'var(--brand-blue)' }}>#L{sch.id}</td>
                            <td style={{ fontWeight:600 }}>Đơn #{sch.orderId}</td>
                            <td>{sch.appointmentDate ? new Date(sch.appointmentDate).toLocaleDateString('vi-VN') : '—'}</td>
                            <td>{sch.appointmentTime}</td>
                            <td><span style={{ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:'0.72rem', fontWeight:700 }}>{s.label}</span></td>
                            <td><button onClick={()=>setDetailSched(sch)} className="btn-icon"><Eye size={15}/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ JOBS ═════════════════════════════════ */}
        {activeTab==='jobs' && (
          <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800 }}>Danh Sách Nhiệm Vụ ({schedules.length})</h2>
              <button onClick={fetchData} disabled={loading} className="btn btn-secondary btn-sm" style={{ gap:5 }}>
                <RefreshCw size={13} className={loading?'animate-spin':''}/> Tải lại
              </button>
            </div>

            {schedules.length===0 ? (
              <div className="card-flat" style={{ padding:48 }}>
                <div className="empty-state"><Wrench size={64}/><p style={{ fontWeight:700, marginTop:12 }}>Chưa có nhiệm vụ nào được phân công</p><p style={{ fontSize:'0.82rem', marginTop:4 }}>Hãy thư giãn và chờ quản trị viên phân công!</p></div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {schedules.map(sch => {
                  const s = getStatusBadge(sch.status);
                  return (
                    <div key={sch.id} className="card" style={{ padding:'20px 24px', borderLeft:`4px solid ${s.color}` }}>
                      <div className="flex-between" style={{ marginBottom:14, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight:800, fontSize:'1rem', color:'var(--text-primary)' }}>Lịch #L{sch.id} – Đơn hàng #{sch.orderId}</div>
                          {sch.notes && <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:3 }}>📝 {sch.notes}</div>}
                        </div>
                        <span style={{ background:s.bg, color:s.color, padding:'5px 14px', borderRadius:'var(--r-full)', fontSize:'0.75rem', fontWeight:700 }}>{s.label}</span>
                      </div>

                      <div className="tech-job-info-grid">
                        <div className="flex-gap-2" style={{ color:'var(--text-secondary)' }}>
                          <Calendar size={15} color="var(--brand-blue)"/>
                          <span>Ngày: <strong style={{ color:'var(--text-primary)' }}>{sch.appointmentDate ? new Date(sch.appointmentDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</strong></span>
                        </div>
                        <div className="flex-gap-2" style={{ color:'var(--text-secondary)' }}>
                          <Clock size={15} color="var(--brand-blue)"/>
                          <span>Giờ: <strong style={{ color:'var(--text-primary)' }}>{sch.appointmentTime || 'Chưa xác định'}</strong></span>
                        </div>
                        <div className="flex-gap-2" style={{ color:'var(--text-secondary)' }}>
                          <MapPin size={15} color="var(--danger)"/>
                          <span>Địa điểm: <strong style={{ color:'var(--text-primary)' }}>Lắp đặt/Sửa tại nhà</strong></span>
                        </div>
                      </div>

                      {sch.status !== 'COMPLETED' && (
                        <div className="flex-gap-3" style={{ justifyContent:'flex-end', paddingTop:12, borderTop:'1px solid var(--border)' }}>
                          <button onClick={()=>setDetailSched(sch)} className="btn btn-secondary btn-sm" style={{ gap:5 }}><Eye size={14}/>Chi tiết</button>
                          {sch.status==='SCHEDULED' && (
                            <button onClick={()=>handleUpdateStatus(sch,'IN_PROGRESS')} className="btn btn-primary btn-sm" style={{ gap:5 }}>
                              <Wrench size={14}/> Bắt đầu thực hiện
                            </button>
                          )}
                          {sch.status==='IN_PROGRESS' && (
                            <button onClick={()=>handleUpdateStatus(sch,'COMPLETED')} className="btn btn-success btn-sm" style={{ gap:5 }}>
                              <CheckCircle size={14}/> Xác nhận hoàn thành
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ PROFILE ══════════════════════════════ */}
        {activeTab==='profile' && (
          <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom:20 }}>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800 }}>Trang Cá Nhân</h2>
              <button onClick={()=>setEditProfile(!editProfile)} className={`btn btn-sm ${editProfile?'btn-danger':'btn-primary'}`} style={{ gap:5 }}>
                {editProfile ? <><X size={14}/> Hủy</> : <><Edit3 size={14}/> Chỉnh sửa</>}
              </button>
            </div>

            <div className="profile-portal-grid">
              {/* Avatar / Contact card */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="card-flat" style={{ padding:24, textAlign:'center' }}>
                  <div className="flex-center" style={{ width:90, height:90, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand-blue),#0099E5)', color:'#fff', fontSize:'2.4rem', fontWeight:800, margin:'0 auto 14px' }}>
                    {profileForm.name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontWeight:800, fontSize:'1.15rem', marginBottom:4 }}>{profileForm.name}</div>
                  <span className="badge badge-green" style={{ marginBottom:14 }}>✅ Kỹ Thuật Viên</span>
                  <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:'0.82rem', textAlign:'left' }}>
                    {[
                      { icon:<Phone size={14}/>, v:profileForm.phone, l:'Điện thoại' },
                      { icon:<Mail size={14}/>, v:profileForm.email, l:'Email' },
                      { icon:<MapPin size={14}/>, v:profileForm.address, l:'Địa chỉ' },
                      { icon:<Wrench size={14}/>, v:profileForm.specialty, l:'Chuyên môn' },
                    ].map(r=>(
                      <div key={r.l} className="flex-gap-2" style={{ padding:'8px 0', borderBottom:'1px solid var(--border)', color:'var(--text-secondary)' }}>
                        <span style={{ color:'var(--brand-blue)', flexShrink:0 }}>{r.icon}</span>
                        <div>
                          <div style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase' }}>{r.l}</div>
                          <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.83rem' }}>{r.v}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievement */}
                <div className="card-flat" style={{ padding:20 }}>
                  <div style={{ fontWeight:700, fontSize:'0.85rem', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                    <Award size={16} color="var(--warning)"/> Thành tích
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { v:completedJobs, l:'Việc hoàn thành', c:'var(--success)' },
                      { v:'4.8 ⭐', l:'Đánh giá TB', c:'#FF8B00' },
                      { v:'5 năm', l:'Kinh nghiệm', c:'var(--brand-blue)' },
                      { v:'24/7', l:'Hỗ trợ khách', c:'var(--purple)' },
                    ].map(s=>(
                      <div key={s.l} style={{ textAlign:'center', padding:'10px 6px', background:'var(--bg-page)', borderRadius:'var(--r-md)' }}>
                        <div style={{ fontWeight:800, fontSize:'1.1rem', color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:'0.67rem', color:'var(--text-muted)', fontWeight:600 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit form / Bio */}
              <div>
                {editProfile ? (
                  <div className="card-flat" style={{ padding:24 }}>
                    <h4 style={{ fontWeight:700, marginBottom:18 }}>Chỉnh Sửa Thông Tin</h4>
                    <form onSubmit={handleSaveProfile} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                      <div className="form-row form-row-2">
                        <div className="form-field"><label>Họ và tên</label><input value={profileForm.name} onChange={e=>setProfileForm({...profileForm,name:e.target.value})}/></div>
                        <div className="form-field"><label>Số điện thoại</label><input value={profileForm.phone} onChange={e=>setProfileForm({...profileForm,phone:e.target.value})}/></div>
                      </div>
                      <div className="form-field"><label>Email</label><input type="email" value={profileForm.email} onChange={e=>setProfileForm({...profileForm,email:e.target.value})}/></div>
                      <div className="form-field"><label>Địa chỉ</label><input value={profileForm.address} onChange={e=>setProfileForm({...profileForm,address:e.target.value})}/></div>
                      <div className="form-field"><label>Chuyên môn</label><input value={profileForm.specialty} onChange={e=>setProfileForm({...profileForm,specialty:e.target.value})}/></div>
                      <div className="form-field"><label>Giới thiệu bản thân</label><textarea rows={4} value={profileForm.bio} onChange={e=>setProfileForm({...profileForm,bio:e.target.value})} style={{ resize:'vertical' }}/></div>
                      <div style={{ display:'flex', gap:10 }}>
                        <button type="submit" className="btn btn-primary" style={{ gap:5 }}><Save size={15}/> Lưu thay đổi</button>
                        <button type="button" onClick={()=>setEditProfile(false)} className="btn btn-secondary">Hủy</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="card-flat" style={{ padding:24, marginBottom:16 }}>
                      <h4 style={{ fontWeight:700, marginBottom:14 }}>Giới Thiệu</h4>
                      <p style={{ fontSize:'0.88rem', color:'var(--text-secondary)', lineHeight:1.75 }}>{profileForm.bio}</p>
                    </div>

                    {/* Assigned work history */}
                    <div className="card-flat" style={{ padding:24 }}>
                      <h4 style={{ fontWeight:700, marginBottom:16 }}>Lịch Sử Lắp Đặt & Sửa Chữa</h4>
                      {schedules.filter(s=>s.status==='COMPLETED').length===0 ? (
                        <div className="empty-state" style={{ padding:'24px 0' }}><CheckCircle2 size={44}/><p style={{ marginTop:8, fontSize:'0.85rem' }}>Chưa có lịch sử hoàn thành</p></div>
                      ) : (
                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                          {schedules.filter(s=>s.status==='COMPLETED').map(sch=>(
                            <div key={sch.id} style={{ display:'flex', gap:14, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                              <div className="flex-center" style={{ width:36, height:36, borderRadius:'50%', background:'var(--success-bg)', color:'var(--success)', flexShrink:0 }}>
                                <CheckCircle size={18}/>
                              </div>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontSize:'0.88rem', marginBottom:2 }}>Đơn #{sch.orderId}</div>
                                <div style={{ fontSize:'0.76rem', color:'var(--text-muted)', display:'flex', gap:14 }}>
                                  <span>📅 {sch.appointmentDate ? new Date(sch.appointmentDate).toLocaleDateString('vi-VN') : '—'}</span>
                                  <span>⏱ {sch.appointmentTime}</span>
                                  {sch.notes && <span>📝 {sch.notes}</span>}
                                </div>
                              </div>
                              <span className="badge badge-green">Hoàn thành</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CATALOG ══════════════════════════════ */}
        {activeTab==='catalog' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize:'1.3rem', fontWeight:800, marginBottom:20 }}>Danh Mục Sản Phẩm & Dịch Vụ</h2>
            <p style={{ fontSize:'0.875rem', color:'var(--text-secondary)', marginBottom:24, background:'var(--brand-blue-light)', padding:'12px 16px', borderRadius:'var(--r-md)', borderLeft:'4px solid var(--brand-blue)' }}>
              📋 Thông tin tham khảo để tư vấn khách hàng. Bạn có thể xem thông số kỹ thuật sản phẩm và báo giá dịch vụ.
            </p>

            <div style={{ marginBottom:32 }}>
              <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <Package size={18} color="var(--brand-blue)"/> Sản Phẩm ({products.length})
              </h3>
              <div className="vouchers-grid">
                {products.map(p=>(
                  <div key={p.id} className="card" style={{ padding:16 }}>
                    <img src={(p.image ? p.image.split(',')[0] : '') || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=280&h=140&fit=crop'} alt={p.name} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:'var(--r-md)', marginBottom:10 }}/>
                    <div style={{ fontWeight:700, fontSize:'0.88rem', marginBottom:4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                      {p.brand && <span className="badge badge-blue" style={{ fontSize:'0.7rem' }}>{p.brand}</span>}
                      {p.warrantyMonths && <span className="badge badge-green" style={{ fontSize:'0.7rem' }}>BH {p.warrantyMonths}th</span>}
                    </div>
                    <div style={{ fontWeight:800, color:'var(--danger)', fontSize:'1rem' }}>{fmtVnd(p.price)}</div>
                    <div style={{ fontSize:'0.76rem', color:'var(--text-secondary)', marginTop:4, lineHeight:1.55, whiteSpace:'pre-wrap' }}>{p.description}</div>
                    <div style={{ marginTop:8, fontSize:'0.72rem', color:'var(--text-muted)' }}>
                      Danh mục: <strong>{categories.find(c=>c.id===p.categoryId)?.name||'—'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                <Wrench size={18} color="var(--success)"/> Dịch Vụ Kỹ Thuật ({services.length})
              </h3>
              <div className="services-grid">
                {services.map(s=>(
                  <div key={s.id} className="card" style={{ padding:18, display:'flex', gap:14 }}>
                    <div className="flex-center" style={{ width:46, height:46, borderRadius:'var(--r-lg)', background:'var(--brand-blue-light)', color:'var(--brand-blue)', flexShrink:0 }}>
                      <Wrench size={20}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <h4 style={{ fontSize:'0.9rem', marginBottom:5 }}>{s.name}</h4>
                      <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:10, whiteSpace:'pre-wrap' }}>{s.description}</p>
                      <div className="flex-gap-3" style={{ fontSize:'0.8rem' }}>
                        <span style={{ color:'var(--text-muted)' }}>⏱ <strong style={{ color:'var(--text-primary)' }}>{s.estimatedHours}h</strong></span>
                        <span style={{ fontWeight:800, color:'var(--success)', fontSize:'0.95rem' }}>{fmtVnd(s.basePrice)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Schedule Detail Modal ────────────────── */}
      {detailSched && (
        <div className="modal-overlay" style={{ zIndex:2500 }} onClick={()=>setDetailSched(null)}>
          <div className="modal-box" style={{ width:560, maxWidth:'95vw' }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi Tiết Lịch #L{detailSched.id}</h3>
              <button onClick={()=>setDetailSched(null)} className="btn-icon"><X size={18}/></button>
            </div>
            <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Status */}
              <div className="flex-between">
                <span style={{ fontWeight:600 }}>Trạng thái:</span>
                {(() => { const s=getStatusBadge(detailSched.status); return <span style={{ background:s.bg, color:s.color, padding:'4px 14px', borderRadius:'var(--r-full)', fontSize:'0.78rem', fontWeight:700 }}>{s.label}</span>; })()}
              </div>

              {/* Details grid */}
              {[
                { l:'Mã đơn hàng',   v:`#${detailSched.orderId}`, icon:<ClipboardList size={15}/> },
                { l:'Ngày hẹn',      v:detailSched.appointmentDate ? new Date(detailSched.appointmentDate).toLocaleDateString('vi-VN') : 'Chưa xác định', icon:<Calendar size={15}/> },
                { l:'Khung giờ',     v:detailSched.appointmentTime || 'Chưa xác định', icon:<Clock size={15}/> },
                { l:'Địa điểm',      v:'Tại địa chỉ khách hàng – Đông Triều, QN', icon:<MapPin size={15}/> },
                { l:'Ghi chú',       v:detailSched.notes || 'Không có ghi chú thêm', icon:<ClipboardList size={15}/> },
              ].map(r=>(
                <div key={r.l} style={{ display:'flex', gap:12, paddingBottom:12, borderBottom:'1px solid var(--border)' }}>
                  <div className="flex-center" style={{ width:34, height:34, borderRadius:'var(--r-md)', background:'var(--brand-blue-light)', color:'var(--brand-blue)', flexShrink:0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{r.l}</div>
                    <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.88rem' }}>{r.v}</div>
                  </div>
                </div>
              ))}

              {/* Action buttons */}
              {detailSched.status !== 'COMPLETED' && (
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
                  {detailSched.status==='SCHEDULED' && (
                    <button onClick={()=>handleUpdateStatus(detailSched,'IN_PROGRESS')} className="btn btn-primary" style={{ gap:5 }}>
                      <Wrench size={15}/> Bắt đầu thực hiện
                    </button>
                  )}
                  {detailSched.status==='IN_PROGRESS' && (
                    <button onClick={()=>handleUpdateStatus(detailSched,'COMPLETED')} className="btn btn-success" style={{ gap:5 }}>
                      <CheckCircle size={15}/> Xác nhận hoàn thành
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
