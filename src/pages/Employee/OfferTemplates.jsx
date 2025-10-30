import React, { useEffect, useState } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Copy, FileText, 
  Filter, Search, MoreHorizontal, CheckCircle,
  AlertCircle, Settings, Mail, Calendar
} from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const OfferTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [filterStatus, filterCategory, searchTerm]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterCategory) params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/offer-templates?${params.toString()}`);
      setTemplates(response.data.data);
    } catch (error) {
      toast.error('Failed to load offer templates');
      console.error(error);
    } finally {
      setLoading(false);
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

  const previewTemplate = async (template) => {
    try {
      const response = await api.post(`/offer-templates/${template._id}/preview`, {
        sampleData: {
          candidateName: 'John Doe',
          designation: 'Software Engineer',
          ctc: '500000',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString(),
          companyName: 'Your Company'
        }
      });
      setPreviewData(response.data.data);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    } catch (error) {
      toast.error('Failed to preview template');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const duplicateData = {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
        status: 'draft'
      };
      delete duplicateData._id;
      delete duplicateData.templateId;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.createdBy;
      delete duplicateData.updatedBy;

      await api.post('/offer-templates', duplicateData);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      'inactive': { color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle },
      'draft': { color: 'bg-yellow-500/20 text-yellow-400', icon: Edit }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {React.createElement(config.icon, { size: 12, className: 'mr-1' })}
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'full-time': 'bg-blue-500/20 text-blue-400',
      'part-time': 'bg-purple-500/20 text-purple-400',
      'contract': 'bg-orange-500/20 text-orange-400',
      'intern': 'bg-pink-500/20 text-pink-400',
      'executive': 'bg-red-500/20 text-red-400',
      'general': 'bg-gray-500/20 text-gray-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[category] || colors.general}`}>
        {category}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-white">Offer Templates</h1>
          <p className="text-gray-400 mt-1">Manage offer letter templates for different roles and categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Template</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-64"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Categories</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
            <option value="executive">Executive</option>
            <option value="general">General</option>
          </select>
          
          <button
            onClick={() => {
              setFilterStatus('');
              setFilterCategory('');
              setSearchTerm('');
            }}
            className="btn-outline text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onPreview={previewTemplate}
            onEdit={(template) => {
              setSelectedTemplate(template);
              setShowCreateModal(true);
            }}
            onDuplicate={duplicateTemplate}
            onDelete={deleteTemplate}
            onStatusChange={updateTemplateStatus}
            getStatusBadge={getStatusBadge}
            getCategoryBadge={getCategoryBadge}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">No offer templates found</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || filterStatus || filterCategory 
              ? 'Try adjusting your filters' 
              : 'Create your first offer template to get started'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onSave={() => {
            fetchTemplates();
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <PreviewModal
          template={selectedTemplate}
          previewData={previewData}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewData(null);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ 
  template, 
  onPreview, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onStatusChange,
  getStatusBadge,
  getCategoryBadge 
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{template.name}</h3>
            {template.isDefault && (
              <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>
          
          <div className="flex items-center space-x-2 mb-3">
            {getStatusBadge(template.status)}
            {getCategoryBadge(template.category)}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreHorizontal size={16} className="text-gray-400" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onPreview(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
              <button
                onClick={() => {
                  onEdit(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  onDuplicate(template);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Copy size={14} />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => {
                  onStatusChange(template._id, template.status === 'active' ? 'inactive' : 'active');
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center space-x-2"
              >
                <Settings size={14} />
                <span>{template.status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                onClick={() => {
                  onDelete(template._id);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <Mail size={14} />
          <span className="truncate">{template.subject}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar size={14} />
          <span>Version {template.version || '1.0'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText size={14} />
          <span>Used {template.usageCount || 0} times</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Created {new Date(template.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={() => onPreview(template)}
          className="btn-outline text-sm"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

// Template Modal Component (placeholder)
const TemplateModal = ({ template, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {template ? 'Edit Template' : 'Create Template'}
        </h2>
        <p className="text-gray-400 mb-4">Template creation/editing form will be implemented here</p>
        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onSave} className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

// Preview Modal Component
const PreviewModal = ({ template, previewData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Template Preview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
            <div className="p-3 bg-gray-700 rounded-lg text-white">
              {previewData.subject}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
            <div className="p-4 bg-gray-700 rounded-lg text-white whitespace-pre-wrap max-h-96 overflow-y-auto">
              {previewData.content}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
};

export default OfferTemplates;
