import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Unlock, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const AccountUnlock = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    companyId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/unlock-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setFormData({ email: '', companyId: '' });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error unlocking account');
    }

    setLoading(false);
  };

  // Only show for admin roles
  const isAdmin = ['superadmin', 'company_admin', 'hr', 'admin'].includes(user?.role);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-6">
          <Unlock className="h-12 w-12 text-blue-600" />
        </div>
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Unlock Account
        </h2>
        
        <p className="text-center text-sm text-gray-600 mb-6">
          Unlock a user account that has been locked due to multiple failed login attempts
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="user@example.com"
              />
            </div>
          </div>

          {user?.role !== 'superadmin' && (
            <div>
              <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
                Company ID
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyId"
                  name="companyId"
                  type="text"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Company ID (for tenant users)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Required for tenant users. Leave empty for super admin accounts.
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !formData.email}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Unlocking...' : 'Unlock Account'}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <Unlock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                How it works
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Accounts are locked after 5 failed login attempts</li>
                  <li>Lockout duration is 30 minutes</li>
                  <li>Unlocking resets the failed attempt counter</li>
                  <li>Users can login immediately after unlock</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountUnlock;
