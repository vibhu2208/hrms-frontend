import api from './axios';

export const verifyNetwork = async () => {
  const response = await api.get('/network/verify');
  return response.data;
};

export const listAllowedNetworks = async () => {
  const response = await api.get('/network/allowed');
  return response.data;
};

export const createAllowedNetwork = async (data) => {
  const response = await api.post('/network/allowed', data);
  return response.data;
};

export const updateAllowedNetwork = async (id, data) => {
  const response = await api.put(`/network/allowed/${id}`, data);
  return response.data;
};

export const deleteAllowedNetwork = async (id) => {
  const response = await api.delete(`/network/allowed/${id}`);
  return response.data;
};
