import React, { useState, useEffect } from 'react';
import UserPortal from './components/UserPortal';
import AdminDashboard from './components/AdminDashboard';
import TechnicianPortal from './components/TechnicianPortal';
import ProfilePage from './components/ProfilePage';
import RobotChatWidget from './components/RobotChatWidget';
import {
  Snowflake, LogIn, LogOut,
  Search, ShoppingBag, ClipboardList, User, Eye, EyeOff,
  Shield, Wrench, Phone, ChevronDown, Bell, Home, Camera
} from './Icons';
import * as api from './services/api';

const DraggableChatButton = ({ href, initialPosition, children, glowColor }) => {
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 100;
        return {
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setHasMoved(false);
    setRel({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setDragging(true);
    setHasMoved(false);
    setRel({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      setHasMoved(true);
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 100;
      let newX = e.clientX - rel.x;
      let newY = e.clientY - rel.y;

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
      if (!dragging) return;
      setHasMoved(true);
      const touch = e.touches[0];
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 100;
      let newX = touch.clientX - rel.x;
      let newY = touch.clientY - rel.y;

      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setDragging(false);

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, rel]);

  const handleClick = (e) => {
    if (hasMoved) {
      e.preventDefault();
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9999,
        width: 42,
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 15px ${glowColor}, 0 3px 6px rgba(0, 0, 0, 0.15)`,
        borderRadius: '50%',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        transition: 'transform 0.2s'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
    </a>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState('home'); // 'home'|'profile'|'admin'|'tech'
  const [activeView, setActiveView] = useState('products'); // 'products'|'cart'|'orders'|'services'
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regError, setRegError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Forgot password fields
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [sendingForgotOtp, setSendingForgotOtp] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // Close account menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.account-menu-container')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll shadow
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const resetRegisterStates = () => {
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegAddress('');
    setRegError('');
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
    setSendingOtp(false);
    setVerifyingOtp(false);
    
    setIsForgotPassword(false);
    setForgotEmail('');
    setForgotOtpCode('');
    setForgotNewPassword('');
    setForgotOtpSent(false);
    setForgotError('');
    setForgotSuccess('');
    setSendingForgotOtp(false);
    setResettingPassword(false);
  };

  const doLogin = (user, tokens) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    if (tokens) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    setShowLoginModal(false);
    setEmail(''); setPassword('');
    setIsRegistering(false); setLoginError('');
    resetRegisterStates();
    // Chuyển hướng về trang chủ sản phẩm và reload để tải lại dữ liệu mới sạch sẽ
    setActivePage('home');
    setActiveView('products');
    setActiveCategory(null);
    window.location.reload();
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    (async () => {
      try {
        const res = await api.login(email, password);
        if (res && res.status === 'success') {
          doLogin(res.data.user, res.data);
        } else {
          setLoginError(res?.message || 'Đăng nhập thất bại.');
        }
      } catch (err) {
        setLoginError(api.extractErrorMessage(err, 'Email hoặc mật khẩu không chính xác.'));
      }
    })();
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!regEmail) {
      setRegError('Vui lòng nhập Email để nhận OTP.');
      return;
    }
    setOtpSent(true);
    setRegError('');
    setSendingOtp(true);
    api.sendOtp(regEmail)
      .then(() => {
        setSendingOtp(false);
      })
      .catch(err => {
        setSendingOtp(false);
        setRegError(api.extractErrorMessage(err, 'Không thể gửi OTP. Email có thể đã tồn tại.'));
      });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode) {
      setRegError('Vui lòng nhập mã OTP.');
      return;
    }
    setVerifyingOtp(true);
    setRegError('');
    try {
      const res = await api.verifyOtp(regEmail, otpCode);
      if (res && res.status === 'success') {
        setOtpVerified(true);
      } else {
        setRegError(res?.message || 'Mã OTP không chính xác.');
      }
    } catch (err) {
      setRegError(api.extractErrorMessage(err, 'Mã OTP không chính xác hoặc đã hết hạn.'));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setRegError('Vui lòng xác thực mã OTP trước.');
      return;
    }
    setRegError('');
    try {
      const res = await api.register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        address: regAddress
      });
      if (res && res.status === 'success') {
        const loginRes = await api.login(regEmail, regPassword);
        if (loginRes && loginRes.status === 'success') {
          doLogin(loginRes.data.user, loginRes.data);
          resetRegisterStates();
        } else {
          setRegError('Đăng ký thành công nhưng tự động đăng nhập thất bại. Vui lòng đăng nhập lại.');
        }
      } else {
        setRegError(res?.message || 'Đăng ký thất bại.');
      }
    } catch (err) {
      setRegError(api.extractErrorMessage(err, 'Email đã tồn tại hoặc dữ liệu không hợp lệ.'));
    }
  };

  const handleForgotSendOtp = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Vui lòng nhập Email.');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setSendingForgotOtp(true);
    api.forgotPasswordSendOtp(forgotEmail)
      .then(() => {
        setForgotOtpSent(true);
        setForgotSuccess('Mã xác thực OTP đã được gửi đến email của bạn.');
      })
      .catch(err => {
        setForgotError(api.extractErrorMessage(err, 'Không thể gửi OTP. Email không tồn tại.'));
      })
      .finally(() => {
        setSendingForgotOtp(false);
      });
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtpCode || !forgotNewPassword) {
      setForgotError('Vui lòng điền đầy đủ mã OTP và mật khẩu mới.');
      return;
    }
    setForgotError('');
    setForgotSuccess('');
    setResettingPassword(true);
    try {
      const res = await api.forgotPasswordReset({
        email: forgotEmail,
        otp: forgotOtpCode,
        newPassword: forgotNewPassword
      });
      if (res && res.status === 'success') {
        alert('Khôi phục mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
        resetRegisterStates();
      } else {
        setForgotError(res?.message || 'Khôi phục mật khẩu thất bại.');
      }
    } catch (err) {
      setForgotError(api.extractErrorMessage(err, 'Mã OTP không chính xác hoặc đã hết hạn.'));
    } finally {
      setResettingPassword(false);
    }
  };

  const handleLogout = () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      api.logout(refresh).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setActivePage('home');
    setCartCount(0);
  };

  const isCustomer   = currentUser?.role === 'CUSTOMER';
  const isAdmin      = currentUser?.role === 'ADMIN';
  const isTech       = currentUser?.role === 'TECHNICIAN';
  const isStaff      = isAdmin || isTech;

  /* ── Portal views ──────────────────────────────────── */
  const showAdminDash = isAdmin && activePage === 'admin-dash';
  const showTechDash  = isTech  && activePage === 'tech-dash';
  const showProfile   = activePage === 'profile' && currentUser;
  const showShop = !showAdminDash && !showTechDash && !showProfile;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>

      {/* ══════════════════════════════════════════════════
          HEADER
          ══════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 1000,
        boxShadow: scrolled ? '0 4px 20px rgba(9,30,66,.18)' : '0 2px 8px rgba(9,30,66,.1)',
        transition: 'box-shadow .3s'
      }}>

        <div style={{ background: 'var(--bg-header)', padding: '0 20px' }}>
          <div className="header-inner">

            {/* Logo */}
            <div onClick={() => setActivePage('home')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0, marginRight: 20 }}>
              <Snowflake 
                size={32} 
                color="var(--brand-yellow)" 
                style={{ 
                  animation: 'fa-spin 8s infinite linear',
                  filter: 'drop-shadow(0 0 8px rgba(255, 171, 0, 0.95))'
                }} 
              />
              <div className="header-logo-text">
                <div className="header-logo-title">
                  ĐÔNG TRIỀU <span style={{ color: 'var(--brand-yellow)' }}>24H</span>
                </div>
                <div className="header-logo-subtitle">
                  Điện lạnh chuyên nghiệp
                </div>
              </div>
            </div>

            {/* Navigation in Header 1 */}
            <div className="header-nav-container">
              <button className={`header-nav-btn ${(activePage === 'home' && (activeView === 'products' || activeView === 'product-detail') && !showAdminDash && !showTechDash) ? 'active' : ''}`} onClick={() => { setActivePage('home'); setActiveView('products'); setActiveCategory(null); }}>
                <Home size={16} /> Trang chủ
              </button>

              {(isCustomer || !currentUser) && (
                <button className={`header-nav-btn ${(activePage === 'home' && activeView === 'cart' && !showAdminDash && !showTechDash) ? 'active' : ''}`} style={{ position: 'relative' }} onClick={() => { if (!currentUser) { setShowLoginModal(true); } else { setActivePage('home'); setActiveView('cart'); } }}>
                  <ShoppingBag size={16} />
                  Giỏ hàng
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>
              )}

              {(isCustomer || !currentUser) && (
                <button className={`header-nav-btn ${(activePage === 'home' && activeView === 'orders' && !showAdminDash && !showTechDash) ? 'active' : ''}`} onClick={() => { if (!currentUser) { setShowLoginModal(true); } else { setActivePage('home'); setActiveView('orders'); } }}>
                  <ClipboardList size={16} /> Đơn hàng của tôi
                </button>
              )}



              {(isCustomer || isStaff || !currentUser) && (
                <button className={`header-nav-btn ${(activePage === 'home' && activeView === 'work-process' && !showAdminDash && !showTechDash) ? 'active' : ''}`} onClick={() => { setActivePage('home'); setActiveView('work-process'); }}>
                  <Camera size={16} /> Quá trình làm việc
                </button>
              )}

              {isAdmin && (
                <button className={`header-nav-btn ${activePage === 'admin-dash' ? 'active' : ''}`} onClick={() => setActivePage('admin-dash')}>
                  <Shield size={16} /> Quản trị hệ thống
                </button>
              )}

              {isTech && (
                <button className={`header-nav-btn ${activePage === 'tech-dash' ? 'active' : ''}`} onClick={() => setActivePage('tech-dash')}>
                  <Wrench size={16} /> Nghiệp vụ kỹ thuật
                </button>
              )}
            </div>

            {/* Search */}
            <div className="header-search-container">
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--r-full)', padding: '8px 16px 8px 38px', fontSize: '0.875rem', width: '100%' }}
              />
            </div>

            {/* Account */}
            <div className="account-menu-container">
              <div 
                className={currentUser ? "account-avatar-btn-welcome" : "account-avatar-btn-simple"} 
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                {currentUser ? (
                  <>
                    <div className="avatar-circle-simple">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="welcome-text">
                      <span className="welcome-prefix">Welcome, </span><strong className="welcome-name">{currentUser.name}</strong>
                    </span>
                  </>
                ) : (
                  <User size={20} style={{ color: '#fff', opacity: 0.9 }} />
                )}
              </div>
              
              <div className={`account-dropdown-menu ${showAccountMenu ? 'show' : ''}`}>
                {currentUser ? (
                  <>
                    <div className="dropdown-header">
                      <strong>{currentUser.name}</strong>
                      <span className="dropdown-role">{currentUser.role}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <button onClick={() => { setActivePage('profile'); setShowAccountMenu(false); }} className="dropdown-item">
                      <User size={14} /> Trang cá nhân
                    </button>
                    <button onClick={() => { handleLogout(); setShowAccountMenu(false); }} className="dropdown-item text-danger">
                      <LogOut size={14} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setIsRegistering(false); setShowLoginModal(true); setShowAccountMenu(false); }} className="dropdown-item">
                      <LogIn size={14} /> Đăng nhập
                    </button>
                    <button onClick={() => { setIsRegistering(true); setShowLoginModal(true); setShowAccountMenu(false); }} className="dropdown-item">
                      <User size={14} /> Đăng ký
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="news-ticker-container">
        <div className="news-ticker-content">
          <div className="news-ticker-item">
            <span className="news-ticker-badge">Chúng Tôi</span>
            <span>Lắp đặt, bảo dưỡng, sửa chữa: điều hòa, tủ lạnh, máy giặt, bình nóng lạnh tại Đông Triều - Điện Lạnh Đông Triều 24h | Dịch vụ lắp đặt, sửa chữa, bảo dưỡng: điều hòa, tủ lạnh, máy giặt, bình nóng lạnh uy tín, nhanh chóng, giá rẻ tại Đông Triều. Hotline: 0387551111</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════════════════ */}
      <main style={{ flex: 1, maxWidth: 1440, width: '100%', margin: '0 auto', padding: '24px 20px', boxSizing: 'border-box' }}>
        {showAdminDash && <AdminDashboard />}
        {showTechDash  && <TechnicianPortal currentUser={currentUser} onLogout={handleLogout} />}
        {showProfile   && <ProfilePage currentUser={currentUser} orders={[]} onUserUpdated={(updated) => {
          const merged = { ...currentUser, ...updated };
          setCurrentUser(merged);
          localStorage.setItem('currentUser', JSON.stringify(merged));
        }} />}
        {showShop      && (
          <UserPortal
            currentUser={currentUser}
            triggerLogin={() => setShowLoginModal(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCartCountChange={setCartCount}
            viewOnly={isStaff}
            activeView={activeView}
            setActiveView={setActiveView}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
      </main>

      {/* ══════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--bg-footer)', color: '#8993A4', padding: '48px 20px 28px', marginTop: 40 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Snowflake size={24} color="var(--brand-yellow)" />
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-.01em' }}>ĐÔNG TRIỀU 24H</div>
                  <div style={{ color: 'var(--brand-yellow)', fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Điện lạnh chuyên nghiệp</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.75, color: '#6B778C' }}>
                Hệ thống phân phối thiết bị điện lạnh chính hãng và dịch vụ kỹ thuật sửa chữa, lắp đặt tận nhà uy tín hàng đầu khu vực Đông Triều, Quảng Ninh.
              </p>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {['🏆 Uy tín 15 năm', '⭐ 4.9/5 đánh giá', '🛡 Bảo hành chính hãng'].map(t => (
                  <span key={t} style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 'var(--r-full)', padding: '3px 8px', color: '#8993A4', whiteSpace: 'nowrap' }}>{t}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Dịch Vụ</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.3, fontSize: '0.82rem', color: '#6B778C' }}>
                {['Lắp đặt máy lạnh', 'Vệ sinh & bơm gas', 'Sửa chữa tủ lạnh', 'Bảo trì máy giặt', 'Sửa bo mạch điện'].map(s => (
                  <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--brand-yellow)', fontSize: '0.6rem' }}>▶</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Tổng Đài</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.4, fontSize: '0.82rem' }}>
                <li style={{ color: '#6B778C' }}>Mua hàng: <strong style={{ color: 'var(--brand-yellow)' }}><a href="tel:0387551111" style={{ color: 'inherit', textDecoration: 'none' }}>0387551111</a></strong></li>
                <li style={{ color: '#6B778C' }}>Kỹ thuật: <strong style={{ color: 'var(--brand-yellow)' }}><a href="tel:0387551111" style={{ color: 'inherit', textDecoration: 'none' }}>0387551111</a></strong></li>
                <li style={{ color: '#6B778C' }}>Bảo hành: <strong style={{ color: 'var(--brand-yellow)' }}><a href="tel:0387551111" style={{ color: 'inherit', textDecoration: 'none' }}>0387551111</a></strong></li>
              </ul>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,171,0,.08)', border: '1px solid rgba(255,171,0,.2)', borderRadius: 'var(--r-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.5)', marginBottom: 2 }}>Kỹ thuật sửa chữa</div>
                <div style={{ color: 'var(--brand-yellow)', fontWeight: 800, fontSize: '1rem' }}>Phục vụ 24/7</div>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Giờ Làm Việc</h4>
              <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2.3, fontSize: '0.82rem', color: '#6B778C' }}>
                <li>Thứ 2 – Thứ 6: <strong style={{ color: '#fff' }}>07:30 – 21:00</strong></li>
                <li>Thứ 7 – CN: <strong style={{ color: '#fff' }}>08:00 – 20:00</strong></li>
                <li>Lễ Tết: <strong style={{ color: 'var(--brand-yellow)' }}>Mở cửa bình thường</strong></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 Điện Lạnh Đông Triều 24h – All rights reserved.</span>
            <span>Thiết kế & Phát triển bởi Đội Kỹ Thuật Đông Triều</span>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════════════════
          LOGIN / REGISTER MODAL
          ══════════════════════════════════════════════════ */}
      {showLoginModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="modal-box animate-slide-up" style={{ width: '90%', maxWidth: 440 }}>

            <div style={{ background: 'var(--bg-header)', padding: '22px 24px', position: 'relative' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                {isRegistering ? '📝 Tạo tài khoản mới' : isForgotPassword ? '🔑 Khôi phục mật khẩu' : '👋 Đăng nhập'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,.65)', marginTop: 3 }}>Điện Lạnh Đông Triều 24h xin chào quý khách!</div>
              <button
                onClick={() => { setShowLoginModal(false); setLoginError(''); setIsRegistering(false); resetRegisterStates(); }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
              {isRegistering ? (
                <div>
                  {!otpSent && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div className="form-field">
                        <label>Email đăng ký *</label>
                        <input type="email" required placeholder="Nhập email để nhận mã xác thực..." value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                      </div>
                      {regError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {regError}</div>}
                      <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--r-full)', marginTop: 4 }} disabled={sendingOtp}>
                        {sendingOtp ? 'Đang gửi...' : 'Gửi mã xác thực OTP'}
                      </button>
                      <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        Đã có tài khoản?{' '}
                        <button type="button" onClick={() => { setIsRegistering(false); setRegError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Đăng nhập</button>
                      </div>
                    </form>
                  )}

                  {otpSent && !otpVerified && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div style={{ padding: 12, background: 'rgba(0,82,204,0.06)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,82,204,0.15)', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Mã xác thực OTP đã được gửi đến email <strong style={{ color: 'var(--brand-blue)' }}>{regEmail}</strong>. Vui lòng kiểm tra hộp thư để nhận mã.
                      </div>
                      <div className="form-field">
                        <label>Mã xác thực OTP *</label>
                        <input type="text" required placeholder="Nhập mã OTP 6 chữ số..." value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }} />
                      </div>
                      {regError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {regError}</div>}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setOtpSent(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: 'var(--r-full)' }}>Quay lại</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: 'var(--r-full)' }} disabled={verifyingOtp}>
                          {verifyingOtp ? 'Đang xác thực...' : 'Xác thực mã OTP'}
                        </button>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: 4 }}>
                        Không nhận được mã?{' '}
                        <button type="button" onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Gửi lại mã</button>
                      </div>
                    </form>
                  )}

                  {otpVerified && (
                    <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div style={{ padding: 10, background: 'rgba(0,135,90,0.06)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,135,90,0.15)', fontSize: '0.84rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ✓ Xác thực email thành công!
                      </div>
                      <div className="form-field">
                        <label>Email (Đã xác thực)</label>
                        <input type="email" disabled value={regEmail} style={{ background: 'var(--bg-surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                      </div>
                      {[
                        { label: 'Họ và tên *', type: 'text', val: regName, set: setRegName, ph: 'Nhập họ và tên...' },
                        { label: 'Số điện thoại *', type: 'tel', val: regPhone, set: setRegPhone, ph: '0901234567' },
                        { label: 'Mật khẩu *', type: 'password', val: regPassword, set: setRegPassword, ph: 'Tối thiểu 6 ký tự' },
                        { label: 'Địa chỉ', type: 'text', val: regAddress, set: setRegAddress, ph: 'Địa chỉ liên hệ...' },
                      ].map(f => (
                        <div key={f.label} className="form-field">
                          <label>{f.label}</label>
                          <input type={f.type} required={f.label.includes('*')} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
                        </div>
                      ))}
                      {regError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {regError}</div>}
                      <button type="submit" className="btn btn-success btn-lg" style={{ borderRadius: 'var(--r-full)', marginTop: 4 }}>Hoàn tất đăng ký</button>
                    </form>
                  )}
                </div>
              ) : isForgotPassword ? (
                <div>
                  {!forgotOtpSent ? (
                    <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div className="form-field">
                        <label>Email tài khoản cần khôi phục *</label>
                        <input type="email" required placeholder="Nhập email của bạn..." value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
                      </div>
                      {forgotError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {forgotError}</div>}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => resetRegisterStates()} className="btn btn-secondary" style={{ flex: 1, borderRadius: 'var(--r-full)' }}>Hủy</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2, borderRadius: 'var(--r-full)' }} disabled={sendingForgotOtp}>
                          {sendingForgotOtp ? 'Đang gửi...' : 'Gửi mã xác thực OTP'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleForgotResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      {forgotSuccess && <div style={{ padding: 10, background: 'rgba(0,82,204,0.06)', borderRadius: 'var(--r-md)', border: '1px solid rgba(0,82,204,0.15)', fontSize: '0.82rem', color: 'var(--brand-blue)', fontWeight: 600 }}>{forgotSuccess}</div>}
                      <div className="form-field">
                        <label>Email tài khoản</label>
                        <input type="email" disabled value={forgotEmail} style={{ background: 'var(--bg-surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                      </div>
                      <div className="form-field">
                        <label>Mã xác thực OTP *</label>
                        <input type="text" required placeholder="Nhập mã OTP 6 chữ số..." value={forgotOtpCode} onChange={e => setForgotOtpCode(e.target.value)} style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }} />
                      </div>
                      <div className="form-field">
                        <label>Mật khẩu mới *</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showPassword ? 'text' : 'password'} required placeholder="Nhập mật khẩu mới..." value={forgotNewPassword} onChange={e => setForgotNewPassword(e.target.value)} style={{ paddingRight: 40 }} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      {forgotError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {forgotError}</div>}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button type="button" onClick={() => setForgotOtpSent(false)} className="btn btn-secondary" style={{ flex: 1, borderRadius: 'var(--r-full)' }}>Quay lại</button>
                        <button type="submit" className="btn btn-success" style={{ flex: 2, borderRadius: 'var(--r-full)' }} disabled={resettingPassword}>
                          {resettingPassword ? 'Đang thực hiện...' : 'Khôi phục mật khẩu'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div className="form-field">
                      <label>Email tài khoản</label>
                      <input type="email" required placeholder="Nhập email..." value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Mật khẩu</label>
                        <button type="button" onClick={() => { setIsForgotPassword(true); setLoginError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Quên mật khẩu?</button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input type={showPassword ? 'text' : 'password'} required placeholder="Nhập mật khẩu..." value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 40 }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    {loginError && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>⚠️ {loginError}</div>}
                    <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--r-full)', marginTop: 4 }}>Đăng Nhập</button>
                    <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Chưa có tài khoản?{' '}
                      <button type="button" onClick={() => { setIsRegistering(true); setLoginError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Đăng ký ngay</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          BOTTOM NAVIGATION (MOBILE ONLY)
          ══════════════════════════════════════════════════ */}
      <div className="bottom-nav">
        <button 
          className={`bottom-nav-item ${(activePage === 'home' && activeView === 'products') ? 'active' : ''}`}
          onClick={() => { setActivePage('home'); setActiveView('products'); setActiveCategory(null); }}
        >
          <Home size={20} />
          <span>Trang chủ</span>
        </button>

        <button 
          className={`bottom-nav-item ${(activePage === 'home' && (activeView === 'services' || activeView === 'book-service')) ? 'active' : ''}`}
          onClick={() => { setActivePage('home'); setActiveView('services'); }}
        >
          <Wrench size={20} />
          <span>Dịch vụ</span>
        </button>

        {isAdmin ? (
          <button 
            className={`bottom-nav-item ${activePage === 'admin-dash' ? 'active' : ''}`}
            onClick={() => setActivePage('admin-dash')}
          >
            <Shield size={20} />
            <span>Quản trị</span>
          </button>
        ) : isTech ? (
          <button 
            className={`bottom-nav-item ${activePage === 'tech-dash' ? 'active' : ''}`}
            onClick={() => setActivePage('tech-dash')}
          >
            <Wrench size={20} />
            <span>Nghiệp vụ</span>
          </button>
        ) : (
          <button 
            className={`bottom-nav-item ${(activePage === 'home' && activeView === 'cart') ? 'active' : ''}`}
            onClick={() => { setActivePage('home'); setActiveView('cart'); }}
          >
            <ShoppingBag size={20} />
            <span>Giỏ hàng</span>
            {cartCount > 0 && <span className="bottom-nav-badge">{cartCount}</span>}
          </button>
        )}

        {(isCustomer || !currentUser) && (
          <button 
            className={`bottom-nav-item ${(activePage === 'home' && activeView === 'orders') ? 'active' : ''}`}
            onClick={() => { setActivePage('home'); setActiveView('orders'); }}
          >
            <ClipboardList size={20} />
            <span>Đơn hàng</span>
          </button>
        )}

        {(isCustomer || isStaff || !currentUser) && (
          <button 
            className={`bottom-nav-item ${(activePage === 'home' && activeView === 'work-process') ? 'active' : ''}`}
            onClick={() => { setActivePage('home'); setActiveView('work-process'); }}
          >
            <Camera size={20} />
            <span>Nhật ký</span>
          </button>
        )}

        <button 
          className={`bottom-nav-item ${activePage === 'profile' ? 'active' : ''}`}
          onClick={() => {
            if (currentUser) {
              setActivePage('profile');
            } else {
              setIsRegistering(false);
              setShowLoginModal(true);
            }
          }}
        >
          <User size={20} />
          <span>Cá nhân</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════
          DRAGGABLE CHAT WIDGETS (INDIVIDUAL DRAGGING)
          ══════════════════════════════════════════════════ */}
      {/* Messenger Button */}
      <DraggableChatButton
        href="https://www.facebook.com/people/%C4%90i%E1%BB%87n-L%E1%BA%A1nh-%C4%90%C3%B4ng-Tri%E1%BB%81u-24h/61577487231224/"
        initialPosition={() => ({ x: window.innerWidth - 60, y: window.innerHeight - 130 })}
        glowColor="rgba(162, 0, 255, 0.75)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="42" height="42">
          <defs>
            <linearGradient id="mess-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#006AFF" />
              <stop offset="30%" stopColor="#A200FF" />
              <stop offset="70%" stopColor="#FF5A5F" />
              <stop offset="100%" stopColor="#FF8A00" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#mess-grad)" />
          <path d="M100 40c-33.1 0-60 25.1-60 56.1 0 16.5 7.6 31.2 19.7 41.5V160l21-11.5c6.1 1.7 12.6 2.6 19.3 2.6 33.1 0 60-25.1 60-56.1S133.1 40 100 40z" fill="#FFFFFF" />
          <path d="M107 72l-25 27 18 3-7 26 25-27-18-3z" fill="url(#mess-grad)" />
        </svg>
      </DraggableChatButton>

      {/* Zalo Button */}
      <DraggableChatButton
        href="https://zalo.me/0387551111"
        initialPosition={() => ({ x: window.innerWidth - 60, y: window.innerHeight - 190 })}
        glowColor="rgba(0, 104, 255, 0.75)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="42" height="42">
          <circle cx="100" cy="100" r="100" fill="#0068FF" />
          <path d="M100 45c-30.4 0-55 19.7-55 44 0 13.9 8 26.3 20.7 34.5-1.5 5.5-5.2 13.6-5.7 14.8-.6 1.4.2 1.5 1.1 1 1.2-.7 13.6-8.5 19.3-12.1 6.1 1.2 12.7 1.8 19.6 1.8 30.4 0 55-19.7 55-44s-24.6-44-55-44z" fill="#FFFFFF" />
          <path d="M78 72h44v7.3l-28.7 29.3H122v8.4H76v-7.3l28.7-29.3H78V72z" fill="#0068FF" />
        </svg>
      </DraggableChatButton>

      {/* Interactive Robot Chat Assistant */}
      <RobotChatWidget />
    </div>
  );
}
