import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { config } from '../../config/api.config';
import { 
  ArrowLeft, 
  Briefcase, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  MessageSquare,
  User,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectApproval = () => {
  const navigate = useNavigate();
  const [pendingProjects, setPendingProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ isOpen: false, projectId: null, reason: '' });

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/projects/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPendingProjects(data.data || []);
      } else {
        toast.error(data.message || 'Failed to fetch pending projects');
      }
    } catch (error) {
      console.error('Error fetching pending projects:', error);
      toast.error('Failed to load pending projects');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      setProcessingId(projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/projects/${projectId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project approved successfully');
        setPendingProjects(prev => prev.filter(p => p._id !== projectId));
      } else {
        toast.error(data.message || 'Failed to approve project');
      }
    } catch (error) {
      console.error('Error approving project:', error);
      toast.error('Failed to approve project');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionModal.reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setProcessingId(rejectionModal.projectId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/projects/${rejectionModal.projectId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejectionReason: rejectionModal.reason.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project rejected successfully');
        setPendingProjects(prev => prev.filter(p => p._id !== rejectionModal.projectId));
        setRejectionModal({ isOpen: false, projectId: null, reason: '' });
      } else {
        toast.error(data.message || 'Failed to reject project');
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
      toast.error('Failed to reject project');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-white">Loading pending projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate('/administration')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Project Approvals</h1>
            <p className="text-gray-400 text-sm">Review and approve pending project requests</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {pendingProjects.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Pending Projects</h3>
            <p className="text-gray-400">All project requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingProjects.map((project) => (
              <div key={project._id} className="bg-[#2A2A3A] rounded-2xl border border-gray-700 overflow-hidden">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white text-lg font-semibold">{project.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority?.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor('pending')}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          PENDING
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{project.projectCode}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Start: {formatDate(project.startDate)}</span>
                        </div>
                        {project.endDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>End: {formatDate(project.endDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Client</p>
                        <p className="text-white">{project.client?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Project Manager</p>
                        <p className="text-white">
                          {project.projectManager ? 
                            `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-500">Team Size</p>
                        <p className="text-white">{project.teamMembers?.length || 0} members</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                {project.teamMembers && project.teamMembers.length > 0 && (
                  <div className="p-6 border-b border-gray-700">
                    <h4 className="text-white font-medium mb-3">Assigned Team Members</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.teamMembers.map((member, index) => (
                        <div key={index} className="bg-[#1E1E2A] px-3 py-2 rounded-lg border border-gray-600">
                          <p className="text-white text-sm">
                            {member.employee ? 
                              `${member.employee.firstName} ${member.employee.lastName}` : 
                              'Unknown'
                            }
                          </p>
                          <p className="text-gray-400 text-xs">{member.role || 'Team Member'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Info */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      Submitted by{' '}
                      <span className="text-white">
                        {project.submittedBy ? 
                          `${project.submittedBy.firstName} ${project.submittedBy.lastName}` : 
                          'Unknown'
                        }
                      </span>
                      {' '}on {formatDate(project.submittedAt)}
                    </div>
                    <div className="text-gray-400">
                      Location: <span className="text-white">{project.location}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-[#1E1E2A] flex justify-end space-x-3">
                  <button
                    onClick={() => setRejectionModal({ isOpen: true, projectId: project._id, reason: '' })}
                    disabled={processingId === project._id}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{processingId === project._id ? 'Processing...' : 'Reject'}</span>
                  </button>
                  <button
                    onClick={() => handleApprove(project._id)}
                    disabled={processingId === project._id}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{processingId === project._id ? 'Processing...' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-white text-lg font-semibold">Reject Project</h3>
            </div>
            <p className="text-gray-400 mb-4">Please provide a reason for rejecting this project request.</p>
            <textarea
              value={rejectionModal.reason}
              onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter rejection reason..."
              className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-red-500 focus:outline-none min-h-[100px] resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRejectionModal({ isOpen: false, projectId: null, reason: '' })}
                disabled={processingId}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId || !rejectionModal.reason.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId ? 'Rejecting...' : 'Reject Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default ProjectApproval;
