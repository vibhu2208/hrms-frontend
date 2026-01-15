import React, { useEffect, useState } from 'react';
import { 
  Plus, CheckCircle, Circle, Clock, User, Calendar, FileText, 
  Search, Filter, Eye, Edit, Trash2, X, MoreVertical, CheckSquare,
  AlertCircle, Briefcase, DollarSign, Package, Users, ArrowRight,
  Phone, Mail, MapPin, Building, CreditCard, Settings, Download
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Stage labels matching the backend model
const stageLabels = [
  { key: 'exitDiscussion', label: 'Exit Discussion' },
  { key: 'assetReturn', label: 'Asset Return' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'finalSettlement', label: 'Final Settlement' },
  { key: 'success', label: 'Completed' }
];

const statusLabels = {
  'in-progress': { label: 'In Progress', color: 'bg-blue-500', badge: 'badge-info' },
  'completed': { label: 'Completed', color: 'bg-green-500', badge: 'badge-success' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500', badge: 'badge-danger' }
};

const resignationTypeLabels = {
  'voluntary': 'Voluntary',
  'involuntary': 'Involuntary',
  'retirement': 'Retirement',
  'contract-end': 'Contract End'
};

const resignationReasonToTypeMap = {
  voluntary_resignation: 'voluntary',
  involuntary_termination: 'involuntary',
  retirement: 'retirement',
  contract_end: 'contract-end'
};

const StageProgress = ({ stages, currentStage, status }) => {
  const stageArray = stages || stageLabels.map(s => s.key);
  const currentIndex = stageArray.indexOf(currentStage);
  
  return (
    <div className="flex items-center space-x-1 overflow-x-auto pb-2">
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
              <div className={`mt-1 text-xs font-medium text-center max-w-[80px] ${
                done ? 'text-green-400' : current ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {stageLabels.find(x => x.key === stage)?.label || stage}
              </div>
            </div>
            {!isLast && (
              <div className={`mx-2 h-0.5 w-12 transition-all duration-300 ${
                done ? 'bg-green-500' : 'bg-gray-700'
              }`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Offboarding = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ total: 0, inProgress: 0, completed: 0, cancelled: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExitInterviewModal, setShowExitInterviewModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedOffboarding, setSelectedOffboarding] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchList();
  }, [filterStatus, filterStage, searchTerm, currentPage]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterStage) params.append('stage', filterStage);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', currentPage);
      params.append('limit', '10');
      
      const res = await api.get(`/offboarding?${params.toString()}`);
      setList(res?.data?.data || []);
      setSummary(res?.data?.summary || {});
      setTotalPages(res?.data?.pagination?.pages || 1);
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

  const fetchOffboardingDetails = async (id) => {
    try {
      const res = await api.get(`/offboarding/${id}`);
      setSelectedOffboarding(res?.data?.data);
      return res?.data?.data;
    } catch (e) {
      toast.error('Failed to load offboarding details');
      return null;
    }
  };

  const initiateOffboarding = async (formData) => {
    try {
      // Map form fields to backend expected format
      const selectedReason = formData.reason;
      const mappedResignationType = resignationReasonToTypeMap[selectedReason] || formData.resignationType || 'voluntary';
      const payload = {
        employeeId: formData.employeeId,
        lastWorkingDate: formData.lastWorkingDay || formData.lastWorkingDate,
        resignationType: mappedResignationType,
        reason: selectedReason || formData.resignationType || mappedResignationType
      };

      await api.post('/offboarding', payload);
      toast.success('Offboarding initiated successfully');
      setShowInitiateModal(false);
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to initiate offboarding');
    }
  };

  const updateOffboarding = async (id, data) => {
    try {
      await api.put(`/offboarding/${id}`, data);
      toast.success('Offboarding updated successfully');
      setShowEditModal(false);
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update offboarding');
    }
  };

  const advanceStage = async (id) => {
    try {
      await api.post(`/offboarding/${id}/advance`);
      toast.success('Stage advanced successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to advance stage');
    }
  };

  const cancelOffboarding = async (id, reason) => {
    try {
      await api.put(`/offboarding/${id}/cancel`, { reason });
      toast.success('Offboarding cancelled successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        setShowDetailsModal(false);
        setSelectedOffboarding(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to cancel offboarding');
    }
  };

  const deleteOffboarding = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offboarding record?')) {
      return;
    }
    try {
      await api.delete(`/offboarding/${id}`);
      toast.success('Offboarding deleted successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        setShowDetailsModal(false);
        setSelectedOffboarding(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to delete offboarding');
    }
  };

  const scheduleExitInterview = async (id, data) => {
    try {
      await api.post(`/offboarding/${id}/exit-interview/schedule`, data);
      toast.success('Exit interview scheduled successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
      setShowExitInterviewModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to schedule exit interview');
    }
  };

  const completeExitInterview = async (id, feedback) => {
    try {
      await api.post(`/offboarding/${id}/exit-interview/complete`, { feedback });
      toast.success('Exit interview completed successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
      setShowExitInterviewModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to complete exit interview');
    }
  };

  const updateClearance = async (id, department, cleared, notes) => {
    try {
      await api.post(`/offboarding/${id}/clearance`, { department, cleared, notes });
      toast.success(`${department.toUpperCase()} clearance updated successfully`);
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
      setShowClearanceModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update clearance');
    }
  };

  const recordAssetReturn = async (id, asset, condition) => {
    try {
      await api.post(`/offboarding/${id}/assets/return`, { asset, condition });
      toast.success('Asset return recorded successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
      setShowAssetModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to record asset return');
    }
  };

  const processSettlement = async (id, amount, paymentStatus) => {
    try {
      await api.post(`/offboarding/${id}/settlement`, { amount, paymentStatus });
      toast.success('Settlement processed successfully');
      fetchList();
      if (selectedOffboarding?._id === id) {
        fetchOffboardingDetails(id);
      }
      setShowSettlementModal(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to process settlement');
    }
  };

  const handleViewDetails = async (item) => {
    const details = await fetchOffboardingDetails(item._id);
    if (details) {
      setShowDetailsModal(true);
    }
  };

  const handleEdit = async (item) => {
    const details = await fetchOffboardingDetails(item._id);
    if (details) {
      setShowEditModal(true);
    }
  };

  if (loading && list.length === 0) {
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-xl font-bold text-white">{summary.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500">
              <Clock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-white">{summary.inProgress || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-xl font-bold text-white">{summary.completed || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500">
              <X size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Cancelled</p>
              <p className="text-xl font-bold text-white">{summary.cancelled || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 flex-1 min-w-[250px]">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name, email, or code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field w-full"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-48"
          >
            <option value="all">All Status</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterStage}
            onChange={(e) => {
              setFilterStage(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-48"
          >
            <option value="">All Stages</option>
            {stageLabels.map(stage => (
              <option key={stage.key} value={stage.key}>{stage.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterStage('');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="btn-outline text-sm"
          >
            <Filter size={16} className="mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Offboarding List */}
      <div className="space-y-4">
        {list.map((item) => (
          <OffboardingCard
            key={item._id}
            item={item}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onAdvanceStage={advanceStage}
            onCancel={cancelOffboarding}
            onDelete={deleteOffboarding}
            onScheduleExitInterview={(id) => {
              setSelectedOffboarding(item);
              setShowExitInterviewModal(true);
            }}
            onUpdateClearance={(id) => {
              setSelectedOffboarding(item);
              setShowClearanceModal(true);
            }}
            onRecordAsset={(id) => {
              setSelectedOffboarding(item);
              setShowAssetModal(true);
            }}
            onProcessSettlement={(id) => {
              setSelectedOffboarding(item);
              setShowSettlementModal(true);
            }}
          />
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && !loading && (
        <div className="text-center py-12 card">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No offboarding records found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterStatus !== 'all' || filterStage ? 'Try adjusting your filters' : 'Initiate an offboarding process to get started'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-400 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modals */}
      {showInitiateModal && (
        <InitiateOffboardingModal
          employees={employees}
          onClose={() => setShowInitiateModal(false)}
          onSubmit={initiateOffboarding}
        />
      )}

      {showDetailsModal && selectedOffboarding && (
        <OffboardingDetailsModal
          offboarding={selectedOffboarding}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOffboarding(null);
          }}
          onRefresh={() => fetchOffboardingDetails(selectedOffboarding._id)}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          onAdvanceStage={advanceStage}
          onScheduleExitInterview={() => setShowExitInterviewModal(true)}
          onUpdateClearance={() => setShowClearanceModal(true)}
          onRecordAsset={() => setShowAssetModal(true)}
          onProcessSettlement={() => setShowSettlementModal(true)}
          onCancel={cancelOffboarding}
          onDelete={deleteOffboarding}
        />
      )}

      {showEditModal && selectedOffboarding && (
        <EditOffboardingModal
          offboarding={selectedOffboarding}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOffboarding(null);
          }}
          onSave={(data) => updateOffboarding(selectedOffboarding._id, data)}
        />
      )}

      {showExitInterviewModal && selectedOffboarding && (
        <ExitInterviewModal
          offboarding={selectedOffboarding}
          employees={employees}
          onClose={() => {
            setShowExitInterviewModal(false);
          }}
          onSchedule={(data) => scheduleExitInterview(selectedOffboarding._id, data)}
          onComplete={(feedback) => completeExitInterview(selectedOffboarding._id, feedback)}
        />
      )}

      {showClearanceModal && selectedOffboarding && (
        <ClearanceModal
          offboarding={selectedOffboarding}
          onClose={() => {
            setShowClearanceModal(false);
          }}
          onUpdate={(department, cleared, notes) => updateClearance(selectedOffboarding._id, department, cleared, notes)}
        />
      )}

      {showAssetModal && selectedOffboarding && (
        <AssetReturnModal
          offboarding={selectedOffboarding}
          onClose={() => {
            setShowAssetModal(false);
          }}
          onRecord={(asset, condition) => recordAssetReturn(selectedOffboarding._id, asset, condition)}
        />
      )}

      {showSettlementModal && selectedOffboarding && (
        <SettlementModal
          offboarding={selectedOffboarding}
          onClose={() => {
            setShowSettlementModal(false);
          }}
          onProcess={(amount, paymentStatus) => processSettlement(selectedOffboarding._id, amount, paymentStatus)}
        />
      )}
    </div>
  );
};

// Offboarding Card Component
const OffboardingCard = ({ 
  item, 
  onViewDetails, 
  onEdit, 
  onAdvanceStage, 
  onCancel, 
  onDelete,
  onScheduleExitInterview,
  onUpdateClearance,
  onRecordAsset,
  onProcessSettlement
}) => {
  const [showActions, setShowActions] = useState(false);
  const employee = item.employee || {};
  const statusInfo = statusLabels[item.status] || statusLabels['in-progress'];

  return (
    <div className="card hover:border-primary-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <User size={24} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {employee.firstName && employee.lastName 
                  ? `${employee.firstName} ${employee.lastName}` 
                  : 'Employee Name Not Available'}
              </h3>
              <p className="text-sm text-gray-400">{employee.email || 'Email not available'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500">Employee Code</p>
              <p className="text-sm text-gray-300">{employee.employeeCode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm text-gray-300">{employee.department?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Resignation Type</p>
              <p className="text-sm text-gray-300 capitalize">
                {resignationTypeLabels[item.resignationType] || item.resignationType || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Last Working Date</p>
              <p className="text-sm text-gray-300">
                {item.lastWorkingDate ? new Date(item.lastWorkingDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <span className={`badge ${statusInfo.badge}`}>
            {statusInfo.label}
          </span>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
            >
              <MoreVertical size={18} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-10 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onViewDetails(item);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(item);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                {item.status === 'in-progress' && (
                  <>
                    <button
                      onClick={() => {
                        onAdvanceStage(item._id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <ArrowRight size={16} />
                      <span>Advance Stage</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this offboarding?')) {
                          const reason = prompt('Please provide a reason for cancellation:');
                          if (reason) {
                            onCancel(item._id, reason);
                          }
                        }
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this offboarding record?')) {
                      onDelete(item._id);
                    }
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 rounded-b-lg"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <StageProgress 
          stages={item.stages}
          currentStage={item.currentStage}
          status={item.status}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </div>
        {item.status === 'in-progress' && (
          <button
            onClick={() => onAdvanceStage(item._id)}
            className="btn-primary text-sm"
          >
            Advance Stage
          </button>
        )}
      </div>
    </div>
  );
};

// Initiate Offboarding Modal
const InitiateOffboardingModal = ({ employees, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    reason: '',
    lastWorkingDay: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.reason || !formData.lastWorkingDay) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Initiate Offboarding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
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
            </select>
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

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Initiate Offboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Offboarding Details Modal
const OffboardingDetailsModal = ({ 
  offboarding, 
  onClose, 
  onRefresh,
  onEdit,
  onAdvanceStage,
  onScheduleExitInterview,
  onUpdateClearance,
  onRecordAsset,
  onProcessSettlement,
  onCancel,
  onDelete
}) => {
  const employee = offboarding.employee || {};
  const clearance = offboarding.clearanceSummary || offboarding.clearance || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-400 mt-1">Offboarding Details</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Employee Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Employee Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-300">{employee.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Employee Code</p>
                <p className="text-sm text-gray-300">{employee.employeeCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Department</p>
                <p className="text-sm text-gray-300">{employee.department?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Designation</p>
                <p className="text-sm text-gray-300">{employee.designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Working Date</p>
                <p className="text-sm text-gray-300">
                  {offboarding.lastWorkingDate ? new Date(offboarding.lastWorkingDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Resignation Type</p>
                <p className="text-sm text-gray-300 capitalize">
                  {resignationTypeLabels[offboarding.resignationType] || offboarding.resignationType || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stage Progress</h3>
            <StageProgress 
              stages={offboarding.stages}
              currentStage={offboarding.currentStage}
              status={offboarding.status}
            />
          </div>

          {/* Clearance Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Clearance Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['hr', 'finance', 'it', 'admin'].map(dept => (
                <div key={dept} className="card p-4">
                  <p className="text-sm font-medium text-gray-300 mb-2 capitalize">{dept}</p>
                  <div className={`badge ${clearance[dept]?.cleared ? 'badge-success' : 'badge-warning'}`}>
                    {clearance[dept]?.cleared ? 'Cleared' : 'Pending'}
                  </div>
                  {clearance[dept]?.clearedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(clearance[dept].clearedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Exit Interview */}
          {offboarding.exitInterview && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Exit Interview</h3>
              <div className="card p-4">
                {offboarding.exitInterview.completed ? (
                  <div>
                    <p className="text-sm text-green-400 mb-2">Completed</p>
                    {offboarding.exitInterview.feedback && (
                      <p className="text-sm text-gray-300">{offboarding.exitInterview.feedback}</p>
                    )}
                  </div>
                ) : offboarding.exitInterview.scheduledDate ? (
                  <p className="text-sm text-gray-300">
                    Scheduled for {new Date(offboarding.exitInterview.scheduledDate).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Not scheduled</p>
                )}
              </div>
            </div>
          )}

          {/* Final Settlement */}
          {offboarding.finalSettlement && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Final Settlement</h3>
              <div className="card p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm text-gray-300">
                      {offboarding.finalSettlement.amount 
                        ? `₹${offboarding.finalSettlement.amount.toLocaleString()}` 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Payment Status</p>
                    <p className="text-sm text-gray-300 capitalize">
                      {offboarding.finalSettlement.paymentStatus || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {offboarding.status === 'in-progress' && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
              <button onClick={() => onAdvanceStage(offboarding._id)} className="btn-primary">
                Advance Stage
              </button>
              <button onClick={onScheduleExitInterview} className="btn-outline">
                Schedule Exit Interview
              </button>
              <button onClick={onUpdateClearance} className="btn-outline">
                Update Clearance
              </button>
              <button onClick={onRecordAsset} className="btn-outline">
                Record Asset Return
              </button>
              <button onClick={onProcessSettlement} className="btn-outline">
                Process Settlement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Offboarding Modal
const EditOffboardingModal = ({ offboarding, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    lastWorkingDate: offboarding.lastWorkingDate ? new Date(offboarding.lastWorkingDate).toISOString().split('T')[0] : '',
    reason: offboarding.reason || '',
    notes: offboarding.notes || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(formData);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Edit Offboarding</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Last Working Date
            </label>
            <input
              type="date"
              value={formData.lastWorkingDate}
              onChange={(e) => setFormData({ ...formData, lastWorkingDate: e.target.value })}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field w-full"
              rows="4"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exit Interview Modal
const ExitInterviewModal = ({ offboarding, employees, onClose, onSchedule, onComplete }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [conductedBy, setConductedBy] = useState('');
  const [feedback, setFeedback] = useState('');

  if (offboarding.exitInterview?.completed) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Exit Interview</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <p className="text-green-400">Exit interview completed</p>
            {offboarding.exitInterview.feedback && (
              <div>
                <p className="text-sm text-gray-400 mb-2">Feedback:</p>
                <p className="text-sm text-gray-300">{offboarding.exitInterview.feedback}</p>
              </div>
            )}
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Exit Interview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {offboarding.exitInterview?.scheduledDate ? (
          <div className="space-y-4">
            <p className="text-gray-300">
              Scheduled for {new Date(offboarding.exitInterview.scheduledDate).toLocaleDateString()}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="input-field w-full"
                rows="4"
                placeholder="Enter exit interview feedback..."
              />
            </div>
            <button
              onClick={() => onComplete(feedback)}
              className="btn-primary w-full"
            >
              Complete Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <button
              onClick={() => onSchedule({ scheduledDate, conductedBy })}
              className="btn-primary w-full"
            >
              Schedule Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Clearance Modal
const ClearanceModal = ({ offboarding, onClose, onUpdate }) => {
  const [department, setDepartment] = useState('hr');
  const [cleared, setCleared] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(department, cleared, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Update Clearance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field w-full"
            >
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="it">IT</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={cleared}
                onChange={(e) => setCleared(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-300">Mark as Cleared</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field w-full"
              rows="3"
            />
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
              Update Clearance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asset Return Modal
const AssetReturnModal = ({ offboarding, onClose, onRecord }) => {
  const [assetId, setAssetId] = useState('');
  const [condition, setCondition] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assetId || !condition) {
      toast.error('Please fill all required fields');
      return;
    }
    onRecord(assetId, condition);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Record Asset Return</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Asset ID
            </label>
            <input
              type="text"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Condition
            </label>
            <textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="input-field w-full"
              rows="3"
              required
            />
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
              Record Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Settlement Modal
const SettlementModal = ({ offboarding, onClose, onProcess }) => {
  const [amount, setAmount] = useState(offboarding.finalSettlement?.amount || '');
  const [paymentStatus, setPaymentStatus] = useState(offboarding.finalSettlement?.paymentStatus || 'pending');

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcess(parseFloat(amount), paymentStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Process Settlement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Settlement Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="input-field w-full"
            >
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="completed">Completed</option>
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
              Process Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Offboarding;
