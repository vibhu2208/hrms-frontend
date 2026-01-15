import React, { useEffect, useState } from 'react';
import { Users, Key, Shield, Mail, Calendar, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: '',
    mustChangePassword: true
  });
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user/all');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setResetting(true);
    try {
      // Use the correct user ID - either selectedUser._id or selectedUser.userId._id
      const userId = selectedUser._id || selectedUser.userId?._id;
      
      if (!userId) {
        toast.error('User ID not found');
        setResetting(false);
        return;
      }

      console.log('Resetting password for user ID:', userId);
      
      await api.put(`/auth/admin/reset-password/${userId}`, {
        newPassword: resetForm.newPassword,
        mustChangePassword: resetForm.mustChangePassword
      });
      
      toast.success(`Password reset successfully for ${selectedUser.firstName} ${selectedUser.lastName}`);
      setShowResetModal(false);
      setSelectedUser(null);
      setResetForm({
        newPassword: '',
        confirmPassword: '',
        mustChangePassword: true
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setSelectedUser(null);
    setResetForm({
      newPassword: '',
      confirmPassword: '',
      mustChangePassword: true
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      hr: 'badge-warning',
      manager: 'badge-info',
      employee: 'badge-success'
    };
    return badges[role] || 'badge-default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage user accounts and reset passwords</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {user.employeeId ? `${user.employeeId.firstName} ${user.employeeId.lastName}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-400">{user.employeeId?.employeeCode || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    {user.lastLogin ? (
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Never</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openResetModal(user)}
                      className="btn-outline text-sm py-2 px-3 flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Reset Password</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No users found</p>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl w-full max-w-md">
            <div className="border-b border-dark-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.userId?.email})
                </p>
              </div>
              <button
                onClick={closeResetModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mustChangePassword"
                  checked={resetForm.mustChangePassword}
                  onChange={(e) => setResetForm({ ...resetForm, mustChangePassword: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="mustChangePassword" className="text-sm text-gray-300">
                  Require user to change password on next login
                </label>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield size={20} className="text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p className="text-yellow-300/80">
                      The user will be able to login with this new password immediately. 
                      Make sure to communicate the new password securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="btn-outline"
                  disabled={resetting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={resetting}
                >
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
