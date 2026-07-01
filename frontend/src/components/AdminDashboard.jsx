import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import {
  TrendingUp, Users, Calendar, ClipboardList, Check, X, RefreshCw,
  Wrench, Plus, Trash2, Shield, Star, DollarSign, Package,
  BarChart2, PieChart, Activity, Tag, Eye, Upload, Image, Loader, Edit, Camera
} from '../Icons';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CHART_COLORS = ['#0052CC','#00B8D9','#FFAB00','#00875A','#DE350B','#6554C0'];
const STATUS_LABELS = { PENDING: 'Chờ duyệt', INSTALLING_REPAIRING: 'Đang thực hiện', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };
const STATUS_COLORS = { PENDING: '#FF8B00', INSTALLING_REPAIRING: '#0052CC', COMPLETED: '#00875A', CANCELLED: '#DE350B' };
const fmtVnd  = (n) => new Intl.NumberFormat('vi-VN').format(n||0) + 'đ';
const fmtFull = (n) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n||0);

/* ── Small Modal component ──────────────────────────────── */
function CrudModal({ title, onClose, onSubmit, children, wide }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={onClose}>
      <div className="modal-box" style={{ width: wide ? 620 : 480, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="btn-icon"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {children}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">Hủy</button>
            <button type="submit" className="btn btn-primary"><Check size={15} /> Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── KPI Card ────────────────────────────────────────────── */
function KpiCard({ label, value, sub, color, icon }) {
  const colorMap = { blue:'#0052CC', green:'#00875A', yellow:'#FF8B00', red:'#DE350B', purple:'#6554C0' };
  const bgMap    = { blue:'#EBF2FF',  green:'#E3FCEF',  yellow:'#FFF7E6',  red:'#FFEBE6',  purple:'#EAE6FF' };
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="flex-between">
        <div>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value" style={{ color: colorMap[color] }}>{value}</div>
          {sub && <div className="kpi-sub">{sub}</div>}
        </div>
        <div className="flex-center" style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: bgMap[color], color: colorMap[color] }}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  /* ── Data states ─── */
  const [orders,     setOrders]     = useState([]);
  const [technicians,setTechnicians]= useState([]);
  const [schedules,  setSchedules]  = useState([]);
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [services,   setServices]   = useState([]);
  const [payments,   setPayments]   = useState([]);
  const [discounts,  setDiscounts]  = useState([]);
  const [users,      setUsers]      = useState([]);

  /* ── Assign modal ─── */
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder,   setSelectedOrder]   = useState(null);
  const [assignTechId,    setAssignTechId]    = useState('');
  const [assignDate,      setAssignDate]      = useState('');
  const [assignTime,      setAssignTime]      = useState('09:00 - 11:00');
  const [assignNotes,     setAssignNotes]     = useState('');

  /* ── CRUD popup modals ─── */
  const [showAddProduct,  setShowAddProduct]  = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddService,  setShowAddService]  = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [showAddVoucher,  setShowAddVoucher]  = useState(false);
  const [showEditVoucher, setShowEditVoucher] = useState(false);
  const [showAddUser,     setShowAddUser]     = useState(false);
  const [showEditUser,    setShowEditUser]    = useState(false);

  /* ── CRUD form states ─── */
  const [newProduct,  setNewProduct]  = useState({ name:'', description:'', price:'', categoryId:'', brand:'', warrantyMonths:12, images:[] });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({ name: '', description: '', price: '', categoryId: '', brand: '', warrantyMonths: 12, images: [] });
  const [newCategory, setNewCategory] = useState({ name:'', description:'', image:'' });
  const [newService,  setNewService]  = useState({ name:'', summary:'', detail:'', basePrice:'', estimatedHours:1 });
  const [editingService, setEditingService] = useState(null);
  const [editServiceForm, setEditServiceForm] = useState({ name: '', summary: '', detail: '', basePrice: '', estimatedHours: 1 });
  const [newVoucher,  setNewVoucher]  = useState({ 
    code: '', 
    discountType: 'PERCENTAGE', 
    discountValue: '', 
    minOrderValue: '', 
    maxUsage: 100, 
    expiryDate: '',
    scope: 'ALL',
    scopeCategoryId: '',
    scopeProductIds: []
  });
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [editVoucherForm, setEditVoucherForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxUsage: 100,
    expiryDate: '',
    scope: 'ALL',
    scopeCategoryId: '',
    scopeProductIds: [],
    status: 'ACTIVE'
  });
  const [newUser,     setNewUser]     = useState({ name:'', email:'', phone:'', password:'', address:'', role:'TECHNICIAN', status:'ACTIVE' });
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', phone: '', address: '', role: '', status: '' });

  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [postPage, setPostPage] = useState(1);

  const [posts, setPosts] = useState([]);
  const [showAddBlogPost, setShowAddBlogPost] = useState(false);
  const [showEditBlogPost, setShowEditBlogPost] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState(null);
  const [blogPostForm, setBlogPostForm] = useState({ title: '', content: '', mediaUrls: [], mediaType: 'IMAGE' });

  const handlePostMediaUpload = async (e, isEdit = false, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      if ((res.status === 'success' || res.success) && res.data) {
        
        if (isEdit) {
          setEditingBlogPost(prev => {
            const newUrls = [...(prev.mediaUrls || [])];
            if (index !== null) {
              newUrls[index] = res.data;
            } else {
              newUrls.push(res.data);
            }
            const hasVideo = file.type.startsWith('video/') || newUrls.some(url => url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('.avi'));
            return {
              ...prev,
              mediaUrls: newUrls,
              mediaType: hasVideo ? 'VIDEO' : 'IMAGE'
            };
          });
        } else {
          setBlogPostForm(prev => {
            const newUrls = [...(prev.mediaUrls || [])];
            if (index !== null) {
              newUrls[index] = res.data;
            } else {
              newUrls.push(res.data);
            }
            const hasVideo = file.type.startsWith('video/') || newUrls.some(url => url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('.avi'));
            return {
              ...prev,
              mediaUrls: newUrls,
              mediaType: hasVideo ? 'VIDEO' : 'IMAGE'
            };
          });
        }
        notify('Tải tệp tin lên thành công!');
      } else {
        notify('Lỗi tải tệp: ' + (res.message || 'Không có phản hồi'), 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      notify('Lỗi tải tệp: ' + errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateBlogPostSubmit = async (e) => {
    e.preventDefault();
    if (!blogPostForm.title.trim() || !blogPostForm.content.trim()) {
      notify('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error');
      return;
    }
    try {
      await api.createPost({
        title: blogPostForm.title,
        content: blogPostForm.content,
        mediaUrl: blogPostForm.mediaUrls.filter(Boolean).join(','),
        mediaType: blogPostForm.mediaType
      });
      setBlogPostForm({ title: '', content: '', mediaUrls: [], mediaType: 'IMAGE' });
      setShowAddBlogPost(false);
      notify('Đã thêm bài viết mới!');
      fetchAllData();
    } catch {
      notify('Lỗi khi thêm bài viết', 'error');
    }
  };

  const handleUpdateBlogPostSubmit = async (e) => {
    e.preventDefault();
    if (!editingBlogPost) return;
    if (!editingBlogPost.title.trim() || !editingBlogPost.content.trim()) {
      notify('Vui lòng nhập đầy đủ tiêu đề và nội dung', 'error');
      return;
    }
    try {
      await api.updatePost(editingBlogPost.id, {
        title: editingBlogPost.title,
        content: editingBlogPost.content,
        mediaUrl: editingBlogPost.mediaUrls.filter(Boolean).join(','),
        mediaType: editingBlogPost.mediaType
      });
      setShowEditBlogPost(false);
      setEditingBlogPost(null);
      notify('Cập nhật bài viết thành công!');
      fetchAllData();
    } catch {
      notify('Lỗi khi cập nhật bài viết', 'error');
    }
  };

  const handleDeleteBlogPost = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await api.deletePost(id);
      notify('Đã xóa bài viết!');
      fetchAllData();
    } catch {
      notify('Lỗi khi xóa bài viết', 'error');
    }
  };

  const handleImageUpload = async (e, setter, currentState, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setter(prev => ({ ...prev, [fieldName]: localUrl }));

    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      if ((res.status === 'success' || res.success) && res.data) {
        setter(prev => ({ ...prev, [fieldName]: res.data }));
        notify('Tải ảnh lên thành công!');
      } else {
        setter(prev => ({ ...prev, [fieldName]: '' }));
        notify('Lỗi tải ảnh: ' + (res.message || 'Không có phản hồi'), 'error');
      }
    } catch (err) {
      setter(prev => ({ ...prev, [fieldName]: '' }));
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      notify('Lỗi tải ảnh: ' + errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    setProductPage(1);
    setServicePage(1);
    setCategoryPage(1);
    setUserPage(1);
    setOrderPage(1);
    setPostPage(1);
  }, [activeTab]);

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

  useEffect(() => { fetchAllData(); }, []);

  async function fetchAllData() {
    try {
      const [o,t,s,p,c,serv,pay,disc,u,pts] = await Promise.all([
        api.getOrders(), api.getTechnicians(), api.getSchedules(),
        api.getProducts(), api.getCategories(), api.getServices(),
        api.getPayments(), api.getDiscounts(), api.getUsers(), api.getPosts()
      ]);
      setOrders(o.data||[]); setTechnicians(t.data||[]); setSchedules(s.data||[]);
      setProducts(p.data||[]); setCategories(c.data||[]); setServices(serv.data||[]);
      setPayments(pay.data||[]); setDiscounts(disc.data||[]); setUsers(u.data||[]);
      setPosts(pts.data||[]);
    } catch (err) { console.error(err); }
  }

  const notify = (text, type='success') => { setMessage({text,type}); setTimeout(()=>setMessage(null),3000); };

  /* ── Order actions ─── */
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrder(orderId, { status: newStatus });
      if (newStatus === 'COMPLETED') {
        const pmt = payments.find(p => p.orderId === orderId);
        if (pmt && pmt.status !== 'COMPLETED') await api.updatePaymentStatus(pmt.id, { status: 'COMPLETED' });
        
        // Complete the schedule if exists
        const sch = schedules.find(s => s.orderId === orderId);
        if (sch && sch.status !== 'COMPLETED') {
          await api.updateSchedule(sch.id, { status: 'COMPLETED', completedAt: new Date().toISOString() });
        }
      }
      notify(`Cập nhật trạng thái: ${STATUS_LABELS[newStatus] || newStatus}`);
      fetchAllData();
    } catch { notify('Không thể cập nhật trạng thái','error'); }
  };

  const handleUpdateScheduleStatus = async (schedule, nextStatus) => {
    try {
      const upd = { status: nextStatus };
      if (nextStatus==='COMPLETED') upd.completedAt = new Date().toISOString();
      await api.updateSchedule(schedule.id, upd);
      
      const orderStatus = nextStatus==='COMPLETED' ? 'COMPLETED' : 'INSTALLING_REPAIRING';
      await api.updateOrder(schedule.orderId, { status: orderStatus });
      
      if (nextStatus==='COMPLETED') {
        const pmt = payments.find(p => p.orderId === schedule.orderId);
        if (pmt && pmt.status !== 'COMPLETED') await api.updatePaymentStatus(pmt.id, { status: 'COMPLETED' });
      }
      notify(`Đã cập nhật trạng thái lịch: ${nextStatus==='IN_PROGRESS'?'Đang thực hiện':'Hoàn thành'}!`);
      fetchAllData();
    } catch { notify('Lỗi cập nhật trạng thái lịch','error'); }
  };

  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    if (technicians.length > 0) setAssignTechId(technicians[0].id.toString());
    setShowAssignModal(true);
  };

  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!assignTechId || !selectedOrder) return;
    try {
      await api.createSchedule({ orderId: selectedOrder.id, technicianId: parseInt(assignTechId), appointmentDate: `${assignDate}T00:00:00`, appointmentTime: assignTime, notes: assignNotes });
      await api.updateOrder(selectedOrder.id, { status: 'INSTALLING_REPAIRING' });
      notify('Đã phân công kỹ thuật viên!');
      setShowAssignModal(false); setSelectedOrder(null); setAssignNotes('');
      fetchAllData();
    } catch { notify('Không thể phân công','error'); }
  };

  /* ── CRUD actions ─── */
  const handleProductImageUpload = async (e, isEdit = false, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      if ((res.status === 'success' || res.success) && res.data) {
        if (isEdit) {
          setEditProductForm(prev => {
            const newImgs = [...prev.images];
            if (index !== null) {
              newImgs[index] = res.data;
            } else {
              newImgs.push(res.data);
            }
            return { ...prev, images: newImgs };
          });
        } else {
          setNewProduct(prev => {
            const newImgs = [...prev.images];
            if (index !== null) {
              newImgs[index] = res.data;
            } else {
              newImgs.push(res.data);
            }
            return { ...prev, images: newImgs };
          });
        }
        notify('Tải ảnh lên thành công!');
      } else {
        notify('Lỗi tải ảnh: ' + (res.message || 'Không có phản hồi'), 'error');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      notify('Lỗi tải ảnh: ' + errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (newProduct.images.length === 0) {
      notify('Vui lòng tải lên ít nhất 1 ảnh sản phẩm', 'error');
      return;
    }
    try {
      await api.createProduct({ 
        ...newProduct, 
        price: parseFloat(newProduct.price), 
        categoryId: parseInt(newProduct.categoryId), 
        warrantyMonths: parseInt(newProduct.warrantyMonths),
        image: newProduct.images.filter(Boolean).join(',')
      });
      setNewProduct({ name:'', description:'', price:'', categoryId:'', brand:'', warrantyMonths:12, images:[] });
      setShowAddProduct(false); notify('Đã thêm sản phẩm mới!'); fetchAllData();
    } catch { notify('Lỗi khi thêm sản phẩm','error'); }
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditProductForm({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      categoryId: prod.categoryId || '',
      brand: prod.brand || '',
      warrantyMonths: prod.warrantyMonths !== undefined ? prod.warrantyMonths : 12,
      images: prod.image ? prod.image.split(',').filter(Boolean) : []
    });
    setShowEditProduct(true);
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (editProductForm.images.length === 0) {
      notify('Vui lòng tải lên ít nhất 1 ảnh sản phẩm', 'error');
      return;
    }
    try {
      await api.updateProduct(editingProduct.id, {
        ...editProductForm,
        price: parseFloat(editProductForm.price),
        categoryId: parseInt(editProductForm.categoryId),
        warrantyMonths: parseInt(editProductForm.warrantyMonths),
        image: editProductForm.images.filter(Boolean).join(',')
      });
      setShowEditProduct(false);
      setEditingProduct(null);
      notify('Cập nhật sản phẩm thành công!');
      fetchAllData();
    } catch {
      notify('Lỗi khi cập nhật sản phẩm', 'error');
    }
  };

  const handleOpenEditService = (serv) => {
    setEditingService(serv);
    const parts = (serv.description || '').split('---');
    const summary = parts[0]?.trim() || '';
    const detail = parts[1]?.trim() || '';
    setEditServiceForm({
      name: serv.name || '',
      summary,
      detail,
      basePrice: serv.basePrice || '',
      estimatedHours: serv.estimatedHours !== undefined ? serv.estimatedHours : 1
    });
    setShowEditService(true);
  };

  const handleUpdateServiceSubmit = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      const description = `${editServiceForm.summary.trim()}\n---\n${editServiceForm.detail.trim()}`;
      await api.updateService(editingService.id, {
        name: editServiceForm.name,
        description,
        basePrice: parseFloat(editServiceForm.basePrice),
        estimatedHours: parseInt(editServiceForm.estimatedHours)
      });
      setShowEditService(false);
      setEditingService(null);
      notify('Cập nhật dịch vụ thành công!');
      fetchAllData();
    } catch {
      notify('Lỗi khi cập nhật dịch vụ', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory(newCategory);
      setNewCategory({ name:'', description:'', image:'' });
      setShowAddCategory(false); notify('Đã thêm danh mục mới!'); fetchAllData();
    } catch { notify('Lỗi khi thêm danh mục','error'); }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const description = `${newService.summary.trim()}\n---\n${newService.detail.trim()}`;
      await api.createService({
        name: newService.name,
        description,
        basePrice: parseFloat(newService.basePrice),
        estimatedHours: parseInt(newService.estimatedHours)
      });
      setNewService({ name:'', summary:'', detail:'', basePrice:'', estimatedHours:1 });
      setShowAddService(false); notify('Đã thêm dịch vụ mới!'); fetchAllData();
    } catch { notify('Lỗi khi thêm dịch vụ','error'); }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      // Input range validation
      if (newVoucher.discountType === 'PERCENTAGE') {
        const val = parseFloat(newVoucher.discountValue);
        if (isNaN(val) || val <= 0 || val > 100) {
          notify('Phần trăm giảm giá phải nằm trong khoảng từ 0% đến 100%!', 'error');
          return;
        }
      } else {
        const val = parseFloat(newVoucher.discountValue);
        if (isNaN(val) || val <= 0) {
          notify('Số tiền giảm giá phải lớn hơn 0!', 'error');
          return;
        }
      }

      if (newVoucher.minOrderValue && parseFloat(newVoucher.minOrderValue) < 0) {
        notify('Giá trị đơn hàng tối thiểu không được âm!', 'error');
        return;
      }
      if (newVoucher.maxUsage && parseInt(newVoucher.maxUsage) <= 0) {
        notify('Giới hạn sử dụng phải ít nhất là 1!', 'error');
        return;
      }

      const nowStr = new Date().toISOString().split('.')[0];
      const expiryStr = newVoucher.expiryDate
        ? `${newVoucher.expiryDate}T23:59:59`
        : `${new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}T23:59:59`;

      let appCond = 'ALL';
      if (newVoucher.scope === 'CATEGORY') {
        if (!newVoucher.scopeCategoryId) { notify('Vui lòng chọn danh mục áp dụng!', 'error'); return; }
        appCond = `CATEGORY:${newVoucher.scopeCategoryId}`;
      } else if (newVoucher.scope === 'PRODUCT') {
        if (!newVoucher.scopeProductIds || newVoucher.scopeProductIds.length === 0) { notify('Vui lòng chọn ít nhất 1 sản phẩm áp dụng!', 'error'); return; }
        appCond = `PRODUCT:${newVoucher.scopeProductIds.join(',')}`;
      }

      await api.createDiscount({
        code: newVoucher.code.trim().toUpperCase(),
        discountType: newVoucher.discountType === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue: parseFloat(newVoucher.discountValue),
        minOrderValue: parseFloat(newVoucher.minOrderValue || 0),
        maxUsages: parseInt(newVoucher.maxUsage || 100),
        startDate: nowStr,
        endDate: expiryStr,
        applicableConditions: appCond,
        status: 'ACTIVE'
      });
      setNewVoucher({ 
        code: '', 
        discountType: 'PERCENTAGE', 
        discountValue: '', 
        minOrderValue: '', 
        maxUsage: 100, 
        expiryDate: '',
        scope: 'ALL',
        scopeCategoryId: '',
        scopeProductIds: []
      });
      setShowAddVoucher(false); notify('Đã tạo mã giảm giá!'); fetchAllData();
    } catch (err) {
      notify(api.extractErrorMessage(err, 'Lỗi khi tạo voucher'), 'error');
    }
  };

  const handleOpenEditVoucher = (v) => {
    setEditingVoucher(v);
    
    let scope = 'ALL';
    let scopeCategoryId = '';
    let scopeProductIds = [];
    
    if (v.applicableConditions) {
      if (v.applicableConditions.startsWith('CATEGORY:')) {
        scope = 'CATEGORY';
        scopeCategoryId = v.applicableConditions.split(':')[1];
      } else if (v.applicableConditions.startsWith('PRODUCT:')) {
        scope = 'PRODUCT';
        const parts = v.applicableConditions.split(':')[1];
        scopeProductIds = parts ? parts.split(',').map(idStr => {
          const num = parseInt(idStr);
          return isNaN(num) ? idStr : num;
        }) : [];
      }
    }
    
    let expiryDate = '';
    if (v.endDate) {
      expiryDate = v.endDate.split('T')[0];
    }

    setEditVoucherForm({
      code: v.code || '',
      discountType: v.discountType === 'FIXED_AMOUNT' ? 'FIXED' : 'PERCENTAGE',
      discountValue: v.discountValue || '',
      minOrderValue: v.minOrderValue || '',
      maxUsage: v.maxUsages || 100,
      expiryDate: expiryDate,
      scope: scope,
      scopeCategoryId: scopeCategoryId,
      scopeProductIds: scopeProductIds,
      status: v.status || 'ACTIVE'
    });
    setShowEditVoucher(true);
  };

  const handleUpdateVoucherSubmit = async (e) => {
    e.preventDefault();
    if (!editingVoucher) return;
    try {
      // Input range validation
      if (editVoucherForm.discountType === 'PERCENTAGE') {
        const val = parseFloat(editVoucherForm.discountValue);
        if (isNaN(val) || val <= 0 || val > 100) {
          notify('Phần trăm giảm giá phải nằm trong khoảng từ 0% đến 100%!', 'error');
          return;
        }
      } else {
        const val = parseFloat(editVoucherForm.discountValue);
        if (isNaN(val) || val <= 0) {
          notify('Số tiền giảm giá phải lớn hơn 0!', 'error');
          return;
        }
      }

      if (editVoucherForm.minOrderValue && parseFloat(editVoucherForm.minOrderValue) < 0) {
        notify('Giá trị đơn hàng tối thiểu không được âm!', 'error');
        return;
      }
      if (editVoucherForm.maxUsage && parseInt(editVoucherForm.maxUsage) <= 0) {
        notify('Giới hạn sử dụng phải ít nhất là 1!', 'error');
        return;
      }

      const expiryStr = editVoucherForm.expiryDate
        ? `${editVoucherForm.expiryDate}T23:59:59`
        : `${new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]}T23:59:59`;

      let appCond = 'ALL';
      if (editVoucherForm.scope === 'CATEGORY') {
        if (!editVoucherForm.scopeCategoryId) { notify('Vui lòng chọn danh mục áp dụng!', 'error'); return; }
        appCond = `CATEGORY:${editVoucherForm.scopeCategoryId}`;
      } else if (editVoucherForm.scope === 'PRODUCT') {
        if (!editVoucherForm.scopeProductIds || editVoucherForm.scopeProductIds.length === 0) { notify('Vui lòng chọn ít nhất 1 sản phẩm áp dụng!', 'error'); return; }
        appCond = `PRODUCT:${editVoucherForm.scopeProductIds.join(',')}`;
      }

      await api.updateDiscount(editingVoucher.id, {
        code: editVoucherForm.code.trim().toUpperCase(),
        discountType: editVoucherForm.discountType === 'FIXED' ? 'FIXED_AMOUNT' : 'PERCENTAGE',
        discountValue: parseFloat(editVoucherForm.discountValue),
        minOrderValue: parseFloat(editVoucherForm.minOrderValue || 0),
        maxUsages: parseInt(editVoucherForm.maxUsage || 100),
        startDate: editingVoucher.startDate || new Date().toISOString().split('.')[0],
        endDate: expiryStr,
        applicableConditions: appCond,
        status: editVoucherForm.status || 'ACTIVE'
      });

      setShowEditVoucher(false);
      setEditingVoucher(null);
      notify('Cập nhật voucher thành công!');
      fetchAllData();
    } catch (err) {
      notify(api.extractErrorMessage(err, 'Lỗi khi cập nhật voucher'), 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(newUser);
      setNewUser({ name:'', email:'', phone:'', password:'', address:'', role:'TECHNICIAN', status:'ACTIVE' });
      setShowAddUser(false); notify('Đã tạo tài khoản thành công!'); fetchAllData();
    } catch (err) {
      notify(api.extractErrorMessage(err, 'Lỗi khi tạo tài khoản'), 'error');
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'CUSTOMER',
      status: user.status || 'ACTIVE'
    });
    setShowEditUser(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.updateUser(editingUser.id, editUserForm);
      setShowEditUser(false);
      setEditingUser(null);
      notify('Cập nhật phân quyền tài khoản thành công!');
      fetchAllData();
    } catch (err) {
      notify(api.extractErrorMessage(err, 'Lỗi khi cập nhật tài khoản'), 'error');
    }
  };

  const handleDeleteProduct  = async (id) => { if (!confirm('Xóa sản phẩm này?')) return; try { await api.deleteProduct(id); notify('Đã xóa!'); fetchAllData(); } catch {} };
  const handleDeleteService  = async (id) => { if (!confirm('Xóa dịch vụ này?')) return; try { await api.deleteService(id); notify('Đã xóa!'); fetchAllData(); } catch {} };
  const handleDeleteDiscount = async (id) => { if (!confirm('Xóa voucher này?')) return; try { await api.deleteDiscount(id); notify('Đã xóa!'); fetchAllData(); } catch {} };
  const handleDeleteUser     = async (id) => { if (!confirm('Xóa tài khoản này?')) return; try { await api.deleteUser(id); notify('Đã xóa tài khoản!'); fetchAllData(); } catch { notify('Không thể xóa tài khoản','error'); } };

  /* ── KPI ─── */
  const totalRevenue   = payments.filter(p=>p.status==='COMPLETED').reduce((s,p)=>s+p.amount,0);
  const pendingOrders  = orders.filter(o=>o.status==='PENDING').length;
  const completedOrders= orders.filter(o=>o.status==='COMPLETED').length;
  const activeSchedules= schedules.filter(s=>s.status==='SCHEDULED'||s.status==='IN_PROGRESS').length;

  /* ── Chart data ─── */
  const revenueByMonth = (() => {
    const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    const data = months.map(m => ({ month:m, doanhThu:0, donHang:0 }));
    payments.filter(p=>p.status==='COMPLETED').forEach(p => { if(p.createdAt){ const m=new Date(p.createdAt).getMonth(); data[m].doanhThu+=p.amount; }});
    orders.forEach(o => { if(o.createdAt){ const m=new Date(o.createdAt).getMonth(); data[m].donHang+=1; }});
    return data;
  })();

  const orderStatusData = ['PENDING','INSTALLING_REPAIRING','COMPLETED','CANCELLED'].map(st => ({
    name: STATUS_LABELS[st], value: orders.filter(o=>o.status===st).length, color: STATUS_COLORS[st]
  })).filter(d=>d.value>0);

  const topProductsData = (() => {
    const c={};
    orders.forEach(o => { o.orderItems?.forEach(i => { c[i.productName]=(c[i.productName]||0)+i.quantity; }); });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([name,soLuong])=>({ name: name.length>18?name.slice(0,18)+'…':name, soLuong }));
  })();

  const TABS = [
    { id:'overview',    icon:TrendingUp,   label:'Tổng quan' },
    { id:'charts',      icon:BarChart2,    label:'Biểu đồ' },
    { id:'orders',      icon:ClipboardList,label:'Đơn hàng' },
    { id:'schedules',   icon:Calendar,     label:'Lịch trình' },
    { id:'technicians', icon:Wrench,       label:'Kỹ thuật viên' },
    { id:'users',       icon:Users,        label:'Tài khoản' },
    { id:'inventory',   icon:Package,      label:'Kho & Dịch vụ' },
    { id:'posts',       icon:Camera,       label:'Nhật ký làm việc' },
    { id:'vouchers',    icon:Tag,          label:'Voucher' },
  ];

  return (
    <div className="admin-portal-main-grid animate-fade-in" style={{ paddingBottom:40 }}>

      {/* Toast */}
      {message && (
        <div className={`toast ${message.type==='error'?'toast-error':'toast-success'}`}>
          <Check size={17} /><span>{message.text}</span>
        </div>
      )}

      {/* ── Sidebar ────────────────────────────────── */}
      <div className="portal-sidebar-card">
        <div className="flex-gap-3 sidebar-header" style={{ padding:'0 6px', marginBottom:14 }}>
          <div className="flex-center" style={{ width:36, height:36, borderRadius:'var(--r-md)', background:'var(--brand-blue-light)', color:'var(--brand-blue)' }}><Shield size={20}/></div>
          <div>
            <div style={{ fontWeight:800, fontSize:'0.95rem' }}>Quản Trị Viên</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Admin Dashboard</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={`sidebar-nav-item ${activeTab===tab.id?'active':''}`} onClick={()=>setActiveTab(tab.id)}>
                <Icon size={15}/> {tab.label}
                {tab.id==='orders' && pendingOrders > 0 && (
                  <span style={{ marginLeft:'auto', background:'var(--danger)', color:'#fff', borderRadius:'var(--r-full)', fontSize:'0.65rem', fontWeight:800, padding:'1px 6px' }}>{pendingOrders}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer" style={{ marginTop:'auto', paddingTop:14, borderTop:'1px solid var(--border)', width:'100%' }}>
          <button onClick={fetchAllData} className="btn btn-secondary btn-sm" style={{ width:'100%', gap:6 }}>
            <RefreshCw size={13}/> Tải lại dữ liệu
          </button>
        </div>
      </div>

      {/* ── Main content ───────────────────────────── */}
      <div>

        {/* ══ OVERVIEW ══════════════════════════════ */}
        {activeTab==='overview' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize:'1.35rem', fontWeight:800, marginBottom:20 }}>Báo Cáo Tổng Quan</h2>
            <div className="kpi-grid">
              <KpiCard label="DOANH THU ĐÃ THU"   value={fmtFull(totalRevenue)}   sub={`${payments.filter(p=>p.status==='COMPLETED').length} thanh toán`} color="green"  icon={<DollarSign size={20}/>}/>
              <KpiCard label="ĐƠN CHỜ DUYỆT"      value={pendingOrders}           sub={`/ ${orders.length} tổng đơn`}                                       color="yellow" icon={<ClipboardList size={20}/>}/>
              <KpiCard label="ĐƠN HOÀN THÀNH"      value={completedOrders}         sub={`${orders.length>0?Math.round(completedOrders/orders.length*100):0}% tỷ lệ`} color="blue"   icon={<Activity size={20}/>}/>
              <KpiCard label="LỊCH ĐANG CHẠY"      value={activeSchedules}         sub={`${technicians.length} kỹ thuật viên`}                                color="red"    icon={<Calendar size={20}/>}/>
            </div>
            <div className="admin-charts-grid">
              <div className="card-flat" style={{ padding:24 }}>
                <h4 style={{ marginBottom:16, fontWeight:700 }}>Đơn hàng gần đây</h4>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead><tr><th>Khách hàng</th><th>Dịch vụ</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {orders.slice(-6).reverse().map(o=>(
                        <tr key={o.id}>
                          <td style={{ fontWeight:600 }}>{o.userName}</td>
                          <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{o.serviceType}</td>
                          <td style={{ fontWeight:700, color: 'var(--danger)' }}>{fmtVnd(o.totalPrice)}</td>
                          <td><span style={{ background:(STATUS_COLORS[o.status]||'#97A0AF')+'20', color:STATUS_COLORS[o.status]||'var(--text-muted)', padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:'0.72rem', fontWeight:700 }}>{STATUS_LABELS[o.status]||o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-flat" style={{ padding:24 }}>
                <h4 style={{ marginBottom:16, fontWeight:700 }}>Hiệu suất kỹ thuật viên</h4>
                {technicians.map(t=>(
                  <div key={t.id} className="flex-gap-3" style={{ padding:'10px 12px', background:'var(--bg-surface-2)', borderRadius:'var(--r-md)', marginBottom:10 }}>
                    <div className="flex-center" style={{ width:36, height:36, borderRadius:'50%', background:'var(--brand-blue-light)', color:'var(--brand-blue)', fontWeight:800, fontSize:'0.85rem', flexShrink:0 }}>{t.name?.[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{t.specialty}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div className="flex-gap-1" style={{ color:'#FF8B00', fontWeight:700, fontSize:'0.85rem', justifyContent:'flex-end' }}><Star size={12} fill="#FF8B00"/>{t.rating}</div>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{t.totalJobs} việc</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ CHARTS ════════════════════════════════ */}
        {activeTab==='charts' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize:'1.35rem', fontWeight:800, marginBottom:20 }}>Biểu Đồ Phân Tích</h2>
            <div className="card-flat" style={{ padding:24, marginBottom:20 }}>
              <h4 style={{ marginBottom:18, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><Activity size={17} color="var(--brand-blue)"/>Doanh Thu & Đơn Hàng Theo Tháng</h4>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={revenueByMonth} margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{fill:'var(--text-secondary)',fontSize:12}}/>
                  <YAxis yAxisId="left" tick={{fill:'var(--text-secondary)',fontSize:11}} tickFormatter={v=>v>=1e6?(v/1e6).toFixed(0)+'M':v}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fill:'var(--text-secondary)',fontSize:11}}/>
                  <Tooltip contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} formatter={(v,n)=>[n==='doanhThu'?fmtFull(v):v, n==='doanhThu'?'Doanh thu':'Đơn hàng']}/>
                  <Legend formatter={v=>v==='doanhThu'?'Doanh thu':'Đơn hàng'}/>
                  <Line yAxisId="left"  type="monotone" dataKey="doanhThu" stroke="#0052CC" strokeWidth={2.5} dot={{r:4}} activeDot={{r:6}}/>
                  <Line yAxisId="right" type="monotone" dataKey="donHang"  stroke="#FFAB00" strokeWidth={2.5} dot={{r:4}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="admin-split-grid">
              <div className="card-flat" style={{ padding:24 }}>
                <h4 style={{ marginBottom:18, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><PieChart size={17} color="var(--brand-blue)"/>Trạng Thái Đơn</h4>
                {orderStatusData.length>0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}><RechartsPie><Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={3}>{orderStatusData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/></RechartsPie></ResponsiveContainer>
                    <div style={{ display:'flex', flexDirection:'column', gap:7, marginTop:8 }}>
                      {orderStatusData.map((d,i)=>(
                        <div key={i} className="flex-between" style={{ fontSize:'0.82rem' }}>
                          <div className="flex-gap-2"><div style={{ width:10, height:10, borderRadius:'50%', background:d.color }}/><span style={{ color:'var(--text-secondary)' }}>{d.name}</span></div>
                          <strong style={{ color:d.color }}>{d.value}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="empty-state"><Package size={44}/><p style={{ marginTop:10 }}>Chưa có dữ liệu</p></div>}
              </div>
              <div className="card-flat" style={{ padding:24 }}>
                <h4 style={{ marginBottom:18, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><BarChart2 size={17} color="var(--brand-blue)"/>Top Sản Phẩm Bán Chạy</h4>
                {topProductsData.length>0 ? (
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={topProductsData} layout="vertical" margin={{left:10,right:20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                      <XAxis type="number" tick={{fill:'var(--text-secondary)',fontSize:11}}/>
                      <YAxis type="category" dataKey="name" tick={{fill:'var(--text-primary)',fontSize:11}} width={130}/>
                      <Tooltip contentStyle={{background:'#fff',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} formatter={v=>[v,'Số lượng bán']}/>
                      <Bar dataKey="soLuong" radius={[0,4,4,0]}>{topProductsData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state"><BarChart2 size={44}/><p style={{ marginTop:10 }}>Chưa có dữ liệu đơn hàng</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS ════════════════════════════════ */}
        {activeTab==='orders' && (() => {
          const orderPageSize = 10;
          const reversedOrders = orders.slice().reverse();
          const totalOrderPages = Math.ceil(reversedOrders.length / orderPageSize) || 1;
          const currentOrderPage = Math.min(orderPage, totalOrderPages);
          const paginatedOrders = reversedOrders.slice((currentOrderPage - 1) * orderPageSize, currentOrderPage * orderPageSize);

          return (
            <div className="card-flat animate-fade-in" style={{ padding:24 }}>
              <h3 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:20 }}>Quản Lý Đơn Hàng ({orders.length})</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Địa chỉ</th><th>Dịch vụ</th><th>Tổng tiền</th><th>Trạng thái</th><th style={{ textAlign:'center' }}>Thao tác</th></tr></thead>
                  <tbody>
                  {paginatedOrders.map(o=>(
                    <tr key={o.id}>
                      <td style={{ fontWeight:700, color:'var(--brand-blue)' }}>#{o.id}</td>
                      <td style={{ fontWeight:600 }}>{o.userName}</td>
                      <td style={{ color:'var(--text-secondary)', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.deliveryAddress}</td>
                      <td style={{ fontSize:'0.8rem' }}>{o.serviceType}</td>
                      <td style={{ fontWeight:700, color:'var(--danger)' }}>{fmtVnd(o.totalPrice)}</td>
                      <td><span style={{ background:(STATUS_COLORS[o.status]||'#97A0AF')+'20', color:STATUS_COLORS[o.status]||'var(--text-muted)', padding:'4px 10px', borderRadius:'var(--r-full)', fontSize:'0.72rem', fontWeight:700 }}>{STATUS_LABELS[o.status]||o.status}</span></td>
                      <td>
                        <div className="flex-center" style={{ gap:7 }}>
                          {o.status==='PENDING' && (
                            <>
                              <button onClick={()=>handleOpenAssignModal(o)} className="btn btn-primary btn-sm">Phân công</button>
                              <button onClick={()=>handleUpdateOrderStatus(o.id,'INSTALLING_REPAIRING')} className="btn btn-warning btn-sm">Tự xử lý</button>
                              <button onClick={()=>handleUpdateOrderStatus(o.id,'CANCELLED')} className="btn btn-danger btn-sm">Hủy</button>
                            </>
                          )}
                          {o.status==='INSTALLING_REPAIRING' && (
                            <button onClick={()=>handleUpdateOrderStatus(o.id,'COMPLETED')} className="btn btn-success btn-sm">Hoàn thành</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {orders.length > orderPageSize && (
                <div className="pagination-container">
                  <button 
                    type="button"
                    disabled={currentOrderPage === 1} 
                    onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
                    className="pagination-btn"
                  >
                    Trước
                  </button>
                  {getVisiblePages(currentOrderPage, totalOrderPages).map((p, idx) => (
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis" style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
                    ) : (
                      <button 
                        key={p} 
                        type="button"
                        onClick={() => setOrderPage(p)}
                        className={`pagination-btn ${currentOrderPage === p ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  ))}
                  <button 
                    type="button"
                    disabled={currentOrderPage === totalOrderPages} 
                    onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
                    className="pagination-btn"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══ SCHEDULES ═════════════════════════════ */}
        {activeTab==='schedules' && (
          <div className="card-flat animate-fade-in" style={{ padding:24 }}>
            <h3 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:20 }}>Lịch Phân Công Làm Việc</h3>
            <div className="table-responsive">
              <table className="data-table">
              <thead>
                <tr>
                  <th>Đơn hàng</th>
                  <th>Kỹ thuật viên</th>
                  <th>Ngày hẹn</th>
                  <th>Khung giờ</th>
                  <th>Trạng thái</th>
                  <th>Ghi chú</th>
                  <th style={{ textAlign:'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(sch=>{
                  const mapStatus = {
                    SCHEDULED:   { label:'Đã lên lịch', bg:'var(--brand-blue-light)',    color:'var(--brand-blue)' },
                    IN_PROGRESS: { label:'Đang thực hiện', bg:'var(--brand-yellow-light)',color:'var(--warning)' },
                    COMPLETED:   { label:'Hoàn thành', bg:'var(--success-bg)',            color:'var(--success)' },
                  };
                  const s = mapStatus[sch.status] || { label:sch.status, bg:'var(--bg-page)', color:'var(--text-secondary)' };
                  return (
                    <tr key={sch.id}>
                      <td style={{ fontWeight:700, color:'var(--brand-blue)' }}>Đơn #{sch.orderId}</td>
                      <td style={{ fontWeight:600 }}>{sch.technicianName}</td>
                      <td>{sch.appointmentDate ? new Date(sch.appointmentDate).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>{sch.appointmentTime}</td>
                      <td><span style={{ background:s.bg, color:s.color, padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:'0.72rem', fontWeight:700 }}>{s.label}</span></td>
                      <td style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>{sch.notes}</td>
                      <td>
                        <div className="flex-center" style={{ gap:7 }}>
                          {sch.status==='SCHEDULED' && (
                            <button onClick={()=>handleUpdateScheduleStatus(sch,'IN_PROGRESS')} className="btn btn-primary btn-sm">Bắt đầu làm</button>
                          )}
                          {sch.status==='IN_PROGRESS' && (
                            <button onClick={()=>handleUpdateScheduleStatus(sch,'COMPLETED')} className="btn btn-success btn-sm">Hoàn thành</button>
                          )}
                          {sch.status==='COMPLETED' && (
                            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Đã hoàn thành</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* ══ TECHNICIANS ═══════════════════════════ */}
        {activeTab==='technicians' && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:20 }}>Đội Ngũ Kỹ Thuật Viên</h3>
            <div className="admin-split-grid-equal">
              {technicians.map(t=>(
                <div key={t.id} className="card" style={{ padding:20, display:'flex', gap:14 }}>
                  <div className="flex-center" style={{ width:54, height:54, borderRadius:'50%', background:'var(--brand-blue-light)', color:'var(--brand-blue)', fontSize:'1.2rem', fontWeight:800, flexShrink:0 }}>{t.name?.[0]}</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ fontSize:'0.95rem', marginBottom:4 }}>{t.name}</h4>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:10 }}>
                      <div>SĐT: <strong>{t.phone}</strong></div>
                      <div>Chuyên môn: <strong style={{ color:'var(--brand-blue)' }}>{t.specialty}</strong></div>
                    </div>
                    <div className="flex-gap-3" style={{ paddingTop:8, borderTop:'1px solid var(--border)', fontSize:'0.78rem', flexWrap:'wrap' }}>
                      <span className={`badge ${t.status==='AVAILABLE'?'badge-green':'badge-yellow'}`}>{t.status}</span>
                      <span className="flex-gap-1" style={{ color:'#FF8B00', fontWeight:700 }}><Star size={12} fill="#FF8B00"/>{t.rating}</span>
                      <span style={{ color:'var(--text-muted)' }}>{t.totalJobs} việc</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ INVENTORY ═════════════════════════════ */}
        {activeTab==='inventory' && (() => {
          const adminProductPageSize = 10;
          const totalAdminProductPages = Math.ceil(products.length / adminProductPageSize) || 1;
          const currentAdminProductPage = Math.min(productPage, totalAdminProductPages);
          const paginatedAdminProducts = products.slice((currentAdminProductPage - 1) * adminProductPageSize, currentAdminProductPage * adminProductPageSize);

          const servicePageSize = 10;
          const totalServicePages = Math.ceil(services.length / servicePageSize) || 1;
          const currentServicePage = Math.min(servicePage, totalServicePages);
          const paginatedServices = services.slice((currentServicePage - 1) * servicePageSize, currentServicePage * servicePageSize);

          const categoryPageSize = 10;
          const totalCategoryPages = Math.ceil(categories.length / categoryPageSize) || 1;
          const currentCategoryPage = Math.min(categoryPage, totalCategoryPages);
          const paginatedCategories = categories.slice((currentCategoryPage - 1) * categoryPageSize, currentCategoryPage * categoryPageSize);

          return (
            <div className="animate-fade-in">
              <h3 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:20 }}>Kho Hàng & Dịch Vụ</h3>
              <div className="admin-split-grid-equal">

                {/* Products */}
                <div className="card-flat" style={{ padding:20 }}>
                  <div className="flex-between" style={{ marginBottom:14 }}>
                    <h4 style={{ fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><Package size={16} color="var(--brand-blue)"/>Sản phẩm ({products.length})</h4>
                    <button onClick={()=>setShowAddProduct(true)} className="btn btn-primary btn-sm" style={{ gap:5 }}><Plus size={14}/>Thêm SP</button>
                  </div>
                  <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
                    {paginatedAdminProducts.map(p=>(
                      <div key={p.id} className="flex-between" style={{ padding:'10px 12px', background:'var(--bg-surface-2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{p.name}</div>
                          <span style={{ fontSize:'0.74rem', color:'var(--danger)', fontWeight:700 }}>{fmtVnd(p.price)}</span>
                          <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:6 }}>• {p.brand}</span>
                        </div>
                        <div className="flex-center" style={{ gap: 8 }}>
                          <button onClick={()=>handleOpenEditProduct(p)} className="btn-icon" style={{ color:'var(--brand-blue)' }} title="Chỉnh sửa"><Edit size={14}/></button>
                          <button onClick={()=>handleDeleteProduct(p.id)} className="btn-icon" style={{ color:'var(--danger)' }} title="Xóa"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {products.length > adminProductPageSize && (
                    <div className="flex-between" style={{ marginTop: 12, alignItems: 'center' }}>
                      <button 
                        type="button"
                        disabled={currentAdminProductPage === 1} 
                        onClick={() => setProductPage(prev => Math.max(prev - 1, 1))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Trước
                      </button>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Trang {currentAdminProductPage} / {totalAdminProductPages}
                      </span>
                      <button 
                        type="button"
                        disabled={currentAdminProductPage === totalAdminProductPages} 
                        onClick={() => setProductPage(prev => Math.min(prev + 1, totalAdminProductPages))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="card-flat" style={{ padding:20 }}>
                  <div className="flex-between" style={{ marginBottom:14 }}>
                    <h4 style={{ fontWeight:700, display:'flex', alignItems:'center', gap:8 }}><Wrench size={16} color="var(--success)"/>Dịch vụ ({services.length})</h4>
                    <button onClick={()=>setShowAddService(true)} className="btn btn-success btn-sm" style={{ gap:5 }}><Plus size={14}/>Thêm DV</button>
                  </div>
                  <div style={{ maxHeight:320, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
                    {paginatedServices.map(s=>(
                      <div key={s.id} className="flex-between" style={{ padding:'10px 12px', background:'var(--bg-surface-2)', borderRadius:'var(--r-md)', border:'1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{s.name}</div>
                          <span style={{ fontSize:'0.74rem', color:'var(--success)', fontWeight:700 }}>{fmtVnd(s.basePrice)}</span>
                          <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:6 }}>• {s.estimatedHours}h</span>
                        </div>
                        <div className="flex-center" style={{ gap: 8 }}>
                          <button onClick={()=>handleOpenEditService(s)} className="btn-icon" style={{ color:'var(--brand-blue)' }} title="Chỉnh sửa"><Edit size={14}/></button>
                          <button onClick={()=>handleDeleteService(s.id)} className="btn-icon" style={{ color:'var(--danger)' }} title="Xóa"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {services.length > servicePageSize && (
                    <div className="flex-between" style={{ marginTop: 12, alignItems: 'center' }}>
                      <button 
                        type="button"
                        disabled={currentServicePage === 1} 
                        onClick={() => setServicePage(prev => Math.max(prev - 1, 1))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Trước
                      </button>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Trang {currentServicePage} / {totalServicePages}
                      </span>
                      <button 
                        type="button"
                        disabled={currentServicePage === totalServicePages} 
                        onClick={() => setServicePage(prev => Math.min(prev + 1, totalServicePages))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>

                {/* Categories */}
                <div className="card-flat" style={{ padding:20 }}>
                  <div className="flex-between" style={{ marginBottom:14 }}>
                    <h4 style={{ fontWeight:700 }}>Danh mục ({categories.length})</h4>
                    <button onClick={()=>setShowAddCategory(true)} className="btn btn-secondary btn-sm" style={{ gap:5 }}><Plus size={14}/>Thêm DM</button>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {paginatedCategories.map(c=>(
                      <span key={c.id} className="badge badge-blue" style={{ fontSize:'0.82rem' }}>{c.name}</span>
                    ))}
                  </div>
                  {categories.length > categoryPageSize && (
                    <div className="flex-between" style={{ marginTop: 12, alignItems: 'center', width: '100%' }}>
                      <button 
                        type="button"
                        disabled={currentCategoryPage === 1} 
                        onClick={() => setCategoryPage(prev => Math.max(prev - 1, 1))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Trước
                      </button>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Trang {currentCategoryPage} / {totalCategoryPages}
                      </span>
                      <button 
                        type="button"
                        disabled={currentCategoryPage === totalCategoryPages} 
                        onClick={() => setCategoryPage(prev => Math.min(prev + 1, totalCategoryPages))} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="card-flat" style={{ padding:20 }}>
                  <h4 style={{ fontWeight:700, marginBottom:14 }}>Thống kê nhanh</h4>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { v:products.length, l:'Sản phẩm', c:'var(--brand-blue)' },
                      { v:services.length, l:'Dịch vụ',  c:'var(--success)' },
                      { v:categories.length, l:'Danh mục',c:'var(--warning)' },
                      { v:discounts.length, l:'Voucher',  c:'var(--purple)' },
                    ].map(s=>(
                      <div key={s.l} style={{ textAlign:'center', padding:'14px 8px', background:'var(--bg-page)', borderRadius:'var(--r-md)' }}>
                        <div style={{ fontWeight:800, fontSize:'1.4rem', color:s.c }}>{s.v}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ══ VOUCHERS ══════════════════════════════ */}
        {activeTab==='vouchers' && (
          <div className="animate-fade-in">
            <div className="flex-between" style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:'1.2rem', fontWeight:800 }}>Quản Lý Voucher / Mã Giảm Giá</h3>
              <button onClick={()=>setShowAddVoucher(true)} className="btn btn-primary" style={{ gap:6 }}><Plus size={15}/>Tạo Voucher Mới</button>
            </div>
            <div className="vouchers-grid">
              {discounts.map(d=>{
                const isExpired = d.endDate ? new Date(d.endDate) < new Date() : false;
                const displayStatus = isExpired ? 'EXPIRED' : (d.status || 'ACTIVE');
                
                // Status badge config
                let badgeBg = 'rgba(0, 135, 90, 0.08)';
                let badgeColor = 'var(--success)';
                let badgeLabel = 'Hoạt động';
                if (displayStatus === 'DEACTIVATED') {
                  badgeBg = 'rgba(222, 53, 11, 0.08)';
                  badgeColor = 'var(--danger)';
                  badgeLabel = 'Tạm khóa';
                } else if (displayStatus === 'EXPIRED') {
                  badgeBg = 'rgba(122, 134, 154, 0.1)';
                  badgeColor = 'var(--text-secondary)';
                  badgeLabel = 'Hết hạn';
                }

                // Progress percentage
                const used = d.usedCount || 0;
                const total = d.maxUsages || 1;
                const usagePercent = Math.min(100, (used / total) * 100);

                return (
                  <div key={d.id} className="card" style={{ 
                    padding:18, 
                    borderLeft: d.discountType === 'PERCENTAGE' ? '4px solid var(--brand-blue)' : '4px solid var(--purple)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 200
                  }}>
                    <div>
                      <div className="flex-between" style={{ marginBottom:10 }}>
                        <span style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--brand-blue)', letterSpacing:'.05em' }}>{d.code}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ 
                            background: badgeBg, 
                            color: badgeColor, 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700 
                          }}>{badgeLabel}</span>
                          <button onClick={()=>handleOpenEditVoucher(d)} className="btn-icon" style={{ color:'var(--text-secondary)' }} title="Chỉnh sửa"><Edit size={14}/></button>
                          <button onClick={()=>handleDeleteDiscount(d.id)} className="btn-icon" style={{ color:'var(--danger)' }} title="Xóa"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      <div style={{ fontSize:'1.4rem', fontWeight:800, color:'var(--danger)', marginBottom:6 }}>
                        {d.discountType==='PERCENTAGE' ? `${d.discountValue}% OFF` : fmtFull(d.discountValue)}
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', display:'flex', flexDirection:'column', gap:3 }}>
                        {d.minOrderValue>0 && <span>Đơn tối thiểu: <strong>{fmtVnd(d.minOrderValue)}</strong></span>}
                        {d.endDate && <span>HSD: <strong>{new Date(d.endDate).toLocaleDateString('vi-VN')}</strong></span>}
                        {d.applicableConditions && d.applicableConditions !== 'ALL' && (
                          <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>
                            Áp dụng: {d.applicableConditions.startsWith('CATEGORY:') 
                              ? `Danh mục: ${categories.find(c => String(c.id) === String(d.applicableConditions.split(':')[1]))?.name || '—'}`
                              : `Sản phẩm cụ thể (${d.applicableConditions.split(':')[1].split(',').length} SP)`
                            }
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                      <div className="flex-between" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <span>Lượt dùng:</span>
                        <strong>{used} / {total} ({Math.round(usagePercent)}%)</strong>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 2.5, overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${usagePercent}%`, 
                          height: '100%', 
                          background: usagePercent >= 100 ? 'var(--danger)' : 'var(--brand-blue)', 
                          borderRadius: 2.5 
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {discounts.length===0 && (
                <div className="card-flat" style={{ padding:32, gridColumn:'1/-1' }}>
                  <div className="empty-state"><Tag size={48}/><p style={{ marginTop:10, fontWeight:700 }}>Chưa có voucher nào</p></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ USERS ════════════════════════════════ */}
        {activeTab==='users' && (() => {
          const userPageSize = 10;
          const totalUserPages = Math.ceil(users.length / userPageSize) || 1;
          const currentUserPage = Math.min(userPage, totalUserPages);
          const paginatedUsers = users.slice((currentUserPage - 1) * userPageSize, currentUserPage * userPageSize);

          return (
            <div className="card-flat animate-fade-in" style={{ padding:24 }}>
              <div className="flex-between" style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:'1.25rem', fontWeight:800 }}>Quản Lý Tài Khoản Người Dùng ({users.length})</h3>
                <button onClick={()=>setShowAddUser(true)} className="btn btn-primary" style={{ gap:6 }}><Plus size={15}/>Thêm Tài Khoản Mới</button>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tên người dùng</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Địa chỉ</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign:'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(u=>(
                      <tr key={u.id}>
                        <td style={{ fontWeight:600 }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td style={{ fontWeight:500 }}>{u.phone}</td>
                        <td style={{ color:'var(--text-secondary)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={u.address}>{u.address || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-blue' : u.role === 'TECHNICIAN' ? 'badge-green' : 'badge-yellow'}`}>
                            {u.role === 'ADMIN' ? '🛡 Admin' : u.role === 'TECHNICIAN' ? '🔧 Kỹ thuật' : '👤 Khách hàng'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ opacity: 0.9 }}>
                            {u.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                          </span>
                        </td>
                        <td>
                          <div className="flex-center" style={{ gap: 8 }}>
                            <button onClick={() => handleOpenEditUser(u)} className="btn-icon" style={{ color: 'var(--brand-blue)' }} title="Phân quyền tài khoản">
                              <Shield size={14} />
                            </button>
                            {u.email !== 'admin@gmail.com' && (
                              <button onClick={()=>handleDeleteUser(u.id)} className="btn-icon" style={{ color:'var(--danger)' }} title="Xóa tài khoản"><Trash2 size={14}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length > userPageSize && (
                <div className="pagination-container">
                  <button 
                    type="button"
                    disabled={currentUserPage === 1} 
                    onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                    className="pagination-btn"
                  >
                    Trước
                  </button>
                  {getVisiblePages(currentUserPage, totalUserPages).map((p, idx) => (
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="pagination-ellipsis" style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
                    ) : (
                      <button 
                        key={p} 
                        type="button"
                        onClick={() => setUserPage(p)}
                        className={`pagination-btn ${currentUserPage === p ? 'active' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  ))}
                  <button 
                    type="button"
                    disabled={currentUserPage === totalUserPages} 
                    onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                    className="pagination-btn"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══ BLOG/WORK PROCESS POSTS ══════════════ */}
        {activeTab==='posts' && (() => {
          const postPageSize = 10;
          const totalPostPages = Math.ceil(posts.length / postPageSize) || 1;
          const currentPostPage = Math.min(postPage, totalPostPages);
          const paginatedPosts = posts.slice((currentPostPage - 1) * postPageSize, currentPostPage * postPageSize);

          return (
            <div className="animate-fade-in">
              <div className="flex-between" style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:'1.25rem', fontWeight:800 }}>Quản Lý Nhật Ký / Bài Viết Hoạt Động ({posts.length})</h3>
                <button onClick={()=>setShowAddBlogPost(true)} className="btn btn-primary" style={{ gap:6 }}>
                  <Plus size={15}/>Tạo Bài Viết Mới
                </button>
              </div>
              <div className="card-flat" style={{ padding:24 }}>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 100 }}>Hình ảnh/Video</th>
                        <th>Tiêu đề bài viết</th>
                        <th>Nội dung tóm tắt</th>
                        <th style={{ width: 100 }}>Số lượt thích</th>
                        <th style={{ width: 120 }}>Ngày đăng</th>
                        <th style={{ width: 100, textAlign:'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPosts.map(p=>(
                        <tr key={p.id}>
                          <td>
                            {p.mediaUrl ? (
                              p.mediaType === 'VIDEO' ? (
                                <div style={{ width: 60, height: 60, borderRadius: 'var(--r-md)', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }} title="Video">
                                  📹
                                </div>
                              ) : (
                                <img src={p.mediaUrl} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }} />
                              )
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Không có</span>
                            )}
                          </td>
                          <td style={{ fontWeight:700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{p.title}</td>
                          <td style={{ color:'var(--text-secondary)', fontSize: '0.82rem', maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={p.content}>
                            {p.content}
                          </td>
                          <td style={{ fontWeight:700, color: 'var(--brand-blue)' }}>❤️ {p.likesCount || 0}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td>
                            <div className="flex-center" style={{ gap: 8 }}>
                              <button
                                onClick={() => {
                                  setEditingBlogPost({
                                    ...p,
                                    mediaUrls: p.mediaUrl ? p.mediaUrl.split(',').filter(Boolean) : []
                                  });
                                  setShowEditBlogPost(true);
                                }}
                                className="btn-icon"
                                style={{ color: 'var(--brand-blue)' }}
                                title="Sửa bài viết"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBlogPost(p.id)}
                                className="btn-icon"
                                style={{ color: 'var(--danger)' }}
                                title="Xóa bài viết"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {posts.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                            <div className="empty-state">
                              <Camera size={44} style={{ opacity: 0.3, marginBottom: 8 }} />
                              <p style={{ fontWeight: 700 }}>Chưa có bài đăng nhật ký nào</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {posts.length > postPageSize && (
                  <div className="pagination-container">
                    <button 
                      type="button"
                      disabled={currentPostPage === 1} 
                      onClick={() => setPostPage(prev => Math.max(prev - 1, 1))}
                      className="pagination-btn"
                    >
                      Trước
                    </button>
                    {getVisiblePages(currentPostPage, totalPostPages).map((p, idx) => (
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="pagination-ellipsis" style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
                      ) : (
                        <button 
                          key={p} 
                          type="button"
                          onClick={() => setPostPage(p)}
                          className={`pagination-btn ${currentPostPage === p ? 'active' : ''}`}
                        >
                          {p}
                        </button>
                      )
                    ))}
                    <button 
                      type="button"
                      disabled={currentPostPage === totalPostPages} 
                      onClick={() => setPostPage(prev => Math.min(prev + 1, totalPostPages))}
                      className="pagination-btn"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ════════════════════════════════════════════
          POPUP MODALS
          ════════════════════════════════════════════ */}

      {/* Add Product Modal (Modern Split Layout) */}
      {showAddProduct && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowAddProduct(false)}>
          <div className="modal-box" style={{ width: 860, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><Package size={18} color="var(--primary)"/> Thêm Sản Phẩm Mới</h3>
              <button onClick={() => setShowAddProduct(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body modal-split">
                
                {/* Left Column: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                      Thông tin cơ bản
                    </h4>
                    <div className="form-row form-row-2">
                      <div className="form-field"><label>Tên sản phẩm *</label><input type="text" required placeholder="VD: Điều hòa Daikin 1.5HP" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})}/></div>
                      <div className="form-field"><label>Hãng sản xuất *</label><input type="text" required placeholder="Daikin, LG, Panasonic..." value={newProduct.brand} onChange={e=>setNewProduct({...newProduct,brand:e.target.value})}/></div>
                    </div>
                    <div className="form-field" style={{ marginTop: 12 }}>
                      <label>Mô tả chi tiết</label>
                      <textarea placeholder="Nhập thông tin tính năng, thông số kỹ thuật..." rows={4} value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})} style={{ resize:'vertical' }}/>
                    </div>
                  </div>

                  <hr className="divider" />

                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                      Giá & Phân loại
                    </h4>
                    <div className="form-row form-row-3">
                      <div className="form-field"><label>Giá tiền (VNĐ) *</label><input type="number" required placeholder="0" value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:e.target.value})}/></div>
                      <div className="form-field"><label>Danh mục *</label>
                        <select required value={newProduct.categoryId} onChange={e=>setNewProduct({...newProduct,categoryId:e.target.value})}>
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-field"><label>Bảo hành (tháng)</label><input type="number" placeholder="12" value={newProduct.warrantyMonths} onChange={e=>setNewProduct({...newProduct,warrantyMonths:e.target.value})}/></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Image Upload Grid (up to 4 images) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                    Hình ảnh sản phẩm (Tối đa 4 ảnh)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {[0, 1, 2, 3].map(index => {
                      const url = newProduct.images?.[index];
                      return (
                        <div key={index} style={{
                          position: 'relative',
                          height: 110,
                          border: '1.5px dashed var(--border)',
                          borderRadius: 'var(--r-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-surface-2)',
                          overflow: 'hidden'
                        }}>
                          {url ? (
                            <>
                              <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== index) }))}
                                style={{
                                  position: 'absolute',
                                  top: 5,
                                  right: 5,
                                  background: 'rgba(222, 53, 11, 0.9)',
                                  color: '#fff',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Xóa ảnh"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <label style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              cursor: isUploading ? 'not-allowed' : 'pointer',
                              gap: 6
                            }}>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={isUploading}
                                onChange={e => handleProductImageUpload(e, false, index)}
                              />
                              <Plus size={18} color="var(--primary)" />
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ảnh {index + 1}</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 5 }}>
                    * Tải lên ít nhất 1 ảnh (Tối đa 4 ảnh).
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddProduct(false)} className="btn btn-secondary">Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}><Check size={16} /> Lưu Sản Phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && editingProduct && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => { setShowEditProduct(false); setEditingProduct(null); }}>
          <div className="modal-box" style={{ width: 860, maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display:'flex', alignItems:'center', gap:8 }}><Package size={18} color="var(--primary)"/> Chỉnh Sửa Sản Phẩm</h3>
              <button onClick={() => { setShowEditProduct(false); setEditingProduct(null); }} className="btn-icon"><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProductSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body modal-split">
                
                {/* Left Column: Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                      Thông tin cơ bản
                    </h4>
                    <div className="form-row form-row-2">
                      <div className="form-field"><label>Tên sản phẩm *</label><input type="text" required placeholder="VD: Điều hòa Daikin 1.5HP" value={editProductForm.name} onChange={e=>setEditProductForm({...editProductForm,name:e.target.value})}/></div>
                      <div className="form-field"><label>Hãng sản xuất *</label><input type="text" required placeholder="Daikin, LG, Panasonic..." value={editProductForm.brand} onChange={e=>setEditProductForm({...editProductForm,brand:e.target.value})}/></div>
                    </div>
                    <div className="form-field" style={{ marginTop: 12 }}>
                      <label>Mô tả chi tiết</label>
                      <textarea placeholder="Nhập thông tin tính năng, thông số kỹ thuật..." rows={4} value={editProductForm.description} onChange={e=>setEditProductForm({...editProductForm,description:e.target.value})} style={{ resize:'vertical' }}/>
                    </div>
                  </div>

                  <hr className="divider" />

                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                      Giá & Phân loại
                    </h4>
                    <div className="form-row form-row-3">
                      <div className="form-field"><label>Giá tiền (VNĐ) *</label><input type="number" required placeholder="0" value={editProductForm.price} onChange={e=>setEditProductForm({...editProductForm,price:e.target.value})}/></div>
                      <div className="form-field"><label>Danh mục *</label>
                        <select required value={editProductForm.categoryId} onChange={e=>setEditProductForm({...editProductForm,categoryId:e.target.value})}>
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-field"><label>Bảo hành (tháng)</label><input type="number" placeholder="12" value={editProductForm.warrantyMonths} onChange={e=>setEditProductForm({...editProductForm,warrantyMonths:e.target.value})}/></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Image Upload Grid (up to 4 images) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--brand-blue)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-blue)' }}></span>
                    Hình ảnh sản phẩm (Tối đa 4 ảnh)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {[0, 1, 2, 3].map(index => {
                      const url = editProductForm.images?.[index];
                      return (
                        <div key={index} style={{
                          position: 'relative',
                          height: 110,
                          border: '1.5px dashed var(--border)',
                          borderRadius: 'var(--r-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-surface-2)',
                          overflow: 'hidden'
                        }}>
                          {url ? (
                            <>
                              <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={() => setEditProductForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== index) }))}
                                style={{
                                  position: 'absolute',
                                  top: 5,
                                  right: 5,
                                  background: 'rgba(222, 53, 11, 0.9)',
                                  color: '#fff',
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Xóa ảnh"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          ) : (
                            <label style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              height: '100%',
                              cursor: isUploading ? 'not-allowed' : 'pointer',
                              gap: 6
                            }}>
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                disabled={isUploading}
                                onChange={e => handleProductImageUpload(e, true, index)}
                              />
                              <Plus size={18} color="var(--primary)" />
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ảnh {index + 1}</span>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 5 }}>
                    * Tải lên ít nhất 1 ảnh (Tối đa 4 ảnh).
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowEditProduct(false); setEditingProduct(null); }} className="btn btn-secondary">Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={isUploading}><Check size={16} /> Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditService && editingService && (
        <CrudModal title={`🔧 Chỉnh Sửa Dịch Vụ: ${editingService.name}`} onClose={()=>{setShowEditService(false);setEditingService(null);}} onSubmit={handleUpdateServiceSubmit}>
          <div className="form-field"><label>Tên dịch vụ *</label><input type="text" required placeholder="VD: Vệ sinh máy lạnh, bơm gas..." value={editServiceForm.name} onChange={e=>setEditServiceForm({...editServiceForm,name:e.target.value})}/></div>
          <div className="form-field"><label>Mô tả tổng quan (Hiển thị ở trang danh sách) *</label><input type="text" required placeholder="Tóm tắt ngắn gọn về dịch vụ..." value={editServiceForm.summary} onChange={e=>setEditServiceForm({...editServiceForm,summary:e.target.value})}/></div>
          <div className="form-field"><label>Mô tả chi tiết (Hiển thị khi bấm xem chi tiết) *</label><textarea placeholder="Các bước thực hiện, thông tin kỹ thuật chi tiết..." rows={4} required value={editServiceForm.detail} onChange={e=>setEditServiceForm({...editServiceForm,detail:e.target.value})} style={{ resize:'vertical' }}/></div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Đơn giá cơ bản (VNĐ) *</label><input type="number" required placeholder="0" value={editServiceForm.basePrice} onChange={e=>setEditServiceForm({...editServiceForm,basePrice:e.target.value})}/></div>
            <div className="form-field"><label>Thời gian ước tính (giờ) *</label><input type="number" required placeholder="1" value={editServiceForm.estimatedHours} onChange={e=>setEditServiceForm({...editServiceForm,estimatedHours:e.target.value})}/></div>
          </div>
        </CrudModal>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <CrudModal title="📁 Thêm Danh Mục Mới" onClose={()=>setShowAddCategory(false)} onSubmit={handleCreateCategory}>
          <div className="form-field"><label>Tên danh mục *</label><input type="text" required placeholder="VD: Máy lạnh, Tủ lạnh..." value={newCategory.name} onChange={e=>setNewCategory({...newCategory,name:e.target.value})}/></div>
          <div className="form-field"><label>Mô tả</label><input type="text" placeholder="Mô tả ngắn về danh mục" value={newCategory.description} onChange={e=>setNewCategory({...newCategory,description:e.target.value})}/></div>
          <div className="form-field">
            <label>Ảnh banner {isUploading && <span style={{color:'var(--brand-blue)', fontSize:'0.8rem'}}>(Đang tải lên...)</span>}</label>
            <input type="file" accept="image/*" onChange={e=>handleImageUpload(e, setNewCategory, newCategory, 'image')}/>
            {newCategory.image && <div style={{marginTop:8}}><img src={newCategory.image} alt="preview" style={{width:80, height:80, objectFit:'cover', borderRadius:'var(--r-md)'}}/></div>}
          </div>
        </CrudModal>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <CrudModal title="🔧 Thêm Dịch Vụ Kỹ Thuật" onClose={()=>setShowAddService(false)} onSubmit={handleCreateService}>
          <div className="form-field"><label>Tên dịch vụ *</label><input type="text" required placeholder="VD: Vệ sinh máy lạnh, bơm gas..." value={newService.name} onChange={e=>setNewService({...newService,name:e.target.value})}/></div>
          <div className="form-field"><label>Mô tả tổng quan (Hiển thị ở trang danh sách) *</label><input type="text" required placeholder="Tóm tắt ngắn gọn về dịch vụ..." value={newService.summary} onChange={e=>setNewService({...newService,summary:e.target.value})}/></div>
          <div className="form-field"><label>Mô tả chi tiết (Hiển thị khi bấm xem chi tiết) *</label><textarea placeholder="Các bước thực hiện, thông tin kỹ thuật chi tiết..." rows={4} required value={newService.detail} onChange={e=>setNewService({...newService,detail:e.target.value})} style={{ resize:'vertical' }}/></div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Đơn giá cơ bản (VNĐ) *</label><input type="number" required placeholder="0" value={newService.basePrice} onChange={e=>setNewService({...newService,basePrice:e.target.value})}/></div>
            <div className="form-field"><label>Thời gian ước tính (giờ) *</label><input type="number" required placeholder="1" value={newService.estimatedHours} onChange={e=>setNewService({...newService,estimatedHours:e.target.value})}/></div>
          </div>
        </CrudModal>
      )}

      {/* Add Voucher Modal */}
      {showAddVoucher && (
        <CrudModal title="🎟 Tạo Voucher Mới" onClose={()=>setShowAddVoucher(false)} onSubmit={handleCreateVoucher}>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Mã voucher *</label><input type="text" required placeholder="VD: SUMMER25" style={{ textTransform:'uppercase', fontWeight:700, letterSpacing:'.05em' }} value={newVoucher.code} onChange={e=>setNewVoucher({...newVoucher,code:e.target.value.toUpperCase()})}/></div>
            <div className="form-field"><label>Loại giảm giá</label>
              <select value={newVoucher.discountType} onChange={e=>setNewVoucher({...newVoucher,discountType:e.target.value})}>
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>{newVoucher.discountType==='PERCENTAGE'?'Phần trăm giảm (%) *':'Số tiền giảm (VNĐ) *'}</label><input type="number" required placeholder="0" value={newVoucher.discountValue} onChange={e=>setNewVoucher({...newVoucher,discountValue:e.target.value})}/></div>
            <div className="form-field"><label>Đơn hàng tối thiểu (VNĐ)</label><input type="number" placeholder="0" value={newVoucher.minOrderValue} onChange={e=>setNewVoucher({...newVoucher,minOrderValue:e.target.value})}/></div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Giới hạn sử dụng</label><input type="number" placeholder="100" value={newVoucher.maxUsage} onChange={e=>setNewVoucher({...newVoucher,maxUsage:e.target.value})}/></div>
            <div className="form-field"><label>Ngày hết hạn *</label><input type="date" required value={newVoucher.expiryDate} onChange={e=>setNewVoucher({...newVoucher,expiryDate:e.target.value})}/></div>
          </div>
          
          <div className="form-field" style={{ marginTop: 12 }}>
            <label>Phạm vi áp dụng sản phẩm</label>
            <select 
              value={newVoucher.scope || 'ALL'} 
              onChange={e => setNewVoucher({
                ...newVoucher, 
                scope: e.target.value,
                scopeCategoryId: '',
                scopeProductIds: []
              })}
            >
              <option value="ALL">Tất cả sản phẩm</option>
              <option value="CATEGORY">Theo danh mục sản phẩm</option>
              <option value="PRODUCT">Theo sản phẩm cụ thể</option>
            </select>
          </div>

          {newVoucher.scope === 'CATEGORY' && (
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Chọn danh mục sản phẩm áp dụng *</label>
              <select 
                required 
                value={newVoucher.scopeCategoryId || ''} 
                onChange={e => setNewVoucher({ ...newVoucher, scopeCategoryId: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {newVoucher.scope === 'PRODUCT' && (
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Chọn sản phẩm áp dụng * (Chọn ít nhất 1)</label>
              <div style={{ 
                maxHeight: 180, 
                overflowY: 'auto', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r-md)', 
                padding: '8px 12px',
                background: 'var(--bg-surface-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {products.map(p => {
                  const checked = (newVoucher.scopeProductIds || []).includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        style={{ width: 'auto', cursor: 'pointer' }}
                        onChange={() => {
                          const currentIds = newVoucher.scopeProductIds || [];
                          const nextIds = checked 
                            ? currentIds.filter(id => id !== p.id) 
                            : [...currentIds, p.id];
                          setNewVoucher({ ...newVoucher, scopeProductIds: nextIds });
                        }}
                      />
                      <span>{p.name} ({fmtVnd(p.price)})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </CrudModal>
      )}

      {/* Edit Voucher Modal */}
      {showEditVoucher && editingVoucher && (
        <CrudModal title="🎟 Chỉnh Sửa Voucher" onClose={()=>{setShowEditVoucher(false);setEditingVoucher(null);}} onSubmit={handleUpdateVoucherSubmit}>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Mã voucher *</label><input type="text" required placeholder="VD: SUMMER25" style={{ textTransform:'uppercase', fontWeight:700, letterSpacing:'.05em' }} value={editVoucherForm.code} onChange={e=>setEditVoucherForm({...editVoucherForm,code:e.target.value.toUpperCase()})}/></div>
            <div className="form-field"><label>Loại giảm giá</label>
              <select value={editVoucherForm.discountType} onChange={e=>setEditVoucherForm({...editVoucherForm,discountType:e.target.value})}>
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (VNĐ)</option>
              </select>
            </div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>{editVoucherForm.discountType==='PERCENTAGE'?'Phần trăm giảm (%) *':'Số tiền giảm (VNĐ) *'}</label><input type="number" required placeholder="0" value={editVoucherForm.discountValue} onChange={e=>setEditVoucherForm({...editVoucherForm,discountValue:e.target.value})}/></div>
            <div className="form-field"><label>Đơn hàng tối thiểu (VNĐ)</label><input type="number" placeholder="0" value={editVoucherForm.minOrderValue} onChange={e=>setEditVoucherForm({...editVoucherForm,minOrderValue:e.target.value})}/></div>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Giới hạn sử dụng</label><input type="number" placeholder="100" value={editVoucherForm.maxUsage} onChange={e=>setEditVoucherForm({...editVoucherForm,maxUsage:e.target.value})}/></div>
            <div className="form-field"><label>Ngày hết hạn *</label><input type="date" required value={editVoucherForm.expiryDate} onChange={e=>setEditVoucherForm({...editVoucherForm,expiryDate:e.target.value})}/></div>
          </div>
          
          <div className="form-row form-row-2" style={{ marginTop: 12 }}>
            <div className="form-field">
              <label>Phạm vi áp dụng sản phẩm</label>
              <select 
                value={editVoucherForm.scope || 'ALL'} 
                onChange={e => setEditVoucherForm({
                  ...editVoucherForm, 
                  scope: e.target.value,
                  scopeCategoryId: '',
                  scopeProductIds: []
                })}
              >
                <option value="ALL">Tất cả sản phẩm</option>
                <option value="CATEGORY">Theo danh mục sản phẩm</option>
                <option value="PRODUCT">Theo sản phẩm cụ thể</option>
              </select>
            </div>
            <div className="form-field">
              <label>Trạng thái hoạt động</label>
              <select 
                value={editVoucherForm.status || 'ACTIVE'} 
                onChange={e => setEditVoucherForm({ ...editVoucherForm, status: e.target.value })}
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="DEACTIVATED">Tạm khóa</option>
              </select>
            </div>
          </div>

          {editVoucherForm.scope === 'CATEGORY' && (
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Chọn danh mục sản phẩm áp dụng *</label>
              <select 
                required 
                value={editVoucherForm.scopeCategoryId || ''} 
                onChange={e => setEditVoucherForm({ ...editVoucherForm, scopeCategoryId: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {editVoucherForm.scope === 'PRODUCT' && (
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Chọn sản phẩm áp dụng * (Chọn ít nhất 1)</label>
              <div style={{ 
                maxHeight: 180, 
                overflowY: 'auto', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--r-md)', 
                padding: '8px 12px',
                background: 'var(--bg-surface-2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {products.map(p => {
                  const checked = (editVoucherForm.scopeProductIds || []).includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        style={{ width: 'auto', cursor: 'pointer' }}
                        onChange={() => {
                          const currentIds = editVoucherForm.scopeProductIds || [];
                          const nextIds = checked 
                            ? currentIds.filter(id => id !== p.id) 
                            : [...currentIds, p.id];
                          setEditVoucherForm({ ...editVoucherForm, scopeProductIds: nextIds });
                        }}
                      />
                      <span>{p.name} ({fmtVnd(p.price)})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </CrudModal>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedOrder && (
        <CrudModal title="👷 Phân Công Kỹ Thuật Viên" onClose={()=>{setShowAssignModal(false);setSelectedOrder(null);}} onSubmit={handleAssignTechnician}>
          <div style={{ background:'var(--bg-surface-2)', padding:'12px 16px', borderRadius:'var(--r-md)', fontSize:'0.86rem', color:'var(--text-secondary)', marginBottom:4 }}>
            Đơn <strong style={{ color:'var(--brand-blue)' }}>#{selectedOrder.id}</strong> – {selectedOrder.serviceType} – Khách: <strong>{selectedOrder.userName}</strong>
          </div>
          <div className="form-field"><label>Kỹ thuật viên</label>
            <select required value={assignTechId} onChange={e=>setAssignTechId(e.target.value)}>
              {technicians.map(t=><option key={t.id} value={t.id}>{t.name} – {t.specialty}</option>)}
            </select>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field"><label>Ngày đến làm *</label><input type="date" required value={assignDate} onChange={e=>setAssignDate(e.target.value)}/></div>
            <div className="form-field"><label>Giờ đến làm</label>
              <select value={assignTime} onChange={e=>setAssignTime(e.target.value)}>
                <option value="09:00 - 11:00">Sáng 09:00–11:00</option>
                <option value="14:00 - 16:00">Chiều 14:00–16:00</option>
                <option value="17:00 - 19:00">Tối 17:00–19:00</option>
              </select>
            </div>
          </div>
          <div className="form-field"><label>Ghi chú công việc</label><textarea rows={3} placeholder="Chi tiết yêu cầu kỹ thuật..." value={assignNotes} onChange={e=>setAssignNotes(e.target.value)} style={{ resize:'none' }}/></div>
        </CrudModal>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <CrudModal title="👤 Thêm Tài Khoản Mới" onClose={()=>setShowAddUser(false)} onSubmit={handleCreateUser}>
          <div className="form-field">
            <label>Họ và tên *</label>
            <input type="text" required placeholder="Nhập họ và tên..." value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})}/>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field">
              <label>Email *</label>
              <input type="email" required placeholder="email@gmail.com" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})}/>
            </div>
            <div className="form-field">
              <label>Số điện thoại *</label>
              <input type="tel" required placeholder="0901234567" value={newUser.phone} onChange={e=>setNewUser({...newUser,phone:e.target.value})}/>
            </div>
          </div>
          <div className="form-field">
            <label>Mật khẩu *</label>
            <input type="password" required placeholder="Nhập mật khẩu..." value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})}/>
          </div>
          <div className="form-field">
            <label>Địa chỉ liên hệ</label>
            <input type="text" placeholder="Nhập địa chỉ..." value={newUser.address} onChange={e=>setNewUser({...newUser,address:e.target.value})}/>
          </div>
          <div className="form-row form-row-2">
            <div className="form-field">
              <label>Vai trò *</label>
              <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})}>
                <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
              </select>
            </div>
            <div className="form-field">
              <label>Trạng thái *</label>
              <select value={newUser.status} onChange={e=>setNewUser({...newUser,status:e.target.value})}>
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
              </select>
            </div>
          </div>
        </CrudModal>
      )}

      {/* Edit User Modal */}
      {showEditUser && editingUser && (
        <CrudModal title={`🛡 Phân Quyền Tài Khoản: ${editingUser.name}`} onClose={()=>{setShowEditUser(false);setEditingUser(null);}} onSubmit={handleUpdateUserSubmit}>
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 'var(--r-md)', fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 7, border: '1px solid var(--border)' }}>
            <div>Họ và tên: <strong style={{ color: 'var(--text-primary)' }}>{editingUser.name}</strong></div>
            <div>Email: <strong style={{ color: 'var(--brand-blue)' }}>{editingUser.email}</strong></div>
            <div>Số điện thoại: <strong style={{ color: 'var(--text-primary)' }}>{editingUser.phone}</strong></div>
            <div>Địa chỉ: <strong style={{ color: 'var(--text-primary)' }}>{editingUser.address || '—'}</strong></div>
            <div>Trạng thái: <span className={`badge ${editingUser.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ display: 'inline-block', marginLeft: 6 }}>{editingUser.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}</span></div>
          </div>
          
          <div className="form-field" style={{ marginTop: 12 }}>
            <label>Vai trò tài khoản (Quyền truy cập) *</label>
            <select value={editUserForm.role} onChange={e=>setEditUserForm({...editUserForm,role:e.target.value})} disabled={editingUser.email === 'admin@gmail.com'}>
              <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
              <option value="TECHNICIAN">Kỹ thuật viên (TECHNICIAN)</option>
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
            </select>
            {editingUser.email === 'admin@gmail.com' && (
              <small style={{ color: 'var(--danger)', marginTop: 4, display: 'block' }}>Không thể thay đổi quyền của tài khoản Admin hệ thống gốc.</small>
            )}
          </div>
        </CrudModal>
      )}

      {/* Add Blog Post Modal */}
      {showAddBlogPost && (
        <CrudModal title="📝 Tạo Bài Đăng Nhật Ký Mới" onClose={()=>setShowAddBlogPost(false)} onSubmit={handleCreateBlogPostSubmit}>
          <div className="form-field">
            <label>Tiêu đề bài viết *</label>
            <input type="text" required placeholder="Nhập tiêu đề, VD: Hoàn thành lắp đặt hệ thống VRV..." value={blogPostForm.title} onChange={e=>setBlogPostForm({...blogPostForm, title: e.target.value})} />
          </div>
          <div className="form-field">
            <label>Nội dung chi tiết *</label>
            <textarea required placeholder="Mô tả quá trình thực hiện..." rows={5} value={blogPostForm.content} onChange={e=>setBlogPostForm({...blogPostForm, content: e.target.value})} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-field">
            <label>
              Hình ảnh & Video bài viết (Tối đa 5 mục) {isUploading && <span style={{ color: 'var(--brand-blue)', fontSize: '0.8rem' }}>(Đang tải lên...)</span>}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map(index => {
                const url = blogPostForm.mediaUrls?.[index];
                return (
                  <div key={index} style={{
                    position: 'relative',
                    height: 90,
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-surface-2)',
                    overflow: 'hidden'
                  }}>
                    {url ? (
                      <>
                        {blogPostForm.mediaType === 'VIDEO' ? (
                          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                            📹
                          </div>
                        ) : (
                          <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button
                          type="button"
                          onClick={() => setBlogPostForm(prev => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, idx) => idx !== index) }))}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(222, 53, 11, 0.9)',
                            color: '#fff',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Xóa"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        gap: 4
                      }}>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          style={{ display: 'none' }}
                          disabled={isUploading}
                          onChange={e => handlePostMediaUpload(e, false, index)}
                        />
                        <Plus size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mục {index + 1}</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
              * Hỗ trợ tải lên cả tệp hình ảnh (.jpg, .png, ...) và video (.mp4, ...). Tối đa 5 tệp.
            </div>
          </div>
        </CrudModal>
      )}

      {/* Edit Blog Post Modal */}
      {showEditBlogPost && editingBlogPost && (
        <CrudModal title="📝 Chỉnh Sửa Bài Đăng Nhật Ký" onClose={()=>{setShowEditBlogPost(false); setEditingBlogPost(null);}} onSubmit={handleUpdateBlogPostSubmit}>
          <div className="form-field">
            <label>Tiêu đề bài viết *</label>
            <input type="text" required placeholder="Nhập tiêu đề..." value={editingBlogPost.title} onChange={e=>setEditingBlogPost({...editingBlogPost, title: e.target.value})} />
          </div>
          <div className="form-field">
            <label>Nội dung chi tiết *</label>
            <textarea required placeholder="Mô tả chi tiết..." rows={5} value={editingBlogPost.content} onChange={e=>setEditingBlogPost({...editingBlogPost, content: e.target.value})} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-field">
            <label>
              Hình ảnh & Video bài viết (Tối đa 5 mục) {isUploading && <span style={{ color: 'var(--brand-blue)', fontSize: '0.8rem' }}>(Đang tải lên...)</span>}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 8 }}>
              {[0, 1, 2, 3, 4].map(index => {
                const url = editingBlogPost.mediaUrls?.[index];
                return (
                  <div key={index} style={{
                    position: 'relative',
                    height: 90,
                    border: '1.5px dashed var(--border)',
                    borderRadius: 'var(--r-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-surface-2)',
                    overflow: 'hidden'
                  }}>
                    {url ? (
                      <>
                        {editingBlogPost.mediaType === 'VIDEO' ? (
                          <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem' }}>
                            📹
                          </div>
                        ) : (
                          <img src={url} alt={`preview-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingBlogPost(prev => ({ ...prev, mediaUrls: prev.mediaUrls.filter((_, idx) => idx !== index) }))}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            background: 'rgba(222, 53, 11, 0.9)',
                            color: '#fff',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Xóa"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <label style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        gap: 4
                      }}>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          style={{ display: 'none' }}
                          disabled={isUploading}
                          onChange={e => handlePostMediaUpload(e, true, index)}
                        />
                        <Plus size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mục {index + 1}</span>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
              * Hỗ trợ tải lên cả tệp hình ảnh (.jpg, .png, ...) và video (.mp4, ...). Tối đa 5 tệp.
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  );
}
