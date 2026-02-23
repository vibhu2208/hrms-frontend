import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare, X, FileText, Calendar, User, Building2, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ComplianceList = () => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    client: '',
    complianceType: '',
    title: '',
    description: '',
    status: 'pending',
    dueDate: '',
    expiryDate: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCompliances();
    fetchEmployees();
    fetchClients();
  }, []);

  const fetchCompliances = async () => {
    try {
      const response = await api.get('/compliance');
      setCompliances(response.data.data);
    } catch (error) {
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees', {
        params: {
          status: 'active',
          fields: 'firstName,lastName,employeeCode'
        }
      });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.warn('Failed to load employees');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients', {
        params: {
          status: 'active',
          fields: 'name,clientCode'
        }
      });
      setClients(response.data.data || []);
    } catch (error) {
      console.warn('Failed to load clients');
    }
  };

  const handleAdd = () => {
    setFormData({
      employee: '',
      client: '',
      complianceType: '',
      title: '',
      description: '',
      status: 'pending',
      dueDate: '',
      expiryDate: '',
      notes: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employee) {
      newErrors.employee = 'Employee is required';
    }
    if (!formData.complianceType) {
      newErrors.complianceType = 'Compliance type is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      
      // Remove empty optional fields
      if (!payload.client) delete payload.client;
      if (!payload.description) delete payload.description;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.expiryDate) delete payload.expiryDate;
      if (!payload.notes) delete payload.notes;

      await api.post('/compliance', payload);
      toast.success('Compliance record created successfully');
      setShowAddModal(false);
      fetchCompliances();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create compliance record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (compliance) => {
    setSelectedCompliance(null);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const response = await api.get(`/compliance/${compliance._id}`);
      setSelectedCompliance(response.data.data);
    } catch (error) {
      toast.error('Failed to load compliance details');
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatComplianceType = (type) => {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredCompliances = compliances.filter(comp => 
    filterStatus === 'all' || comp.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      'in-progress': 'badge-info',
      completed: 'badge-success',
      failed: 'badge-danger',
      expired: 'badge-default'
    };
    return badges[status] || 'badge-default';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance Tracker</h1>
          <p className="text-gray-400 mt-1">Track compliance requirements and deadlines</p>
        </div>
        <button 
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Compliance</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Title</th>
                <th>Type</th>
                <th>Client</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompliances.map((compliance) => {
                const daysUntilDue = compliance.dueDate ? 
                  Math.ceil((new Date(compliance.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <tr key={compliance._id}>
                    <td>
                      {compliance.employee?.firstName} {compliance.employee?.lastName}
                    </td>
                    <td>{compliance.title}</td>
                    <td className="capitalize">{compliance.complianceType}</td>
                    <td>{compliance.client?.name || '-'}</td>
                    <td>
                      <div>
                        {compliance.dueDate ? new Date(compliance.dueDate).toLocaleDateString() : '-'}
                        {daysUntilDue !== null && daysUntilDue <= 15 && daysUntilDue > 0 && (
                          <span className="block text-xs text-yellow-500">
                            Due in {daysUntilDue} days
                          </span>
                        )}
                        {daysUntilDue !== null && daysUntilDue <= 0 && (
                          <span className="block text-xs text-red-500">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(compliance.status)}`}>
                        {compliance.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDetails(compliance)}
                        className="p-2 text-blue-400 hover:bg-dark-800 rounded"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCompliances.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No compliance records found</p>
        </div>
      )}

      {/* Add Compliance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-3xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Add Compliance</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Employee <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.employee ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} {emp.employeeCode ? `(${emp.employeeCode})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.employee && <p className="text-red-400 text-xs mt-1">{errors.employee}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client
                  </label>
                  <select
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="">Select Client (Optional)</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.clientCode ? `(${client.clientCode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Compliance Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="complianceType"
                    value={formData.complianceType}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.complianceType ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="background-verification">Background Verification</option>
                    <option value="drug-test">Drug Test</option>
                    <option value="medical-checkup">Medical Checkup</option>
                    <option value="safety-training">Safety Training</option>
                    <option value="security-clearance">Security Clearance</option>
                    <option value="client-onboarding">Client Onboarding</option>
                    <option value="nda-signed">NDA Signed</option>
                    <option value="policy-acknowledgment">Policy Acknowledgment</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.complianceType && <p className="text-red-400 text-xs mt-1">{errors.complianceType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field w-full"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Enter compliance title"
                    required
                  />
                  {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="input-field w-full"
                    placeholder="Enter compliance description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="input-field w-full"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="input-field w-full"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Compliance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Compliance Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCompliance(null);
                }}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : selectedCompliance ? (
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      Basic Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                      <p className="text-white">{selectedCompliance.title}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                      <p className="text-white capitalize">{formatComplianceType(selectedCompliance.complianceType)}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <span className={`badge ${getStatusBadge(selectedCompliance.status)}`}>
                        {selectedCompliance.status}
                      </span>
                    </div>

                    {selectedCompliance.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedCompliance.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Employee & Client Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Employee & Client
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Employee</label>
                      <p className="text-white">
                        {selectedCompliance.employee?.firstName} {selectedCompliance.employee?.lastName}
                        {selectedCompliance.employee?.employeeCode && (
                          <span className="text-gray-400 ml-2">({selectedCompliance.employee.employeeCode})</span>
                        )}
                      </p>
                    </div>

                    {selectedCompliance.client && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
                        <p className="text-white">
                          {selectedCompliance.client?.name}
                          {selectedCompliance.client?.clientCode && (
                            <span className="text-gray-400 ml-2">({selectedCompliance.client.clientCode})</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      Important Dates
                    </h3>
                    
                    {selectedCompliance.dueDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                        <p className="text-white">
                          {new Date(selectedCompliance.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {selectedCompliance.expiryDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                        <p className="text-white">
                          {new Date(selectedCompliance.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {selectedCompliance.completedDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Completed Date</label>
                        <p className="text-white">
                          {new Date(selectedCompliance.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Created At</label>
                      <p className="text-white">
                        {new Date(selectedCompliance.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Verification & Additional Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                      Verification & Notes
                    </h3>
                    
                    {selectedCompliance.verifiedBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Verified By</label>
                        <p className="text-white">
                          {selectedCompliance.verifiedBy?.firstName} {selectedCompliance.verifiedBy?.lastName}
                        </p>
                        {selectedCompliance.verifiedAt && (
                          <p className="text-gray-400 text-xs mt-1">
                            Verified on {new Date(selectedCompliance.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedCompliance.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                        <p className="text-gray-300 whitespace-pre-wrap">{selectedCompliance.notes}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Alert Settings</label>
                      <p className="text-white">
                        {selectedCompliance.alertEnabled ? (
                          <span className="text-green-400">Enabled</span>
                        ) : (
                          <span className="text-gray-400">Disabled</span>
                        )}
                        {selectedCompliance.alertEnabled && selectedCompliance.alertDaysBefore && (
                          <span className="text-gray-400 ml-2">
                            ({selectedCompliance.alertDaysBefore} days before)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Documents */}
                  {selectedCompliance.documents && selectedCompliance.documents.length > 0 && (
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-500" />
                        Documents ({selectedCompliance.documents.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCompliance.documents.map((doc, index) => (
                          <div key={index} className="p-3 bg-gray-700 rounded-lg">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
                            >
                              <FileText size={16} />
                              <span>{doc.name}</span>
                            </a>
                            {doc.uploadedAt && (
                              <p className="text-gray-400 text-xs mt-1">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedCompliance(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-400">Failed to load compliance details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceList;
