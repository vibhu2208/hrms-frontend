import React, { useEffect, useState } from 'react';
import { Plus, UserPlus, Search } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState('all');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/api/candidates');
      setCandidates(response.data.data);
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
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
        <button className="btn-primary flex items-center space-x-2">
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
                    <button className="p-2 text-blue-400 hover:bg-dark-800 rounded">
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
    </div>
  );
};

export default CandidateList;
