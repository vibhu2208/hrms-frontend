import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Verify token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setVerifying(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      // We'll verify the token when the user tries to reset the password
      // For now, just check if token exists
      if (token && token.length > 10) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResetSuccess(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
        if (result.message.includes('Invalid or expired')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Reset Link</h2>
          <p className="text-gray-400">Please wait while we verify your password reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo2.png" 
                alt="Company Logo" 
                className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
              />
            </div>
            
            <div className="card">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-500" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-3">Invalid Reset Link</h1>
              <p className="text-gray-400 mb-6">
                This password reset link is invalid or has expired.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full btn-primary"
                >
                  Request New Reset Link
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-secondary"
                >
                  Back to Login
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mt-4">
              Need help? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo2.png" 
                alt="Company Logo" 
                className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
              />
            </div>
            
            <div className="card">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-3">Password Reset Successful!</h1>
              <p className="text-gray-400 mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full btn-primary"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo2.png" 
              alt="Company Logo" 
              className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400">
            Create your new password below.
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-500" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-dark-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Password Requirements:</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li className={formData.newPassword.length >= 8 ? 'text-green-500' : ''}>
                  • At least 8 characters long
                </li>
                <li className={formData.newPassword !== formData.confirmPassword && formData.confirmPassword ? 'text-red-500' : ''}>
                  • Passwords must match
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-primary-500 hover:text-primary-400 text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
