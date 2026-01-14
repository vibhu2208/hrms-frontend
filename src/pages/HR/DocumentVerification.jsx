import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Download, Eye, AlertCircle, Search, Filter } from 'lucide-react';
import { 
  getCandidatesWithDocuments, 
  getCandidateDocuments, 
  verifyDocument, 
  unverifyDocument,
  bulkVerifyDocuments,
  downloadDocument,
  getVerificationStats
} from '../../api/documentUpload';
import toast from 'react-hot-toast';

const DocumentVerification = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, [filterStatus]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await getCandidatesWithDocuments(filterStatus);
      if (response.success) {
        setCandidates(response.data);
      }
    } catch (error) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getVerificationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const fetchCandidateDocuments = async (onboardingId) => {
    try {
      const response = await getCandidateDocuments(onboardingId);
      if (response.success) {
        setSelectedCandidate(response.data.candidate);
        setDocuments(response.data.documents);
      }
    } catch (error) {
      toast.error('Failed to load documents');
    }
  };

  const handleVerify = async (documentId) => {
    try {
      const response = await verifyDocument(documentId, 'Document verified');
      if (response.success) {
        toast.success('Document verified successfully');
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to verify document');
    }
  };

  const handleUnverify = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await unverifyDocument(rejectingDoc._id, rejectionReason);
      if (response.success) {
        toast.success('Document rejected. Re-submission email sent to candidate.');
        setShowRejectModal(false);
        setRejectingDoc(null);
        setRejectionReason('');
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to reject document');
    }
  };

  const handleBulkVerify = async () => {
    if (selectedDocs.length === 0) {
      toast.error('Please select documents to verify');
      return;
    }

    try {
      const response = await bulkVerifyDocuments(selectedDocs, 'Bulk verified');
      if (response.success) {
        toast.success(`${selectedDocs.length} documents verified successfully`);
        setSelectedDocs([]);
        fetchCandidateDocuments(selectedCandidate.onboardingId);
        fetchCandidates();
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to bulk verify documents');
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const blob = await downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Document downloaded');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.candidateId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-800',
      unverified: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      resubmitted: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Document Verification</h1>
          <p className="text-gray-400 mt-1">Review and verify candidate documents</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Documents</p>
                <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Review</p>
                <h3 className="text-2xl font-bold text-yellow-500">{stats.pending}</h3>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <h3 className="text-2xl font-bold text-green-500">{stats.verified}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rejected</p>
                <h3 className="text-2xl font-bold text-red-500">{stats.unverified}</h3>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-4">Candidates</h3>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>

              {/* Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input w-full"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="unverified">Rejected</option>
                <option value="resubmitted">Resubmitted</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.onboardingId}
                  onClick={() => fetchCandidateDocuments(candidate.onboardingId)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedCandidate?.onboardingId === candidate.onboardingId
                      ? 'bg-primary-600'
                      : 'bg-dark-800 hover:bg-dark-700'
                  }`}
                >
                  <h4 className="font-medium text-white">{candidate.candidateName}</h4>
                  <p className="text-sm text-gray-400">{candidate.position}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-gray-400">
                      {candidate.documentStats.total} docs
                    </span>
                    {candidate.documentStats.pending > 0 && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        {candidate.documentStats.pending} pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Panel */}
        <div className="lg:col-span-2">
          <div className="card">
            {selectedCandidate ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedCandidate.candidateName}
                      </h3>
                      <p className="text-sm text-gray-400">{selectedCandidate.candidateEmail}</p>
                      <p className="text-sm text-gray-400">{selectedCandidate.position}</p>
                    </div>
                    {selectedDocs.length > 0 && (
                      <button
                        onClick={handleBulkVerify}
                        className="btn-primary"
                      >
                        Verify Selected ({selectedDocs.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className="bg-dark-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDocs([...selectedDocs, doc._id]);
                              } else {
                                setSelectedDocs(selectedDocs.filter(id => id !== doc._id));
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <h4 className="font-medium text-white">{doc.documentName}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(doc.verificationStatus)}`}>
                                {doc.verificationStatus}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{doc.originalFileName}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                            </p>
                            {doc.unverificationReason && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                <p className="text-sm text-red-400">
                                  <strong>Rejection Reason:</strong> {doc.unverificationReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(doc._id, doc.originalFileName)}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-400" />
                          </button>
                          {doc.verificationStatus !== 'verified' && (
                            <button
                              onClick={() => handleVerify(doc._id)}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Verify"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          {doc.verificationStatus !== 'unverified' && (
                            <button
                              onClick={() => {
                                setRejectingDoc(doc);
                                setShowRejectModal(true);
                              }}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {documents.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No documents uploaded yet
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a candidate to view their documents</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Reject Document</h3>
            <p className="text-gray-400 mb-4">
              Please provide a reason for rejecting <strong>{rejectingDoc?.documentName}</strong>
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="input w-full h-32 mb-4"
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingDoc(null);
                  setRejectionReason('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUnverify}
                className="btn-danger flex-1"
              >
                Reject & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
