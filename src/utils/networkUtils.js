import api from '../api/axios';

/**
 * Checks if the current network matches the office network
 * @returns {Promise<{isOfficeNetwork: boolean, reason?: string}>}
 */
export const checkOfficeNetwork = async () => {
  try {
    const response = await api.get('/network/verify');
    const data = response.data;

    return {
      isOfficeNetwork: true,
      ip: data.ip,
      network: data.network,
      reason: data.network ? `Verified: ${data.network}` : 'Verified'
    };
  } catch (error) {
    const message = error?.response?.data?.message || 'You are not connected to office WiFi';
    const ip = error?.response?.data?.ip;

    return {
      isOfficeNetwork: false,
      ip,
      reason: message
    };
  }
};

/**
 * Network change listener
 * @param {Function} callback - Called when network status changes
 * @returns {Function} Function to remove event listener
 */
export const onNetworkChange = (callback) => {
  if (!navigator.onLine) {
    callback({ isOnline: false, isOfficeNetwork: false });
  }
  
  const handleOnline = async () => {
    const { isOfficeNetwork, reason, ip, network } = await checkOfficeNetwork();
    callback({ isOnline: true, isOfficeNetwork, reason, ip, network });
  };
  
  const handleOffline = () => {
    callback({ isOnline: false, isOfficeNetwork: false });
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial check
  if (navigator.onLine) {
    handleOnline();
  }
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
