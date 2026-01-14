import axios from 'axios';
import config from '../config/api.config';

const API_URL = config.apiBaseUrl;

// ==================== Public APIs (No Auth Required) ====================

/**
 * Validate upload token
 */
export const validateToken = async (token, tenantId) => {
  const response = await axios.get(`${API_URL}/public/document-upload/validate/${token}`, {
    params: { tenantId }
  });
  return response.data;
};

/**
 * Upload document
 */
export const uploadDocument = async (token, tenantId, documentType, file, onProgress) => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('tenantId', tenantId);
  formData.append('documentType', documentType);

  const response = await axios.post(
    `${API_URL}/public/document-upload/upload/${token}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    }
  );
  return response.data;
};

/**
 * Get uploaded documents for a token
 */
export const getUploadedDocuments = async (token, tenantId) => {
  const response = await axios.get(`${API_URL}/public/document-upload/documents/${token}`, {
    params: { tenantId }
  });
  return response.data;
};

// ==================== HR/Admin APIs (Auth Required) ====================

/**
 * Generate upload token for onboarding
 */
export const generateUploadToken = async (onboardingId) => {
  const response = await axios.post(`${API_URL}/document-verification/generate-token/${onboardingId}`);
  return response.data;
};

/**
 * Get all candidates with documents
 */
export const getCandidatesWithDocuments = async (status) => {
  const response = await axios.get(`${API_URL}/document-verification/candidates`, {
    params: { status }
  });
  return response.data;
};

/**
 * Get documents for specific candidate
 */
export const getCandidateDocuments = async (onboardingId) => {
  const response = await axios.get(`${API_URL}/document-verification/candidates/${onboardingId}/documents`);
  return response.data;
};

/**
 * Verify document
 */
export const verifyDocument = async (documentId, remarks) => {
  const response = await axios.put(`${API_URL}/document-verification/documents/${documentId}/verify`, {
    remarks
  });
  return response.data;
};

/**
 * Unverify document (mark as rejected)
 */
export const unverifyDocument = async (documentId, reason) => {
  const response = await axios.put(`${API_URL}/document-verification/documents/${documentId}/unverify`, {
    reason
  });
  return response.data;
};

/**
 * Bulk verify documents
 */
export const bulkVerifyDocuments = async (documentIds, remarks) => {
  const response = await axios.post(`${API_URL}/document-verification/documents/bulk-verify`, {
    documentIds,
    remarks
  });
  return response.data;
};

/**
 * Download document
 */
export const downloadDocument = async (documentId) => {
  const response = await axios.get(`${API_URL}/document-verification/documents/${documentId}/download`, {
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Get verification statistics
 */
export const getVerificationStats = async () => {
  const response = await axios.get(`${API_URL}/document-verification/stats`);
  return response.data;
};

/**
 * Send test onboarding email
 */
export const sendTestOnboardingEmail = async (onboardingId, testEmail) => {
  const response = await axios.post(`${API_URL}/onboarding/${onboardingId}/send-test-email`, {
    testEmail
  });
  return response.data;
};

export default {
  validateToken,
  uploadDocument,
  getUploadedDocuments,
  generateUploadToken,
  getCandidatesWithDocuments,
  getCandidateDocuments,
  verifyDocument,
  unverifyDocument,
  bulkVerifyDocuments,
  downloadDocument,
  getVerificationStats,
  sendTestOnboardingEmail
};
