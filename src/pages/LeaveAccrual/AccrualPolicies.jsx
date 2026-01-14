import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AccrualPolicies = () => {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    accrualFrequency: 'monthly',
    accrualRate: 0,
    maxAccrual: 0,
    allowCarryForward: false,
    maxCarryForward: 0,
    proRataCalculation: true,
    isActive: true
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-accrual/policies');
      setPolicies(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch accrual policies');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await api.put(`/leave-accrual/policies/${editingPolicy._id}`, formData);
        toast.success('Accrual policy updated successfully');
      } else {
        await api.post('/leave-accrual/policies', formData);
        toast.success('Accrual policy created successfully');
      }
      setShowModal(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save accrual policy');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/leave-accrual/policies/${id}`);
      toast.success('Accrual policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete accrual policy');
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      accrualFrequency: 'monthly',
      accrualRate: 0,
      maxAccrual: 0,
      allowCarryForward: false,
      maxCarryForward: 0,
      proRataCalculation: true,
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Leave Accrual Policies</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingPolicy(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Policy
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Frequency</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accrual Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Max Accrual</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Carry Forward</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {policies.map((policy) => (
              <tr key={policy._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{policy.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{policy.accrualFrequency}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{policy.accrualRate}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{policy.maxAccrual}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {policy.allowCarryForward ? `Yes (Max: ${policy.maxCarryForward})` : 'No'}
                </td>
                <td className="px-4 py-3">
                  {policy.isActive ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={16} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle size={16} />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPolicy(policy);
                        setFormData({
                          leaveType: policy.leaveType || '',
                          accrualFrequency: policy.accrualFrequency || 'monthly',
                          accrualRate: policy.accrualRate || 0,
                          maxAccrual: policy.maxAccrual || 0,
                          allowCarryForward: policy.allowCarryForward || false,
                          maxCarryForward: policy.maxCarryForward || 0,
                          proRataCalculation: policy.proRataCalculation !== undefined ? policy.proRataCalculation : true,
                          isActive: policy.isActive !== undefined ? policy.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(policy._id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPolicy ? 'Edit Accrual Policy' : 'Create Accrual Policy'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Accrual Frequency</label>
                  <select
                    name="accrualFrequency"
                    value={formData.accrualFrequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Accrual Rate</label>
                  <input
                    type="number"
                    name="accrualRate"
                    value={formData.accrualRate}
                    onChange={handleChange}
                    required
                    step="0.1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Accrual</label>
                  <input
                    type="number"
                    name="maxAccrual"
                    value={formData.maxAccrual}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Carry Forward</label>
                  <input
                    type="number"
                    name="maxCarryForward"
                    value={formData.maxCarryForward}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allowCarryForward"
                    checked={formData.allowCarryForward}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Allow Carry Forward</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="proRataCalculation"
                    checked={formData.proRataCalculation}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Pro-Rata Calculation</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPolicy(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPolicy ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccrualPolicies;

