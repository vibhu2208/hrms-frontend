import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { config } from '../../config/api.config';
import {
  Search,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  MessageSquare,
  Plus,
  Loader2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const PROGRESS_STATUS_OPTIONS = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'completed', label: 'Completed' }
];

const getProgressColorClasses = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'at-risk':
      return 'bg-red-500';
    case 'in-progress':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

const getProgressBadgeClasses = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-300';
    case 'at-risk':
      return 'bg-red-500/20 text-red-300';
    case 'in-progress':
      return 'bg-blue-500/20 text-blue-300';
    default:
      return 'bg-gray-600/30 text-gray-300';
  }
};

const ManagerHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    present: 0,
    onLeave: 0
  });
  const [projects, setProjects] = useState({
    current: [],
    past: [],
    all: []
  });
  const [projectDetails, setProjectDetails] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  const upcomingMeetings = [];

  const fetchProjects = async (authToken) => {
    try {
      const token = authToken || localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/manager/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        toast.error(data.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleProgressUpdate = async (projectId, payload) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing');
        return false;
      }

      const response = await fetch(`${config.apiBaseUrl}/manager/projects/${projectId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Project progress updated');
        await fetchProjects(token);
        setProjectDetails(prev => {
          if (!prev || prev._id !== projectId) return prev;
          return {
            ...prev,
            ...data.data,
            managerRole: prev.managerRole
          };
        });
        return true;
      }

      toast.error(data.message || 'Failed to update progress');
      return false;
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update project progress');
      return false;
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch team stats
        const statsResponse = await fetch(`${config.apiBaseUrl}/manager/team-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setTeamStats(statsData.data);
        }

        await fetchProjects(token);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewProject = async (project) => {
    const token = localStorage.getItem('token');
    if (!token || !project?._id) {
      toast.error('Missing project information');
      return;
    }

    setShowProjectModal(true);
    setProjectLoading(true);
    setProjectDetails(null);

    try {
      const response = await fetch(`${config.apiBaseUrl}/manager/projects/${project._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProjectDetails(data.data);
      } else {
        handleProjectFetchError(data.message || 'Failed to load project');
        setShowProjectModal(false);
      }
    } catch (error) {
      handleProjectFetchError(error);
      setShowProjectModal(false);
    } finally {
      setProjectLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A3A] text-white pl-12 pr-4 py-3 rounded-2xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Manager Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/employee/manager/leave-approvals')}
            className="bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Leave Approvals</span>
          </button>

          <button
            onClick={() => navigate('/employee/manager/assign-project')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <Briefcase className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Assign Project</span>
          </button>

          <button
            onClick={() => navigate('/employee/manager/schedule-meeting')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <Calendar className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Schedule Meeting</span>
          </button>

          <button
            onClick={() => navigate('/employee/manager/announcements')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <MessageSquare className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Announcements</span>
          </button>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Team Size</p>
              <Users className="w-5 h-5 text-[#A88BFF]" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.totalMembers}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Present Today</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.present}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">On Leave</p>
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.onLeave}</h3>
          </div>

        </div>

        {/* Assigned Projects */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Assigned Projects</h3>
            <button
              onClick={() => navigate('/employee/manager/assign-project')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Project</span>
            </button>
          </div>

          {projects.current && projects.current.length > 0 ? (
            <div className="space-y-3">
              {projects.current.map((project) => (
                <div key={project._id} className="p-4 bg-[#1E1E2A] rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <p className="text-gray-400 text-sm">{project.projectCode}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-400">
                          <span className="text-white font-medium">Client:</span> {project.client?.name || 'N/A'}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-white font-medium">Role:</span> {project.managerRole}
                        </p>
                        <p className="text-gray-400">
                          <span className="text-white font-medium">Status:</span>{' '}
                          <span className={`capitalize ${
                            project.status === 'active' ? 'text-green-400' :
                            project.status === 'completed' ? 'text-blue-400' :
                            project.status === 'on-hold' ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                        </p>
                        <p className="text-gray-400">
                          <span className="text-white font-medium">Team Size:</span> {project.teamSize}
                        </p>
                      </div>
                      {project.description && (
                        <p className="text-gray-400 text-sm mt-2">{project.description}</p>
                      )}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Progress</span>
                          <span>{Math.round(project.progress?.percentage ?? 0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`${getProgressColorClasses(project.progress?.status)} h-2 transition-all duration-300`}
                            style={{ width: `${Math.round(project.progress?.percentage ?? 0)}%` }}
                          />
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getProgressBadgeClasses(project.progress?.status)}`}>
                          {PROGRESS_STATUS_OPTIONS.find(opt => opt.value === project.progress?.status)?.label || 'Not Tracked'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProject(project)}
                      className="ml-4 px-4 py-2 bg-[#1E1E2A] text-white rounded-xl border border-gray-700 hover:border-[#A88BFF] transition-all text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active projects assigned</p>
            </div>
          )}

          {/* Past Projects */}
          {projects.past && projects.past.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3">Past Projects</h4>
              <div className="space-y-2">
                {projects.past.slice(0, 3).map((project) => (
                  <div key={project._id} className="p-3 bg-[#1E1E2A] rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium">{project.name}</p>
                        <p className="text-gray-400 text-xs">{project.projectCode} • {project.managerRole}</p>
                      </div>
                      <span className={`text-xs capitalize ${
                        project.status === 'completed' ? 'text-green-400' :
                        project.status === 'cancelled' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Upcoming Meetings</h3>
            <button
              onClick={() => navigate('/employee/manager/schedule-meeting')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 bg-[#1E1E2A] rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{meeting.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {formatDate(meeting.date)} at {meeting.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{meeting.attendees}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />

      {showProjectModal && (
        <ProjectDetailsModal
          project={projectDetails}
          loading={projectLoading}
          onClose={() => {
            setShowProjectModal(false);
            setProjectDetails(null);
          }}
          onUpdateProgress={handleProgressUpdate}
        />
      )}
    </div>
  );
};

const handleProjectFetchError = (error) => {
  console.error('Error fetching project details:', error);
  toast.error('Unable to load project details right now');
};

const ProjectDetailsModal = ({ project, loading, onClose, onUpdateProgress }) => {
  const [progressValue, setProgressValue] = useState(project?.progress?.percentage ?? 0);
  const [progressStatus, setProgressStatus] = useState(project?.progress?.status ?? 'not-started');
  const [progressUpdating, setProgressUpdating] = useState(false);

  useEffect(() => {
    setProgressValue(project?.progress?.percentage ?? 0);
    setProgressStatus(project?.progress?.status ?? 'not-started');
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project?._id || !onUpdateProgress) return;

    setProgressUpdating(true);
    const success = await onUpdateProgress(project._id, {
      percentage: progressValue,
      status: progressStatus
    });
    setProgressUpdating(false);

    if (success) {
      toast.success('Progress updated');
    }
  };

  const progressPercentage = Math.round(progressValue ?? 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A3A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-[#2A2A3A] border-b border-gray-700 p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Project Details</h2>
            {project && (
              <p className="text-sm text-gray-400 mt-1">{project.projectCode}</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              Loading project details...
            </div>
          ) : project ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Project Name" value={project.name} />
                <DetailItem label="Status" value={project.status} capitalize />
                <DetailItem label="Client" value={project.client?.name || 'N/A'} />
                <DetailItem label="Location" value={project.location || 'N/A'} />
                <DetailItem
                  label="Start Date"
                  value={project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                />
                <DetailItem
                  label="End Date"
                  value={project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                />
                <DetailItem
                  label="Project Manager"
                  value={project.projectManager ? `${project.projectManager.firstName} ${project.projectManager.lastName}` : 'Not assigned'}
                />
                <DetailItem label="Team Size" value={project.teamMembers?.filter(tm => tm.isActive).length || 0} />
              </div>

              {project.description && (
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{project.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span>Completion</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(Number(e.target.value))}
                      className="w-full"
                      disabled={project.managerRole !== 'Project Manager'}
                    />
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                      <div
                        className={`${getProgressColorClasses(progressStatus)} h-2 transition-all duration-300`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Progress Status</label>
                      <select
                        value={progressStatus}
                        onChange={(e) => setProgressStatus(e.target.value)}
                        disabled={project.managerRole !== 'Project Manager'}
                        className="w-full bg-[#1E1E2A] text-white p-3 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                      >
                        {PROGRESS_STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {project.managerRole === 'Project Manager' && (
                      <button
                        onClick={handleSubmit}
                        disabled={progressUpdating}
                        className="px-4 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {progressUpdating ? 'Updating...' : 'Update Progress'}
                      </button>
                    )}
                  </div>

                  {project.progress?.updatedAt && (
                    <p className="text-xs text-gray-500">
                      Last updated on {new Date(project.progress.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {project.teamMembers && project.teamMembers.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-3">Active Team Members</h3>
                  <div className="space-y-3">
                    {project.teamMembers
                      .filter(member => member.isActive)
                      .map(member => (
                        <div key={member._id || member.employee?._id || member.employee?.email} className="bg-[#1E1E2A] border border-gray-700 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">
                                {member.employee?.firstName} {member.employee?.lastName}
                              </p>
                              <p className="text-sm text-gray-400">{member.role || 'Team Member'}</p>
                            </div>
                            <div className="text-right text-sm text-gray-400">
                              <p>{member.employee?.designation || 'Designation N/A'}</p>
                              {member.startDate && (
                                <p>Since {new Date(member.startDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 py-12">
              Unable to load project details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, capitalize }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
    <p className={`text-sm text-gray-200 ${capitalize ? 'capitalize' : ''}`}>{value || 'N/A'}</p>
  </div>
);

export default ManagerHome;
