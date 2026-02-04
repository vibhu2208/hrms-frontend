import React, { useState, useEffect } from 'react';
import { Settings, Play, Save, Plus, Trash2, Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AutomaticEncashmentSettings = () => {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    leaveType: '',
    isAutomatic: true,
    automaticTrigger: 'year_end',
    automaticTriggerDate: '',
    automaticTriggerThreshold: 0,
    automaticEncashmentPercentage: 100,
    requiresApproval: true,
    approvalLevels: 1,
    calculationMethod: 'basic_salary',
    ratePerDay: 0,
    minBalance: 0,
    maxEncashable: 0,
    maxEncashablePercentage: 100
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-encashment/rules');
      setRules(response.data.data || []);
    } catch (error) {
      console.error('Error fetching encashment rules:', error);
      
      // Show more specific error message
      if (error.response?.status === 403) {
        toast.error('Access denied. You need admin or HR role to access this page.');
      } else if (error.response?.status === 401) {
        toast.error('Please log in to access this page.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch encashment rules');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-encashment/rules', formData);
      toast.success('Automatic encashment rule created successfully');
      setShowModal(false);
      setFormData({
        leaveType: '',
        isAutomatic: true,
        automaticTrigger: 'year_end',
        automaticTriggerDate: '',
        automaticTriggerThreshold: 0,
        automaticEncashmentPercentage: 100,
        requiresApproval: true,
        approvalLevels: 1,
        calculationMethod: 'basic_salary',
        ratePerDay: 0,
        minBalance: 0,
        maxEncashable: 0,
        maxEncashablePercentage: 100
      });
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create rule');
    }
  };

  const processAutomaticEncashment = async (triggerType = 'year_end') => {
    try {
      setProcessing(true);
      const response = await api.post('/leave-encashment/automatic/process', { triggerType });
      toast.success(response.data.message || `Processed ${response.data.processed} encashments`);
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process automatic encashment');
    } finally {
      setProcessing(false);
    }
  };

  const getTriggerIcon = (trigger) => {
    const icons = {
      year_end: Calendar,
      employment_end: Target,
      specific_date: Calendar,
      leave_balance_threshold: TrendingUp
    };
    return icons[trigger] || Calendar;
  };

  const getTriggerLabel = (trigger) => {
    const labels = {
      year_end: 'Year End',
      employment_end: 'Employment End',
      specific_date: 'Specific Date',
      leave_balance_threshold: 'Balance Threshold'
    };
    return labels[trigger] || trigger;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Check if user has required role
  if (!user || (user.role !== 'admin' && user.role !== 'hr' && user.role !== 'company_admin')) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Access Denied</h3>
              <p className="text-gray-300">
                You don't have permission to access automatic encashment settings. 
                This page is only available to administrators and HR personnel.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Current role: <span className="font-medium">{user?.role || 'Unknown'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Automatic Leave Encashment Settings</h1>
        <div className="flex gap-3">
          <button
            onClick={() => processAutomaticEncashment('year_end')}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Play size={20} />
            Process Year-End
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            New Rule
          </button>
        </div>
      </div>

      {/* Automatic Rules List */}
      <div className="grid gap-4 mb-6">
        {rules.filter(rule => rule.isAutomatic).map((rule) => {
          const TriggerIcon = getTriggerIcon(rule.automaticTrigger);
          return (
            <div key={rule._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{rule.leaveType}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rule.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                    }`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-full">
                      Automatic
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <TriggerIcon size={16} />
                      <span>Trigger: {getTriggerLabel(rule.automaticTrigger)}</span>
                    </div>
                    <div className="text-gray-300">
                      Encashment: {rule.automaticEncashmentPercentage}%
                    </div>
                    {rule.automaticTriggerDate && (
                      <div className="text-gray-300">
                        Date: {new Date(rule.automaticTriggerDate).toLocaleDateString()}
                      </div>
                    )}
                    {rule.automaticTriggerThreshold > 0 && (
                      <div className="text-gray-300">
                        Threshold: {rule.automaticTriggerThreshold} days
                      </div>
                    )}
                    <div className="text-gray-300">
                      Approval: {rule.requiresApproval ? 'Required' : 'Auto-approved'}
                    </div>
                    <div className="text-gray-300">
                      Max Days: {rule.maxEncashable || 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {rules.filter(rule => rule.isAutomatic).length === 0 && (
          <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg">
            No automatic encashment rules configured
          </div>
        )}
      </div>

      {/* Manual Rules List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Manual Encashment Rules</h2>
        <div className="grid gap-4">
          {rules.filter(rule => !rule.isAutomatic).map((rule) => (
            <div key={rule._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 opacity-75">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{rule.leaveType}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rule.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                }`}>
                  {rule.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full">
                  Manual
                </span>
              </div>
            </div>
          ))}
          {rules.filter(rule => !rule.isAutomatic).length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-800 rounded-lg">
              No manual encashment rules configured
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Automatic Encashment Rule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Comp Offs">Comp Offs</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Calculation Method</label>
                <select
                  name="calculationMethod"
                  value={formData.calculationMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="basic_salary">Basic Salary</option>
                  <option value="gross_salary">Gross Salary</option>
                  <option value="fixed_rate">Fixed Rate</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {formData.calculationMethod === 'fixed_rate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rate Per Day (₹)</label>
                  <input
                    type="number"
                    name="ratePerDay"
                    value={formData.ratePerDay}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Minimum Balance (days)</label>
                <input
                  type="number"
                  name="minBalance"
                  value={formData.minBalance}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Encashable (days, 0 = unlimited)</label>
                <input
                  type="number"
                  name="maxEncashable"
                  value={formData.maxEncashable}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Automatic Trigger</label>
                <select
                  name="automaticTrigger"
                  value={formData.automaticTrigger}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="year_end">Year End</option>
                  <option value="employment_end">Employment End</option>
                  <option value="specific_date">Specific Date</option>
                  <option value="leave_balance_threshold">Leave Balance Threshold</option>
                </select>
              </div>

              {formData.automaticTrigger === 'specific_date' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Trigger Date</label>
                  <input
                    type="date"
                    name="automaticTriggerDate"
                    value={formData.automaticTriggerDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              )}

              {formData.automaticTrigger === 'leave_balance_threshold' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Balance Threshold (days)</label>
                  <input
                    type="number"
                    name="automaticTriggerThreshold"
                    value={formData.automaticTriggerThreshold}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Encashment Percentage ({formData.automaticEncashmentPercentage}%)
                </label>
                <input
                  type="range"
                  name="automaticEncashmentPercentage"
                  value={formData.automaticEncashmentPercentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="requiresApproval"
                  id="requiresApproval"
                  checked={formData.requiresApproval}
                  onChange={handleChange}
                  className="rounded"
                />
                <label htmlFor="requiresApproval" className="text-sm text-gray-300">
                  Requires Approval
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save size={20} />
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomaticEncashmentSettings;
