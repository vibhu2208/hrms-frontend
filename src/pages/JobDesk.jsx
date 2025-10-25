import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Briefcase } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import JobCreateModal from '../components/JobCreateModal';

const JobDesk = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data.data);
    } catch (error) {
      toast.error('Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = (newJob) => {
    setJobs(prev => [newJob, ...prev]);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      draft: 'badge-warning',
      closed: 'badge-danger',
      'on-hold': 'badge-info'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Desk</h1>
          <p className="text-gray-400 mt-1">Manage job postings and positions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job._id} className="card hover:border-primary-600 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <Briefcase size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  <p className="text-sm text-gray-400">{job.department?.name}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(job.status)}`}>
                {job.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Location:</span>
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Type:</span>
                <span className="capitalize">{job.employmentType}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Experience:</span>
                <span>{job.experience?.min}-{job.experience?.max} years</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Openings:</span>
                <span>{job.openings}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Applications:</span>
                <span>{job.applications}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-dark-800">
              <button className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1">
                <Eye size={16} />
                <span>View</span>
              </button>
              <button className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1">
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button className="btn-outline text-sm py-2 px-3 text-red-500 hover:bg-red-500/10">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No job postings found</p>
        </div>
      )}

      {/* Job Creation Modal */}
      <JobCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
};

export default JobDesk;
