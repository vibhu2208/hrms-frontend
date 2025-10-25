import React, { useEffect, useState } from 'react';
import { Plus, Clock, Check, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TimesheetList = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const response = await api.get('/timesheets');
      setTimesheets(response.data.data);
    } catch (error) {
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/timesheets/${id}/approve`);
      toast.success('Timesheet approved successfully');
      fetchTimesheets();
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.put(`/timesheets/${id}/reject`, { rejectionReason: reason });
      toast.success('Timesheet rejected');
      fetchTimesheets();
    } catch (error) {
      toast.error('Failed to reject timesheet');
    }
  };

  const filteredTimesheets = timesheets.filter(ts => 
    filterStatus === 'all' || ts.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-default',
      submitted: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      invoiced: 'badge-info'
    };
    return badges[status] || 'badge-default';
  };

  const canApprove = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'client';

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
          <h1 className="text-2xl font-bold text-white">Timesheets</h1>
          <p className="text-gray-400 mt-1">Track project hours and billing</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>New Timesheet</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="invoiced">Invoiced</option>
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Client</th>
                <th>Week</th>
                <th>Total Hours</th>
                <th>Billable Hours</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((timesheet) => (
                <tr key={timesheet._id}>
                  <td>
                    {timesheet.employee?.firstName} {timesheet.employee?.lastName}
                  </td>
                  <td>{timesheet.project?.name}</td>
                  <td>{timesheet.client?.name}</td>
                  <td>
                    {new Date(timesheet.weekStartDate).toLocaleDateString()} - 
                    {new Date(timesheet.weekEndDate).toLocaleDateString()}
                  </td>
                  <td>{timesheet.totalHours} hrs</td>
                  <td>{timesheet.totalBillableHours} hrs</td>
                  <td>
                    <span className={`badge ${getStatusBadge(timesheet.status)}`}>
                      {timesheet.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {timesheet.status === 'submitted' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(timesheet._id)}
                            className="p-2 text-green-400 hover:bg-dark-800 rounded"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(timesheet._id)}
                            className="p-2 text-red-400 hover:bg-dark-800 rounded"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTimesheets.length === 0 && (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No timesheets found</p>
        </div>
      )}
    </div>
  );
};

export default TimesheetList;
