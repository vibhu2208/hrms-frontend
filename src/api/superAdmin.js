import api from './axios';

// Dashboard APIs
export const getDashboardStats = () => {
  return api.get('/super-admin/dashboard/stats');
};

export const getSystemHealth = () => {
  return api.get('/super-admin/dashboard/health');
};

// Client Management APIs
export const getClients = (params = {}) => {
  return api.get('/super-admin/clients', { params });
};

export const getClient = (id) => {
  return api.get(`/super-admin/clients/${id}`);
};

export const createClient = (data) => {
  return api.post('/super-admin/clients', data);
};

export const updateClient = (id, data) => {
  return api.put(`/super-admin/clients/${id}`, data);
};

export const updateClientStatus = (id, status) => {
  return api.patch(`/super-admin/clients/${id}/status`, { status });
};

export const updateClientSubscription = (id, data) => {
  return api.patch(`/super-admin/clients/${id}/subscription`, data);
};

export const deleteClient = (id) => {
  return api.delete(`/super-admin/clients/${id}`);
};

// Package Management APIs
export const getPackages = (params = {}) => {
  return api.get('/super-admin/packages', { params });
};

export const getPackage = (id) => {
  return api.get(`/super-admin/packages/${id}`);
};

export const createPackage = (data) => {
  return api.post('/super-admin/packages', data);
};

export const updatePackage = (id, data) => {
  return api.put(`/super-admin/packages/${id}`, data);
};

export const togglePackageStatus = (id) => {
  return api.patch(`/super-admin/packages/${id}/toggle-status`);
};

export const deletePackage = (id) => {
  return api.delete(`/super-admin/packages/${id}`);
};
