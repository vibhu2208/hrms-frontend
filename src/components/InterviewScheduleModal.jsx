import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Users, Loader, Plus, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const InterviewScheduleModal = ({ candidateId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    interviewType: 'Technical',
    round: '',
    scheduledDate: '',
    scheduledTime: '',
    meetingPlatform: 'Google Meet',
    meetingLink: '',
    interviewer: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingMeet, setCreatingMeet] = useState(false);
  const [googleAuthenticated, setGoogleAuthenticated] = useState(false);

  useEffect(() => {
    fetchEmployees();
    checkGoogleAuth();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleCreateGoogleMeet = async () => {
    setCreatingMeet(true);
    try {
      // Create a temporary interview to trigger Google Meet creation
      const tempData = {
        ...formData,
        createGoogleMeet: true
      };

      const response = await api.post(`/candidates/${candidateId}/interview`, tempData);
      
      if (response.data.success && response.data.googleMeetData) {
        setFormData(prev => ({
          ...prev,
          meetingLink: response.data.googleMeetData.joinUrl
        }));
        toast.success('Google Meet created successfully!');
        
        // Show additional info if calendar event was created
        if (response.data.calendarEventData) {
          toast.success('Calendar invitation also sent to interviewers');
        }
      } else {
        toast.error('Failed to create Google Meet');
      }
    } catch (error) {
      console.error('Failed to create Google Meet:', error);
      toast.error(error.response?.data?.message || 'Failed to create Google Meet');
    } finally {
      setCreatingMeet(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      // Redirect to Google OAuth2 flow using backend callback
      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('http://localhost:5001/api/auth/google/callback')}&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/meetings.space.created https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      // Store current URL for redirect back
      sessionStorage.setItem('returnTo', window.location.pathname);
      
      // Redirect to Google
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error('Failed to authenticate with Google');
    }
  };

  const checkGoogleAuth = async () => {
    try {
      const response = await api.get('/auth/google-status');
      if (response.data.hasGoogleAccess) {
        setGoogleAuthenticated(true);
        toast.success('Google Meet access granted!');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if Google Meet is selected but no link is provided
    if (formData.meetingPlatform === 'Google Meet' && !formData.meetingLink) {
      toast.error('Please create a Google Meet link or provide a manual meeting link');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/candidates/${candidateId}/interview`, formData);
      toast.success('Interview scheduled successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear meeting link when platform changes
    if (name === 'meetingPlatform') {
      setFormData(prev => ({ ...prev, meetingLink: '' }));
    }
  };

  const handleInterviewerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, interviewer: selectedOptions }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-lg border border-dark-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interview Type *
            </label>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Managerial">Managerial</option>
              <option value="Cultural Fit">Cultural Fit</option>
              <option value="Final Round">Final Round</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Round */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Round Name
            </label>
            <input
              type="text"
              name="round"
              value={formData.round}
              onChange={handleChange}
              placeholder="e.g., Round 1, First Technical Interview"
              className="input-field"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock size={16} className="inline mr-2" />
                Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Meeting Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Video size={16} className="inline mr-2" />
              Meeting Platform
            </label>
            <select
              name="meetingPlatform"
              value={formData.meetingPlatform}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Google Meet">Google Meet</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Zoom">Zoom</option>
              <option value="Phone">Phone</option>
              <option value="In-Person">In-Person</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Meeting Link with Google Meet Creation */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meeting Link
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/..."
                className="input-field flex-1"
                disabled={formData.meetingPlatform !== 'Google Meet' && formData.meetingPlatform !== 'Microsoft Teams' && formData.meetingPlatform !== 'Zoom'}
              />
              {formData.meetingPlatform === 'Google Meet' && (
                <button
                  type="button"
                  onClick={handleCreateGoogleMeet}
                  disabled={creatingMeet || !formData.scheduledDate || !formData.scheduledTime}
                  className="btn-primary flex items-center space-x-2 px-4 py-2 whitespace-nowrap"
                >
                  {creatingMeet ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Meet</span>
                    </>
                  )}
                </button>
              )}
            </div>
            {formData.meetingPlatform === 'Google Meet' && (
              <p className="text-xs text-gray-500 mt-1">
                Click "Create Meet" to generate a real Google Meet link. Make sure you logged in with Google and granted Meet permissions.
              </p>
            )}
            {formData.meetingLink && (
              <div className="mt-2 p-2 bg-dark-800 rounded border border-dark-700">
                <p className="text-xs text-gray-400">Meeting link ready:</p>
                <a 
                  href={formData.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 break-all"
                >
                  {formData.meetingLink}
                </a>
              </div>
            )}
          </div>

          {/* Interviewers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users size={16} className="inline mr-2" />
              Assign Interviewer(s)
            </label>
            <select
              multiple
              value={formData.interviewer}
              onChange={handleInterviewerChange}
              className="input-field h-32"
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.designation || 'N/A'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  <span>Schedule Interview</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
