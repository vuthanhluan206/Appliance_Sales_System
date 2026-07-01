import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, Lock, ShieldCheck, Edit2, Save, X, Package, CheckCircle, Clock, AlertCircle } from '../Icons';
import * as api from '../services/api';

const ORDER_STATUS_CONFIG = {
  PENDING:               { label: 'Chờ duyệt',     className: 'badge-yellow', icon: Clock },
  INSTALLING_REPAIRING:  { label: 'Đang thực hiện', className: 'badge-blue',   icon: AlertCircle },
  COMPLETED:             { label: 'Hoàn thành',     className: 'badge-green',  icon: CheckCircle },
  CANCELLED:             { label: 'Đã hủy',         className: 'badge-red',    icon: X },
};

export default function ProfilePage({ currentUser, orders: initialOrders = [], onUserUpdated }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loginHistory, setLoginHistory] = useState([]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (currentUser?.id) {
      const fetchLoginHistory = async () => {
        try {
          const res = await api.getLoginHistory();
          setLoginHistory(res.data || []);
        } catch (err) {
          console.error('Error fetching login history:', err);
        }
      };
      fetchLoginHistory();
    }
  }, [currentUser]);

  const parseUserAgent = (ua) => {
    if (!ua) return 'Thiết bị không xác định';
    const lower = ua.toLowerCase();
    if (lower.includes('mobi') || lower.includes('android') || lower.includes('iphone') || lower.includes('ipad')) {
      if (lower.includes('iphone')) return '📱 iPhone (iOS)';
      if (lower.includes('ipad')) return '📱 iPad (iOS)';
      if (lower.includes('android')) return '📱 Thiết bị Android';
      return '📱 Thiết bị di động';
    }
    if (lower.includes('windows')) return '💻 Máy tính Windows';
    if (lower.includes('macintosh') || lower.includes('mac os')) return '💻 Mac OS';
    if (lower.includes('linux')) return '💻 Máy tính Linux';
    return '🖥 Thiết bị khác';
  };

  useEffect(() => {
    if (currentUser?.id && currentUser?.role === 'CUSTOMER') {
      const fetchOrders = async () => {
        try {
          const res = await api.getOrdersByUser(currentUser.id);
          setOrders(res.data || []);
        } catch (err) {
          console.error('Error fetching user orders:', err);
        }
      };
      fetchOrders();
    }
  }, [currentUser]);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editEmail] = useState(currentUser?.email || '');

  // Change password
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveProfile = async () => {
    try {
      const res = await api.updateUser(currentUser.id, {
        name: editName,
        phone: editPhone,
        address: editAddress,
      });
      setSaveMsg('Cập nhật thông tin thành công!');
      setIsEditing(false);
      // Cập nhật lại state và localStorage ở App.jsx
      if (onUserUpdated) {
        const updatedData = res?.data || res;
        onUserUpdated({
          name: updatedData?.name || editName,
          phone: updatedData?.phone || editPhone,
          address: updatedData?.address || editAddress,
        });
      }
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMsg('Có lỗi khi cập nhật. Thử lại sau.');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    if (newPassword !== confirmPassword) {
      setPwdError('Mật khẩu mới không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    try {
      // Gọi API đổi mật khẩu (nếu backend hỗ trợ)
      await api.updateUser(currentUser.id, { password: newPassword });
      setPwdSuccess('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPwdForm(false);
    } catch (err) {
      console.error(err);
      setPwdError('Không thể đổi mật khẩu. Vui lòng thử lại.');
    }
  };

  const getStatusCfg = (status) => ORDER_STATUS_CONFIG[status] || { label: status, className: 'badge-gray', icon: Package };

  return (
    <div className="animate-fade-in profile-main-grid" style={{ gridTemplateColumns: (currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN') ? '1fr' : undefined, maxWidth: (currentUser?.role === 'ADMIN' || currentUser?.role === 'TECHNICIAN') ? 600 : 'none', margin: '0 auto' }}>

      {/* ── Left: Profile Card ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar & Info card */}
        <div className="card-flat" style={{ padding: 24 }}>
          {/* Avatar */}
          <div className="flex-center" style={{ marginBottom: 20 }}>
            <div className="flex-center" style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052CC, #00B8D9)',
              color: '#fff', fontSize: '2rem', fontWeight: 800,
              boxShadow: '0 8px 24px rgba(0,82,204,0.3)'
            }}>
              {(editName || currentUser?.name || 'U')[0].toUpperCase()}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>{editName || currentUser?.name}</div>
            <div className="badge badge-blue" style={{ margin: '6px auto 0', display: 'inline-flex' }}>
              {currentUser?.role || 'CUSTOMER'}
            </div>
          </div>

          <hr className="divider" style={{ margin: '0 0 16px 0' }} />

          {/* Info Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <InfoRow icon={<Mail size={15} />} label="Email" value={editEmail} />

            {isEditing ? (
              <>
                <EditRow icon={<User size={15} />} label="Họ và tên">
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ fontSize: '0.875rem', padding: '6px 10px' }} />
                </EditRow>
                <EditRow icon={<Phone size={15} />} label="Điện thoại">
                  <input value={editPhone} onChange={e => setEditPhone(e.target.value)} style={{ fontSize: '0.875rem', padding: '6px 10px' }} />
                </EditRow>
                <EditRow icon={<MapPin size={15} />} label="Địa chỉ">
                  <input value={editAddress} onChange={e => setEditAddress(e.target.value)} style={{ fontSize: '0.875rem', padding: '6px 10px' }} />
                </EditRow>
              </>
            ) : (
              <>
                <InfoRow icon={<Phone size={15} />} label="Điện thoại" value={currentUser?.phone || 'Chưa cập nhật'} />
                <InfoRow icon={<MapPin size={15} />} label="Địa chỉ" value={currentUser?.address || 'Chưa cập nhật'} />
                {currentUser?.lastLoginTime && (
                  <InfoRow 
                    icon={<Clock size={15} />} 
                    label="Đăng nhập cuối" 
                    value={`${new Date(currentUser.lastLoginTime).toLocaleTimeString('vi-VN')} ${new Date(currentUser.lastLoginTime).toLocaleDateString('vi-VN')} (${currentUser.lastLoginIp === '0:0:0:0:0:0:0:1' ? '127.0.0.1' : (currentUser.lastLoginIp || '—')})`} 
                  />
                )}
              </>
            )}
          </div>

          {/* Edit / Save buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {isEditing ? (
              <>
                <button className="btn btn-primary" style={{ flex: 1, gap: 6 }} onClick={handleSaveProfile}>
                  <Save size={15} /> Lưu lại
                </button>
                <button className="btn btn-secondary" style={{ padding: '9px 12px' }} onClick={() => setIsEditing(false)}>
                  <X size={15} />
                </button>
              </>
            ) : (
              <button className="btn btn-secondary" style={{ flex: 1, gap: 6 }} onClick={() => setIsEditing(true)}>
                <Edit2 size={15} /> Chỉnh sửa
              </button>
            )}
          </div>

          {saveMsg && (
            <div style={{
              marginTop: 12, padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: saveMsg.includes('thành công') ? 'var(--success-bg)' : 'var(--danger-bg)',
              color: saveMsg.includes('thành công') ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.82rem', fontWeight: 600
            }}>
              {saveMsg}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card-flat" style={{ padding: 24 }}>
          <div className="flex-between" style={{ marginBottom: showPwdForm ? 16 : 0 }}>
            <div className="flex-gap-2" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <Lock size={16} color="var(--brand-blue)" /> Đổi mật khẩu
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowPwdForm(!showPwdForm); setPwdError(''); setPwdSuccess(''); }}>
              {showPwdForm ? 'Đóng' : 'Thay đổi'}
            </button>
          </div>

          {showPwdForm && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
              <PasswordField label="Mật khẩu hiện tại" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              <PasswordField label="Mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <PasswordField label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />

              {pwdError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {pwdError}</div>}
              {pwdSuccess && <div style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>✓ {pwdSuccess}</div>}

              <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
                <ShieldCheck size={15} /> Cập nhật mật khẩu
              </button>
            </form>
          )}
        </div>

        {/* Lịch sử đăng nhập */}
        <div className="card-flat" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={16} color="var(--brand-blue)" />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Lịch Sử Đăng Nhập</span>
          </div>
          
          {loginHistory.length === 0 ? (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
              Chưa có dữ liệu lịch sử đăng nhập.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
              {loginHistory.map(log => (
                <div key={log.id} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface-2)',
                  borderRadius: 'var(--r-md)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  border: '1px solid var(--border)'
                }}>
                  <div className="flex-between">
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {parseUserAgent(log.userAgent)}
                    </span>
                    <span style={{ 
                      color: 'var(--brand-blue)', 
                      fontWeight: 700,
                      background: 'rgba(0, 82, 204, 0.06)',
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontSize: '0.72rem'
                    }}>
                      {log.ipAddress}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                    Đăng nhập lúc: <strong>{new Date(log.loginTime).toLocaleTimeString('vi-VN')} {new Date(log.loginTime).toLocaleDateString('vi-VN')}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Order History (Only for CUSTOMER) ───────────────────────── */}
      {currentUser?.role !== 'ADMIN' && currentUser?.role !== 'TECHNICIAN' && (
      <div className="card-flat" style={{ padding: 24 }}>
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <Package size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--brand-blue)' }} />
            Lịch Sử Đơn Hàng
          </h3>
          <span className="badge badge-blue">{orders.length} đơn</span>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Package size={56} />
            <p style={{ marginTop: 12, fontWeight: 600 }}>Chưa có đơn hàng nào</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Hãy chọn sản phẩm và đặt hàng!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.slice().reverse().map(order => {
              const cfg = getStatusCfg(order.status);
              const StatusIcon = cfg.icon;
              return (
                <div key={order.id} style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 20px',
                  transition: 'box-shadow 0.2s',
                  background: 'var(--bg-surface)',
                }}>
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <div className="flex-gap-3">
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        Đơn #{order.id}
                      </div>
                      <span className={`badge ${cfg.className}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <StatusIcon size={10} /> {cfg.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalPrice)}
                    </div>
                  </div>

                  <div className="grid-2col" style={{ gap: '6px 24px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Loại:</span> <strong>{order.serviceType}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Địa chỉ:</span> {order.deliveryAddress || '—'}</div>
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>SẢN PHẨM ĐÃ MUA:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {order.orderItems.map(item => (
                          <span key={item.id} className="badge badge-gray">{item.productName} × {item.quantity}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.orderServices && order.orderServices.length > 0 && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>DỊCH VỤ ĐÃ ĐẶT:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {order.orderServices.map(serv => (
                          <span key={serv.id} className="badge badge-blue" style={{ background: 'rgba(0, 82, 204, 0.1)', color: '#0052cc', border: 'none' }}>🔧 {serv.serviceName}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div className="flex-center" style={{ width: 28, height: 28, borderRadius: 'var(--radius-md)', background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function EditRow({ icon, label, children }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--brand-blue)' }}>{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          style={{ paddingRight: 40, fontSize: '0.875rem', padding: '7px 36px 7px 12px' }}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  );
}
