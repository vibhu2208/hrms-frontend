import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, Info } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const EncashmentRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-encashment/requests');
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch encashment requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: XCircle },
      processed: { color: 'blue', icon: DollarSign }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 text-${config.color}-400`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
        <h1 className="text-2xl font-bold text-white">Leave Encashment History</h1>
      </div>

      {/* Automatic Encashment Notice */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-white font-medium mb-1">Automatic Leave Encashment</h3>
            <p className="text-gray-300 text-sm">
              Leave encashment is processed automatically as per company policy. 
              You will be notified when encashment is processed based on your leave balance and eligibility.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Days</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Request Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{request.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{request.numberOfDays}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  ₹{request.totalAmount?.toLocaleString() || '0'}
                </td>
                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                <td className="px-4 py-3">
                  {request.isAutomatic ? (
                    <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full">
                      Automatic
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded-full">
                      Manual
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No encashment requests found
          </div>
        )}
      </div>
    </div>
  );
};

export default EncashmentRequests;

