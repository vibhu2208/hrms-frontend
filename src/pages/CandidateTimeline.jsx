import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Calendar, Clock, User, CheckCircle, XCircle,
  AlertCircle, Video, Users, Star, MessageSquare, FileText, Send, Loader
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import InterviewScheduleModal from '../components/InterviewScheduleModal';
import InterviewFeedbackModal from '../components/InterviewFeedbackModal';
import HRCallModal from '../components/HRCallModal';

const CandidateTimeline = () => {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHRCallModal, setShowHRCallModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    fetchCandidateData();
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const [candidateRes, timelineRes] = await Promise.all([
        api.get(`/candidates/${candidateId}`),
        api.get(`/candidates/${candidateId}/timeline`)
      ]);
      
      setCandidate(candidateRes.data.data);
      setTimeline(timelineRes.data.data);
    } catch (error) {
      toast.error('Failed to load candidate data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (type, notes = '') => {
    try {
      setSendingNotification(true);
      await api.post(`/candidates/${candidateId}/notification`, { type, notes });
      toast.success('Notification sent successfully');
      fetchCandidateData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      'applied': User,
      'screening': FileText,
      'shortlisted': CheckCircle,
      'interview-scheduled': Calendar,
      'interview-completed': Video,
      'offer-extended': Mail,
      'offer-accepted': CheckCircle,
      'rejected': XCircle
    };
    return icons[stage] || AlertCircle;
  };

  const getStageColor = (stage) => {
    const colors = {
      'applied': 'bg-blue-500',
      'screening': 'bg-yellow-500',
      'shortlisted': 'bg-purple-500',
      'interview-scheduled': 'bg-indigo-500',
      'interview-completed': 'bg-cyan-500',
      'offer-extended': 'bg-green-500',
      'offer-accepted': 'bg-emerald-500',
      'rejected': 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-12 h-12 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Candidate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="btn-outline p-2">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-gray-400 mt-1">Hiring Journey Timeline</p>
          </div>
        </div>
      </div>

      {/* Candidate Info Card */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="text-white font-medium">{candidate.email}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="text-white font-medium">{candidate.phone}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Applied For</p>
            <p className="text-white font-medium">{candidate.appliedFor?.title || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Timeline Stepper */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Hiring Process</h2>
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-800"></div>
          
          <div className="space-y-8">
            {/* Step 1: Notification */}
            <TimelineStep
              icon={Mail}
              title="Interview Notification"
              color="bg-blue-500"
              completed={timeline.notifications?.interviewEmail?.sent || timeline.notifications?.interviewCall?.completed}
            >
              <div className="space-y-3">
                {!timeline.notifications?.interviewEmail?.sent && !timeline.notifications?.interviewCall?.completed && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Start by sending an email or marking the call as done to proceed with interview scheduling
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleSendNotification('interviewEmail')}
                    disabled={sendingNotification || timeline.notifications?.interviewEmail?.sent}
                    className={`btn-sm ${timeline.notifications?.interviewEmail?.sent ? 'btn-success' : 'btn-primary'}`}
                  >
                    <Mail size={16} className="mr-2" />
                    {timeline.notifications?.interviewEmail?.sent ? 'Email Sent' : 'Send Email'}
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Add call notes:');
                      if (notes !== null) handleSendNotification('interviewCall', notes);
                    }}
                    disabled={sendingNotification || timeline.notifications?.interviewCall?.completed}
                    className={`btn-sm ${timeline.notifications?.interviewCall?.completed ? 'btn-success' : 'btn-outline'}`}
                  >
                    <Phone size={16} className="mr-2" />
                    {timeline.notifications?.interviewCall?.completed ? 'Call Done' : 'Mark Call Done'}
                  </button>
                </div>
                {timeline.notifications?.interviewEmail?.sent && (
                  <p className="text-sm text-gray-400">
                    Email sent on {new Date(timeline.notifications.interviewEmail.sentAt).toLocaleString()}
                  </p>
                )}
                {timeline.notifications?.interviewCall?.completed && (
                  <p className="text-sm text-gray-400">
                    Call completed on {new Date(timeline.notifications.interviewCall.completedAt).toLocaleString()}
                    {timeline.notifications.interviewCall.notes && ` - ${timeline.notifications.interviewCall.notes}`}
                  </p>
                )}
              </div>
            </TimelineStep>

            {/* Step 2: Interview Scheduling */}
            <TimelineStep
              icon={Calendar}
              title="Interview Scheduling"
              color="bg-indigo-500"
              completed={timeline.interviews?.length > 0}
            >
              <div className="space-y-3">
                {!timeline.notifications?.interviewEmail?.sent && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-400 flex items-center">
                      <AlertCircle size={16} className="mr-2" />
                      Please send interview notification email before scheduling interviews
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowScheduleModal(true)}
                  disabled={!timeline.notifications?.interviewEmail?.sent}
                  className={`btn-sm ${
                    timeline.notifications?.interviewEmail?.sent 
                      ? 'btn-primary' 
                      : 'btn-outline opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule Interview
                </button>
                
                {timeline.interviews?.map((interview, idx) => (
                  <div key={interview._id} className="card bg-dark-800/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-white">{interview.interviewType}</span>
                          <span className={`badge ${
                            interview.status === 'completed' ? 'badge-success' :
                            interview.status === 'scheduled' ? 'badge-info' : 'badge-warning'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <p><Calendar size={14} className="inline mr-2" />
                            {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                          </p>
                          <p><Video size={14} className="inline mr-2" />{interview.meetingPlatform}</p>
                          {interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" 
                               className="text-primary-500 hover:underline">
                              Join Meeting
                            </a>
                          )}
                        </div>
                        {interview.feedback && (
                          <div className="mt-2 p-2 bg-dark-700 rounded">
                            <p className="text-sm text-gray-300">{interview.feedback}</p>
                            {interview.rating && (
                              <div className="flex items-center mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} 
                                    className={i < interview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} 
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {(interview.status === 'scheduled' || (interview.status === 'completed' && !interview.feedback)) && (
                        <button
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowFeedbackModal(true);
                          }}
                          className={`btn-sm ${
                            interview.status === 'completed' && !interview.feedback
                              ? 'btn-primary animate-pulse'
                              : 'btn-outline'
                          }`}
                        >
                          {interview.status === 'completed' && !interview.feedback ? (
                            <>
                              <AlertCircle size={14} className="mr-1" />
                              Add Feedback (Required)
                            </>
                          ) : (
                            'Add Feedback'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TimelineStep>

            {/* Step 3: HR Call */}
            <TimelineStep
              icon={Phone}
              title="HR Call / Final Discussion"
              color="bg-purple-500"
              completed={timeline.hrCall?.status === 'completed'}
            >
              <div className="space-y-3">
                {(() => {
                  const hasCompletedInterview = timeline.interviews?.some(
                    interview => interview.status === 'completed' && interview.feedback && interview.rating
                  );
                  return !hasCompletedInterview && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-400 flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        Please complete at least one interview and submit feedback before conducting HR call
                      </p>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setShowHRCallModal(true)}
                  disabled={!timeline.interviews?.some(
                    interview => interview.status === 'completed' && interview.feedback && interview.rating
                  )}
                  className={`btn-sm ${
                    timeline.interviews?.some(
                      interview => interview.status === 'completed' && interview.feedback && interview.rating
                    )
                      ? 'btn-primary' 
                      : 'btn-outline opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Phone size={16} className="mr-2" />
                  {timeline.hrCall?.status === 'completed' ? 'Update HR Call' : 'Conduct HR Call'}
                </button>
                
                {timeline.hrCall && timeline.hrCall.status !== 'pending' && (
                  <div className="card bg-dark-800/50 p-4">
                    <p className="text-sm text-gray-400">
                      Status: <span className="text-white capitalize">{timeline.hrCall.status}</span>
                    </p>
                    {timeline.hrCall.summary && (
                      <p className="text-sm text-gray-300 mt-2">{timeline.hrCall.summary}</p>
                    )}
                    {timeline.hrCall.decision && timeline.hrCall.decision !== 'pending' && (
                      <p className="text-sm mt-2">
                        Decision: <span className={`font-semibold ${
                          timeline.hrCall.decision === 'move-to-onboarding' ? 'text-green-400' :
                          timeline.hrCall.decision === 'reject' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {timeline.hrCall.decision.replace(/-/g, ' ').toUpperCase()}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </TimelineStep>

            {/* Step 4: Onboarding/Rejection */}
            <TimelineStep
              icon={candidate.status === 'rejected' ? XCircle : CheckCircle}
              title={candidate.status === 'rejected' ? 'Rejected' : 'Onboarding'}
              color={candidate.status === 'rejected' ? 'bg-red-500' : 'bg-green-500'}
              completed={candidate.stage === 'joined' || candidate.status === 'rejected'}
            >
              {candidate.stage === 'joined' && (
                <p className="text-green-400">Candidate has been moved to onboarding</p>
              )}
              {candidate.status === 'rejected' && (
                <p className="text-red-400">Candidate was rejected</p>
              )}
            </TimelineStep>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Activity Log</h2>
        <div className="space-y-4">
          {timeline.timeline?.map((activity, idx) => (
            <div key={idx} className="flex items-start space-x-4 pb-4 border-b border-dark-800 last:border-0">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="font-semibold text-white">{activity.action}</p>
                <p className="text-sm text-gray-400">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                  {activity.performedBy && ` • by ${activity.performedBy.firstName} ${activity.performedBy.lastName}`}
                </p>
              </div>
            </div>
          ))}
          {(!timeline.timeline || timeline.timeline.length === 0) && (
            <p className="text-gray-400 text-center py-4">No activity recorded yet</p>
          )}
        </div>
      </div>

      {/* Modals */}
      {showScheduleModal && (
        <InterviewScheduleModal
          candidateId={candidateId}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            fetchCandidateData();
          }}
        />
      )}

      {showFeedbackModal && selectedInterview && (
        <InterviewFeedbackModal
          candidateId={candidateId}
          interview={selectedInterview}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
          }}
          onSuccess={() => {
            setShowFeedbackModal(false);
            setSelectedInterview(null);
            fetchCandidateData();
          }}
        />
      )}

      {showHRCallModal && (
        <HRCallModal
          candidateId={candidateId}
          hrCall={timeline.hrCall}
          onClose={() => setShowHRCallModal(false)}
          onSuccess={() => {
            setShowHRCallModal(false);
            fetchCandidateData();
          }}
        />
      )}
    </div>
  );
};

// Timeline Step Component
const TimelineStep = ({ icon: Icon, title, color, completed, children }) => {
  return (
    <div className="relative flex items-start space-x-4">
      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${color} ${!completed && 'opacity-50'}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1 pb-8">
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default CandidateTimeline;
