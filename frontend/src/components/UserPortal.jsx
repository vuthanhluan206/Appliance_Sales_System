import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import {
  ShoppingCart, Trash2, Plus, Minus, Star, Sparkles, CheckCircle2,
  ClipboardList, Wrench, Tag, Package, X, ChevronRight, ChevronLeft, ChevronDown,
  Snowflake, Wind, Zap, MapPin, Calendar, Clock, Shield, Award,
  ShoppingBag, Eye, ArrowLeft, ThumbsUp, MessageSquare, RefreshCw, Phone, Truck,
  Search, Camera, Heart
} from '../Icons';

/* ── Icon map for categories ─────────────────────────── */
const CAT_ICONS = { 'máy lạnh': Snowflake, 'điều hòa': Wind, 'tủ lạnh': Package, 'máy giặt': Zap, 'linh kiện': Wrench };
function getCatIcon(name = '') {
  const l = name.toLowerCase();
  for (const [k, I] of Object.entries(CAT_ICONS)) if (l.includes(k)) return I;
  return Package;
}

const STATUS_CFG = {
  PENDING:              { label: 'Chờ duyệt',     bg: 'var(--brand-yellow-light)', color: 'var(--warning)' },
  INSTALLING_REPAIRING: { label: 'Đang thực hiện', bg: 'var(--brand-blue-light)',   color: 'var(--brand-blue)' },
  COMPLETED:            { label: 'Hoàn thành',     bg: 'var(--success-bg)',         color: 'var(--success)' },
  CANCELLED:            { label: 'Đã hủy',         bg: 'var(--danger-bg)',          color: 'var(--danger)' },
};

