import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';

export default function RobotChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 80,
    y: window.innerHeight - 250 // Stacked above the Zalo button initially
  }));
  const [dragging, setDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Xin chào! Tôi là Trợ lý ảo của Điện Lạnh Đông Triều 24H. Tôi có thể giải đáp các thắc mắc của bạn về bảng giá sửa chữa, chính sách bảo hành, sản phẩm và dịch vụ của chúng tôi. Bạn cần hỗ trợ gì hôm nay?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [viewportTop, setViewportTop] = useState(0);
  const messagesEndRef = useRef(null);

  // Keep button inside screen boundaries on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const maxX = window.innerWidth - 80;
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

  // Handle mobile visual viewport changes to keep header sticky and slide input with keyboard
  useEffect(() => {
    if (!isOpen || !window.visualViewport) return;

    const handleViewportChange = () => {
      setViewportHeight(window.visualViewport.height);
      setViewportTop(window.visualViewport.offsetTop);
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
    
    handleViewportChange();

    return () => {
      window.visualViewport.removeEventListener('resize', handleViewportChange);
      window.visualViewport.removeEventListener('scroll', handleViewportChange);
    };
  }, [isOpen]);

  // Tooltip popup timer (occasional helper message)
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      return;
    }

    // Initial popup after 5 seconds
    const initialTimeout = setTimeout(() => {
      setShowTooltip(true);
    }, 5000);

    // Hide popup after 12 seconds
    const hideTimeout = setTimeout(() => {
      setShowTooltip(false);
    }, 12000);

    // Interval to repeat the popup occasionally (every 35 seconds)
    const interval = setInterval(() => {
      setShowTooltip(true);
      // Hide it again 7 seconds later
      setTimeout(() => {
        setShowTooltip(false);
      }, 7000);
    }, 35000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(hideTimeout);
      clearInterval(interval);
    };
  }, [isOpen]);

  // Handle Drag Start
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only allow left click
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

  // Handle Drag movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      setHasMoved(true);
      const maxX = window.innerWidth - 80;
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
      const maxX = window.innerWidth - 80;
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

  const handleButtonClick = (e) => {
    if (!hasMoved) {
      setIsOpen(!isOpen);
    }
  };

  // Predefined Q&A database (Fake Data / Local Knowledge Base)
  const FAKE_KNOWLEDGE_BASE = [
    {
      keywords: ['giá', 'bảng giá', 'chi phí', 'bao nhiêu', 'tiền', 'vệ sinh', 'sửa chữa', 'bảo trì'],
      answer: `🔧 **BẢNG GIÁ DỊCH VỤ ĐIỆN LẠNH ĐÔNG TRIỀU 24H:**

1. **Vệ sinh máy lạnh:**
   - Máy lạnh treo tường (1HP - 2.5HP): **150.000đ - 250.000đ**
   - Máy lạnh âm trần/tủ đứng: **350.000đ - 500.000đ**
2. **Nạp gas máy lạnh:**
   - Bổ sung gas R22/R410A/R32: **200.000đ - 500.000đ** (tùy lượng hụt)
3. **Sửa chữa tủ lạnh:**
   - Kiểm tra & sửa board mạch: **Từ 450.000đ**
   - Thay Block tủ lạnh: **Từ 1.200.000đ** (bảo hành 1 năm)
4. **Vệ sinh máy giặt:**
   - Máy giặt cửa trên: **250.000đ**
   - Máy giặt cửa trước (lồng ngang): **350.000đ**

*Lưu ý: Báo giá chính xác sẽ được kỹ thuật viên cung cấp sau khi kiểm tra thực tế. Liên hệ Hotline **0387551111** để được đặt lịch kiểm tra miễn phí!*`
    },
    {
      keywords: ['bảo hành', 'chính sách', 'hỗ trợ', 'lỗi', 'hỏng', 'đổi trả'],
      answer: `🛡️ **CHÍNH SÁCH BẢO HÀNH ĐIỆN LẠNH ĐÔNG TRIỀU 24H:**

- **Dịch vụ sửa chữa & bảo trì:** Bảo hành từ **3 đến 12 tháng** đối với tất cả các hạng mục khắc phục sự cố.
- **Linh kiện thay thế:** Bảo hành chính hãng theo thời gian của nhà sản xuất (thường từ **6 đến 24 tháng**).
- **Cam kết:** Khắc phục miễn phí 100% nếu phát sinh lỗi cũ trong thời gian bảo hành. Thời gian tiếp nhận và xử lý bảo hành trong vòng **2 tiếng** kể từ khi nhận được yêu cầu của quý khách.
- Hotline tiếp nhận bảo hành 24/7: **0387551111**.`
    },
    {
      keywords: ['sản phẩm', 'bán', 'mua', 'máy lạnh', 'tủ lạnh', 'máy giặt', 'điều hòa', 'hàng mới'],
      answer: `❄️ **SẢN PHẨM ĐANG BÁN TẠI ĐIỆN LẠNH ĐÔNG TRIỀU 24H:**

Chúng tôi phân phối chính hãng các sản phẩm điện lạnh với giá cạnh tranh nhất:
- **Máy lạnh/Điều hòa:** Daikin, Panasonic, Toshiba, Casper, Funiki, LG. (Hỗ trợ bao công lắp đặt + tặng 3m ống đồng).
- **Tủ lạnh:** Samsung, Panasonic, LG, Toshiba (Công nghệ Inverter tiết kiệm điện).
- **Máy giặt:** Electrolux, LG, Toshiba, Aqua (Lồng đứng và lồng ngang).

*Khuyến mãi hiện tại: Giảm ngay **5%** cho khách hàng cũ mua máy lạnh thứ hai trở lên! Chi tiết xem tại mục Sản phẩm.*`
    },
    {
      keywords: ['liên hệ', 'hotline', 'địa chỉ', 'cửa hàng', 'điện thoại', 'sđt', 'đông triều', 'quảng ninh'],
      answer: `📞 **THÔNG TIN LIÊN HỆ ĐIỆN LẠNH ĐÔNG TRIỀU 24H:**

- **Hotline hỗ trợ 24/7:** **0387551111** (Zalo tư vấn kỹ thuật)
- **Địa chỉ văn phòng:** Đông Triều, Quảng Ninh (Chúng tôi hỗ trợ nhanh trong 30 phút tại khu vực Đông Triều và lân cận).
- **Giờ làm việc:** 7:00 AM - 10:00 PM (Kể cả Thứ 7, Chủ Nhật và ngày lễ).
- **Website/Fanpage:** Điện Lạnh Đông Triều 24H.

Hãy gọi ngay hotline nếu bạn cần sửa chữa hoặc lắp đặt gấp!`
    }
  ];

  // Auto-scroll to bottom of chat when messages update or keyboard opens/closes
  useEffect(() => {
    if (messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping, viewportHeight]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Try to connect to backend AI Chat controller
      const response = await api.chatWithAi(query);
      
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response || 'Dạ, em không nhận được phản hồi từ hệ thống.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.warn(
        '⚠️ CẢNH BÁO AI CHAT: Không kết nối được API AI Backend hoặc cơ sở dữ liệu Vector Store. ' +
        'Hệ thống tự động kích hoạt chế độ dự phòng Q&A nội bộ (Local Fallback). ' +
        'Hãy kiểm tra xem Backend (cổng 8080) có chạy thành công không và đã cấu hình GEMINI_API_KEY chưa.',
        error
      );
      
      // Fallback to Local Knowledge Base
      setTimeout(() => {
        setIsTyping(false);
        const lowerQuery = query.toLowerCase();
        let matchedAnswer = '';

        for (const item of FAKE_KNOWLEDGE_BASE) {
          if (item.keywords.some(keyword => lowerQuery.includes(keyword))) {
            matchedAnswer = item.answer;
            break;
          }
        }

        if (!matchedAnswer) {
          matchedAnswer = `Dạ, em chưa có thông tin chi tiết về vấn đề này. Tuy nhiên, Anh/Chị có thể liên hệ trực tiếp đến số Hotline **0387551111** để gặp trực tiếp kỹ thuật viên tư vấn, hoặc nhắn tin Zalo số này để bên em hỗ trợ nhanh nhất nhé! Cảm ơn Anh/Chị! 🙏`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: matchedAnswer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 700);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Calculate chat panel position dynamically relative to the button
  const getPanelStyle = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      return {
        position: 'fixed',
        left: 0,
        top: `${viewportTop}px`,
        width: '100vw',
        height: `${viewportHeight}px`,
        zIndex: 10000,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        animation: 'fadeInUp 0.3s ease-out'
      };
    }
    
    const panelWidth = 360;
    const panelHeight = 480;
    
    // Default: Open to the left of the button and slightly above
    let left = position.x - panelWidth - 15;
    let top = position.y - panelHeight + 45;

    // Boundary constraints: open to the right if too close to left edge
    if (left < 10) {
      left = position.x + 60;
    }
    // Open below if too close to top edge
    if (top < 10) {
      top = position.y + 60;
    }

    // Keep completely inside window boundaries
    left = Math.max(10, Math.min(left, window.innerWidth - panelWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - panelHeight - 10));

    return {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 9998,
      width: `${panelWidth}px`,
      height: `${panelHeight}px`,
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), 0 1px 8px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      animation: 'fadeInUp 0.3s ease-out'
    };
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════
          1. DRAGGABLE FLOATING ROBOT CHAT BUTTON
          ══════════════════════════════════════════════════ */}
      {/* Tooltip Helper Speech Bubble */}
      {!isOpen && showTooltip && (
        <div
          style={{
            position: 'fixed',
            left: position.x < window.innerWidth / 2 ? `${position.x + 70}px` : `${position.x - 220}px`,
            top: `${position.y + 10}px`,
            width: '200px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
            zIndex: 9998,
            fontSize: '12px',
            fontWeight: '500',
            lineHeight: '1.4',
            animation: 'tooltip-fade-in 0.3s ease-out forwards',
            pointerEvents: 'auto',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          <div onClick={() => { setIsOpen(true); setShowTooltip(false); }} style={{ cursor: 'pointer', flex: 1 }}>
            Tôi là trợ lý ảo, bấm vào tôi để được tư vấn!
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              fontSize: '10px',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            ✕
          </button>
          
          {/* Triangle pointer */}
          <div
            style={{
              position: 'absolute',
              top: '15px',
              width: '10px',
              height: '10px',
              backgroundColor: '#ffffff',
              transform: 'rotate(-45deg)',
              zIndex: -1,
              ...(position.x < window.innerWidth / 2 ? {
                left: '-6px',
                borderLeft: '1px solid #e2e8f0',
                borderTop: '1px solid #e2e8f0'
              } : {
                right: '-6px',
                borderRight: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0'
              })
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          1. DRAGGABLE FLOATING ROBOT CHAT BUTTON
          ══════════════════════════════════════════════════ */}
      <button
        onClick={handleButtonClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          outline: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          background: isOpen ? 'linear-gradient(135deg, #5046e5 0%, #6366f1 100%)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isOpen ? '0 0 15px rgba(99, 102, 241, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3)' : 'none',
          filter: isOpen ? 'none' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          transition: dragging ? 'none' : 'transform 0.2s',
          touchAction: 'none',
          animation: !isOpen && !dragging ? 'robot-pulse 2s infinite' : 'none'
        }}
        onMouseEnter={e => {
          if (!dragging) e.currentTarget.style.transform = 'scale(1.15) rotate(10deg)';
        }}
        onMouseLeave={e => {
          if (!dragging) e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
        }}
        title="Trợ lý ảo tư vấn"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <img src="/robot_icon.png" alt="Trợ lý ảo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}

        <style>{`
          @keyframes robot-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
          }
          @keyframes tooltip-fade-in {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.15);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0,0,0,0.3);
          }
          .robot-chat-input {
            font-size: 14px !important;
          }
          @media (max-width: 768px) {
            .robot-chat-input {
              font-size: 16px !important;
            }
          }
        `}</style>
      </button>

      {/* ══════════════════════════════════════════════════
          2. CUSTOMER SUPPORT CHAT PANEL
          ══════════════════════════════════════════════════ */}
      {isOpen && (
        <div style={getPanelStyle()}>
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #5046e5 0%, #6366f1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.6)'
                }}
              >
                <img src="/robot_icon.png" alt="Trợ lý ảo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Trợ Lý Ảo
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} title="Online"></span>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>Điện Lạnh Đông Triều 24H</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#ffffff',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.8
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Body */}
          <div
            className="custom-scrollbar"
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    backgroundColor: msg.sender === 'user' ? '#6366f1' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)',
                    fontSize: '13.5px',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-line',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  {msg.text}
                  <div
                    style={{
                      fontSize: '9.5px',
                      opacity: 0.7,
                      textAlign: 'right',
                      marginTop: '4px'
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '12px 12px 12px 2px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    height: '32px'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce-dot 1.4s infinite ease-in-out' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce-dot 1.4s infinite ease-in-out 0.2s' }}></span>
                  <span style={{ width: '6px', height: '6px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: 'bounce-dot 1.4s infinite ease-in-out 0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Options */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              flexShrink: 0
            }}
            className="custom-scrollbar"
          >
            <button
              onClick={() => handleSend('Bảng giá dịch vụ sửa chữa')}
              style={{
                padding: '5px 10px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: '#475569',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
            >
              🛠️ Bảng giá sửa chữa
            </button>
            <button
              onClick={() => handleSend('Chính sách bảo hành')}
              style={{
                padding: '5px 10px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: '#475569',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
            >
              🛡️ Chính sách bảo hành
            </button>
            <button
              onClick={() => handleSend('Sản phẩm nổi bật')}
              style={{
                padding: '5px 10px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: '#475569',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
            >
              ❄️ Sản phẩm đang bán
            </button>
            <button
              onClick={() => handleSend('Thông tin liên hệ')}
              style={{
                padding: '5px 10px',
                borderRadius: '20px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                color: '#475569',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
            >
              📞 Liên hệ
            </button>
          </div>

          {/* Footer Input */}
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: '#ffffff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="robot-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '24px',
                border: '1px solid #cbd5e1',
                outline: 'none',
                color: '#1e293b',
                transition: 'all 0.2s'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
              onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            />
            <button
              onClick={() => handleSend()}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#5046e5'; e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#6366f1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '1px' }}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bounce-dot and fadeInUp animation */}
      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
