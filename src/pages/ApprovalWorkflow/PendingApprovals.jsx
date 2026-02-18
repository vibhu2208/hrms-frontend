import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filters, setFilters] = useState({
    entityType: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchApprovals();
  }, [filters]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.entityType) params.entityType = filters.entityType;
      if (filters.status) params.status = filters.status;
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/55260818-aa6f-4194-8f1a-a7b791aff845', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: 'baseline', hypothesisId: 'H5', location: 'hrms-frontend/src/pages/ApprovalWorkflow/PendingApprovals.jsx:fetchApprovals:before', message: 'Fetching pending approvals (frontend)', data: { path: '/approval-workflow/pending', params }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      
      const response = await api.get('/approval-workflow/pending', { params });
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/55260818-aa6f-4194-8f1a-a7b791aff845', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: 'baseline', hypothesisId: 'H5', location: 'hrms-frontend/src/pages/ApprovalWorkflow/PendingApprovals.jsx:fetchApprovals:after', message: 'Fetched pending approvals (frontend)', data: { httpOk: Boolean(response?.status && response.status >= 200 && response.status < 300), status: response?.status || null, count: Array.isArray(response?.data?.data) ? response.data.data.length : null, success: response?.data?.success ?? null }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      setApprovals(response.data.data || []);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/55260818-aa6f-4194-8f1a-a7b791aff845', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId: 'baseline', hypothesisId: 'H5', location: 'hrms-frontend/src/pages/ApprovalWorkflow/PendingApprovals.jsx:fetchApprovals:error', message: 'Failed fetching pending approvals (frontend)', data: { status: error?.response?.status || null, message: String(error?.response?.data?.message || error?.message || error) }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (entityType, entityId, action, comments = '', instanceId, currentLevel) => {
    try {
      if (entityType === 'leave_request' || entityType === 'project') {
        // Use approval workflow endpoint with instance ID
        await api.post(`/approval-workflow/${entityType}/${instanceId}/approve`, {
          action,
          comments,
          level: currentLevel
        });
      } else {
        // Use generic approval workflow endpoint
        await api.post(`/approval-workflow/${entityType}/${entityId}/approve`, {
          action,
          comments,
          level: currentLevel
        });
      }
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchApprovals();
    } catch (error) {
      toast.error(`Failed to ${action} request: ${error.response?.data?.message || error.message}`);
    }
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
        <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={24} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Entity Type</label>
            <select
              name="entityType"
              value={filters.entityType}
              onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All</option>
              <option value="leave_request">Leave Request</option>
              <option value="project">Project</option>
              <option value="leave_encashment">Leave Encashment</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Details</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Request Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">SLA Deadline</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {approvals.map((approval) => (
              <tr key={approval._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{approval.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {approval.employeeName || approval.employee?.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {approval.details || approval.description || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {approval.requestDate ? new Date(approval.requestDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {approval.slaDeadline ? new Date(approval.slaDeadline).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(approval.entityType, approval.entityId, 'approve', '', approval.instanceId, approval.currentLevel)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.entityType, approval.entityId, 'reject', '', approval.instanceId, approval.currentLevel)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {approvals.length === 0 && (
          <div className="text-center py-8 text-gray-400">No pending approvals</div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;

