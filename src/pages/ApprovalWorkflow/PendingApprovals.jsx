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
      
      // This would need to be implemented in the backend
      const response = await api.get('/approval-workflow/pending', { params });
      setApprovals(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (entityType, entityId, action, comments = '') => {
    try {
      await api.post(`/approval-workflow/${entityType}/${entityId}/approve`, {
        action,
        comments
      });
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchApprovals();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
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
                  {new Date(approval.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {approval.slaDeadline ? new Date(approval.slaDeadline).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproval(approval.entityType, approval.entityId, 'approve')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(approval.entityType, approval.entityId, 'reject')}
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

