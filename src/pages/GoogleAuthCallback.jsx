import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          toast.error('Google authentication failed');
          navigate('/dashboard');
          return;
        }

        if (code) {
          // Send code to backend for token exchange
          const response = await api.get(`/auth/google/callback?code=${code}`);
          
          if (response.data.success) {
            toast.success('Google Meet access granted!');
          } else {
            toast.error('Failed to get Google access');
          }
        }

        // Redirect back to where user came from
        const returnTo = sessionStorage.getItem('returnTo') || '/dashboard';
        sessionStorage.removeItem('returnTo');
        navigate(returnTo);
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
