import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Briefcase, MapPin, Star, Clock, ChevronDown, X, Plus, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const ResumeSearch = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    requiredSkills: [],
    preferredSkills: [],
    minimumExperience: 0,
    candidateIds: [],
    maxResults: 10,
    includeAllCandidates: false
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkillInput, setPreferredSkillInput] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Common skills for auto-complete
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'REST APIs', 'GraphQL', 'Microservices', 'Git',
    'Agile', 'Scrum', 'Machine Learning', 'Deep Learning', 'TensorFlow',
    'TypeScript', 'HTML', 'CSS', 'DevOps', 'CI/CD', 'Terraform', 'Ansible'
  ];

  const addSkill = (skill, type) => {
    if (!skill.trim()) return;
    
    const skillArray = type === 'required' ? 'requiredSkills' : 'preferredSkills';
    const currentSkills = searchCriteria[skillArray];
    
    if (!currentSkills.includes(skill.trim())) {
      setSearchCriteria(prev => ({
        ...prev,
        [skillArray]: [...currentSkills, skill.trim()]
      }));
    }
    
    if (type === 'required') {
      setSkillInput('');
    } else {
      setPreferredSkillInput('');
    }
  };

  const removeSkill = (skill, type) => {
    const skillArray = type === 'required' ? 'requiredSkills' : 'preferredSkills';
    setSearchCriteria(prev => ({
      ...prev,
      [skillArray]: prev[skillArray].filter(s => s !== skill)
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    
    try {
      const response = await api.post('/ai-analysis/resume-search', searchCriteria);
      
      if (response.data.success) {
        setResults(response.data.data);
      } else {
        setError(response.data.message || 'Search failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search resumes');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500';
    return 'bg-red-500/20 border-red-500';
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Resume Search & Shortlisting</h1>
        <p className="text-gray-400">AI-powered candidate screening and matching</p>
      </div>

      {/* Search Form */}
      <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Search Criteria</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[#A88BFF] hover:text-[#B89CFF] transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Required Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Required Skills <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill(skillInput, 'required')}
              placeholder="Add required skill (e.g., React, Node.js)"
              className="flex-1 px-4 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
            />
            <button
              onClick={() => addSkill(skillInput, 'required')}
              className="px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Skill Pills */}
          <div className="flex flex-wrap gap-2">
            {searchCriteria.requiredSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#A88BFF]/20 text-[#A88BFF] rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill, 'required')}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          
          {/* Common Skills Suggestions */}
          {searchCriteria.requiredSkills.length === 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Common skills:</p>
              <div className="flex flex-wrap gap-2">
                {commonSkills.slice(0, 8).map(skill => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill, 'required')}
                    className="px-2 py-1 text-xs bg-[#1E1E2A] border border-gray-700 rounded text-gray-400 hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preferred Skills */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preferred Skills (Optional)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={preferredSkillInput}
              onChange={(e) => setPreferredSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill(preferredSkillInput, 'preferred')}
              placeholder="Add preferred skill"
              className="flex-1 px-4 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
            />
            <button
              onClick={() => addSkill(preferredSkillInput, 'preferred')}
              className="px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {searchCriteria.preferredSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill, 'preferred')}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Experience (years)
              </label>
              <input
                type="number"
                min="0"
                value={searchCriteria.minimumExperience}
                onChange={(e) => setSearchCriteria(prev => ({
                  ...prev,
                  minimumExperience: parseInt(e.target.value) || 0
                }))}
                className="w-full px-4 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Results
              </label>
              <select
                value={searchCriteria.maxResults}
                onChange={(e) => setSearchCriteria(prev => ({
                  ...prev,
                  maxResults: parseInt(e.target.value)
                }))}
                className="w-full px-4 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#A88BFF]"
              >
                <option value={5}>5 Results</option>
                <option value={10}>10 Results</option>
                <option value={20}>20 Results</option>
                <option value={50}>50 Results</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchCriteria.includeAllCandidates}
                  onChange={(e) => setSearchCriteria(prev => ({
                    ...prev,
                    includeAllCandidates: e.target.checked
                  }))}
                  className="w-4 h-4 text-[#A88BFF] bg-[#1E1E2A] border-gray-700 rounded focus:ring-[#A88BFF]"
                />
                Search all candidates
              </label>
            </div>
          </div>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading || searchCriteria.requiredSkills.length === 0}
          className="w-full py-3 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching Candidates...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search & Shortlist Candidates
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Shortlisted Candidates</h2>
            <span className="text-sm text-gray-400">{results.length} candidates found</span>
          </div>

          <div className="space-y-4">
            {results.map((candidate, index) => (
              <div
                key={candidate.candidateId || index}
                className="bg-[#1E1E2A] rounded-xl border border-gray-700 p-6 hover:border-[#A88BFF]/50 transition-colors"
              >
                {/* Candidate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{candidate.name}</h3>
                      <div className={`px-3 py-1 rounded-full border ${getScoreBgColor(candidate.score)}`}>
                        <span className={`text-sm font-medium ${getScoreColor(candidate.score)}`}>
                          {candidate.score}% Match
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {candidate.email && (
                        <span>{candidate.email}</span>
                      )}
                      {candidate.currentCompany && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {candidate.currentCompany}
                        </span>
                      )}
                      {candidate.currentDesignation && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {candidate.currentDesignation}
                        </span>
                      )}
                      {candidate.experience && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {candidate.experience}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Matched Skills */}
                {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Matched Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchedSkills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-[#A88BFF]/20 text-[#A88BFF] rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {candidate.summary && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Why this candidate is relevant:</p>
                    <p className="text-sm text-gray-400 leading-relaxed">{candidate.summary}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors text-sm"
                  >
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-[#1E1E2A] border border-gray-700 text-gray-300 rounded-lg hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors text-sm">
                    Contact Candidate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Candidate Details</h3>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">{selectedCandidate.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white">{selectedCandidate.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span>
                      <p className="text-white">{selectedCandidate.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Experience:</span>
                      <p className="text-white">{selectedCandidate.experience || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <p className="text-white">{selectedCandidate.location || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Current Company:</span>
                      <p className="text-white">{selectedCandidate.currentCompany || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Current Role:</span>
                      <p className="text-white">{selectedCandidate.currentDesignation || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h5 className="text-white font-medium mb-3">All Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCandidate.allSkills || []).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#1E1E2A] border border-gray-700 rounded text-sm text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Matched Skills */}
                <div>
                  <h5 className="text-white font-medium mb-3">Matched Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.matchedSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#A88BFF]/20 text-[#A88BFF] rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h5 className="text-white font-medium mb-3">AI Summary</h5>
                  <p className="text-gray-300 leading-relaxed">{selectedCandidate.summary}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <button className="px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors">
                    Schedule Interview
                  </button>
                  <button className="px-4 py-2 bg-[#1E1E2A] border border-gray-700 text-gray-300 rounded-lg hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors">
                    Send Message
                  </button>
                  <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                    Shortlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSearch;