const fmtVnd = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const PostMediaCarousel = ({ mediaUrls, mediaType, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const urls = mediaUrls ? mediaUrls.split(',').filter(Boolean) : [];
  
  if (urls.length === 0) return null;
  if (urls.length === 1) {
    const url = urls[0];
    return (
      <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid var(--border)' }}>
        {mediaType === 'VIDEO' ? (
          <video src={url} controls style={{ width: '100%', maxHeight: '450px', objectFit: 'contain' }} />
        ) : (
          <img src={url} alt={title} style={{ width: '100%', maxHeight: '450px', objectFit: 'cover' }} />
        )}
      </div>
    );
  }

  const nextMedia = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev + 1) % urls.length);
  };

  const prevMedia = (e) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev - 1 + urls.length) % urls.length);
  };

  return (
    <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', background: '#000', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '450px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {mediaType === 'VIDEO' ? (
          <video key={activeIndex} src={urls[activeIndex]} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <img src={urls[activeIndex]} alt={`${title}-${activeIndex}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <button 
        onClick={prevMedia} 
        style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 32, height: 32,
          borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10
        }}
      >
        <ChevronLeft size={16} />
      </button>
      <button 
        onClick={nextMedia} 
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', width: 32, height: 32,
          borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10
        }}
      >
        <ChevronRight size={16} />
      </button>

      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, zIndex: 10, background: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: 'var(--r-full)'
      }}>
        {urls.map((_, idx) => (
          <div
            key={idx}
            onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: activeIndex === idx ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default function UserPortal({
  currentUser,
  triggerLogin,
  searchQuery,
  setSearchQuery,
  onCartCountChange,
  viewOnly = false,
  activeView,
  setActiveView,
  activeCategory,
  setActiveCategory
}) {
  const currentUserId = currentUser?.id || null;

  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [services,   setServices]   = useState([]);
  const [reviews,    setReviews]    = useState([]);
  const [cart,       setCart]       = useState([]);
  const [orders,     setOrders]     = useState([]);

  // Product detail page
  const [detailProduct,  setDetailProduct]  = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Checkout
  const [address,        setAddress]        = useState('456 Đường Nguyễn Huệ, Đông Triều, QN');
  const [notes,          setNotes]          = useState('');
  const [serviceType,    setServiceType]    = useState('DELIVERY_AND_INSTALLATION');
  const [selectedServs,  setSelectedServs]  = useState([]);
  const [apptDate,       setApptDate]       = useState('');
  const [apptTime,       setApptTime]       = useState('09:00 - 11:00');
  const [couponCode,     setCouponCode]     = useState('');
  const [appliedCoupon,  setAppliedCoupon]  = useState(null);
  const [discounts,      setDiscounts]      = useState([]);
  const [claimedCodes,   setClaimedCodes]   = useState(() => {
    try {
      const saved = localStorage.getItem(`claimed_vouchers_${currentUser?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync claimedCodes from localStorage when currentUser changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`claimed_vouchers_${currentUser?.id || 'guest'}`);
      setClaimedCodes(saved ? JSON.parse(saved) : []);
    } catch {
      setClaimedCodes([]);
    }
  }, [currentUser]);

  // Review
  const [reviewOrderId,  setReviewOrderId]  = useState(null);
  const [reviewProdId,   setReviewProdId]   = useState(null);
  const [reviewServId,   setReviewServId]   = useState(null);
  const [prodRating,     setProdRating]     = useState(5);
  const [servRating,     setServRating]     = useState(5);
  const [reviewContent,  setReviewContent]  = useState('');

  // Booking service separately
  const [bookingService, setBookingService] = useState(null);
  const [expandedServiceIds, setExpandedServiceIds] = useState([]);
  const [detailService, setDetailService] = useState(null);
  const [bookAddress,    setBookAddress]    = useState(currentUser?.address || '456 Đường Nguyễn Huệ, Đông Triều, QN');
  const [bookDate,       setBookDate]       = useState('');
  const [bookTime,       setBookTime]       = useState('09:00 - 11:00');
  const [bookNotes,      setBookNotes]      = useState('');

  const [message, setMessage] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [likedPosts, setLikedPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('likedPosts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await api.getPosts();
      const data = res.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const handleLikePost = async (postId) => {
    if (likedPosts.includes(postId)) {
      showNotification('Bạn đã thích bài viết này rồi!', 'info');
      return;
    }
    try {
      const res = await api.likePost(postId);
      if (res && res.status === 'success') {
        const updatedLiked = [...likedPosts, postId];
        setLikedPosts(updatedLiked);
        localStorage.setItem('likedPosts', JSON.stringify(updatedLiked));
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
        showNotification('Cảm ơn bạn đã yêu thích bài viết! ❤️');
      }
    } catch (err) {
      console.error('Error liking post:', err);
      showNotification('Không thể bày tỏ cảm xúc lúc này', 'error');
    }
  };

  useEffect(() => {
    if (activeView === 'work-process') {
      fetchPosts();
    }
  }, [activeView, fetchPosts]);

  useEffect(() => {
    if (currentUser?.address) {
      setBookAddress(currentUser.address);
    }
  }, [currentUser]);

  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderValue) {
      let subtotal = cart.reduce((s, i) => s + i.quantity * (products.find(p => p.id === i.productId)?.price || 0), 0);
      selectedServs.forEach(sid => { subtotal += services.find(s => s.id === sid)?.basePrice || 0; });
      if (subtotal < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
        showNotification(`Đã bỏ áp dụng mã ${appliedCoupon.code} vì tổng đơn hàng chưa đạt tối thiểu ${fmtVnd(appliedCoupon.minOrderValue)}`, 'warning');
      }
    }
  }, [cart, selectedServs, appliedCoupon, products, services]);


  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play slider
  useEffect(() => {
    if (activeView !== 'products' && activeView !== 'services') return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeView]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % 3);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + 3) % 3);

  const gotoCategory = (name) => {
    const cat = categories.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (cat) {
      setActiveCategory(cat.id);
      setActiveView('products');
    } else {
      setActiveCategory(null);
      setActiveView('products');
    }
  };

  /* ── Initial data fetch ──────────────────────────── */
  useEffect(() => {
    setProductPage(1);
  }, [activeCategory, searchQuery]);

  useEffect(() => { fetchInitialData(); }, []);

  async function fetchInitialData() {
    try {
      const [cats, prods, servs, revs] = await Promise.all([
        api.getCategories().catch(() => ({ data: [] })),
        api.getProducts().catch(() => ({ data: [] })),
        api.getServices().catch(() => ({ data: [] })),
        api.getReviews().catch(() => ({ data: [] }))
      ]);
      setCategories(cats.data || []);
      setProducts(prods.data || []);
      setServices(servs.data || []);
      setReviews(revs.data || []);
    } catch (err) {
      console.error('Error loading public catalog data:', err);
    }

    try {
      const discs = await api.getDiscounts();
      setDiscounts(discs.data || []);
    } catch (err) {
      // Expected for guests / non-logged in users
      setDiscounts([]);
    }
  }

  /* ── Cart sync when user logs in ─────────────────── */
  useEffect(() => {
    if (currentUserId && !viewOnly) {
      (async () => {
        if (cart.some(i => String(i.id).startsWith('local-'))) {
          for (const item of cart) {
            try { await api.addToCart({ userId: currentUserId, productId: item.productId, quantity: item.quantity }); }
            catch {}
          }
        }
        fetchCart(); fetchUserOrders();
      })();
    } else if (!currentUserId) { setCart([]); setOrders([]); }
  }, [currentUserId]);

  useEffect(() => { onCartCountChange?.(cart.length); }, [cart]);

  async function fetchCart() {
    if (!currentUserId || viewOnly) return;
    try { const r = await api.getCart(currentUserId); setCart(r.data || []); } catch {}
  }
  async function fetchUserOrders() {
    if (!currentUserId) return;
    try { const r = await api.getOrdersByUser(currentUserId); setOrders(r.data || []); } catch {}
  }

  /* ── Cart actions ────────────────────────────────── */
  const handleAddToCart = async (product, quantity = 1) => {
    if (viewOnly) { showNotification('Bạn đang ở chế độ xem – không thể thêm vào giỏ', 'error'); return; }
    if (!currentUserId) {
      triggerLogin();
      return;
    }
    try { await api.addToCart({ userId: currentUserId, productId: product.id, quantity: quantity }); fetchCart(); showNotification('Đã thêm vào giỏ hàng!'); }
    catch (err) { showNotification(api.extractErrorMessage(err, 'Lỗi khi thêm vào giỏ'), 'error'); }
  };

  const handleUpdateQty = async (itemId, qty, delta) => {
    const nq = qty + delta;
    if (nq < 1) return;
    if (!currentUserId) { setCart(p => p.map(i => i.id === itemId ? { ...i, quantity: nq } : i)); return; }
    try { await api.updateCartItem(itemId, { quantity: nq }); fetchCart(); } catch {}
  };

  const handleDeleteItem = async (itemId) => {
    if (!currentUserId) { setCart(p => p.filter(i => i.id !== itemId)); showNotification('Đã xóa!'); return; }
    try { await api.deleteCartItem(itemId); fetchCart(); showNotification('Đã xóa khỏi giỏ!'); } catch {}
  };

  const handleClaimVoucher = (code) => {
    if (!currentUserId) {
      triggerLogin();
      return;
    }
    const currentClaimed = [...claimedCodes];
    if (currentClaimed.includes(code.toUpperCase())) {
      showNotification('Bạn đã nhận voucher này rồi!', 'info');
      return;
    }
    const updatedClaimed = [...currentClaimed, code.toUpperCase()];
    setClaimedCodes(updatedClaimed);
    localStorage.setItem(`claimed_vouchers_${currentUser?.id}`, JSON.stringify(updatedClaimed));
    showNotification(`Nhận voucher ${code} thành công! 🎉`);
    
    // Refresh discounts lists
    fetchInitialData();
  };

  const getVoucherDiscountAmount = (coupon, cartItems) => {
    if (!coupon) return 0;
    
    let eligibleSubtotal = 0;
    const cond = coupon.applicableConditions || 'ALL';
    
    cartItems.forEach(item => {
      const p = products.find(prod => prod.id === item.productId);
      if (!p) return;
      
      let isEligible = false;
      if (cond === 'ALL') {
        isEligible = true;
      } else if (cond.startsWith('CATEGORY:')) {
        const catId = parseInt(cond.split(':')[1]);
        if (p.categoryId === catId) isEligible = true;
      } else if (cond.startsWith('PRODUCT:')) {
        const productIds = cond.split(':')[1].split(',').map(id => parseInt(id));
        if (productIds.includes(p.id)) isEligible = true;
      }
      
      if (isEligible) {
        eligibleSubtotal += item.quantity * p.price;
      }
    });

    if (eligibleSubtotal === 0) return 0;

    if (coupon.discountType === 'PERCENTAGE') {
      return eligibleSubtotal * (coupon.discountValue / 100);
    } else {
      return Math.min(coupon.discountValue, eligibleSubtotal);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const d = await api.getDiscountByCode(couponCode.trim().toUpperCase());
      if (d.data) {
        // Claim check
        if (!claimedCodes.includes(d.data.code.toUpperCase())) {
          showNotification('Bạn chưa nhận voucher này. Hãy nhận voucher tại mục Voucher ở trang chủ!', 'error');
          return;
        }

        let subtotal = cart.reduce((s, i) => s + i.quantity * (products.find(p => p.id === i.productId)?.price || 0), 0);
        selectedServs.forEach(sid => { subtotal += services.find(s => s.id === sid)?.basePrice || 0; });

        if (d.data.minOrderValue && subtotal < d.data.minOrderValue) {
          showNotification(`Đơn hàng tối thiểu phải từ ${fmtVnd(d.data.minOrderValue)} để sử dụng mã này`, 'error');
          return;
        }

        // Scope check
        const discountAmt = getVoucherDiscountAmount(d.data, cart);
        if (discountAmt === 0) {
          showNotification('Voucher không áp dụng cho các sản phẩm trong giỏ hàng hiện tại', 'error');
          return;
        }

        setAppliedCoupon(d.data); 
        showNotification(`Áp dụng mã ${d.data.code} thành công!`); 
      }
    } catch { showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error'); }
  };

  const applyVoucherDirectly = async (code) => {
    setCouponCode(code);
    try {
      const d = await api.getDiscountByCode(code.trim().toUpperCase());
      if (d.data) {
        if (!claimedCodes.includes(d.data.code.toUpperCase())) {
          showNotification('Bạn chưa nhận voucher này. Hãy nhận voucher tại mục Voucher ở trang chủ!', 'error');
          return;
        }

        let subtotal = cart.reduce((s, i) => s + i.quantity * (products.find(p => p.id === i.productId)?.price || 0), 0);
        selectedServs.forEach(sid => { subtotal += services.find(s => s.id === sid)?.basePrice || 0; });

        if (d.data.minOrderValue && subtotal < d.data.minOrderValue) {
          showNotification(`Đơn hàng tối thiểu phải từ ${fmtVnd(d.data.minOrderValue)} để sử dụng mã này`, 'error');
          return;
        }

        const discountAmt = getVoucherDiscountAmount(d.data, cart);
        if (discountAmt === 0) {
          showNotification('Voucher không áp dụng cho các sản phẩm trong giỏ hàng hiện tại', 'error');
          return;
        }

        setAppliedCoupon(d.data);
        showNotification(`Áp dụng mã ${d.data.code} thành công!`);
      }
    } catch {
      showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
    }
  };

  const getCartTotal = () => {
    let t = cart.reduce((s, i) => s + i.quantity * (products.find(p => p.id === i.productId)?.price || 0), 0);
    selectedServs.forEach(sid => { t += services.find(s => s.id === sid)?.basePrice || 0; });
    
    if (appliedCoupon) {
      const minOrderVal = appliedCoupon.minOrderValue || 0;
      if (t >= minOrderVal) {
        const discountAmt = getVoucherDiscountAmount(appliedCoupon, cart);
        t = Math.max(0, t - discountAmt);
      }
    }
    return t;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!currentUserId) { triggerLogin(); return; }
    if (cart.length === 0) { showNotification('Giỏ hàng trống!', 'error'); return; }
    try {
      const orderItems = cart.map(i => ({ productId: i.productId, quantity: i.quantity }));
      
      let finalNotes = notes;
      if (apptDate) {
        finalNotes = `[Hẹn: ${apptDate} (${apptTime})] ${notes || ''}`;
      }
      finalNotes = finalNotes ? `${finalNotes} - Thanh toán sau khi lắp đặt và hoàn thành dịch vụ` : 'Thanh toán sau khi lắp đặt và hoàn thành dịch vụ';
      
      let total = getCartTotal();
      const newOrder = await api.createOrder({ userId: currentUserId, deliveryAddress: address, notes: finalNotes, serviceType, orderItems, totalPrice: total });
      const orderId = newOrder.data.id;
      for (const sid of selectedServs) await api.addServiceToOrder({ orderId, serviceId: sid, notes: 'Dịch vụ đi kèm' });
      await api.createPayment({ orderId, amount: total, paymentMethod: serviceType === 'REPAIR' ? 'CASH' : 'BANK_TRANSFER', notes: 'Thanh toán khi đặt đơn' });
      await api.clearCart(currentUserId);
      setNotes(''); setSelectedServs([]); setApptDate(''); setAppliedCoupon(null); setCouponCode('');
      showNotification('Đặt hàng thành công! Đơn đang chờ duyệt 🎉');
      fetchCart(); fetchUserOrders(); setActiveView('checkout-success');
    } catch (err) { showNotification(api.extractErrorMessage(err, 'Có lỗi xảy ra khi đặt hàng'), 'error'); }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await api.createReview({
        userId: currentUserId,
        orderId: reviewOrderId,
        productId: reviewProdId,
        serviceId: reviewServId,
        productRating: reviewProdId ? prodRating : 5,
        serviceRating: servRating,
        content: reviewContent
      });
      setReviewOrderId(null);
      setReviewProdId(null);
      setReviewServId(null);
      setReviewContent('');
      showNotification('Cảm ơn đánh giá của bạn! 🌟');
      fetchUserOrders();
      fetchInitialData();
    } catch (err) {
      showNotification(api.extractErrorMessage(err, 'Không thể gửi đánh giá'), 'error');
    }
  };

  const handleBookServiceSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) { triggerLogin(); return; }
    if (!bookDate) { showNotification('Vui lòng chọn ngày hẹn!', 'error'); return; }
    if (!bookAddress) { showNotification('Vui lòng nhập địa chỉ!', 'error'); return; }

    try {
      const finalNotes = `[Hẹn: ${bookDate} (${bookTime})] ${bookNotes || ''} - Thanh toán sau khi lắp đặt và hoàn thành dịch vụ`;
      const newOrder = await api.createOrder({
        userId: currentUserId,
        deliveryAddress: bookAddress,
        notes: finalNotes,
        serviceType: 'REPAIR',
        orderItems: [],
        totalPrice: bookingService.basePrice
      });
      const orderId = newOrder.data.id;

      await api.addServiceToOrder({
        orderId,
        serviceId: bookingService.id,
        notes: 'Đặt lịch dịch vụ kỹ thuật riêng'
      });

      await api.createPayment({
        orderId,
        amount: bookingService.basePrice,
        paymentMethod: 'CASH',
        notes: 'Thanh toán tiền mặt sau khi làm xong'
      });

      setBookingService(null);
      setBookNotes('');
      setBookDate('');
      showNotification('Đặt lịch dịch vụ kỹ thuật thành công! Đơn hàng đang chờ duyệt 🎉');
      fetchUserOrders();
      setActiveView('checkout-success');
    } catch (err) {
      showNotification(api.extractErrorMessage(err, 'Lỗi khi đặt lịch dịch vụ'), 'error');
    }
  };

  /* ── Product detail ──────────────────────────────── */
  const openDetail = (prod) => {
    setDetailProduct(prod);
    const prodRevs = reviews.filter(r => r.productId === prod.id);
    setProductReviews(prodRevs);
    setDetailQuantity(1);
    setActiveImageIndex(0);
    setActiveView('product-detail');
  };

  const openServiceDetail = (serv) => {
    setDetailService(serv);
    setActiveView('service-detail');
  };

  /* ── Helpers ─────────────────────────────────────── */
  const getVisiblePages = (current, total) => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    if (current > 3) pages.push('...');
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (current < total - 2) pages.push('...');
    if (!pages.includes(total)) pages.push(total);
    return pages;
  };

  function showNotification(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory ? p.categoryId === activeCategory : true;
    const matchSearch = searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchCat && matchSearch;
  });

  const productPageSize = 20;
  const totalProductPages = Math.ceil(filteredProducts.length / productPageSize) || 1;
  const currentProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = filteredProducts.slice((currentProductPage - 1) * productPageSize, currentProductPage * productPageSize);

  const avgRating = (prodId) => {
    const rs = reviews.filter(r => r.productId === prodId);
    if (!rs.length) return null;
    return (rs.reduce((s, r) => s + (r.productRating || 5), 0) / rs.length).toFixed(1);
  };

  const avgServiceRating = (serviceId) => {
    const rs = reviews.filter(r => r.serviceId === serviceId);
    if (!rs.length) return null;
    return (rs.reduce((s, r) => s + (r.serviceRating || 5), 0) / rs.length).toFixed(1);
  };



  /* ════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════ */
  return (
    <div className="animate-fade-in">

      {/* Toast */}
      {message && (
        <div className={`toast ${message.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <CheckCircle2 size={17} /> <span>{message.text}</span>
        </div>
      )}      {/* ════════════════════════════════════════════
          HERO BANNER
          ════════════════════════════════════════════ */}
      {(activeView === 'products' || activeView === 'services' || activeView === 'vouchers-list') && (
        <>
          <div className="hero-banner">
          <div className="hero-banner-slider">
            
            {/* Slide Navigation Left/Right Arrows */}
            <button className="slider-arrow slider-arrow-left" onClick={prevSlide} aria-label="Previous Slide">
              <ChevronLeft size={18} />
            </button>
            <button className="slider-arrow slider-arrow-right" onClick={nextSlide} aria-label="Next Slide">
              <ChevronRight size={18} />
            </button>

            {/* Dots Indicator */}
            <div className="slider-dots">
              {[0, 1, 2].map(idx => (
                <button
                  key={idx}
                  className={`slider-dot ${currentSlide === idx ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* SLIDE 1: Quạt Điều Hòa (Reference image layout) */}
            {currentSlide === 0 && (
              <div className="hero-slide animate-fade" style={{ background: 'linear-gradient(130deg, #0266da 0%, #0099ff 55%, #00b8d9 100%)' }}>
                <div className="hero-slide-deco-grid" />
                <div className="hero-slide-deco-green" />
                <div className="hero-slide-deco-orange" />
                <div className="hero-slide-deco-circle" />
                <div className="hero-slide-deco-circle-inner" />
                
                {/* Left content */}
                <div className="hero-slide-content">
                  {/* Brand Logo */}
                  <div className="banner-logo">
                    <div className="flex-center" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-yellow)', boxShadow: '0 0 12px rgba(255,171,0,.6)' }}>
                      <Snowflake size={16} color="#172B4D" style={{ animation: 'spin 6s infinite linear' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>Điện Lạnh</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-yellow)', letterSpacing: '0.5px' }}>Đông Triều 24h</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="slide-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16, textShadow: '0 2px 4px rgba(0,0,0,0.15)', letterSpacing: '-0.02em' }}>
                    QUẠT ĐIỀU HÒA<br />
                    <span style={{ color: 'var(--brand-yellow)' }}>GIÁ CHỈ TỪ 179K</span>
                  </div>

                  {/* Promo Boxes */}
                  <div className="promo-boxes">
                    <div className="promo-box promo-box-red">
                      <span className="promo-box-label">Giảm thêm</span>
                      <span className="promo-box-value">10%</span>
                    </div>
                    <div className="promo-box promo-box-orange">
                      <span className="promo-box-label">Tặng quà</span>
                      <span className="promo-box-value">500k</span>
                    </div>
                    <div className="promo-box promo-box-darkred">
                      <span className="promo-box-label">Áp dụng</span>
                      <span className="promo-box-desc" style={{ fontSize: '0.65rem', fontWeight: 700 }}>đơn hàng từ 2 triệu</span>
                    </div>
                  </div>

                  {/* Quality Badges */}
                  <div className="quality-badges">
                    <div className="quality-badge-item">
                      <Zap size={13} color="var(--brand-yellow)" />
                      <span>Phản hồi nhanh (60 phút)</span>
                    </div>
                    <div className="quality-badge-item">
                      <CheckCircle2 size={13} color="#4ade80" />
                      <span>Chính hãng 100% (CO/CQ)</span>
                    </div>
                    <div className="quality-badge-item">
                      <Award size={13} color="var(--brand-yellow)" />
                      <span>Bảo hành tận nơi</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                    <button className="btn btn-yellow btn-lg" onClick={() => gotoCategory('điều hòa')} style={{ borderRadius: 'var(--r-full)', fontWeight: 800 }}>
                      MUA SẮM NGAY
                    </button>
                    <button className="btn" style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.5)', borderRadius: 'var(--r-full)', fontWeight: 600 }} onClick={() => setActiveView('services')}>
                      ĐẶT DỊCH VỤ KỸ THUẬT
                    </button>
                    <a href="tel:0387551111" className="hotline-pill">
                      <Phone size={13} /> LIÊN HỆ HOTLINE 0387551111
                    </a>
                  </div>
                </div>

                {/* Right image */}
                <div className="hero-slide-showcase">
                  <img src="/cooling_appliances.png" alt="Quạt điều hòa Điện Lạnh Đông Triều" className="hero-showcase-img" />
                </div>
              </div>
            )}

            {/* SLIDE 2: Máy Lạnh / Điều Hòa */}
            {currentSlide === 1 && (
              <div className="hero-slide animate-fade" style={{ background: 'linear-gradient(130deg, #091e42 0%, #0052cc 60%, #0065ff 100%)' }}>
                <div className="hero-slide-deco-grid" />
                <div className="hero-slide-deco-circle" style={{ left: '40%' }} />
                
                <div className="hero-slide-content">
                  <div className="banner-logo">
                    <div className="flex-center" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 12px rgba(0,184,217,.5)' }}>
                      <Wind size={16} color="#172B4D" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>MÁY LẠNH CHÍNH HÃNG</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary)', letterSpacing: '1px' }}>ĐẠI LÝ PHÂN PHỐI ỦY QUYỀN</span>
                    </div>
                  </div>

                  <div className="slide-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em' }}>
                    ĐIỀU HÒA MÁY LẠNH<br />
                    <span style={{ color: 'var(--secondary)' }}>GIẢM GIÁ ĐẾN 30%</span>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
                    Phân phối chính hãng Daikin, Panasonic, Casper, LG. Hỗ trợ khảo sát tận nơi miễn phí. Tặng combo vật tư phụ + miễn phí công lắp đặt trị giá 800K.
                  </p>

                  <div className="quality-badges" style={{ marginBottom: 24 }}>
                    <div className="quality-badge-item">
                      <CheckCircle2 size={13} color="#4ade80" />
                      <span>Miễn phí công lắp đặt</span>
                    </div>
                    <div className="quality-badge-item">
                      <Truck size={13} color="var(--brand-yellow)" />
                      <span>Giao hàng siêu tốc 2h</span>
                    </div>
                    <div className="quality-badge-item">
                      <Shield size={13} color="var(--secondary)" />
                      <span>Bảo hành chính hãng 2 năm</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => gotoCategory('máy lạnh')} style={{ background: 'var(--secondary)', color: 'var(--text-primary)', borderRadius: 'var(--r-full)', fontWeight: 800 }}>
                      MUA MÁY LẠNH NGAY
                    </button>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 'var(--r-full)', fontWeight: 600 }} onClick={() => setActiveView('services')}>
                      ĐĂNG KÝ LẮP ĐẶT
                    </button>
                    <a href="tel:0387551111" className="hotline-pill">
                      <Phone size={13} /> HOTLINE 0387551111
                    </a>
                  </div>
                </div>

                <div className="hero-slide-showcase">
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&fit=crop" alt="Điều hòa máy lạnh chính hãng" className="hero-showcase-img" style={{ width: '85%', borderRadius: 'var(--r-lg)' }} />
                </div>
              </div>
            )}

            {/* SLIDE 3: Dịch vụ bảo trì / Sửa chữa */}
            {currentSlide === 2 && (
              <div className="hero-slide animate-fade" style={{ background: 'linear-gradient(130deg, #091e42 0%, #0052cc 50%, #00875a 100%)' }}>
                <div className="hero-slide-deco-grid" />
                <div className="hero-slide-deco-circle-inner" style={{ left: '42%' }} />
                
                <div className="hero-slide-content">
                  <div className="banner-logo">
                    <div className="flex-center" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--brand-yellow)', boxShadow: '0 0 12px rgba(255,171,0,.5)' }}>
                      <Wrench size={16} color="#172B4D" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>DỊCH VỤ ĐIỆN LẠNH</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-yellow)', letterSpacing: '1.5px' }}>CHUYÊN NGHIỆP - TẬN TÂM</span>
                    </div>
                  </div>

                  <div className="slide-title" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-0.02em' }}>
                    SỬA CHỮA BẢO DƯỠNG<br />
                    <span style={{ color: 'var(--brand-yellow)' }}>ĐIỀU HÒA - TỦ LẠNH - MÁY GIẶT</span>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,.8)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
                    Thực hiện nhanh chóng tại nhà. Kỹ thuật viên tay nghề cao đến sau 30-60 phút gọi. Cam kết linh kiện chính hãng 100%, bảo hành lâu dài từ 3 đến 12 tháng.
                  </p>

                  <div className="quality-badges" style={{ marginBottom: 24 }}>
                    <div className="quality-badge-item">
                      <Clock size={13} color="#4ade80" />
                      <span>Có mặt trong 60 phút</span>
                    </div>
                    <div className="quality-badge-item">
                      <Wrench size={13} color="var(--brand-yellow)" />
                      <span>Thợ trung thực, tay nghề cao</span>
                    </div>
                    <div className="quality-badge-item">
                      <Shield size={13} color="var(--secondary)" />
                      <span>Linh kiện chính hãng 100%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button className="btn btn-yellow btn-lg" onClick={() => setActiveView('services')} style={{ borderRadius: 'var(--r-full)', fontWeight: 800 }}>
                      ĐẶT LỊCH KỸ THUẬT NGAY
                    </button>
                    <a href="tel:0387551111" className="hotline-pill">
                      <Phone size={13} /> GỌI THỢ NGAY: 0387551111
                    </a>
                  </div>
                </div>

                <div className="hero-slide-showcase">
                  <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&fit=crop" alt="Dịch vụ điện lạnh chuyên nghiệp" className="hero-showcase-img" style={{ width: '85%', borderRadius: 'var(--r-lg)' }} />
                </div>
              </div>
            )}

          </div>
        </div>
          
          {/* Homepage SEO Header (Single h1 per page) */}
          <div className="homepage-seo-intro" style={{
            padding: '24px',
            borderRadius: 'var(--r-xl)',
            background: 'linear-gradient(135deg, var(--brand-blue-light) 0%, rgba(235, 242, 255, 0.4) 100%)',
            border: '1px solid rgba(0, 82, 204, 0.1)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px',
              borderRadius: '50%', background: 'rgba(0, 82, 204, 0.04)', zIndex: 0
            }} />
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--brand-blue)',
              marginBottom: '8px',
              lineHeight: 1.35,
              position: 'relative',
              zIndex: 1
            }}>
              Sửa chữa, lắp đặt điều hòa, máy giặt, bình nóng lạnh tại Đông Triều
            </h1>
            <p style={{
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
              position: 'relative',
              zIndex: 1
            }}>
              Điện Lạnh 24h chuyên cung cấp dịch vụ sửa chữa, bảo dưỡng, lắp đặt điều hòa, máy giặt, bình nóng lạnh uy tín, chuyên nghiệp tại Đông Triều. Đội ngũ kỹ thuật viên tay nghề cao, có mặt nhanh chóng sau 30 phút, cam kết linh kiện chính hãng, bảo hành dài hạn. Hotline: <strong>0387.551.111</strong>
            </p>
          </div>
        </>
      )}
      {/* ════════════════════════════════════════════
          LAYOUT: Sidebar + Main
          ════════════════════════════════════════════ */}
      <div className="portal-layout" style={(activeView === 'work-process' || activeView === 'checkout-success' || activeView === 'cart' || activeView === 'book-service') ? { gridTemplateColumns: '1fr' } : {}}>

        {/* ── LEFT SIDEBAR ─────────────────────────── */}
        {activeView !== 'work-process' && activeView !== 'checkout-success' && activeView !== 'cart' && activeView !== 'book-service' && (
          <div className="portal-sidebar">

            {/* Category filter */}
            <div className="card-flat" style={{ padding: '16px 12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '0 6px', marginBottom: 10 }}>
                DANH MỤC SẢN PHẨM
              </div>
              <nav className="sidebar-nav">
                <button className={`sidebar-nav-item ${activeCategory === null && (activeView === 'products' || activeView === 'product-detail') ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(null); setActiveView('products'); }}>
                  <Package size={15} /> Tất cả sản phẩm
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '1px 7px', borderRadius: 'var(--r-full)' }}>{products.length}</span>
                </button>
                {categories.map(cat => {
                  const Icon = getCatIcon(cat.name);
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button key={cat.id}
                      className={`sidebar-nav-item ${activeCategory === cat.id && (activeView === 'products' || activeView === 'product-detail') ? 'active' : ''}`}
                      onClick={() => { setActiveCategory(cat.id); setActiveView('products'); }}>
                      <Icon size={15} />
                      <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{cat.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '1px 6px', borderRadius: 'var(--r-full)', flexShrink: 0 }}>{count}</span>
                    </button>
                  );
                })}
                <button className={`sidebar-nav-item ${activeView === 'vouchers-list' ? 'active' : ''}`}
                  onClick={() => { setActiveCategory(null); setActiveView('vouchers-list'); }}
                  style={{ color: 'var(--purple)', fontWeight: activeView === 'vouchers-list' ? 700 : 500 }}
                >
                  <Tag size={15} color="var(--purple)" /> Khuyến mãi / Voucher
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--purple)', background: 'var(--purple-bg)', padding: '1px 7px', borderRadius: 'var(--r-full)', fontWeight: 800 }}>{discounts.length}</span>
                </button>
              </nav>
            </div>

            {/* Services action */}
            <div className="card-flat" style={{ padding: '16px 12px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '0 6px', marginBottom: 10 }}>
                DỊCH VỤ & NHẬT KÝ
              </div>
              <nav className="sidebar-nav">
                <button className={`sidebar-nav-item ${activeView === 'services' ? 'active' : ''}`} onClick={() => setActiveView('services')}>
                  <Wrench size={15} /> Dịch vụ kỹ thuật
                </button>
                <button className={`sidebar-nav-item ${activeView === 'work-process' ? 'active' : ''}`} onClick={() => { setActiveView('work-process'); setActiveCategory(null); }}>
                  <Camera size={15} /> Quá trình làm việc
                </button>
              </nav>
            </div>

          </div>
        )}

        {/* ── RIGHT MAIN CONTENT ───────────────────── */}
        <div>

          {/* ─── VIEW: PRODUCTS ──────────────────── */}
          {(activeView === 'products' || activeView === 'vouchers-list') && (
            <div className="animate-fade-in">


              {/* Mobile Search Bar */}
              {activeView === 'products' && (
                <div className="mobile-search-container" style={{ marginBottom: 16, position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', padding: '8px 16px 8px 38px', fontSize: '0.875rem', width: '100%' }}
                  />
                </div>
              )}

              {/* Category filter pills (horizontal) */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <button className={`cat-btn ${activeCategory === null && activeView === 'products' ? 'active' : ''}`} onClick={() => { setActiveCategory(null); setActiveView('products'); }}>
                  <Package size={13} /> Tất cả
                </button>
                {categories.map(cat => {
                  const Icon = getCatIcon(cat.name);
                  return (
                    <button key={cat.id} className={`cat-btn ${activeCategory === cat.id && activeView === 'products' ? 'active' : ''}`} onClick={() => { setActiveCategory(cat.id); setActiveView('products'); }}>
                      <Icon size={13} /> {cat.name}
                    </button>
                  );
                })}
                <button className={`cat-btn ${activeView === 'vouchers-list' ? 'active' : ''}`} 
                  onClick={() => { setActiveCategory(null); setActiveView('vouchers-list'); }}
                  style={{ 
                    borderColor: 'var(--purple)', 
                    color: activeView === 'vouchers-list' ? '#fff' : 'var(--purple)', 
                    background: activeView === 'vouchers-list' ? 'var(--purple)' : 'transparent',
                    fontWeight: 700
                  }}
                >
                  <Tag size={13} /> Khuyến mãi / Voucher
                </button>
              </div>

              {activeView === 'vouchers-list' ? (
                <>
                  <div className="flex-between" style={{ marginBottom: 16 }}>
                    <h2 className="section-heading" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.1rem' }}>
                      Khuyến Mãi & Voucher Giảm Giá
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({discounts.length})</span>
                    </h2>
                    <button className="btn btn-ghost btn-sm" onClick={fetchInitialData} style={{ gap: 5 }}>
                      <RefreshCw size={13} /> Tải lại
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                    {discounts.map(d => {
                      const claimed = claimedCodes.includes(d.code.toUpperCase());
                      const isExpired = new Date(d.endDate) < new Date();
                      const isMaxed = d.usedCount >= d.maxUsages;
                      const isInactive = d.status !== 'ACTIVE' || isExpired || isMaxed;
                      
                      let conditionText = '';
                      const cond = d.applicableConditions || 'ALL';
                      if (cond === 'ALL') {
                        conditionText = 'Áp dụng cho tất cả sản phẩm.';
                      } else if (cond.startsWith('CATEGORY:')) {
                        const catId = parseInt(cond.split(':')[1]);
                        const catName = categories.find(c => c.id === catId)?.name || 'Danh mục sản phẩm';
                        conditionText = `Chỉ áp dụng cho các sản phẩm thuộc danh mục: ${catName}.`;
                      } else if (cond.startsWith('PRODUCT:')) {
                        const productIds = cond.split(':')[1].split(',').map(id => parseInt(id));
                        const productNames = products.filter(p => productIds.includes(p.id)).map(p => p.name).join(', ');
                        conditionText = `Chỉ áp dụng cho các sản phẩm: ${productNames || 'Sản phẩm cụ thể'}.`;
                      }

                      if (d.minOrderValue > 0) {
                        conditionText += ` Đơn hàng tối thiểu từ ${fmtVnd(d.minOrderValue)}.`;
                      }

                      return (
                        <div key={d.id} className="card" style={{ 
                          padding: 20, 
                          border: '1.5px dashed var(--purple)', 
                          borderRadius: 'var(--r-lg)',
                          background: claimed ? 'rgba(101, 84, 192, 0.04)' : 'var(--bg-surface)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 12,
                          opacity: isInactive ? 0.6 : 1,
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: isInactive ? 'var(--text-muted)' : 'var(--purple)' }} />

                          <div style={{ paddingLeft: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: isInactive ? 'var(--text-secondary)' : 'var(--purple)', letterSpacing: '.02em' }}>
                                {d.discountType === 'PERCENTAGE' ? `GIẢM ${d.discountValue}%` : `GIẢM ${fmtVnd(d.discountValue)}`}
                              </span>
                              <span className={`badge ${isInactive ? 'badge-gray' : (claimed ? 'badge-green' : 'badge-purple')}`} style={{ fontSize: '0.72rem' }}>
                                {isInactive ? 'Hết hạn/Hết lượt' : (claimed ? '✓ Đã nhận' : 'Chưa nhận')}
                              </span>
                            </div>
                            
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: 8, color: 'var(--text-primary)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                              Mã: <span style={{ color: 'var(--purple)', background: 'var(--purple-bg)', padding: '2px 8px', borderRadius: 'var(--r-sm)', fontSize: '0.9rem' }}>{d.code}</span>
                            </div>

                            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.4 }}>
                              <strong>Điều kiện:</strong> {conditionText}
                            </div>

                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                              Hạn dùng: {new Date(d.endDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>

                          <div style={{ paddingLeft: 8, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                            <button
                              disabled={isInactive || claimed}
                              onClick={() => handleClaimVoucher(d.code)}
                              className={`btn ${claimed ? 'btn-secondary' : 'btn-primary'}`}
                              style={{
                                background: claimed ? 'var(--bg-page)' : 'var(--purple)',
                                color: claimed ? 'var(--text-muted)' : '#fff',
                                borderRadius: 'var(--r-full)',
                                fontSize: '0.78rem',
                                padding: '6px 16px',
                                fontWeight: 700,
                                border: 'none',
                                boxShadow: claimed ? 'none' : '0 4px 10px rgba(101, 84, 192, 0.3)'
                              }}
                            >
                              {claimed ? 'Đã nhận thành công' : 'Nhận Voucher'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {discounts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                      <Tag size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                      <div>Hiện tại chưa có chương trình khuyến mãi nào được phát hành.</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex-between" style={{ marginBottom: 16 }}>
                    <h2 className="section-heading" style={{ margin: 0, border: 'none', padding: 0, fontSize: '1.1rem' }}>
                      {activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'Tất Cả Sản Phẩm'}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({filteredProducts.length})</span>
                    </h2>
                    <button className="btn btn-ghost btn-sm" onClick={fetchInitialData} style={{ gap: 5 }}>
                      <RefreshCw size={13} /> Tải lại
                    </button>
                  </div>

                  {paginatedProducts.length === 0 ? (
                    <div className="empty-state card-flat" style={{ padding: 48 }}>
                      <Package size={64} /><p style={{ fontWeight: 700, fontSize: '1rem', marginTop: 12 }}>Không tìm thấy sản phẩm</p>
                      <p style={{ fontSize: '0.82rem', marginTop: 4 }}>Thử chọn danh mục khác hoặc tìm kiếm với từ khóa khác</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid-auto">
                        {paginatedProducts.map(prod => {
                          const rating = avgRating(prod.id);
                          return (
                            <div key={prod.id} className="product-card" onClick={() => openDetail(prod)}>
                              <div style={{ overflow: 'hidden', position: 'relative' }}>
                                <img src={(prod.image ? prod.image.split(',')[0] : '') || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=420&h=210&fit=crop'} alt={prod.name} className="product-card-img" />
                                {prod.brand && <span className="product-tag">{prod.brand}</span>}
                                {rating && (
                                  <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,.95)', borderRadius: 'var(--r-full)', padding: '3px 9px', fontSize: '0.73rem', fontWeight: 700, color: '#FF8B00', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Star size={11} fill="#FF8B00" /> {rating}
                                  </span>
                                )}
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,.4))', padding: '24px 0 8px', display: 'flex', justifyContent: 'center' }}>
                                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Eye size={12} /> Xem chi tiết
                                  </span>
                                </div>
                              </div>
                              <div className="product-card-body">
                                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 5, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 40 }}>{prod.name}</h3>
                                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 34, marginBottom: 12 }}>{prod.description}</p>
                                <div className="product-card-footer">
                                  <div className="product-price">{fmtVnd(prod.price)}</div>
                                  {!viewOnly ? (
                                    <div className="product-card-actions">
                                      <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleAddToCart(prod); }} 
                                        className="btn btn-secondary btn-sm btn-add-cart"
                                        title="Thêm vào giỏ"
                                      >
                                        <ShoppingCart size={12} />
                                        <span className="btn-text">Thêm giỏ</span>
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          handleAddToCart(prod); 
                                          setActiveView('cart'); 
                                        }} 
                                        className="btn btn-primary btn-sm btn-buy-now"
                                      >
                                        <span className="btn-text-main">Mua</span>
                                        <span className="btn-text-extra"> ngay</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="badge badge-gray"><Eye size={11} /> Xem</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {filteredProducts.length > productPageSize && (
                        <div className="pagination-container">
                          <button 
                            disabled={currentProductPage === 1} 
                            onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
                            className="pagination-btn"
                          >
                            Trước
                          </button>
                          {getVisiblePages(currentProductPage, totalProductPages).map((p, idx) => (
                            p === '...' ? (
                              <span key={`ellipsis-${idx}`} className="pagination-ellipsis" style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
                            ) : (
                              <button 
                                key={p} 
                                onClick={() => setProductPage(p)}
                                className={`pagination-btn ${currentProductPage === p ? 'active' : ''}`}
                              >
                                {p}
                              </button>
                            )
                          ))}
                          <button 
                            disabled={currentProductPage === totalProductPages} 
                            onClick={() => setProductPage(prev => Math.min(prev + 1, totalProductPages))}
                            className="pagination-btn"
                          >
                            Sau
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Featured Services Section */}
              {activeView === 'products' && (
                <div style={{ marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 36 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wrench size={18} color="var(--brand-blue)" /> Dịch Vụ Kỹ Thuật Nổi Bật
                      </h2>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: 4 }}>Dịch vụ sửa chữa, bảo dưỡng lắp đặt chuyên nghiệp tại nhà</p>
                    </div>
                    <button 
                      onClick={() => setActiveView('services')} 
                      className="btn btn-ghost btn-sm" 
                      style={{ fontSize: '0.8rem', color: 'var(--brand-blue)', fontWeight: 700, gap: 4 }}
                    >
                      Xem tất cả dịch vụ →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {services.slice(0, 3).map(s => {
                      const parts = (s.description || '').split('---');
                      const summary = parts[0]?.trim() || '';
                      return (
                        <div 
                          key={s.id} 
                          className="card animate-fade-in" 
                          style={{ padding: 20, display: 'flex', gap: 14, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border)' }}
                          onClick={() => openServiceDetail(s)}
                        >
                          <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', flexShrink: 0 }}>
                            <Wrench size={20} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 6 }}>{s.name}</h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 12 }}>
                              {summary}
                            </p>
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>{fmtVnd(s.basePrice)}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-blue)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                Chi tiết →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ─── VIEW: CART ──────────────────────── */}
          {activeView === 'cart' && !viewOnly && (
            <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <div className="flex-center" style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(0, 82, 204, 0.1)', color: 'var(--brand-blue)' }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>Giỏ Hàng Của Bạn</h1>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Kiểm tra các sản phẩm và tiến hành đặt hàng thanh toán nhanh chóng</p>
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="card" style={{ padding: '60px 40px', textAlign: 'center' }}>
                  <div className="empty-state">
                    <ShoppingCart size={64} style={{ opacity: 0.2, color: 'var(--text-muted)', marginBottom: 16 }} />
                    <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 8 }}>Giỏ hàng đang trống!</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Bạn chưa thêm sản phẩm nào vào giỏ hàng của mình.</p>
                    <button className="btn btn-primary" style={{ borderRadius: 'var(--r-full)', padding: '10px 24px' }} onClick={() => setActiveView('products')}>Quay lại mua sắm ngay</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'flex-start' }}>
                  
                  {/* LEFT COLUMN: Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 18, color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border)', paddingBottom: 10 }}>Danh sách sản phẩm ({cart.length})</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {cart.map((item, idx) => {
                          const prod = products.find(p => p.id === item.productId);
                          return (
                            <div key={item.id} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: idx < cart.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                              <img src={(prod?.image ? prod.image.split(',')[0] : '') || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=80&h=80&fit=crop'} alt={item.productName} style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 4 }}>{item.productName}</div>
                                <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.88rem' }}>{fmtVnd(prod?.price || 0)}</div>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-page)', borderRadius: 'var(--r-full)', padding: '3px 6px', border: '1px solid var(--border)' }}>
                                <button type="button" onClick={() => handleUpdateQty(item.id, item.quantity, -1)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Minus size={10} /></button>
                                <span style={{ fontWeight: 800, width: 22, textAlign: 'center', fontSize: '0.85rem' }}>{item.quantity}</span>
                                <button type="button" onClick={() => handleUpdateQty(item.id, item.quantity, 1)} style={{ width: 24, height: 24, border: 'none', background: 'transparent', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><Plus size={10} /></button>
                              </div>
                              
                              <div style={{ fontWeight: 800, minWidth: 90, textAlign: 'right', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{fmtVnd((prod?.price || 0) * item.quantity)}</div>
                              <button type="button" onClick={() => handleDeleteItem(item.id)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}><Trash2 size={16} /></button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Promo Code section */}
                    <div className="card" style={{ padding: 20, border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Tag size={15} color="var(--purple)" /> Sử dụng mã giảm giá (Voucher)
                      </h4>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          type="text" 
                          placeholder="Nhập mã voucher (VD: SUMMER25)..." 
                          value={couponCode} 
                          onChange={e => setCouponCode(e.target.value)} 
                          style={{ flex: 1, fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: '#fff' }} 
                        />
                        <button type="button" onClick={handleApplyCoupon} className="btn btn-secondary" style={{ padding: '0 20px', borderRadius: 'var(--r-md)', background: 'var(--purple)', color: '#fff', border: 'none', fontWeight: 700 }}>Áp dụng</button>
                      </div>

                      {/* Display claimed available vouchers list */}
                      {(() => {
                        const availableVouchers = discounts.filter(d => 
                          claimedCodes.includes(d.code.toUpperCase()) &&
                          d.status === 'ACTIVE' &&
                          new Date(d.endDate) >= new Date() &&
                          d.usedCount < d.maxUsages
                        );
                        
                        if (availableVouchers.length > 0) {
                          return (
                            <div style={{ marginTop: 14 }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>Voucher đã nhận của bạn (Click để chọn nhanh):</div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {availableVouchers.map(v => {
                                  const isSelected = couponCode.toUpperCase() === v.code.toUpperCase();
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() => applyVoucherDirectly(v.code)}
                                      style={{
                                        background: isSelected ? 'rgba(101, 84, 192, 0.12)' : 'rgba(101, 84, 192, 0.04)',
                                        border: isSelected ? '1.5px solid var(--purple)' : '1px dashed var(--purple)',
                                        color: 'var(--purple)',
                                        padding: '6px 12px',
                                        borderRadius: 'var(--r-sm)',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s',
                                        display: 'inline-flex',
                                        flexDirection: 'column',
                                        gap: 2
                                      }}
                                    >
                                      <span>🎟 {v.code} ({v.discountType === 'PERCENTAGE' ? `Giảm ${v.discountValue}%` : `Giảm ${fmtVnd(v.discountValue)}`})</span>
                                      <span style={{ fontSize: '0.62rem', fontWeight: 500, opacity: 0.8 }}>Hạn: {new Date(v.endDate).toLocaleDateString('vi-VN')}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      {appliedCoupon && (
                        <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(101, 84, 192, 0.08)', color: 'var(--purple)', padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 800 }}>
                          🎟 {appliedCoupon.code} : Đã áp dụng giảm {appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : fmtVnd(appliedCoupon.discountValue)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Summary & Checkout Form */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Cost Summary Box */}
                    <div className="card" style={{ padding: 24, border: '1px solid var(--border)', background: 'var(--bg-surface-2)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>Tóm tắt đơn hàng</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                          { label: `Tạm tính (${cart.length} sản phẩm)`, val: fmtVnd(cart.reduce((s, i) => s + i.quantity * (products.find(p => p.id === i.productId)?.price || 0), 0)) },
                          selectedServs.length ? { label: 'Dịch vụ kỹ thuật đi kèm', val: fmtVnd(selectedServs.reduce((s, sid) => s + (services.find(sv => sv.id === sid)?.basePrice || 0), 0)) } : null,
                          appliedCoupon ? { label: 'Giảm giá coupon', val: '−' + (appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.discountValue}%` : fmtVnd(appliedCoupon.discountValue)), green: true } : null,
                        ].filter(Boolean).map(r => (
                          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: r.green ? 'var(--success)' : 'var(--text-secondary)' }}>
                            <span>{r.label}</span>
                            <span style={{ fontWeight: 700 }}>{r.val}</span>
                          </div>
                        ))}
                      </div>
                      <hr className="divider" style={{ margin: '14px 0', borderColor: 'var(--border)' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.15rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>Tổng cộng thanh toán</span>
                        <span style={{ color: 'var(--danger)' }}>{fmtVnd(getCartTotal())}</span>
                      </div>
                    </div>

                    {/* Delivery & Schedule Info */}
                    <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 18, color: 'var(--text-primary)', borderBottom: '1.5px solid var(--border)', paddingBottom: 10 }}>Thông tin nhận hàng & Lắp đặt</h3>
                      <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="form-field">
                          <label style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6 }}>Địa chỉ nhận hàng *</label>
                          <input 
                            type="text" 
                            value={address} 
                            onChange={e => setAddress(e.target.value)} 
                            required 
                            placeholder="Số nhà, tên đường, phường/xã..."
                            style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }} 
                          />
                        </div>

                        <div className="form-field">
                          <label style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6 }}>Phương thức vận chuyển & Dịch vụ</label>
                          <select 
                            value={serviceType} 
                            onChange={e => setServiceType(e.target.value)} 
                            style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: '#fff' }}
                          >
                            <option value="DELIVERY_AND_INSTALLATION">Mua sản phẩm & Giao hàng lắp đặt tận nơi</option>
                            <option value="REPAIR">Chỉ giao hàng (Tự lắp đặt)</option>
                          </select>
                        </div>

                        {/* Interactive Services Checkbox list */}
                        <div className="form-field">
                          <label style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6 }}>Dịch vụ kỹ thuật hỗ trợ đi kèm</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', padding: 8, background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }}>
                            {services.map(s => {
                              const isChecked = selectedServs.includes(s.id);
                              return (
                                <label 
                                  key={s.id} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 10, 
                                    padding: '8px 12px', 
                                    borderRadius: 'var(--r-sm)',
                                    background: isChecked ? 'rgba(0, 82, 204, 0.05)' : 'var(--bg-surface)', 
                                    border: isChecked ? '1px solid var(--brand-blue)' : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    color: 'var(--text-primary)',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => setSelectedServs(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} 
                                    style={{ width: 'auto', margin: 0 }} 
                                  />
                                  <span style={{ flex: 1 }}>{s.name}</span>
                                  <span style={{ color: 'var(--success)', fontWeight: 800 }}>+{new Intl.NumberFormat('vi-VN').format(s.basePrice)}đ</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Booking Schedule */}
                        <div className="form-field">
                          <label style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6 }}>Lịch hẹn nhân viên lắp đặt/kỹ thuật</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <input 
                              type="date" 
                              value={apptDate} 
                              onChange={e => setApptDate(e.target.value)} 
                              min={new Date().toISOString().split('T')[0]}
                              style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }} 
                            />
                            <select 
                              value={apptTime} 
                              onChange={e => setApptTime(e.target.value)} 
                              style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', background: '#fff' }}
                            >
                              <option value="09:00 - 11:00">Sáng 09:00 - 11:00</option>
                              <option value="14:00 - 16:00">Chiều 14:00 - 16:00</option>
                              <option value="17:00 - 19:00">Tối 17:00 - 19:00</option>
                            </select>
                          </div>
                        </div>

                        {/* Order Notes */}
                        <div className="form-field">
                          <label style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6 }}>Ghi chú đơn hàng</label>
                          <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            rows={3} 
                            placeholder="Nhập yêu cầu giao hàng đặc biệt hoặc ghi chú lỗi thiết bị..." 
                            style={{ fontSize: '0.85rem', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)', resize: 'vertical' }} 
                          />
                        </div>

                        {/* Payments instruction badge */}
                        <div style={{
                          background: 'rgba(40, 167, 69, 0.06)',
                          borderLeft: '4px solid var(--success)',
                          padding: '12px 14px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#1e7e34',
                          fontWeight: 600,
                        }}>
                          💡 Phương thức thanh toán: Trực tiếp bằng tiền mặt (COD) hoặc Chuyển khoản ngân hàng sau khi hoàn tất nghiệm thu lắp đặt.
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg" 
                          style={{ borderRadius: 'var(--r-full)', width: '100%', height: 48, fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}
                        >
                          🛒 XÁC NHẬN ĐẶT HÀNG NGAY
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ─── VIEW: ORDERS ────────────────────── */}
          {activeView === 'orders' && (
            <div className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h2 className="section-heading" style={{ margin: 0, border: 'none', padding: 0 }}>
                  <ClipboardList size={18} color="var(--brand-blue)" />
                  {viewOnly ? 'Đặt Dịch Vụ Hộ Khách' : `Đơn Hàng Của Tôi (${orders.length})`}
                </h2>
                {currentUserId && <button onClick={fetchUserOrders} className="btn btn-ghost btn-sm"><RefreshCw size={13} /> Tải lại</button>}
              </div>

              {viewOnly && (
                <div className="card-flat" style={{ padding: 24, marginBottom: 20, borderLeft: '4px solid var(--warning)', background: 'var(--brand-yellow-light)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: 6 }}>⚠️ Chế độ nhân viên – Đặt hàng hộ khách</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chức năng này cho phép bạn tạo đơn/lịch hẹn hộ khách hàng. Vui lòng liên hệ quản trị viên để thực hiện.</p>
                </div>
              )}

              {!currentUserId && !viewOnly ? (
                <div className="card-flat" style={{ padding: 40 }}>
                  <div className="empty-state"><ClipboardList size={60} /><p style={{ fontWeight: 700, marginTop: 12 }}>Chưa đăng nhập</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={triggerLogin}>Đăng nhập để xem đơn hàng</button>
                  </div>
                </div>
              ) : orders.length === 0 && !viewOnly ? (
                <div className="card-flat" style={{ padding: 40 }}>
                  <div className="empty-state"><Package size={60} /><p style={{ fontWeight: 700, marginTop: 12 }}>Chưa có đơn hàng</p>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setActiveView('products')}>Bắt đầu mua sắm</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.slice().reverse().map(order => {
                    const sc = STATUS_CFG[order.status] || { label: order.status, bg: 'var(--bg-page)', color: 'var(--text-secondary)' };
                    return (
                      <div key={order.id} className="card" style={{ padding: '18px 22px' }}>
                        <div className="flex-between" style={{ marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Đơn #{order.id}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{order.serviceType}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ background: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700 }}>{sc.label}</span>
                            <div style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '1rem' }}>{fmtVnd(order.totalPrice)}</div>
                          </div>
                        </div>
                        {order.orderItems?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                            {order.orderItems.map(item => <span key={item.id} className="badge badge-gray">{item.productName} ×{item.quantity}</span>)}
                          </div>
                        )}
                        {order.orderServices?.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                            {order.orderServices.map(serv => <span key={serv.id} className="badge badge-blue" style={{ background: 'rgba(0, 82, 204, 0.1)', color: '#0052cc', border: 'none' }}>🔧 {serv.serviceName}</span>)}
                          </div>
                        )}
                        {order.status === 'COMPLETED' && (order.orderItems?.length > 0 || order.orderServices?.length > 0) && (
                          <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Đánh giá:</span>
                            {order.orderItems?.map(item => (
                              <button key={item.id} onClick={() => { setReviewOrderId(order.id); setReviewProdId(item.productId); setReviewServId(null); }} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                                <Star size={11} /> {item.productName}
                              </button>
                            ))}
                            {order.orderServices?.map(serv => (
                              <button key={serv.id} onClick={() => { setReviewOrderId(order.id); setReviewProdId(null); setReviewServId(serv.serviceId); }} className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                                <Star size={11} /> Dịch vụ: {serv.serviceName}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeView === 'services' && (
            <div className="animate-fade-in">
              <h2 className="section-heading"><Wrench size={18} color="var(--brand-blue)" /> Dịch Vụ Kỹ Thuật ({services.length})</h2>
              <div className="services-grid">
                {services.map(s => {
                  const parts = (s.description || '').split('---');
                  const summary = parts[0]?.trim() || '';

                  return (
                    <div key={s.id} className="card animate-fade-in" style={{ padding: 22, transition: 'all 0.3s ease', cursor: 'pointer' }} onClick={() => {
                      openServiceDetail(s);
                    }}>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <div className="flex-center" style={{ width: 50, height: 50, borderRadius: 'var(--r-lg)', background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', flexShrink: 0 }}>
                          <Wrench size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', marginBottom: 5 }}>{s.name}</h4>
                          {(() => {
                            const rating = avgServiceRating(s.id);
                            const count = reviews.filter(r => r.serviceId === s.id).length;
                            return rating ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, fontSize: '0.8rem', color: '#FF8B00' }}>
                                <Star size={11} fill="#FF8B00" color="#FF8B00" />
                                <span><strong>{rating}</strong> / 5 ({count} đánh giá)</span>
                              </div>
                            ) : null;
                          })()}
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                            {summary}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-blue)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 12 }}>
                            Xem chi tiết dịch vụ & Đặt lịch <ArrowLeft size={12} style={{ transform: 'rotate(180deg)' }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              <span>⏱ <strong style={{ color: 'var(--text-primary)' }}>{s.estimatedHours}h</strong></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '0.95rem' }}>{fmtVnd(s.basePrice)}</span>
                              {!viewOnly && (
                                <button onClick={() => { if (!currentUserId) { triggerLogin(); } else { setBookingService(s); setActiveView('book-service'); } }} className="btn btn-primary btn-sm" style={{ padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.78rem' }}>
                                  Đặt lịch ngay
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}



          {/* ─── VIEW: CHECKOUT SUCCESS ──────────────── */}
          {activeView === 'checkout-success' && (
            <div className="animate-fade-in flex-center" style={{ flexDirection: 'column', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
              <div className="flex-center" style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)', marginBottom: 24 }}>
                <CheckCircle2 size={44} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Đặt hàng & Đặt lịch thành công!</h2>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 520, lineHeight: 1.6, marginBottom: 32 }}>
                Yêu cầu sửa chữa dịch vụ hoặc đơn đặt hàng sản phẩm của bạn đã được chuyển tới hệ thống. Đơn hàng đang ở trạng thái chờ duyệt, nhân viên kỹ thuật sẽ liên hệ trực tiếp số điện thoại của bạn để xác nhận lịch hẹn trong thời gian sớm nhất. Cám ơn quý khách đã tin dùng dịch vụ của chúng tôi!
              </span>
              <button 
                onClick={() => setActiveView('products')} 
                className="btn btn-primary" 
                style={{ borderRadius: 'var(--r-full)', padding: '12px 32px', fontWeight: 800, background: 'var(--brand-blue)', color: '#fff', border: 'none', boxShadow: 'var(--shadow-sm)' }}
              >
                Quay lại Trang chủ
              </button>
            </div>
          )}

          {/* ─── VIEW: SERVICE DETAIL ─────────────────── */}
          {activeView === 'service-detail' && detailService && (() => {
            const parts = (detailService.description || '').split('---');
            const summary = parts[0]?.trim() || '';
            const detail = parts[1]?.trim() || parts[0]?.trim() || 'Không có mô tả chi tiết cho dịch vụ này.';

            return (
              <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
                <button 
                  onClick={() => { setDetailService(null); setActiveView('services'); }} 
                  className="btn btn-secondary" 
                  style={{ marginBottom: 20, gap: 8, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--r-full)', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <ArrowLeft size={16} /> Quay lại danh sách dịch vụ
                </button>

                <div className="product-detail-grid">
                  {/* Left Column: Wrench Icon Illustration & Guarantees */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, var(--brand-blue-light) 0%, rgba(235, 242, 255, 0.4) 100%)', 
                      borderRadius: 'var(--r-xl)', 
                      padding: 40, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      minHeight: 280, 
                      border: '1px solid var(--border)',
                      textAlign: 'center'
                    }}>
                      <div className="flex-center animate-bounce-slow" style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(0, 82, 204, 0.1)', color: 'var(--brand-blue)', marginBottom: 18 }}>
                        <Wrench size={40} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Dịch Vụ Kỹ Thuật Đáng Tin Cậy</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8, maxWidth: 260, lineHeight: 1.5 }}>Hỗ trợ sửa chữa tại nhà nhanh chóng, chuyên nghiệp và trung thực.</p>
                    </div>

                    {/* Guarantees */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { title: 'Kỹ thuật viên lành nghề', desc: 'Đội ngũ tay nghề cao, được đào tạo bài bản, lịch sự.', icon: Award, color: 'var(--brand-blue)' },
                        { title: 'Linh kiện chính hãng 100%', desc: 'Cam kết phụ tùng chính hãng, hoàn tiền nếu phát hiện hàng giả.', icon: Shield, color: 'var(--success)' },
                        { title: 'Bảo hành sau sửa chữa', desc: 'Chính sách bảo hành chu đáo dài hạn từ 3 - 12 tháng.', icon: CheckCircle2, color: 'var(--purple)' }
                      ].map(c => (
                        <div key={c.title} style={{ display: 'flex', gap: 12, padding: '14px 18px', background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                          <div style={{ color: c.color, flexShrink: 0, marginTop: 2 }}><c.icon size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 3 }}>{c.title}</h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Info & Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 20 }}>
                    <div>
                      <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2 }}>{detailService.name}</h1>
                      
                      {/* Price Section */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Giá khảo sát cơ bản:</span>
                          <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', letterSpacing: '-0.02em' }}>{fmtVnd(detailService.basePrice)}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(Miễn phí kiểm tra nếu làm)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span>⏱ Thời gian thực hiện dự kiến: <strong>{detailService.estimatedHours} giờ</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Summary box */}
                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)', marginBottom: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: 10, color: 'var(--text-primary)' }}>Mô tả tổng quan:</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {summary}
                      </p>
                    </div>

                    {/* Details box */}
                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)', marginBottom: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: 10, color: 'var(--text-primary)' }}>Thông tin thực hiện chi tiết:</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {detail}
                      </p>
                    </div>

                    {/* Action Panel */}
                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--border)', marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {!viewOnly ? (
                          <button 
                            onClick={() => { if (!currentUserId) { triggerLogin(); } else { setBookingService(detailService); setActiveView('book-service'); } }} 
                            className="btn btn-primary btn-lg" 
                            style={{ flex: 1, borderRadius: 'var(--r-full)', height: 48, fontSize: '0.9rem', fontWeight: 800, gap: 8 }}
                          >
                            📅 Đăng ký đặt lịch hẹn ngay
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chỉ xem thông tin dịch vụ</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── VIEW: BOOK SERVICE ─────────────────── */}
          {activeView === 'book-service' && bookingService && (() => {
            const parts = (bookingService.description || '').split('---');
            const summary = parts[0]?.trim() || '';
            const detail = parts[1]?.trim() || parts[0]?.trim() || 'Không có mô tả chi tiết cho dịch vụ này.';

            return (
              <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
                <button 
                  onClick={() => { setBookingService(null); setActiveView('services'); }} 
                  className="btn btn-secondary" 
                  style={{ marginBottom: 20, gap: 8, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--r-full)', padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  <ArrowLeft size={16} /> Quay lại danh sách dịch vụ
                </button>

                <div style={{ 
                  background: 'linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-mid) 100%)',
                  borderRadius: 'var(--r-xl)',
                  padding: '32px 40px',
                  color: '#fff',
                  marginBottom: 28,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span className="badge badge-yellow" style={{ marginBottom: 12, fontSize: '0.75rem', fontWeight: 800 }}>⚙️ BOOKING SERVICE</span>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 8, color: '#fff' }}>Đăng Ký Đặt Lịch Dịch Vụ</h1>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Vui lòng kiểm tra thông tin và chọn thời gian hẹn phù hợp. Kỹ thuật viên của chúng tôi sẽ liên hệ xác nhận ngay.</p>
                  </div>
                  <div style={{ position: 'absolute', right: -20, bottom: -40, opacity: 0.15, transform: 'rotate(-15deg)' }}>
                    <Wrench size={240} />
                  </div>
                </div>

                <div className="product-detail-grid" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: 32, marginBottom: 28 }}>
                  {/* Left Column: Service Details & Commitments */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 24, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                        <div className="flex-center" style={{ width: 56, height: 56, borderRadius: 'var(--r-lg)', background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', flexShrink: 0 }}>
                          <Wrench size={28} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{bookingService.name}</h3>
                          <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>⏱ Thời gian hoàn thành: <strong>{bookingService.estimatedHours}h</strong></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 8 }}>Mô tả công việc:</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                          {detail}
                        </p>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Đơn giá dịch vụ:</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>{fmtVnd(bookingService.basePrice)}</span>
                      </div>
                    </div>

                    {/* Commitment cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { title: 'Kỹ thuật viên chuyên nghiệp', desc: 'Đội ngũ tay nghề cao, tác phong lịch sự, sạch sẽ.', icon: Award, color: 'var(--brand-blue)' },
                        { title: 'Chất lượng chính hãng', desc: 'Cam kết phụ tùng, linh kiện thay thế chính hãng 100%.', icon: Shield, color: 'var(--success)' },
                        { title: 'Bảo hành dài hạn', desc: 'Bảo hành chu đáo sau sửa chữa từ 3 đến 12 tháng.', icon: CheckCircle2, color: 'var(--purple)' }
                      ].map(c => (
                        <div key={c.title} style={{ display: 'flex', gap: 12, padding: '14px 18px', background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                          <div style={{ color: c.color, flexShrink: 0, marginTop: 2 }}><c.icon size={18} /></div>
                          <div>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 3 }}>{c.title}</h4>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>{c.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Booking Form */}
                  <div>
                    <form onSubmit={handleBookServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '2px solid var(--brand-blue)', paddingBottom: 8 }}>
                        <ClipboardList size={18} color="var(--brand-blue)" /> Thông Tin Hẹn Lịch
                      </h3>

                      <div className="form-field">
                        <label>Họ và tên khách hàng</label>
                        <input type="text" disabled value={currentUser?.name || 'Khách vãng lai'} style={{ background: 'var(--bg-surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                      </div>

                      <div className="form-row form-row-2">
                        <div className="form-field">
                          <label>Số điện thoại liên hệ</label>
                          <input type="text" disabled value={currentUser?.phone || '—'} style={{ background: 'var(--bg-surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                        </div>
                        <div className="form-field">
                          <label>Email khách hàng</label>
                          <input type="text" disabled value={currentUser?.email || '—'} style={{ background: 'var(--bg-surface-2)', cursor: 'not-allowed', color: 'var(--text-muted)' }} />
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Địa chỉ thực hiện dịch vụ (Nơi sửa chữa/lắp đặt) *</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Nhập số nhà, tên đường, phường/xã, huyện..." 
                          value={bookAddress} 
                          onChange={e => setBookAddress(e.target.value)} 
                          style={{ border: '1.5px solid var(--border)' }}
                        />
                      </div>

                      <div className="form-row form-row-2">
                        <div className="form-field">
                          <label>Ngày hẹn thực hiện *</label>
                          <input 
                            type="date" 
                            required 
                            value={bookDate} 
                            onChange={e => setBookDate(e.target.value)} 
                            min={new Date().toISOString().split('T')[0]} 
                            style={{ border: '1.5px solid var(--border)' }}
                          />
                        </div>
                        <div className="form-field">
                          <label>Khung giờ mong muốn *</label>
                          <select 
                            value={bookTime} 
                            onChange={e => setBookTime(e.target.value)}
                            style={{ border: '1.5px solid var(--border)' }}
                          >
                            <option value="09:00 - 11:00">Sáng 09:00 - 11:00</option>
                            <option value="14:00 - 16:00">Chiều 14:00 - 16:00</option>
                            <option value="17:00 - 19:00">Tối 17:00 - 19:00</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-field">
                        <label>Ghi chú yêu cầu kỹ thuật (Chi tiết lỗi, yêu cầu đặc biệt...)</label>
                        <textarea 
                          rows={4} 
                          placeholder="Mô tả tình trạng máy móc hoặc các yêu cầu cụ thể đối với thợ kỹ thuật..." 
                          value={bookNotes} 
                          onChange={e => setBookNotes(e.target.value)} 
                          style={{ resize: 'vertical', border: '1.5px solid var(--border)' }}
                        />
                      </div>

                      {/* Cost summary block */}
                      <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-md)', padding: 18, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-secondary)' }}>
                          <span>Phí dịch vụ cơ bản:</span>
                          <span style={{ fontWeight: 600 }}>{fmtVnd(bookingService.basePrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
                          <span>Phí di chuyển của thợ:</span>
                          <span style={{ color: 'var(--success)', fontWeight: 800 }}>Miễn phí</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: '0.95rem' }}>
                          <span style={{ fontWeight: 800 }}>Tổng tiền dự kiến:</span>
                          <strong style={{ color: 'var(--danger)', fontSize: '1.25rem', fontWeight: 900 }}>{fmtVnd(bookingService.basePrice)}</strong>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(40, 167, 69, 0.06)',
                        borderLeft: '4px solid var(--success)',
                        padding: '12px 14px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: '#1e7e34',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        💡 Lưu ý: Bạn chỉ cần thanh toán trực tiếp cho kỹ thuật viên sau khi công việc đã hoàn thành và nghiệm thu.
                      </div>

                      <div style={{ display: 'flex', gap: 14, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button 
                          type="button" 
                          onClick={() => { setBookingService(null); setActiveView('services'); }} 
                          className="btn btn-secondary" 
                          style={{ borderRadius: 'var(--r-full)', height: 44, padding: '0 24px' }}
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary" 
                          style={{ borderRadius: 'var(--r-full)', height: 44, padding: '0 32px', fontWeight: 800, gap: 6, display: 'inline-flex', alignItems: 'center' }}
                        >
                          <CheckCircle2 size={16} /> Xác Nhận Đặt Lịch
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── VIEW: PRODUCT DETAIL ──────────────────── */}
          {activeView === 'product-detail' && detailProduct && (
            <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
              <button 
                onClick={() => setActiveView('products')} 
                className="btn btn-secondary" 
                style={{ marginBottom: 20, gap: 8, display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--r-full)', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
              </button>

              <div className="product-detail-grid" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: 28, marginBottom: 28 }}>
                {/* Left Column: Image, Badges & Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-surface-2)', padding: 12 }}>
                    <img 
                      src={(detailProduct.image ? detailProduct.image.split(',')[activeImageIndex] : '') || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&fit=crop'} 
                      alt={detailProduct.name} 
                      style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 'var(--r-md)' }} 
                    />

                    {/* Image navigation controls for 2 or more images */}
                    {detailProduct.image && detailProduct.image.split(',').filter(Boolean).length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = detailProduct.image.split(',').filter(Boolean);
                            setActiveImageIndex(prev => (prev === 0 ? imgs.length - 1 : prev - 1));
                          }}
                          style={{
                            position: 'absolute',
                            left: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255, 255, 255, 0.85)',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s',
                            zIndex: 10
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                        >
                          <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = detailProduct.image.split(',').filter(Boolean);
                            setActiveImageIndex(prev => (prev === imgs.length - 1 ? 0 : prev + 1));
                          }}
                          style={{
                            position: 'absolute',
                            right: 20,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255, 255, 255, 0.85)',
                            border: '1px solid var(--border)',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s',
                            zIndex: 10
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                        >
                          <ChevronRight size={20} strokeWidth={2.5} />
                        </button>
                      </>
                    )}
                  </div>
                  {detailProduct.image && detailProduct.image.split(',').filter(Boolean).length > 1 && (
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                      {detailProduct.image.split(',').filter(Boolean).map((imgUrl, imgIdx) => (
                        <img 
                          key={imgIdx}
                          src={imgUrl}
                          alt={`${detailProduct.name}-${imgIdx}`}
                          onClick={() => setActiveImageIndex(imgIdx)}
                          style={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'cover', 
                            borderRadius: 'var(--r-md)', 
                            cursor: 'pointer',
                            border: activeImageIndex === imgIdx ? '2.5px solid var(--brand-blue)' : '1px solid var(--border)',
                            opacity: activeImageIndex === imgIdx ? 1 : 0.65,
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detailProduct.brand && <span className="badge badge-blue" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>🏷️ {detailProduct.brand}</span>}
                    {detailProduct.warrantyMonths && <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>🛡️ BH {detailProduct.warrantyMonths} tháng</span>}
                    {avgRating(detailProduct.id) && (
                      <span className="badge badge-yellow" style={{ fontSize: '0.8rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#FF8B00" color="#FF8B00" /> {avgRating(detailProduct.id)}/5
                      </span>
                    )}
                  </div>

                  <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)', marginTop: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: 12, color: 'var(--text-primary)' }}>Thông số chi tiết:</div>
                    <div className="product-specs-grid" style={{ fontSize: '0.85rem' }}>
                      {[
                        { l: 'Thương hiệu', v: detailProduct.brand || 'Chính hãng' },
                        { l: 'Bảo hành', v: detailProduct.warrantyMonths ? `${detailProduct.warrantyMonths} tháng` : 'Theo chính sách NSX' },
                        { l: 'Danh mục', v: categories.find(c => c.id === detailProduct.categoryId)?.name || 'Điện lạnh dân dụng' },
                        { l: 'Mã sản phẩm', v: `SP-${detailProduct.id}` },
                      ].map(spec => (
                        <div key={spec.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{spec.l}:</span>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{spec.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Info & Description */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 20 }}>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2 }}>{detailProduct.name}</h1>
                    
                    {/* Price section with Market Price (Giá thị trường) and Selling Price (Giá bán) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>Giá thị trường:</span>
                        <span style={{ textDecoration: 'line-through', fontWeight: 500 }}>
                          {fmtVnd(Math.round((detailProduct.price * 1.15) / 10000) * 10000)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Giá bán:</span>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--danger)', letterSpacing: '-0.02em' }}>{fmtVnd(detailProduct.price)}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>(Đã bao gồm VAT)</span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)', marginBottom: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: 10, color: 'var(--text-primary)' }}>Mô tả sản phẩm:</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {detailProduct.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                      </p>
                    </div>

                    {/* Purchase Widget (Quantity select, Add to cart, Buy now) */}
                    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--border)', marginTop: 20 }}>
                      {!viewOnly && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 16 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-secondary)' }}>Chọn số lượng:</span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--r-full)', background: 'var(--bg-surface)', padding: '2px 8px', gap: 12 }}>
                            <button 
                              onClick={() => setDetailQuantity(q => Math.max(1, q - 1))} 
                              className="btn-icon" 
                              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontSize: '0.95rem', fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{detailQuantity}</span>
                            <button 
                              onClick={() => setDetailQuantity(q => q + 1)} 
                              className="btn-icon" 
                              style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 12 }}>
                        {!viewOnly ? (
                          <>
                            <button 
                              onClick={() => handleAddToCart(detailProduct, detailQuantity)} 
                              className="btn btn-secondary" 
                              style={{ flex: 1, borderRadius: 'var(--r-full)', fontWeight: 800, height: 44, gap: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ShoppingCart size={18} /> Thêm vào giỏ
                            </button>
                            <button 
                              onClick={async () => {
                                await handleAddToCart(detailProduct, detailQuantity);
                                setActiveView('cart');
                              }} 
                              className="btn btn-primary" 
                              style={{ flex: 1, borderRadius: 'var(--r-full)', fontWeight: 800, height: 44, gap: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <ShoppingBag size={18} /> Mua ngay
                            </button>
                          </>
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
                            Sản phẩm đang được mở ở chế độ xem thông tin.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', padding: 28 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={18} color="var(--brand-blue)" />
                  Đánh giá từ khách hàng ({productReviews.length})
                  {productReviews.length > 0 && (
                    <span className="badge badge-yellow" style={{ fontSize: '0.8rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Star size={10} fill="#FF8B00" color="#FF8B00" /> {avgRating(detailProduct.id)}
                    </span>
                  )}
                </h3>

                {productReviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Chưa có đánh giá nào cho sản phẩm này.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {productReviews.map(rv => (
                      <div key={rv.id} style={{ background: 'var(--bg-surface-2)', borderRadius: 'var(--r-lg)', padding: 20, border: '1px solid var(--border)' }}>
                        <div className="flex-between" style={{ marginBottom: 10 }}>
                          <div className="flex-gap-2">
                            <div className="flex-center" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', fontWeight: 800, fontSize: '0.85rem' }}>
                              {rv.userName?.[0] || 'K'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                              <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>{rv.userName || 'Khách hàng'}</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Đã mua hàng</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} size={14} fill={i <= (rv.productRating || 5) ? '#FF8B00' : 'none'} color="#FF8B00" />
                            ))}
                          </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {rv.content}
                        </p>
                        {rv.serviceRating && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>Chất lượng phục vụ kỹ thuật:</span>
                            <span style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={11} fill={i <= rv.serviceRating ? '#FF8B00' : 'none'} color="#FF8B00" />
                              ))}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── VIEW: WORK PROCESS ──────────────────── */}
          {activeView === 'work-process' && (
            <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{
                marginBottom: 28,
                background: 'linear-gradient(135deg, #0747a6 0%, #0052cc 60%, #0065ff 100%)',
                borderRadius: 'var(--r-xl)',
                padding: '28px 32px',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(9, 30, 66, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 20
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-10%',
                  width: '300px',
                  height: '300px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                
                <div style={{
                  position: 'absolute',
                  bottom: '-50%',
                  left: '10%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0, 184, 217, 0.12) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div className="flex-center" style={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'rgba(255, 171, 0, 0.12)',
                  border: '1.5px solid rgba(255, 171, 0, 0.35)',
                  boxShadow: '0 0 20px rgba(255, 171, 0, 0.15)',
                  color: 'var(--brand-yellow)',
                  flexShrink: 0
                }}>
                  <Camera size={26} style={{ filter: 'drop-shadow(0 0 6px rgba(255, 171, 0, 0.5))' }} />
                </div>

                <div style={{ flex: 1, zIndex: 2 }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    margin: 0,
                    color: '#fff',
                    letterSpacing: '0.3px',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)'
                  }}>
                    Nhật Ký Hoạt Động & Quá Trình Làm Việc
                  </h2>
                  <p style={{
                    margin: '6px 0 0',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.5,
                    fontWeight: 400
                  }}>
                    Hình ảnh và video thực tế ghi lại quá trình sửa chữa, bảo dưỡng thiết bị điện lạnh tại công trình của đội ngũ kỹ thuật viên Đông Triều 24h.
                  </p>
                </div>
              </div>

              {loadingPosts ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '24px', color: 'var(--brand-blue)' }}>⏳</span>
                  <span style={{ fontSize: '0.9rem' }}>Đang tải nhật ký làm việc...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state card-flat" style={{ padding: '60px 24px', textAlign: 'center' }}>
                  <Camera size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Chưa có bài viết nhật ký nào</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Các bài viết ghi lại quá trình làm việc của kỹ thuật viên sẽ được cập nhật tại đây.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {posts.map(post => {
                    const isLiked = likedPosts.includes(post.id);
                    return (
                      <article key={post.id} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                        {/* Post Header */}
                        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
                          <div className="flex-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-yellow) 0%, #ff8b00 100%)', color: '#172B4D', fontWeight: 800, fontSize: '1rem', boxShadow: '0 2px 5px rgba(255,171,0,0.3)' }}>
                            DT
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              Đông Triều 24h Admin
                              <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: 'var(--r-sm)' }}>Tác giả</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Post Body */}
                        <div style={{ padding: '20px' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px', color: 'var(--text-primary)' }}>{post.title}</h3>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>{post.content}</p>

                          {/* Post Media */}
                          <PostMediaCarousel mediaUrls={post.mediaUrl} mediaType={post.mediaType} title={post.title} />
                        </div>

                        {/* Post Footer / Actions */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-2)' }}>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 12px',
                              borderRadius: 'var(--r-full)',
                              transition: 'all 0.2s',
                              color: isLiked ? '#ef4444' : 'var(--text-secondary)'
                            }}
                            className="like-btn"
                          >
                            <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} style={{ transition: 'transform 0.2s' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: isLiked ? 700 : 500 }}>
                              {isLiked ? 'Đã thích' : 'Yêu thích'}
                            </span>
                          </button>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{post.likesCount || 0}</span> lượt thích
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          REVIEW MODAL
          ════════════════════════════════════════════ */}
      {reviewOrderId && (
        <div className="modal-overlay" style={{ zIndex: 2600 }}>
          <div className="modal-box animate-slide-up" style={{ width: 480 }}>
            <div className="modal-header">
              <h3>⭐ {reviewProdId ? 'Đánh Giá Sản Phẩm & Dịch Vụ' : 'Đánh Giá Dịch Vụ Kỹ Thuật'}</h3>
              <button onClick={() => { setReviewOrderId(null); setReviewProdId(null); setReviewServId(null); }} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateReview}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviewProdId && (
                  <div className="flex-between">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Chất lượng sản phẩm:</span>
                    <div className="star-rating">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={22} fill={i <= prodRating ? '#FF8B00' : 'none'} color="#FF8B00" onClick={() => setProdRating(i)} style={{ cursor: 'pointer' }} />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex-between">
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{reviewProdId ? 'Thái độ kỹ thuật viên:' : 'Chất lượng dịch vụ:'}</span>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={22} fill={i <= servRating ? '#FF8B00' : 'none'} color="#FF8B00" onClick={() => setServRating(i)} style={{ cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <div className="form-field">
                  <label>Nội dung nhận xét</label>
                  <textarea value={reviewContent} onChange={e => setReviewContent(e.target.value)} required rows={4} placeholder="Chia sẻ trải nghiệm sử dụng dịch vụ của bạn..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setReviewOrderId(null)} className="btn btn-secondary">Hủy</button>
                <button type="submit" className="btn btn-primary">Gửi đánh giá ⭐</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
