import api from './api';

export const auctionService = {
  getAll: (params) => api.get('/auctions', { params }),
  getOne: (id) => api.get(`/auctions/${id}`),
  create: (formData) => api.post('/auctions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
  getMyListings: () => api.get('/auctions/my/listings'),
  getMyWins: () => api.get('/auctions/my/wins'),
  getDashboardStats: () => api.get('/auctions/stats/dashboard'),
};

export const bidService = {
  place: (auctionId, amount) => api.post(`/bids/${auctionId}`, { amount }),
  getForAuction: (auctionId, params) => api.get(`/bids/${auctionId}`, { params }),
  getUserHistory: () => api.get('/bids/user/history'),
};

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};
