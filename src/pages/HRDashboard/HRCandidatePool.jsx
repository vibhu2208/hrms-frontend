import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Plus, FileText, UploadCloud, Search, Clock, Filter, X, Loader2 } from 'lucide-react';

const HRCandidatePool = () => {
  const [allEntries, setAllEntries] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filters, setFilters] = useState({
    status: 'active',
    processingStatus: '',
    minExperience: '',
    maxExperience: ''
  });

  const [newResume, setNewResume] = useState({
    name: '',
    email: '',
    phone: '',
    rawText: '',
    tags: ''
  });

  const [fileUpload, setFileUpload] = useState({
    file: null,
    name: '',
    email: '',
    phone: '',
    tags: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const pageSize = 20;

  const normalizeResumeEntry = (resume = {}) => ({
    id: resume._id,
    type: 'resume',
    name: resume.name || 'Unnamed Candidate',
    email: resume.email || '',
    phone: resume.phone || '',
    experience: {
      years: resume.parsedData?.experience?.years ?? null,
      months: resume.parsedData?.experience?.months ?? null
    },
    skills: resume.parsedData?.skills || [],
    statusLabel: resume.processingStatus || 'pending',
    statusType: 'processing',
    tags: resume.tags || [],
    source: resume.fileName || 'Resume Upload',
    rawText: resume.rawText || '',
    createdAt: resume.createdAt || resume.updatedAt,
    appliedRole: null,
    stage: null,
    original: resume
  });

  const normalizeCandidateEntry = (candidate = {}) => ({
    id: candidate._id,
    type: 'candidate',
    name: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unnamed Candidate',
    email: candidate.email || '',
    phone: candidate.phone || '',
    experience: {
      years: candidate.experience?.years ?? null,
      months: candidate.experience?.months ?? null
    },
    skills: Array.isArray(candidate.skills) ? candidate.skills : [],
    statusLabel: candidate.stage || candidate.status || 'applied',
    statusType: 'stage',
    tags: [candidate.source, candidate.appliedFor?.title].filter(Boolean),
    source: candidate.appliedFor?.title ? `Applied for ${candidate.appliedFor.title}` : 'Job Applicant',
    rawText: '',
    createdAt: candidate.createdAt,
    appliedRole: candidate.appliedFor?.title || '',
    stage: candidate.stage || '',
    resumeUrl: candidate.resume?.url,
    original: candidate
  });

  const applyPagination = (dataset, targetPage = 1) => {
    const total = dataset.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(targetPage, 1), pages);
    const startIndex = (safePage - 1) * pageSize;
    setEntries(dataset.slice(startIndex, startIndex + pageSize));
    setPage(safePage);
    setTotalPages(pages);
    setTotalCount(total);
  };

  const fetchCandidatePool = async (opts = {}) => {
    setLoading(true);
    setError('');

    const targetPage = opts.page || 1;

    try {
      const resumeParams = {
        page: 1,
        limit: pageSize,
        status: filters.status,
      };

      if (filters.processingStatus) resumeParams.processingStatus = filters.processingStatus;
      if (filters.minExperience) resumeParams.minExperience = filters.minExperience;
      if (filters.maxExperience) resumeParams.maxExperience = filters.maxExperience;

      const resumeRequest = searchQuery.trim()
        ? api.post('/resume-pool/search', {
            query: searchQuery.trim(),
            page: 1,
            limit: pageSize,
            filters: {}
          })
        : api.get('/resume-pool', { params: resumeParams });

      const candidateParams = {};
      if (searchQuery.trim()) {
        candidateParams.search = searchQuery.trim();
      }

      const [resumeResponse, candidateResponse] = await Promise.all([
        resumeRequest,
        api.get('/candidates', { params: candidateParams })
      ]);

      const resumeData = Array.isArray(resumeResponse?.data?.data) ? resumeResponse.data.data : [];
      const candidateData = Array.isArray(candidateResponse?.data?.data) ? candidateResponse.data.data : [];

      const resumeEntries = resumeData.map(normalizeResumeEntry);
      const candidateEntries = candidateData.map(normalizeCandidateEntry);

      const combined = [...candidateEntries, ...resumeEntries].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setAllEntries(combined);
      applyPagination(combined, targetPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidate pool');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatePool({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchCandidatePool({ page: 1 });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setTimeout(() => fetchCandidatePool({ page: 1 }), 0);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    applyPagination(allEntries, newPage);
  };

  const openAddModal = () => {
    setNewResume({ name: '', email: '', phone: '', rawText: '', tags: '' });
    setShowAddModal(true);
  };

  const openFileModal = () => {
    setFileUpload({ file: null, name: '', email: '', phone: '', tags: '' });
    setShowFileModal(true);
  };

  const handleAddResume = async () => {
    if (!newResume.name.trim() || !newResume.rawText.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: newResume.name.trim(),
        email: newResume.email.trim() || undefined,
        phone: newResume.phone.trim() || undefined,
        rawText: newResume.rawText,
        tags: newResume.tags
          ? newResume.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []
      };

      const response = await api.post('/resume-pool/text', payload);

      if (response.data.success) {
        setShowAddModal(false);
        await fetchResumes({ page: 1 });
      } else {
        setError(response.data.message || 'Failed to add resume');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add resume');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!fileUpload.file) return;

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', fileUpload.file);
      if (fileUpload.name) formData.append('name', fileUpload.name);
      if (fileUpload.email) formData.append('email', fileUpload.email);
      if (fileUpload.phone) formData.append('phone', fileUpload.phone);
      if (fileUpload.tags) formData.append('tags', fileUpload.tags);

      const response = await api.post('/resume-pool/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setShowFileModal(false);
        await fetchResumes({ page: 1 });
      } else {
        setError(response.data.message || 'Failed to upload resume file');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume file');
    } finally {
      setSubmitting(false);
    }
  };

  const getExperienceString = (entry) => {
    if (!entry) return 'N/A';
    if (entry.type === 'candidate') {
      const years = entry.experience?.years || 0;
      const months = entry.experience?.months || 0;
      if (!years && !months) return 'N/A';
      if (!months) return `${years} yrs`;
      return `${years} yrs ${months} mo`;
    }

    const years = entry.experience?.years || 0;
    const months = entry.experience?.months || 0;
    if (!years && !months) return 'N/A';
    if (!months) return `${years} yrs`;
    return `${years} yrs ${months} mo`;
  };

  const getStatusBadge = (entry) => {
    if (!entry) return 'text-gray-400 border-gray-700';
    if (entry.type === 'candidate') {
      switch (entry.statusLabel) {
        case 'shortlisted':
        case 'interview-scheduled':
          return 'border-green-500/50 text-green-300 bg-green-500/10';
        case 'offer-extended':
        case 'offer-accepted':
          return 'border-blue-500/50 text-blue-300 bg-blue-500/10';
        case 'rejected':
          return 'border-red-500/50 text-red-300 bg-red-500/10';
        default:
          return 'border-[#A88BFF]/50 text-[#C7B6FF] bg-[#A88BFF]/10';
      }
    }

    switch (entry.statusLabel) {
      case 'completed':
        return 'border-green-500/50 text-green-300 bg-green-500/10';
      case 'failed':
        return 'border-red-500/50 text-red-300 bg-red-500/10';
      case 'processing':
        return 'border-blue-500/50 text-blue-300 bg-blue-500/10';
      default:
        return 'border-[#A88BFF]/50 text-[#C7B6FF] bg-[#A88BFF]/10';
    }
  };

  const getEntryTags = (entry) => {
    if (!entry) return [];
    if (entry.type === 'candidate') {
      const tags = entry.tags || [];
      return tags.length ? tags : ['Job Applicant'];
    }
    return entry.tags || [];
  };

  const openEntryModal = (entry) => {
    setSelectedEntry(entry);
  };

  const closeEntryModal = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-[#A88BFF]" />
            Candidate Pool
          </h1>
          <p className="text-gray-400 mt-1">
            Unified view of all applicants and uploaded resumes across roles and sources.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A88BFF] text-white text-sm font-medium hover:bg-[#B89CFF] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Raw Text
          </button>
          <button
            onClick={openFileModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E1E2A] border border-gray-700 text-gray-200 text-sm font-medium hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Resume File
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, skills, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A88BFF] text-white text-sm font-medium hover:bg-[#B89CFF] transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Filter className="w-3 h-3" />
              Filters
            </div>
            <select
              value={filters.processingStatus}
              onChange={(e) => handleFilterChange('processingStatus', e.target.value)}
              className="px-3 py-1.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-xs text-gray-200 focus:outline-none focus:border-[#A88BFF]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <input
              type="number"
              placeholder="Min Exp"
              value={filters.minExperience}
              onChange={(e) => handleFilterChange('minExperience', e.target.value)}
              className="w-20 px-2 py-1.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
            />
            <input
              type="number"
              placeholder="Max Exp"
              value={filters.maxExperience}
              onChange={(e) => handleFilterChange('maxExperience', e.target.value)}
              className="w-20 px-2 py-1.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4 text-[#A88BFF]" />
            <span>Candidate Pool</span>
            <span className="text-xs text-gray-500">({entries.length} shown of {totalCount})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            Recruiting + AI parsed resumes, combined automatically
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#232334] text-xs uppercase text-gray-400">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Experience</th>
                <th className="px-4 py-3 text-left">Key Skills</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#A88BFF]" />
                      <span>Loading candidate pool...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 text-sm">
                    No candidates found yet. Adjust filters or add resumes manually.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-gray-800 hover:bg-[#1E1E2A]/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-white font-medium flex items-center gap-2">
                          {entry.name}
                          {entry.type === 'candidate' && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              Applicant
                            </span>
                          )}
                          {entry.type === 'resume' && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                              Resume
                            </span>
                          )}
                        </span>
                        {entry.appliedRole && (
                          <span className="text-xs text-gray-500">Applied for: {entry.appliedRole}</span>
                        )}
                        {entry.source && entry.type === 'resume' && (
                          <span className="text-xs text-gray-500">{entry.source}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col text-xs text-gray-300">
                        {entry.email && <span>{entry.email}</span>}
                        {entry.phone && <span className="text-gray-500">{entry.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-300">
                        {getExperienceString(entry)}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(entry.skills || []).slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-[#1E1E2A] border border-gray-700 text-[11px] text-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {(entry.skills || []).length > 5 && (
                          <span className="text-[11px] text-gray-500">
                            +{(entry.skills.length - 5)} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${getStatusBadge(entry)}`}
                      >
                        {entry.statusLabel || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {getEntryTags(entry).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full bg-[#1E1E2A] border border-gray-700 text-[11px] text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEntryModal(entry)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E1E2A] border border-gray-700 text-xs text-gray-200 hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-2 py-1 rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#A88BFF] hover:text-[#A88BFF]"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-1 rounded border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#A88BFF] hover:text-[#A88BFF]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Raw Text Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-[#2A2A3A] border border-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#A88BFF]" />
                  Add Resume (Raw Text)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Paste full resume text. We will auto-parse skills and experience.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Candidate Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newResume.name}
                    onChange={(e) => setNewResume(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                    placeholder="e.g. Sarah Chen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newResume.email}
                    onChange={(e) => setNewResume(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newResume.phone}
                    onChange={(e) => setNewResume(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newResume.tags}
                  onChange={(e) => setNewResume(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                  placeholder="e.g. Java, Backend, 6 years"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Resume Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={10}
                  value={newResume.rawText}
                  onChange={(e) => setNewResume(prev => ({ ...prev, rawText: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF] resize-none"
                  placeholder="Paste full resume content here..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Tip: You can copy-paste from PDF or Word. The system will auto-extract skills & experience.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:border-gray-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResume}
                  disabled={submitting || !newResume.name.trim() || !newResume.rawText.trim()}
                  className="px-4 py-2 rounded-lg bg-[#A88BFF] text-xs text-white font-medium hover:bg-[#B89CFF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Add to Pool
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#2A2A3A] border border-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-сenter gap-2">
                  <UploadCloud className="w-4 h-4 text-[#A88BFF]" />
                  Upload Resume File
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Upload PDF or DOCX files. We will parse them automatically.
                </p>
              </div>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Candidate Name (optional)
                  </label>
                  <input
                    type="text"
                    value={fileUpload.name}
                    onChange={(e) => setFileUpload(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                    placeholder="If empty, system will try to detect"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={fileUpload.tags}
                    onChange={(e) => setFileUpload(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A88BFF]"
                    placeholder="e.g. Backend, Senior, React"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">
                  Resume File <span className="text-red-400">*</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-700 rounded-xl bg-[#1E1E2A] text-gray-400 cursor-pointer hover:border-[#A88BFF] hover:text-[#A88BFF] transition-colors text-center text-xs">
                  <UploadCloud className="w-5 h-5" />
                  {fileUpload.file ? (
                    <>
                      <span className="text-gray-200 text-sm">{fileUpload.file.name}</span>
                      <span>Click to change file</span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-200 text-sm">Click to upload PDF or DOCX</span>
                      <span>Max 10MB per file</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileUpload(prev => ({ ...prev, file }));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Files are stored in the resume pool and auto-parsed for skills & experience.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFileModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:border-gray-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={submitting || !fileUpload.file}
                  className="px-4 py-2 rounded-lg bg-[#A88BFF] text-xs text-white font-medium hover:bg-[#B89CFF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3 h-3" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-[#2A2A3A] border border-gray-800 rounded-2xl shadow-xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#A88BFF]" />
                  {selectedEntry.name}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedEntry.type === 'candidate'
                    ? selectedEntry.appliedRole
                      ? `Job Applicant • Applied for ${selectedEntry.appliedRole}`
                      : 'Job Applicant'
                    : selectedEntry.source || 'Resume Pool'}
                </p>
              </div>
              <button
                onClick={closeEntryModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-5 py-4 overflow-y-auto max-h-[70vh]">
              {/* Left column: basic info */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-[#1E1E2A] border border-gray-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Basic Info</h3>
                  <div className="space-y-2 text-xs text-gray-300">
                    {selectedEntry.email && (
                      <div>
                        <span className="text-gray-500">Email: </span>
                        <span>{selectedEntry.email}</span>
                      </div>
                    )}
                    {selectedEntry.phone && (
                      <div>
                        <span className="text-gray-500">Phone: </span>
                        <span>{selectedEntry.phone}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Experience: </span>
                      <span>{getExperienceString(selectedEntry)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <span className="capitalize">{selectedEntry.statusLabel || 'pending'}</span>
                    </div>
                    {getEntryTags(selectedEntry).length > 0 && (
                      <div>
                        <span className="text-gray-500">Tags: </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {getEntryTags(selectedEntry).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-[#1E1E2A] border border-gray-700 text-[11px] text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#1E1E2A] border border-gray-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-1 text-xs">
                    {(selectedEntry.skills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-[#232334] text-gray-200 border border-gray-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {(!selectedEntry.skills || selectedEntry.skills.length === 0) && (
                      <span className="text-gray-500">No parsed skills available.</span>
                    )}
                  </div>
                </div>

                {selectedEntry.type === 'resume' && selectedEntry.original?.aiAnalysis && (
                  <div className="bg-[#1E1E2A] border border-gray-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">AI Insights</h3>
                    <div className="space-y-2 text-xs text-gray-300">
                      {selectedEntry.original.aiAnalysis.overallFit && (
                        <div>
                          <span className="text-gray-500">Overall Fit: </span>
                          <span className="capitalize">{selectedEntry.original.aiAnalysis.overallFit}</span>
                        </div>
                      )}
                      {selectedEntry.original.aiAnalysis.keyHighlights && selectedEntry.original.aiAnalysis.keyHighlights.length > 0 && (
                        <div>
                          <span className="text-gray-500">Highlights:</span>
                          <ul className="mt-1 list-disc list-inside space-y-1">
                            {selectedEntry.original.aiAnalysis.keyHighlights.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column: raw text */}
              <div className="lg:col-span-2">
                {selectedEntry.type === 'resume' ? (
                  <div className="bg-[#1E1E2A] border border-gray-800 rounded-xl p-4 h-full flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#A88BFF]" />
                      Raw Resume Text
                    </h3>
                    <div className="flex-1 overflow-y-auto rounded-lg bg-[#11111C] border border-gray-900 p-3 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedEntry.rawText || 'No raw text available.'}
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1E1E2A] border border-gray-800 rounded-xl p-4 h-full flex flex-col">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#A88BFF]" />
                      Candidate Overview
                    </h3>
                    <div className="flex-1 overflow-y-auto rounded-lg bg-[#11111C] border border-gray-900 p-3 text-xs text-gray-300 space-y-3">
                      <div>
                        <span className="text-gray-500 block mb-1">Stage</span>
                        <span className="capitalize">{selectedEntry.stage || selectedEntry.statusLabel || 'applied'}</span>
                      </div>
                      {selectedEntry.original?.professionalExperience && selectedEntry.original.professionalExperience.length > 0 && (
                        <div>
                          <span className="text-gray-500 block mb-1">Experience Highlights</span>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedEntry.original.professionalExperience.slice(0, 5).map((expItem, idx) => (
                              <li key={idx}>
                                <span className="text-white">{expItem.designation || 'Role'} @ {expItem.company || 'Company'}</span>
                                {expItem.startDate && (
                                  <span className="text-gray-500 ml-1">
                                    ({new Date(expItem.startDate).toLocaleDateString()} - {expItem.currentlyWorking ? 'Present' : expItem.endDate ? new Date(expItem.endDate).toLocaleDateString() : 'Unknown'})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedEntry.original?.timeline && selectedEntry.original.timeline.length > 0 && (
                        <div>
                          <span className="text-gray-500 block mb-1">Recent Timeline</span>
                          <ul className="space-y-1">
                            {selectedEntry.original.timeline.slice(-4).reverse().map((event, idx) => (
                              <li key={idx} className="text-gray-300">
                                <span className="text-white">{event.action}</span>
                                <span className="ml-2 text-gray-500 text-[11px]">
                                  {new Date(event.timestamp).toLocaleString()}
                                </span>
                                {event.description && <div className="text-gray-400 text-[11px]">{event.description}</div>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRCandidatePool;
