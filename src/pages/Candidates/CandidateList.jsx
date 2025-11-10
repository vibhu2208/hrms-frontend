import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Search, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CandidateList = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    candidateCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    appliedFor: '',
    experience: { years: 0, months: 0 },
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    source: 'job-portal',
    resumeUrl: '',
    linkedinUrl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/candidates');
      setCandidates(response.data.data);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data.filter(job => job.status === 'active'));
    } catch (error) {
      console.error('Failed to load jobs');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/candidates', formData);
      setCandidates([response.data.data, ...candidates]);
      toast.success('Candidate added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add candidate');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      appliedFor: '',
      experience: { years: 0, months: 0 },
      currentCTC: '',
      expectedCTC: '',
      noticePeriod: '',
      source: 'job-portal',
      resumeUrl: '',
      linkedinUrl: ''
    });
  };

  const handleViewDetails = (candidateId) => {
    navigate(`/candidates/${candidateId}/timeline`);
  };

  const filteredCandidates = candidates.filter(candidate => 
    filterStage === 'all' || candidate.stage === filterStage
  );

  const getStageBadge = (stage) => {
    const badges = {
      applied: 'badge-info',
      screening: 'badge-warning',
      shortlisted: 'badge-success',
      'interview-scheduled': 'badge-info',
      'interview-completed': 'badge-warning',
      'offer-extended': 'badge-success',
      'offer-accepted': 'badge-success',
      'offer-rejected': 'badge-danger',
      joined: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[stage] || 'badge-default';
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
          <h1 className="text-2xl font-bold text-white">Candidates</h1>
          <p className="text-gray-400 mt-1">Manage recruitment pipeline</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="input-field w-64"
        >
          <option value="all">All Stages</option>
          <option value="applied">Applied</option>
          <option value="screening">Screening</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="interview-scheduled">Interview Scheduled</option>
          <option value="interview-completed">Interview Completed</option>
          <option value="offer-extended">Offer Extended</option>
          <option value="offer-accepted">Offer Accepted</option>
          <option value="joined">Joined</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied For</th>
                <th>Experience</th>
                <th>Current CTC</th>
                <th>Expected CTC</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate._id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {candidate.firstName} {candidate.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{candidate.email}</p>
                      <p className="text-sm text-gray-400">{candidate.phone}</p>
                    </div>
                  </td>
                  <td>{candidate.appliedFor?.title || 'N/A'}</td>
                  <td>
                    {candidate.experience?.years || 0}y {candidate.experience?.months || 0}m
                  </td>
                  <td>${candidate.currentCTC?.toLocaleString() || 0}</td>
                  <td>${candidate.expectedCTC?.toLocaleString() || 0}</td>
                  <td className="capitalize">{candidate.source}</td>
                  <td>
                    <span className={`badge ${getStageBadge(candidate.stage)}`}>
                      {candidate.stage}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleViewDetails(candidate._id)}
                      className="p-2 text-blue-400 hover:bg-dark-800 rounded"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <UserPlus size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No candidates found</p>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Add New Candidate</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCandidate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.candidateCode}
                    onChange={(e) => setFormData({ ...formData, candidateCode: e.target.value })}
                    className="input-field"
                    placeholder="e.g., EMP001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Applied For *
                </label>
                <select
                  required
                  value={formData.appliedFor}
                  onChange={(e) => setFormData({ ...formData, appliedFor: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Job</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience.years}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      experience: { ...formData.experience, years: parseInt(e.target.value) || 0 }
                    })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={formData.experience.months}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      experience: { ...formData.experience, months: parseInt(e.target.value) || 0 }
                    })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current CTC
                  </label>
                  <input
                    type="number"
                    value={formData.currentCTC}
                    onChange={(e) => setFormData({ ...formData, currentCTC: e.target.value })}
                    className="input-field"
                    placeholder="In USD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expected CTC
                  </label>
                  <input
                    type="number"
                    value={formData.expectedCTC}
                    onChange={(e) => setFormData({ ...formData, expectedCTC: e.target.value })}
                    className="input-field"
                    placeholder="In USD"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.noticePeriod}
                    onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Source
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input-field"
                  >
                    <option value="job-portal">Job Portal</option>
                    <option value="referral">Referral</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="direct">Direct Application</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resume URL
                </label>
                <input
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateList;
