import React, { useEffect, useState } from 'react';
import { 
  Plus, CheckCircle, Circle, Clock, FileText, Calendar, 
  Users, AlertCircle, Eye, Edit, Send, CheckSquare,
  Filter, Search, MoreHorizontal, Mail, Phone, X, Briefcase,
  MapPin, DollarSign, Building, FileEdit, Trash2, Copy, Save
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// New comprehensive onboarding status labels
const statusLabels = {
  'preboarding': { label: 'Pre-boarding', color: 'bg-blue-500', icon: Circle },
  'offer_sent': { label: 'Offer Sent', color: 'bg-yellow-500', icon: Mail },
  'offer_accepted': { label: 'Offer Accepted', color: 'bg-green-500', icon: CheckCircle },
  'docs_pending': { label: 'Documents Pending', color: 'bg-orange-500', icon: FileText },
  'docs_verified': { label: 'Documents Verified', color: 'bg-emerald-500', icon: CheckSquare },
  'ready_for_joining': { label: 'Ready for Joining', color: 'bg-purple-500', icon: Calendar },
  'completed': { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
  'rejected': { label: 'Rejected', color: 'bg-red-500', icon: AlertCircle }
};

const OnboardingProgressBar = ({ status }) => {
  const steps = [
    'preboarding', 'offer_sent', 'offer_accepted', 
    'docs_pending', 'docs_verified', 'ready_for_joining', 'completed'
  ];
  
  const currentIndex = steps.indexOf(status);
  const isRejected = status === 'rejected';
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIndex || status === 'completed';
        const isCurrent = idx === currentIndex && !isRejected;
        const isLast = idx === steps.length - 1;
        const stepInfo = statusLabels[step];
        
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                isRejected ? 'bg-red-500 text-white' :
                isCompleted ? 'bg-green-500 text-white' : 
                isCurrent ? `${stepInfo.color} text-white animate-pulse` : 
                'bg-gray-700 text-gray-400'
              }`}>
                {React.createElement(stepInfo.icon, { size: 16 })}
              </div>
              <div className={`mt-1 text-xs font-medium text-center max-w-20 ${
                isRejected ? 'text-red-400' :
                isCompleted ? 'text-green-400' : 
                isCurrent ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {stepInfo.label}
              </div>
            </div>
            {!isLast && (
              <div className={`mx-2 h-0.5 w-12 transition-all duration-300 ${
                isRejected ? 'bg-red-500' :
                isCompleted ? 'bg-green-500' : 'bg-gray-700'
              }`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState('onboarding'); // 'onboarding' or 'templates'
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({});
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Template states
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateFilter, setTemplateFilter] = useState({ status: '', category: '', search: '' });
  
  // Send Offer Modal states
  const [showSendOfferModal, setShowSendOfferModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (activeTab === 'onboarding') {
      fetchList();
    } else if (activeTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab, filterStatus, filterDepartment, searchTerm, templateFilter]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterDepartment) params.append('department', filterDepartment);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await api.get(`/onboarding?${params.toString()}`);
      setList(res?.data?.data || []);
      setSummary(res?.data?.summary || {});
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load onboarding list');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus, notes = '') => {
    try {
      await api.put(`/onboarding/${id}/status`, { status: newStatus, notes });
      toast.success('Status updated successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    }
  };

  const sendOffer = async (id, offerDetails) => {
    try {
      await api.post(`/onboarding/${id}/send-offer`, offerDetails);
      toast.success('Offer sent successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send offer');
    }
  };

  const setJoiningDate = async (id, joiningDate, notifyTeams = true) => {
    try {
      await api.post(`/onboarding/${id}/set-joining-date`, { joiningDate, notifyTeams });
      toast.success('Joining date set and teams notified');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to set joining date');
    }
  };

  const completeOnboarding = async (id) => {
    if (!confirm('Are you sure you want to complete this onboarding? This will create an employee record.')) {
      return;
    }
    
    try {
      await api.post(`/onboarding/${id}/complete`);
      toast.success('Onboarding completed successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to complete onboarding');
    }
  };

  // Template Management Functions
  const fetchTemplates = async () => {
    setTemplateLoading(true);
    try {
      const params = new URLSearchParams();
      if (templateFilter.status) params.append('status', templateFilter.status);
      if (templateFilter.category) params.append('category', templateFilter.category);
      if (templateFilter.search) params.append('search', templateFilter.search);
      
      const response = await api.get(`/offer-templates?${params.toString()}`);
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load offer templates');
      console.error(error);
    } finally {
      setTemplateLoading(false);
    }
  };

  const saveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await api.put(`/offer-templates/${editingTemplate._id}`, templateData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/offer-templates', templateData);
        toast.success('Template created successfully');
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save template');
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await api.delete(`/offer-templates/${id}`);
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false
      };
      delete newTemplate._id;
      delete newTemplate.createdAt;
      delete newTemplate.updatedAt;
      
      await api.post('/offer-templates', newTemplate);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const updateTemplateStatus = async (id, status) => {
    try {
      await api.put(`/offer-templates/${id}/status`, { status });
      toast.success(`Template ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template status');
    }
  };

  const filteredList = list;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Onboarding</h1>
          <p className="text-gray-400 mt-1">Manage comprehensive candidate onboarding process</p>
        </div>
        <div className="flex items-center space-x-3">
          {activeTab === 'onboarding' && summary.overdue > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-900/20 border border-red-800 rounded-lg">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-red-400">{summary.overdue} Overdue</span>
            </div>
          )}
          {activeTab === 'onboarding' && (
            <span className="text-sm text-gray-400">
              Total: {summary.total || 0}
            </span>
          )}
          {activeTab === 'templates' && (
            <button
              onClick={() => {
                setEditingTemplate(null);
                setShowTemplateModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Create Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'onboarding'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users size={18} />
              <span>Onboarding List</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'templates'
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileEdit size={18} />
              <span>Offer Templates</span>
            </div>
          </button>
        </div>
      </div>

      {/* Onboarding Tab Content */}
      {activeTab === 'onboarding' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(summary.byStatus || {}).map(([status, count]) => {
              const statusInfo = statusLabels[status];
              if (!statusInfo) return null;
              
              return (
                <div key={status} className="card p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                      {React.createElement(statusInfo.icon, { size: 20, className: 'text-white' })}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{statusInfo.label}</p>
                      <p className="text-xl font-bold text-white">{count}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-48"
          >
            <option value="">All Status</option>
            {Object.entries(statusLabels).map(([status, info]) => (
              <option key={status} value={status}>{info.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterDepartment('');
              setSearchTerm('');
            }}
            className="btn-outline text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Onboarding List */}
      <div className="space-y-4">
        {filteredList.map((item) => (
          <OnboardingCard 
            key={item._id} 
            item={item} 
            onUpdateStatus={updateStatus}
            onSendOffer={sendOffer}
            onSetJoiningDate={setJoiningDate}
            onComplete={completeOnboarding}
            onOpenSendOfferModal={(candidate) => {
              setSelectedCandidate(candidate);
              setShowSendOfferModal(true);
            }}
            onViewDetails={(onboarding) => {
              setSelectedOnboarding(onboarding);
              setShowDetails(true);
            }}
          />
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No onboarding records found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterStatus ? 'Try adjusting your filters' : 'Candidates will appear here when sent to onboarding'}
          </p>
        </div>
      )}

          {/* Details Modal */}
          {showDetails && selectedOnboarding && (
            <OnboardingDetailsModal 
              onboarding={selectedOnboarding}
              onClose={() => {
                setShowDetails(false);
                setSelectedOnboarding(null);
              }}
            />
          )}
        </>
      )}

      {/* Templates Tab Content */}
      {activeTab === 'templates' && (
        <TemplatesSection
          templates={templates}
          loading={templateLoading}
          filter={templateFilter}
          setFilter={setTemplateFilter}
          onEdit={(template) => {
            setEditingTemplate(template);
            setShowTemplateModal(true);
          }}
          onDelete={deleteTemplate}
          onDuplicate={duplicateTemplate}
          onUpdateStatus={updateTemplateStatus}
        />
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          onSave={saveTemplate}
        />
      )}

      {/* Send Offer Modal */}
      {showSendOfferModal && selectedCandidate && (
        <SendOfferModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowSendOfferModal(false);
            setSelectedCandidate(null);
          }}
          onSend={sendOffer}
        />
      )}
    </div>
  );
};

// Onboarding Card Component
const OnboardingCard = ({ item, onUpdateStatus, onSendOffer, onSetJoiningDate, onComplete, onViewDetails, onOpenSendOfferModal }) => {
  const [showActions, setShowActions] = useState(false);
  const statusInfo = statusLabels[item.status];
  
  const getNextActions = () => {
    switch (item.status) {
      case 'preboarding':
        return [
          { label: 'Send Offer', action: () => onOpenSendOfferModal(item), color: 'btn-primary' }
        ];
      case 'offer_sent':
        return [
          { label: 'Mark Accepted', action: () => onUpdateStatus(item._id, 'offer_accepted'), color: 'btn-success' },
          { label: 'Mark Rejected', action: () => onUpdateStatus(item._id, 'rejected'), color: 'btn-danger' }
        ];
      case 'offer_accepted':
        return [
          { label: 'Request Documents', action: () => onUpdateStatus(item._id, 'docs_pending'), color: 'btn-primary' }
        ];
      case 'docs_pending':
        return [
          { label: 'Verify Documents', action: () => onUpdateStatus(item._id, 'docs_verified'), color: 'btn-success' }
        ];
      case 'docs_verified':
        return [
          { label: 'Set Joining Date', action: () => handleSetJoiningDate(), color: 'btn-primary' }
        ];
      case 'ready_for_joining':
        return [
          { label: 'Complete Onboarding', action: () => onComplete(item._id), color: 'btn-success' }
        ];
      default:
        return [];
    }
  };

  const handleSetJoiningDate = () => {
    const joiningDate = prompt('Enter joining date (YYYY-MM-DD):');
    if (joiningDate) {
      onSetJoiningDate(item._id, joiningDate);
    }
  };

  const nextActions = getNextActions();

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{item.candidateName}</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} text-white`}>
              {React.createElement(statusInfo.icon, { size: 12, className: 'mr-1' })}
              {statusInfo.label}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail size={14} />
              <span>{item.candidateEmail}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={14} />
              <span>{item.candidatePhone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={14} />
              <span>{item.position}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewDetails(item)}
            className="btn-outline text-sm"
          >
            <Eye size={16} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="btn-outline text-sm"
            >
              <MoreHorizontal size={16} />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                {nextActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      action.action();
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <OnboardingProgressBar status={item.status} />

      {item.joiningDate && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-green-400" />
            <span className="text-sm text-green-400">
              Joining Date: {new Date(item.joiningDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {item.offer?.expiryDate && item.status === 'offer_sent' && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Offer expires: {new Date(item.offer.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          ID: {item.onboardingId} • Created: {new Date(item.createdAt).toLocaleDateString()}
        </div>
        
        <div className="flex items-center space-x-2">
          {nextActions.slice(0, 2).map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className={`${action.color} text-sm`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Onboarding Details Modal Component
const OnboardingDetailsModal = ({ onboarding, onClose }) => {
  const statusInfo = statusLabels[onboarding.status];
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{onboarding.candidateName}</h2>
            <p className="text-gray-400 mt-1">Onboarding ID: {onboarding.onboardingId}</p>
          </div>
          <button
            onClick={onClose}
            className="btn-outline p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Current Status</h3>
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${statusInfo.color}`}>
                {React.createElement(statusInfo.icon, { size: 24, className: 'text-white' })}
              </div>
              <div>
                <p className="text-white font-medium">{statusInfo.label}</p>
                <p className="text-gray-400 text-sm">Updated: {formatDate(onboarding.updatedAt)}</p>
              </div>
            </div>
            <div className="mt-4">
              <OnboardingProgressBar status={onboarding.status} />
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-primary-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{onboarding.candidateEmail}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-primary-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white">{onboarding.candidatePhone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Briefcase size={18} className="text-primary-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Position</p>
                  <p className="text-white">{onboarding.position}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Building size={18} className="text-primary-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Department</p>
                  <p className="text-white">{onboarding.department?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Details */}
          {onboarding.offer && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Offer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Briefcase size={18} className="text-primary-500 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Offered Designation</p>
                    <p className="text-white">{onboarding.offer.offeredDesignation || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign size={18} className="text-primary-500 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Offered CTC</p>
                    <p className="text-white">{formatCurrency(onboarding.offer.offeredCTC)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar size={18} className="text-primary-500 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Start Date</p>
                    <p className="text-white">{formatDate(onboarding.offer.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock size={18} className="text-primary-500 mt-1" />
                  <div>
                    <p className="text-gray-400 text-sm">Offer Sent</p>
                    <p className="text-white">{formatDate(onboarding.offer.sentAt)}</p>
                  </div>
                </div>
                {onboarding.offer.expiryDate && (
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={18} className="text-yellow-500 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm">Offer Expires</p>
                      <p className="text-white">{formatDate(onboarding.offer.expiryDate)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Salary Breakdown */}
              {onboarding.offer.salary && (
                <div className="mt-4 p-4 bg-dark-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-400 mb-3">Salary Breakdown</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Basic</p>
                      <p className="text-white font-medium">{formatCurrency(onboarding.offer.salary.basic)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">HRA</p>
                      <p className="text-white font-medium">{formatCurrency(onboarding.offer.salary.hra)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Allowances</p>
                      <p className="text-white font-medium">{formatCurrency(onboarding.offer.salary.allowances)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-white font-medium">{formatCurrency(onboarding.offer.salary.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Joining Date */}
          {onboarding.joiningDate && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Joining Information</h3>
              <div className="flex items-start space-x-3">
                <Calendar size={18} className="text-primary-500 mt-1" />
                <div>
                  <p className="text-gray-400 text-sm">Joining Date</p>
                  <p className="text-white font-medium text-lg">{formatDate(onboarding.joiningDate)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {onboarding.auditTrail && onboarding.auditTrail.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
              <div className="space-y-3">
                {onboarding.auditTrail.slice().reverse().map((audit, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-dark-800 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{audit.action.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-gray-400 text-sm">{audit.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{formatDate(audit.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {onboarding.documents && onboarding.documents.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Documents</h3>
              <div className="space-y-2">
                {onboarding.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText size={18} className="text-primary-500" />
                      <div>
                        <p className="text-white">{doc.name}</p>
                        <p className="text-gray-400 text-sm">{doc.type}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Templates Section Component
const TemplatesSection = ({ templates, loading, filter, setFilter, onEdit, onDelete, onDuplicate, onUpdateStatus }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="input-field w-64"
            />
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="input-field w-40"
          >
            <option value="">All Categories</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
            <option value="executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template._id} className="card p-4 hover:border-primary-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{template.description}</p>
              </div>
              {template.isDefault && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs font-medium rounded">
                  Default
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{template.category}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  template.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  template.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {template.status}
                </span>
              </div>
              {template.usageCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Used:</span>
                  <span className="text-white">{template.usageCount} times</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(template)}
                className="flex-1 btn-outline text-sm py-2"
              >
                <Edit size={14} className="inline mr-1" />
                Edit
              </button>
              <button
                onClick={() => onDuplicate(template)}
                className="btn-outline p-2"
                title="Duplicate"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={() => onUpdateStatus(template._id, template.status === 'active' ? 'inactive' : 'active')}
                className={`btn-outline p-2 ${template.status === 'active' ? 'text-yellow-400' : 'text-green-400'}`}
                title={template.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {template.status === 'active' ? <Clock size={16} /> : <CheckCircle size={16} />}
              </button>
              <button
                onClick={() => onDelete(template._id)}
                className="btn-outline p-2 text-red-400 hover:bg-red-500/10"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileEdit size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No templates found</p>
          <p className="text-gray-500 text-sm mt-2">
            {filter.search || filter.status || filter.category
              ? 'Try adjusting your filters'
              : 'Create your first offer template to get started'}
          </p>
        </div>
      )}
    </>
  );
};

// Template Modal Component
const TemplateModal = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'full-time',
    subject: template?.subject || '',
    content: template?.content || '',
    status: template?.status || 'draft',
    isDefault: template?.isDefault || false,
    variables: template?.variables || [],
    expiryDays: template?.expiryDays || 1,
    reminderDays: template?.reminderDays || []
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Template name is required';
    if (!formData.subject.trim()) newErrors.subject = 'Email subject is required';
    if (!formData.content.trim()) newErrors.content = 'Template content is required';
    if (formData.expiryDays < 1) newErrors.expiryDays = 'Expiry days must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const insertVariable = (variable) => {
    setFormData({
      ...formData,
      content: formData.content + `{{${variable}}}`
    });
  };

  const availableVariables = [
    'candidateName', 'candidateEmail', 'position', 'department',
    'offeredCTC', 'startDate', 'joiningDate', 'companyName',
    'hrName', 'hrEmail', 'hrPhone'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {template ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-gray-400 mt-1">Design your offer letter template</p>
          </div>
          <button onClick={onClose} className="btn-outline p-2">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., Full-Time Offer Letter"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field w-full"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field w-full"
              rows="2"
              placeholder="Brief description of this template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`input-field w-full ${errors.subject ? 'border-red-500' : ''}`}
              placeholder="e.g., Offer Letter - {{position}} at {{companyName}}"
            />
            {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Template Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Template Content *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">Insert Variable:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      insertVariable(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="input-field text-xs py-1"
                >
                  <option value="">Select...</option>
                  {availableVariables.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`input-field w-full font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
              rows="12"
              placeholder="Dear {{candidateName}},&#10;&#10;We are pleased to offer you the position of {{position}} at {{companyName}}...&#10;&#10;Use {{variableName}} to insert dynamic content."
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Use double curly braces for variables, e.g., {`{{candidateName}}`}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field w-full"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Offer Expiry (Days) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.expiryDays}
                onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                className={`input-field w-full ${errors.expiryDays ? 'border-red-500' : ''}`}
              />
              {errors.expiryDays && <p className="text-red-400 text-sm mt-1">{errors.expiryDays}</p>}
            </div>

            <div className="flex items-center pt-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Set as Default</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
            >
              <Save size={18} />
              <span>{template ? 'Update Template' : 'Create Template'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Send Offer Modal Component
const SendOfferModal = ({ candidate, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    candidateName: candidate.candidateName || '',
    salary: '',
    templateId: 'default'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = 'Candidate name is required';
    }
    if (!formData.salary || formData.salary <= 0) {
      newErrors.salary = 'Valid salary is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSend(candidate._id, {
        templateId: formData.templateId,
        offerDetails: {
          designation: candidate.position,
          ctc: parseFloat(formData.salary),
          salary: parseFloat(formData.salary)
        }
      });
      onClose();
    } catch (error) {
      toast.error('Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Send Offer Letter</h2>
            <p className="text-gray-400 text-sm mt-1">Fill in the offer details</p>
          </div>
          <button onClick={onClose} className="btn-outline p-2">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Candidate Info */}
          <div className="bg-dark-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Position:</span>
              <span className="text-white font-medium">{candidate.position}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{candidate.candidateEmail}</span>
            </div>
            {candidate.department && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Department:</span>
                <span className="text-white">{candidate.department.name || candidate.department}</span>
              </div>
            )}
          </div>

          {/* Candidate Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Candidate Name *
            </label>
            <input
              type="text"
              value={formData.candidateName}
              onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
              className={`input-field w-full ${errors.candidateName ? 'border-red-500' : ''}`}
              placeholder="Enter candidate's full name"
            />
            {errors.candidateName && (
              <p className="text-red-400 text-sm mt-1">{errors.candidateName}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Annual CTC (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className={`input-field w-full ${errors.salary ? 'border-red-500' : ''}`}
              placeholder="e.g., 500000"
            />
            {errors.salary && (
              <p className="text-red-400 text-sm mt-1">{errors.salary}</p>
            )}
            {formData.salary && (
              <p className="text-gray-400 text-xs mt-1">
                ₹{parseFloat(formData.salary).toLocaleString('en-IN')} per annum
              </p>
            )}
          </div>

          {/* Info Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              <strong>Note:</strong> A default offer letter template will be used. The offer will be sent to {candidate.candidateEmail}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail size={18} />
                  <span>Send Offer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
