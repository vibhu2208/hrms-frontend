import api from './axios';

export const approvalWorkflowsAPI = {
  list: (params) => api.get('/approval-workflow/workflows', { params }),
  stats: () => api.get('/approval-workflow/workflows/stats'),
  get: (id) => api.get(`/approval-workflow/workflows/${id}`),
  create: (payload) => api.post('/approval-workflow/workflows', payload),
  update: (id, payload) => api.put(`/approval-workflow/workflows/${id}`, payload),
  duplicate: (id) => api.post(`/approval-workflow/workflows/${id}/duplicate`),
  archive: (id) => api.post(`/approval-workflow/workflows/${id}/archive`),
  history: (id) => api.get(`/approval-workflow/workflows/${id}/history`),
  validate: (payload) => api.post('/approval-workflow/workflows/validate', payload),
  exportCSV: () => api.get('/approval-workflow/workflows/export', { responseType: 'blob' }),
  exportJSON: (id) => api.get(`/approval-workflow/workflows/${id}/export`, { responseType: 'blob' }),
  importJSON: (payload) => api.post('/approval-workflow/workflows/import', payload)
};

