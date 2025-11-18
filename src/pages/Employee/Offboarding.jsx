import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, User, Calendar, FileText } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const stageLabels = [
  { key: 'initiation', label: 'Initiation' },
  { key: 'manager_approval', label: 'Manager Approval' },
  { key: 'hr_approval', label: 'HR Approval' },
  { key: 'finance_approval', label: 'Finance Approval' },
  { key: 'checklist_generation', label: 'Checklist Generation' },
  { key: 'departmental_clearance', label: 'Departmental Clearance' },
  { key: 'asset_return', label: 'Asset Return' },
  { key: 'knowledge_transfer', label: 'Knowledge Transfer' },
  { key: 'final_settlement', label: 'Final Settlement' },
  { key: 'exit_interview', label: 'Exit Interview' },
  { key: 'closure', label: 'Closure' }
];

const StageProgress = ({ stages, currentStage, status }) => {
  // Use stageLabels if stages is not provided or is undefined
  const stageArray = stages || stageLabels.map(s => s.key);
  const currentIndex = stageArray.indexOf(currentStage);
  
  return (
    <div className="w-full">
      {/* Mobile View - Vertical Layout */}
      <div className="block lg:hidden">
        <div className="space-y-2">
          {stageArray.map((stage, idx) => {
            const done = status === 'completed' || idx < currentIndex;
            const current = idx === currentIndex && status !== 'completed';
            
            return (
              <div key={stage} className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                  done ? 'bg-green-500 text-white' : 
                  current ? 'bg-blue-500 text-white animate-pulse' : 
                  'bg-gray-700 text-gray-400'
                }`}>
                  {done ? <CheckCircle size={14} /> : current ? <Clock size={14} /> : <Circle size={14} />}
                </div>
                <div className={`text-xs font-medium ${
                  done ? 'text-green-400' : current ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {stageLabels.find(x => x.key === stage)?.label || stage}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Desktop View - Horizontal Scrollable Layout */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center space-x-1 min-w-max">
            {stageArray.map((stage, idx) => {
              const done = status === 'completed' || idx < currentIndex;
              const current = idx === currentIndex && status !== 'completed';
              const isLast = idx === stageArray.length - 1;
              
              return (
                <div key={stage} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      done ? 'bg-green-500 text-white' : 
                      current ? 'bg-blue-500 text-white animate-pulse' : 
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {done ? <CheckCircle size={18} /> : current ? <Clock size={18} /> : <Circle size={18} />}
                    </div>
                    <div className={`mt-1 text-xs font-medium text-center whitespace-nowrap ${
                      done ? 'text-green-400' : current ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      {stageLabels.find(x => x.key === stage)?.label || stage}
                    </div>
                  </div>
                  {!isLast && (
                    <div className={`mx-3 h-0.5 w-12 transition-all duration-300 flex-shrink-0 ${
                      done ? 'bg-green-500' : 'bg-gray-700'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Offboarding = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tenant/offboarding');
      setList(res?.data?.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load offboarding list');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res?.data?.data || []);
    } catch (e) {
      toast.error('Failed to load employees');
    }
  };

  const advanceStage = async (id) => {
    try {
      await api.put(`/tenant/offboarding/${id}/approve`);
      toast.success('Stage advanced successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to advance stage');
    }
  };

  const initiateOffboarding = async (formData) => {
    try {
      await api.post('/tenant/offboarding', formData);
      toast.success('Offboarding initiated successfully');
      setShowInitiateModal(false);
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate offboarding');
    }
  };

  const filteredList = list.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Offboarding</h1>
          <p className="text-gray-400 mt-1">Manage employee exit process</p>
        </div>
        <button 
          onClick={() => {
            setShowInitiateModal(true);
            fetchEmployees();
          }}
          className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Initiate Offboarding</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="closed">Completed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredList.map((item) => (
          <div key={item._id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <User size={18} />
                  <span className="truncate">
                    {item.employeeId?.firstName && item.employeeId?.lastName 
                      ? `${item.employeeId.firstName} ${item.employeeId.lastName}` 
                      : 'Employee Name Not Available'
                    }
                  </span>
                </h3>
                <p className="text-sm text-gray-400 truncate">{item.employeeId?.email || 'Email not available'}</p>
                <p className="text-sm text-gray-400">{item.employeeId?.employeeCode || 'Employee Code not available'}</p>
                
                {/* Employee Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="text-sm text-gray-400 flex items-center space-x-1 min-w-0">
                    <FileText size={14} className="flex-shrink-0" />
                    <span className="truncate">Designation: {item.employeeId?.designation || 'Not specified'}</span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center space-x-1 min-w-0">
                    <FileText size={14} className="flex-shrink-0" />
                    <span className="truncate">Department: {item.employeeId?.department?.name || 'Not specified'}</span>
                  </div>
                </div>

                {/* Offboarding Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="text-sm text-gray-400 capitalize flex items-center space-x-1 min-w-0">
                    <FileText size={14} className="flex-shrink-0" />
                    <span className="truncate">Reason: {item.reason?.replace(/_/g, ' ') || 'Not specified'}</span>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center space-x-1 min-w-0">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="truncate">Priority: {item.priority || 'Medium'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge whitespace-nowrap ${
                  item.status === 'closed' ? 'badge-success' :
                  item.status === 'active' ? 'badge-info' :
                  item.status === 'approved' ? 'badge-success' :
                  item.status === 'rejected' ? 'badge-danger' :
                  'badge-warning'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-3">Progress Stages</h4>
              <StageProgress 
                currentStage={item.currentStage} 
                status={item.status}
              />
            </div>

            {item.lastWorkingDay && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-sm text-red-400 flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Last Working Day: {new Date(item.lastWorkingDay).toLocaleDateString()}</span>
                </p>
              </div>
            )}

            {/* Approval Status Section */}
            <div className="mb-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-2">Current Status & Approvals</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Current Stage:</span> 
                    <span className="block mt-1 break-words">{stageLabels.find(s => s.key === item.currentStage)?.label || item.currentStage}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Overall Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs inline-block ${
                      item.status === 'closed' ? 'bg-green-900 text-green-300' :
                      item.status === 'active' ? 'bg-blue-900 text-blue-300' :
                      item.status === 'approved' ? 'bg-green-900 text-green-300' :
                      item.status === 'rejected' ? 'bg-red-900 text-red-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {item.status}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  {item.completionPercentage && (
                    <p className="text-sm text-gray-400">
                      <span className="font-medium">Progress:</span> {item.completionPercentage}%
                    </p>
                  )}
                  <p className="text-sm text-gray-400">
                    <span className="font-medium">Created:</span> {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Approval Details */}
              {item.approvals && item.approvals.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <h5 className="text-xs font-semibold text-gray-300 mb-2">Approval Chain</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {item.approvals.map((approval, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-1">
                        <span className="text-gray-400 capitalize break-words">{approval.stage} Approval:</span>
                        <span className={`px-2 py-1 rounded whitespace-nowrap self-start sm:self-auto ${
                          approval.status === 'approved' ? 'bg-green-900 text-green-300' :
                          approval.status === 'rejected' ? 'bg-red-900 text-red-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {approval.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-400">
                <p>Initiated: {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              
              {item.status === 'active' && (
                <button
                  onClick={() => advanceStage(item._id)}
                  className="btn-primary text-sm w-full sm:w-auto"
                >
                  Advance Stage
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No offboarding records found</p>
        </div>
      )}

      {/* Initiate Offboarding Modal */}
      {showInitiateModal && (
        <InitiateOffboardingModal
          employees={employees}
          onClose={() => setShowInitiateModal(false)}
          onSubmit={initiateOffboarding}
        />
      )}
    </div>
  );
};

// Initiate Offboarding Modal Component
const InitiateOffboardingModal = ({ employees, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    reason: '',
    reasonDetails: '',
    lastWorkingDay: '',
    noticePeriod: 30,
    priority: 'medium'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.reason || !formData.lastWorkingDay) {
      toast.error('Please fill all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Initiate Offboarding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white self-end sm:self-auto">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Employee *
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="input-field w-full"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Reason *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field w-full"
              required
            >
              <option value="">Select Reason</option>
              <option value="voluntary_resignation">Voluntary Resignation</option>
              <option value="involuntary_termination">Involuntary Termination</option>
              <option value="retirement">Retirement</option>
              <option value="contract_end">Contract End</option>
              <option value="layoff">Layoff</option>
              <option value="performance_issues">Performance Issues</option>
              <option value="misconduct">Misconduct</option>
              <option value="mutual_agreement">Mutual Agreement</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Reason Details
            </label>
            <textarea
              value={formData.reasonDetails}
              onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
              className="input-field w-full"
              rows="3"
              placeholder="Additional details about the offboarding reason..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Last Working Day *
            </label>
            <input
              type="date"
              value={formData.lastWorkingDay}
              onChange={(e) => setFormData({ ...formData, lastWorkingDay: e.target.value })}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notice Period (days)
            </label>
            <input
              type="number"
              value={formData.noticePeriod}
              onChange={(e) => setFormData({ ...formData, noticePeriod: parseInt(e.target.value) })}
              className="input-field w-full"
              min="0"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              Initiate Offboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Offboarding;
