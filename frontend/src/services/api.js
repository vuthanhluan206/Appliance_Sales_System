import axios from 'axios';

const getLocalBackendUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getLocalBackendUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically attach accessToken to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: automatically refresh expired access tokens
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.data && error.response.data.code === 'MULTIPLE_LOGINS') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      alert(error.response.data.message || "Tài khoản của bạn đã đăng nhập ở thiết bị khác. Bạn sẽ bị đăng xuất khỏi thiết bị này!");
      window.location.reload();
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // If request fails with 401 and has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refresh_token: refresh,
          });

          const tokenData = response.data.data;
          const newAccessToken = tokenData.accessToken;
          const newRefreshToken = tokenData.refreshToken;

          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

          processQueue(null, newAccessToken);
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Refresh token is invalid or expired, log user out
          const hasToken = localStorage.getItem('accessToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          if (hasToken) {
            window.location.reload();
          }
          return Promise.reject(refreshError);
        }
      } else {
        const hasToken = localStorage.getItem('accessToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        if (hasToken) {
          window.location.reload();
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const login = (username, password) => api.post('/api/auth/login', { username, password }).then(res => res.data);
export const register = (data) => api.post('/api/auth/register', data).then(res => res.data);
export const logout = (refreshToken) => api.post('/api/auth/logout', { refresh_token: refreshToken }).then(res => res.data);
export const sendOtp = (email) => api.post('/api/auth/send-otp', email, { headers: { 'Content-Type': 'text/plain' } }).then(res => res.data);
export const verifyOtp = (email, otp) => api.post('/api/auth/verify-otp', { email, otp }).then(res => res.data);
export const forgotPasswordSendOtp = (email) => api.post('/api/auth/forgot-password/send-otp', email, { headers: { 'Content-Type': 'text/plain' } }).then(res => res.data);
export const forgotPasswordReset = (data) => api.post('/api/auth/forgot-password/reset', data).then(res => res.data);

// File Upload API
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
};

// User API
export const getUsers = () => api.get('/users').then(res => res.data);
export const createUser = (data) => api.post('/createUser', data).then(res => res.data);
export const getUser = (id) => api.get(`/getUser/${id}`).then(res => res.data);
export const updateUser = (id, data) => api.put(`/updateUser/${id}`, data).then(res => res.data);
export const deleteUser = (id) => api.delete(`/deleteUser/${id}`).then(res => res.data);
export const getLoginHistory = () => api.get('/api/user/login-history').then(res => res.data);

// Category API
export const getCategories = () => api.get('/categories').then(res => res.data);
export const createCategory = (data) => api.post('/createCategory', data).then(res => res.data);
export const updateCategory = (id, data) => api.put(`/updateCategory/${id}`, data).then(res => res.data);
export const deleteCategory = (id) => api.delete(`/deleteCategory/${id}`).then(res => res.data);

// Product API
export const getProducts = () => api.get('/products').then(res => res.data);
export const getProduct = (id) => api.get(`/getProduct/${id}`).then(res => res.data);
export const createProduct = (data) => api.post('/createProduct', data).then(res => res.data);
export const updateProduct = (id, data) => api.put(`/updateProduct/${id}`, data).then(res => res.data);
export const deleteProduct = (id) => api.delete(`/deleteProduct/${id}`).then(res => res.data);

// Cart API
export const getCart = (userId) => api.get(`/cart/user/${userId}`).then(res => res.data);
export const addToCart = (data) => api.post('/cart/add', data).then(res => res.data);
export const updateCartItem = (id, data) => api.put(`/cart/update/${id}`, data).then(res => res.data);
export const deleteCartItem = (id) => api.delete(`/cart/delete/${id}`).then(res => res.data);
export const clearCart = (userId) => api.delete(`/cart/clear/${userId}`).then(res => res.data);

// Order API
export const getOrders = () => api.get('/orders').then(res => res.data);
export const getOrder = (id) => api.get(`/getOrder/${id}`).then(res => res.data);
export const getOrdersByUser = (userId) => api.get(`/orders/user/${userId}`).then(res => res.data);
export const createOrder = (data) => api.post('/createOrder', data).then(res => res.data);
export const updateOrder = (id, data) => api.put(`/updateOrder/${id}`, data).then(res => res.data);
export const deleteOrder = (id) => api.delete(`/deleteOrder/${id}`).then(res => res.data);

// Service API
export const getServices = () => api.get('/services').then(res => res.data);
export const getService = (id) => api.get(`/getService/${id}`).then(res => res.data);
export const createService = (data) => api.post('/createService', data).then(res => res.data);
export const updateService = (id, data) => api.put(`/updateService/${id}`, data).then(res => res.data);
export const deleteService = (id) => api.delete(`/deleteService/${id}`).then(res => res.data);

// Order Service link APIs
export const addServiceToOrder = (data) => api.post('/order/addService', data).then(res => res.data);
export const getOrderServices = (orderId) => api.get(`/order/${orderId}/services`).then(res => res.data);
export const removeServiceFromOrder = (id) => api.delete(`/order/removeService/${id}`).then(res => res.data);

// Technician API
export const getTechnicians = () => api.get('/technicians').then(res => res.data);
export const getTechnician = (id) => api.get(`/getTechnician/${id}`).then(res => res.data);
export const createTechnician = (data) => api.post('/createTechnician', data).then(res => res.data);
export const updateTechnician = (id, data) => api.put(`/updateTechnician/${id}`, data).then(res => res.data);
export const deleteTechnician = (id) => api.delete(`/deleteTechnician/${id}`).then(res => res.data);

// Schedule API
export const getSchedules = () => api.get('/schedules').then(res => res.data);
export const getSchedule = (id) => api.get(`/getSchedule/${id}`).then(res => res.data);
export const getSchedulesByTechnician = (techId) => api.get(`/schedules/technician/${techId}`).then(res => res.data);
export const getSchedulesByOrder = (orderId) => api.get(`/schedules/order/${orderId}`).then(res => res.data);
export const createSchedule = (data) => api.post('/createSchedule', data).then(res => res.data);
export const updateSchedule = (id, data) => api.put(`/updateSchedule/${id}`, data).then(res => res.data);
export const deleteSchedule = (id) => api.delete(`/deleteSchedule/${id}`).then(res => res.data);

// Review API
export const getReviews = () => api.get('/reviews').then(res => res.data);
export const getReview = (id) => api.get(`/getReview/${id}`).then(res => res.data);
export const getReviewsByProduct = (productId) => api.get(`/reviews/product/${productId}`).then(res => res.data);
export const createReview = (data) => api.post('/createReview', data).then(res => res.data);
export const updateReview = (id, data) => api.put(`/updateReview/${id}`, data).then(res => res.data);
export const deleteReview = (id) => api.delete(`/deleteReview/${id}`).then(res => res.data);

// Payment API
export const getPayments = () => api.get('/payments').then(res => res.data);
export const getPayment = (id) => api.get(`/getPayment/${id}`).then(res => res.data);
export const getPaymentByOrder = (orderId) => api.get(`/payment/order/${orderId}`).then(res => res.data);
export const createPayment = (data) => api.post('/createPayment', data).then(res => res.data);
export const updatePaymentStatus = (id, data) => api.put(`/updatePaymentStatus/${id}`, data).then(res => res.data);

// Transaction API
export const getTransactions = () => api.get('/transactions').then(res => res.data);
export const getTransaction = (id) => api.get(`/getTransaction/${id}`).then(res => res.data);
export const getTransactionsByUser = (userId) => api.get(`/transactions/user/${userId}`).then(res => res.data);
export const createTransaction = (data) => api.post('/createTransaction', data).then(res => res.data);

// Discount API
export const getDiscounts = () => api.get('/discounts').then(res => res.data);
export const getDiscountByCode = (code) => api.get(`/discount/code/${code}`).then(res => res.data);
export const createDiscount = (data) => api.post('/createDiscount', data).then(res => res.data);
export const updateDiscount = (id, data) => api.put(`/updateDiscount/${id}`, data).then(res => res.data);
export const deleteDiscount = (id) => api.delete(`/deleteDiscount/${id}`).then(res => res.data);

// Warranty API
export const getWarranties = () => api.get('/warranties').then(res => res.data);
export const getWarrantiesByOrder = (orderId) => api.get(`/warranties/order/${orderId}`).then(res => res.data);
export const createWarranty = (data) => api.post('/createWarranty', data).then(res => res.data);
export const updateWarranty = (id, data) => api.put(`/updateWarranty/${id}`, data).then(res => res.data);
export const deleteWarranty = (id) => api.delete(`/deleteWarranty/${id}`).then(res => res.data);

// Post / Work Process API
export const getPosts = () => api.get('/posts').then(res => res.data);
export const getPost = (id) => api.get(`/getPost/${id}`).then(res => res.data);
export const createPost = (data) => api.post('/createPost', data).then(res => res.data);
export const updatePost = (id, data) => api.put(`/updatePost/${id}`, data).then(res => res.data);
export const deletePost = (id) => api.delete(`/deletePost/${id}`).then(res => res.data);
export const likePost = (id) => api.post(`/post/like/${id}`).then(res => res.data);

// Chatbot AI
export const chatWithAi = (question) => api.post('/api/chat', { question }).then(res => res.data);

// Helper to extract clean error messages from API responses, avoiding raw JSON display
export const extractErrorMessage = (err, defaultMsg = 'Đã có lỗi xảy ra') => {
  if (!err) return defaultMsg;
  
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      if (parsed && typeof parsed === 'object') {
        return extractObjectErrorMessage(parsed, defaultMsg);
      }
    } catch {
      return err;
    }
  }
  
  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData === 'object') {
      if (responseData.message && typeof responseData.message === 'string') {
        try {
          const parsed = JSON.parse(responseData.message);
          return extractObjectErrorMessage(parsed, defaultMsg);
        } catch {
          let msg = responseData.message;
          // Spring Validation Errors or Custom Validation Format: "field: validation error message"
          if (msg.includes('VALIDATION_ERROR') || responseData.code === 'VALIDATION_ERROR' || responseData.status === 'BAD_REQUEST') {
            return msg.split(';').map(s => {
              const idx = s.indexOf(':');
              return idx !== -1 ? s.substring(idx + 1).trim() : s.trim();
            }).join('; ');
          }
          return msg;
        }
      }
      
      if (responseData.errors) {
        if (typeof responseData.errors === 'object') {
          return Object.values(responseData.errors).join('; ');
        } else if (Array.isArray(responseData.errors)) {
          return responseData.errors.join('; ');
        }
      }
      
      return responseData.message || defaultMsg;
    }
    
    if (typeof responseData === 'string') {
      try {
        const parsed = JSON.parse(responseData);
        return extractObjectErrorMessage(parsed, defaultMsg);
      } catch {
        return responseData;
      }
    }
  }
  
  if (err.message) {
    if (err.message.includes('Network Error')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.';
    }
    return err.message;
  }
  
  return defaultMsg;
};

const extractObjectErrorMessage = (obj, defaultMsg) => {
  if (obj.message) return obj.message;
  if (obj.error) return obj.error;
  const values = Object.values(obj);
  if (values.length > 0) {
    return values.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join('; ');
  }
  return defaultMsg;
};


