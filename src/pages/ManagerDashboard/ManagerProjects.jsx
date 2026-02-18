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
  Plus,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const ManagerProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState({
    current: [],
    pending: [],
    rejected: [],
    past: [],
    all: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/manager/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
        console.log('Manager projects loaded:', data.data);
      } else {
        toast.error(data.message || 'Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'current': return projects.current.length;
      case 'pending': return projects.pending.length;
      case 'rejected': return projects.rejected.length;
      case 'past': return projects.past.length;
      default: return projects.all.length;
    }
  };

  const getProjectsForTab = (tab) => {
    switch (tab) {
      case 'current': return projects.current;
      case 'pending': return projects.pending;
      case 'rejected': return projects.rejected;
      case 'past': return projects.past;
      default: return projects.all;
    }
  };

  const tabs = [
    { id: 'all', label: 'All Projects', icon: Briefcase },
    { id: 'current', label: 'Active', icon: CheckCircle },
    { id: 'pending', label: 'Pending Approval', icon: Clock },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
    { id: 'past', label: 'Completed', icon: Calendar }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-white">Loading projects...</div>
      </div>
    );
  }

  const currentProjects = getProjectsForTab(activeTab);

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employee/manager/home')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">My Projects</h1>
              <p className="text-gray-400 text-sm">Manage and track project assignments</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/employee/manager/assign-project')}
            className="bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-[#2A2A3A] p-1 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = getTabCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#A88BFF] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#3A3A4A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {count > 0 && (
                  <span className="bg-[#1E1E2A] text-white text-xs px-2 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {currentProjects.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Projects Found</h3>
            <p className="text-gray-400">
              {activeTab === 'pending' 
                ? 'No projects pending approval' 
                : activeTab === 'rejected'
                ? 'No rejected projects'
                : 'No projects found. Create your first project!'
              }
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => navigate('/employee/manager/assign-project')}
                className="mt-4 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProjects.map((project) => (
              <div key={project._id} className="bg-[#2A2A3A] rounded-2xl border border-gray-700 overflow-hidden hover:border-[#A88BFF]/50 transition-all">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white text-lg font-semibold line-clamp-2">{project.name}</h3>
                    <div className="flex flex-col space-y-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority?.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.approvalStatus)}`}>
                        {project.approvalStatus?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-3">{project.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{project.projectCode}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Client:</span>
                      <span className="text-white">{project.client?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Team Size:</span>
                      <span className="text-white">{project.teamSize || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Your Role:</span>
                      <span className="text-white">{project.managerRole}</span>
                    </div>
                    {project.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Submitted:</span>
                        <span className="text-white">{formatDate(project.submittedAt)}</span>
                      </div>
                    )}
                    {project.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Approved:</span>
                        <span className="text-white">{formatDate(project.approvedAt)}</span>
                      </div>
                    )}
                    {project.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <span className="text-red-400 text-xs font-medium">Rejection Reason:</span>
                        <p className="text-red-300 text-sm mt-1">{project.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {project.approvalStatus === 'pending' && project.canEdit && (
                    <button
                      onClick={() => navigate('/employee/manager/assign-project')}
                      className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Edit Project
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ManagerProjects;
