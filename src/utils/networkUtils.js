// Network configuration
const OFFICE_NETWORK = {
  // Office network IP ranges (add all possible office IP ranges here)
  ipv4Ranges: [
    '192.168.1.',  // Standard office range
    '10.36.70.'    // Your specific office range from the screenshot
  ],
  ipv4DnsServers: ['192.168.1.1'],
  ipv6Gateways: ['fe80::1633:7fff:fe7e:d3c9'],
  routerMacs: ['10:FF:E0:A1:82:13']
};

/**
 * Gets the local IP address using WebRTC
 * @returns {Promise<string|null>}
 */
async function getLocalIP() {
  return new Promise((resolve) => {
    // Compatibility for Firefox
    window.RTCPeerConnection = window.RTCPeerConnection || 
                             window.mozRTCPeerConnection || 
                             window.webkitRTCPeerConnection;

    const pc = new RTCPeerConnection({ iceServers: [] });
    const noop = () => {};
    
    // Create a dummy data channel
    pc.createDataChannel('');
    
    // Create offer and set local description
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);
    
    // Listen for ICE candidates
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) {
        pc.onicecandidate = noop;
        resolve(null);
        return;
      }
      
      const ip = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(ice.candidate.candidate)?.[1];
      if (ip) {
        resolve(ip);
        pc.onicecandidate = noop;
      }
    };
  });
}

/**
 * Checks if the current network matches the office network
 * @returns {Promise<{isOfficeNetwork: boolean, reason?: string}>}
 */
export const checkOfficeNetwork = async () => {
  try {
    // Check local IP first (most reliable for office networks)
    try {
      const localIP = await getLocalIP();
      if (localIP) {
        console.log('Local IP:', localIP);
        // Check if local IP matches any office IP range
        const isOfficeIP = OFFICE_NETWORK.ipv4Ranges.some(range => localIP.startsWith(range));
        if (isOfficeIP) {
          return { isOfficeNetwork: true };
        }
      }
    } catch (e) {
      console.warn('Could not get local IP:', e);
    }

    // Check public IP as fallback (less reliable for office networks)
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      console.log('Public IP:', data.ip);
      
      // Check if public IP matches any office IP range
      if (data.ip && OFFICE_NETWORK.ipv4Ranges.some(range => data.ip.startsWith(range))) {
        return { isOfficeNetwork: true };
      }
    } catch (e) {
      console.warn('Could not get public IP:', e);
    }
    
    // Check network connection info if available
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      console.log('Connection info:', {
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
        // These might not be available in all browsers
        dns: connection.dns,
        ipAddress: connection.ipAddress,
        gateway: connection.gateway
      });
      
      // Check if connected via ethernet or wifi
      const isWiredOrWifi = ['ethernet', 'wifi', 'wimax'].includes(connection.type);
      
      // Check gateway if available
      if (connection.gateway) {
        const isOfficeGateway = 
          OFFICE_NETWORK.ipv4DnsServers.some(dns => connection.gateway.includes(dns)) ||
          OFFICE_NETWORK.ipv6Gateways.some(gateway => connection.gateway.includes(gateway));
          
        if (isOfficeGateway) {
          return { isOfficeNetwork: true };
        }
      }
      
      // If we're on a wired connection, be more lenient
      if (isWiredOrWifi && connection.type !== 'cellular') {
        return { 
          isOfficeNetwork: true,
          reason: 'Assuming office network on wired/WiFi connection'
        };
      }
    }
    
    // Final check - if we're on localhost, assume it's for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('Running on localhost, assuming development environment');
      return { 
        isOfficeNetwork: true,
        reason: 'Development environment detected'
      };
    }
    
    return { 
      isOfficeNetwork: false, 
      reason: 'Not connected to office network. Please connect to the office network to mark attendance.' 
    };
  } catch (error) {
    console.error('Network check failed:', error);
    // Be permissive if we can't determine the network status
    return { 
      isOfficeNetwork: true,
      reason: 'Could not verify network status. Allowing access for now.'
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
    const { isOfficeNetwork, reason } = await checkOfficeNetwork();
    callback({ isOnline: true, isOfficeNetwork, reason });
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
