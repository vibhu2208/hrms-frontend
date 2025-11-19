import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import {
  Search,
  Calendar,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  MessageSquare,
  Plus
} from 'lucide-react';

const ManagerHome = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    present: 0,
    onLeave: 0,
    pendingApprovals: 0
  });

  const upcomingMeetings = [];

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch team stats
        const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/manager/team-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setTeamStats(statsData.data);
        }

        // Fetch pending leaves
        const leavesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/manager/pending-leaves`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const leavesData = await leavesResponse.json();
        if (leavesData.success) {
          setPendingLeaves(leavesData.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveAction = (leaveId, action) => {
    // TODO: API call to approve/reject leave
    console.log(`${action} leave ${leaveId}`);
    setPendingLeaves(pendingLeaves.filter(leave => leave.id !== leaveId));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      {/* Top Search Bar */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search team members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A3A] text-white pl-12 pr-4 py-3 rounded-2xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Manager Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/employee/manager/leave-approvals')}
            className="bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Leave Approvals</span>
            {pendingLeaves.length > 0 && (
              <span className="block mt-1 text-xs bg-white/20 rounded-full px-2 py-1">
                {pendingLeaves.length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/employee/manager/assign-project')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <Briefcase className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Assign Project</span>
          </button>

          <button
            onClick={() => navigate('/employee/manager/schedule-meeting')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <Calendar className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Schedule Meeting</span>
          </button>

          <button
            onClick={() => navigate('/employee/manager/announcements')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all"
          >
            <MessageSquare className="w-6 h-6 text-[#A88BFF] mx-auto mb-2" />
            <span className="text-sm font-semibold">Announcements</span>
          </button>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Team Size</p>
              <Users className="w-5 h-5 text-[#A88BFF]" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.totalMembers}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Present Today</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.present}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">On Leave</p>
              <Calendar className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.onLeave}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Pending</p>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{teamStats.pendingApprovals}</h3>
          </div>
        </div>

        {/* Pending Leave Approvals */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Pending Leave Approvals</h3>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
              {pendingLeaves.length} Pending
            </span>
          </div>

          {pendingLeaves.length > 0 ? (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="p-4 bg-[#1E1E2A] rounded-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                          <span className="text-white font-bold">{leave.employeeName.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{leave.employeeName}</h4>
                          <p className="text-gray-400 text-sm">{leave.leaveType}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-400">
                          <span className="text-white">{formatDate(leave.startDate)}</span> - 
                          <span className="text-white"> {formatDate(leave.endDate)}</span>
                        </p>
                        <p className="text-gray-400">
                          <span className="text-white">{leave.days}</span> day(s)
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Reason: {leave.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleLeaveAction(leave.id, 'approve')}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveAction(leave.id, 'reject')}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No pending leave approvals</p>
            </div>
          )}
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Upcoming Meetings</h3>
            <button
              onClick={() => navigate('/employee/manager/schedule-meeting')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 bg-[#1E1E2A] rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{meeting.title}</h4>
                    <p className="text-gray-400 text-sm">
                      {formatDate(meeting.date)} at {meeting.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{meeting.attendees}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ManagerHome;
