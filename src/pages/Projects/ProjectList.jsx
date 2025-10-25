import React, { useEffect, useState } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      planning: 'badge-info',
      active: 'badge-success',
      'on-hold': 'badge-warning',
      completed: 'badge-default',
      cancelled: 'badge-danger'
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
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Manage client projects and assignments</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="card hover:border-primary-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <FolderKanban size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-gray-400">{project.projectCode}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Client:</span>
                <span>{project.client?.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Location:</span>
                <span>{project.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Manager:</span>
                <span>
                  {project.projectManager ? 
                    `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                    'Not assigned'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Team Size:</span>
                <span>{project.teamMembers?.filter(tm => tm.isActive).length || 0}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Duration:</span>
                <span>
                  {new Date(project.startDate).toLocaleDateString()} - 
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            </div>

            <button className="w-full btn-primary text-sm">
              View Details
            </button>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No projects found</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
