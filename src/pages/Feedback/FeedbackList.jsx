import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/api/feedback');
      setFeedbacks(response.data.data);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-default',
      submitted: 'badge-warning',
      acknowledged: 'badge-success',
      disputed: 'badge-danger'
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
          <h1 className="text-2xl font-bold text-white">Performance Feedback</h1>
          <p className="text-gray-400 mt-1">Employee performance reviews and feedback</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Feedback</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {feedback.employee?.firstName} {feedback.employee?.lastName}
                </h3>
                <p className="text-sm text-gray-400 capitalize">{feedback.feedbackType}</p>
              </div>
              <span className={`badge ${getStatusBadge(feedback.status)}`}>
                {feedback.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Project:</span>
                <span className="text-white">{feedback.project?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Overall Rating:</span>
                <span className="text-white font-bold">{feedback.overallRating || 'N/A'}/5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Submitted By:</span>
                <span className="text-white capitalize">{feedback.feedbackBy}</span>
              </div>
            </div>

            <button className="w-full btn-primary text-sm">
              View Details
            </button>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No feedback records found</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
