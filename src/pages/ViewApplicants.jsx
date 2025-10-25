import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  Calendar,
  User,
  FileText,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  UserPlus,
  Sparkles,
  TrendingUp,
  Brain,
  BarChart3,
  Loader
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import AIInsights from '../components/AIInsights';

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStats, setAnalysisStats] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState({});

  useEffect(() => {
    fetchApplicants();
    fetchAnalysisStats();
  }, [jobId, filterStage, filterStatus]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStage !== 'all') params.append('stage', filterStage);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/jobs/${jobId}/applicants?${params.toString()}`);
      let applicantsData = response.data.data;
      
      // Sort applicants based on selected sort option
      applicantsData = sortApplicants(applicantsData, sortBy);
      
      setApplicants(applicantsData);
      setJobDetails(response.data.job);
    } catch (error) {
      toast.error('Failed to load applicants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysisStats = async () => {
    try {
      const response = await api.get(`/ai-analysis/jobs/${jobId}/stats`);
      setAnalysisStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analysis stats:', error);
    }
  };

  const sortApplicants = (data, sortOption) => {
    const sorted = [...data];
    switch (sortOption) {
      case 'ai-score':
        return sorted.sort((a, b) => {
          const scoreA = a.aiAnalysis?.matchScore || 0;
          const scoreB = b.aiAnalysis?.matchScore || 0;
          return scoreB - scoreA;
        });
      case 'date':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'name':
        return sorted.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
      default:
        return sorted;
    }
  };

  const handleAnalyzeCandidates = async () => {
    if (!window.confirm('Analyze all candidates for this job? This may take a few moments.')) {
      return;
    }

    try {
      setAnalyzing(true);
      const response = await api.post(`/ai-analysis/jobs/${jobId}/analyze`);
      toast.success(response.data.message);
      
      // Refresh applicants and stats
      await fetchApplicants();
      await fetchAnalysisStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze candidates');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAIInsights = (candidateId) => {
    setShowAIInsights(prev => ({
      ...prev,
      [candidateId]: !prev[candidateId]
    }));
  };

  const handleSearch = () => {
    fetchApplicants();
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setApplicants(prev => sortApplicants(prev, newSort));
  };

  const getStageColor = (stage) => {
    const colors = {
      'applied': 'bg-blue-500/20 text-blue-400',
      'screening': 'bg-yellow-500/20 text-yellow-400',
      'shortlisted': 'bg-purple-500/20 text-purple-400',
      'interview-scheduled': 'bg-indigo-500/20 text-indigo-400',
      'interview-completed': 'bg-cyan-500/20 text-cyan-400',
      'offer-extended': 'bg-green-500/20 text-green-400',
      'offer-accepted': 'bg-emerald-500/20 text-emerald-400',
      'offer-rejected': 'bg-red-500/20 text-red-400',
      'joined': 'bg-teal-500/20 text-teal-400',
      'rejected': 'bg-gray-500/20 text-gray-400'
    };
    return colors[stage] || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': 'badge-success',
      'hired': 'badge-info',
      'rejected': 'badge-danger',
      'withdrawn': 'badge-warning'
    };
    return badges[status] || 'badge-default';
  };

  const formatExperience = (experience) => {
    if (!experience) return 'N/A';
    const { years = 0, months = 0 } = experience;
    if (years === 0 && months === 0) return 'Fresher';
    if (years === 0) return `${months} months`;
    if (months === 0) return `${years} years`;
    return `${years}y ${months}m`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewCandidate = (candidateId) => {
    navigate(`/candidates/${candidateId}`);
  };

  const handleMoveToOnboarding = async (applicant, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`Move ${applicant.firstName} ${applicant.lastName} to onboarding?`)) {
      return;
    }

    try {
      await api.post(`/candidates/${applicant._id}/onboarding`);
      toast.success('Candidate moved to onboarding successfully!');
      // Refresh the applicants list
      fetchApplicants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move candidate to onboarding');
    }
  };

  const canMoveToOnboarding = (stage) => {
    return ['shortlisted', 'offer-extended', 'offer-accepted'].includes(stage);
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/job-desk')}
            className="btn-outline p-2"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {jobDetails?.title || 'Job'} - Applicants
            </h1>
            <p className="text-gray-400 mt-1">
              {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'} found
              {analysisStats && analysisStats.analyzed > 0 && (
                <span className="ml-2 text-primary-500">
                  • {analysisStats.analyzed} analyzed
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAnalyzeCandidates}
            disabled={analyzing}
            className="btn-primary flex items-center space-x-2"
          >
            {analyzing ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze Candidates</span>
              </>
            )}
          </button>
          <button
            onClick={() => toast.success('Export feature coming soon!')}
            className="btn-outline flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Stats */}
      {analysisStats && analysisStats.analyzed > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary-600/20 to-primary-800/20 border-primary-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.averageScore}%</p>
              </div>
              <BarChart3 size={32} className="text-primary-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Excellent Fit</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.fitDistribution.excellent}</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Good Fit</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.fitDistribution.good}</p>
              </div>
              <Brain size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-600/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Top Score</p>
                <p className="text-2xl font-bold text-white mt-1">{analysisStats.topScore}%</p>
              </div>
              <Sparkles size={32} className="text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or candidate code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary md:w-auto"
          >
            Search
          </button>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="date">Sort by Date</option>
            <option value="ai-score">Sort by AI Score</option>
            <option value="name">Sort by Name</option>
          </select>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="interview-completed">Interview Completed</option>
            <option value="offer-extended">Offer Extended</option>
            <option value="offer-accepted">Offer Accepted</option>
            <option value="offer-rejected">Offer Rejected</option>
            <option value="joined">Joined</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="card text-center py-12">
          <User size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No applicants found for this job posting</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((applicant) => (
            <div
              key={applicant._id}
              className="card hover:border-primary-600 transition-all cursor-pointer"
              onClick={() => handleViewCandidate(applicant._id)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section - Basic Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <span className={`badge ${getStatusBadge(applicant.status)}`}>
                        {applicant.status}
                      </span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageColor(applicant.stage)}`}>
                        {applicant.stage.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-gray-400">
                        <Mail size={14} className="mr-2 flex-shrink-0" />
                        <span className="truncate">{applicant.email}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Phone size={14} className="mr-2 flex-shrink-0" />
                        <span>{applicant.phone}</span>
                      </div>
                      {applicant.currentLocation && (
                        <div className="flex items-center text-gray-400">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <span className="truncate">{applicant.currentLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-400">
                        <Briefcase size={14} className="mr-2 flex-shrink-0" />
                        <span>{formatExperience(applicant.experience)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Section - Additional Details */}
                <div className="flex flex-wrap gap-4 lg:gap-6 text-sm">
                  {applicant.currentCompany && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Current Company</p>
                      <p className="text-white font-medium">{applicant.currentCompany}</p>
                    </div>
                  )}
                  {applicant.currentDesignation && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Current Role</p>
                      <p className="text-white font-medium">{applicant.currentDesignation}</p>
                    </div>
                  )}
                  {applicant.expectedCTC && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Expected CTC</p>
                      <p className="text-white font-medium flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        {applicant.expectedCTC.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {applicant.noticePeriod !== undefined && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Notice Period</p>
                      <p className="text-white font-medium flex items-center">
                        <Clock size={14} className="mr-1" />
                        {applicant.noticePeriod} days
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-1">Applied On</p>
                    <p className="text-white text-sm font-medium flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(applicant.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {applicant.resume?.url && (
                      <a
                        href={applicant.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-outline text-sm py-2 px-4 flex items-center space-x-2"
                      >
                        <FileText size={16} />
                        <span>Resume</span>
                      </a>
                    )}
                    {canMoveToOnboarding(applicant.stage) && applicant.status === 'active' && (
                      <button
                        onClick={(e) => handleMoveToOnboarding(applicant, e)}
                        className="btn-primary text-sm py-2 px-4 flex items-center space-x-2 whitespace-nowrap"
                      >
                        <UserPlus size={16} />
                        <span>Move to Onboarding</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {applicant.skills && applicant.skills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-800">
                  <p className="text-gray-500 text-xs mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {applicant.skills.slice(0, 8).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-dark-800 text-gray-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {applicant.skills.length > 8 && (
                      <span className="px-2 py-1 bg-dark-800 text-gray-400 rounded text-xs">
                        +{applicant.skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Insights Section */}
              {applicant.aiAnalysis?.isAnalyzed && (
                <div>
                  <AIInsights analysis={applicant.aiAnalysis} compact={true} />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAIInsights(applicant._id);
                    }}
                    className="mt-3 text-sm text-primary-500 hover:text-primary-400 flex items-center space-x-1"
                  >
                    <Brain size={14} />
                    <span>{showAIInsights[applicant._id] ? 'Hide' : 'View'} Detailed AI Insights</span>
                  </button>

                  {showAIInsights[applicant._id] && (
                    <div className="mt-4 pt-4 border-t border-dark-800">
                      <AIInsights analysis={applicant.aiAnalysis} compact={false} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicants;
