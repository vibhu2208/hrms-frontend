import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardOverview, getTodayAttendance, checkIn, checkOut } from '../../api/employeeDashboard';
import { checkOfficeNetwork, onNetworkChange } from '../../utils/networkUtils';
import toast from 'react-hot-toast';
import BottomNavigation from '../../components/BottomNavigation';
import {
  Search,
  Calendar,
  Clock,
  Bell,
  Cake,
  Award,
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

const ModernEmployeeHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isOfficeNetwork: false,
    isLoading: true,
    lastChecked: null,
    error: null,
    ip: null,
    network: null
  });

  // Network verification
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        setNetworkStatus(prev => ({ ...prev, isLoading: true }));
        const { isOfficeNetwork, reason, ip, network } = await checkOfficeNetwork();
        setNetworkStatus({
          isOnline: navigator.onLine,
          isOfficeNetwork,
          isLoading: false,
          lastChecked: new Date(),
          error: isOfficeNetwork ? null : (reason || 'Not connected to office network'),
          ip: ip || null,
          network: network || null
        });
      } catch (error) {
        console.error('Network check failed:', error);
        setNetworkStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to verify network. Please try again.'
        }));
      }
    };

    checkNetwork();
    const cleanup = onNetworkChange(({ isOnline, isOfficeNetwork, reason, ip, network }) => {
      setNetworkStatus({
        isOnline,
        isOfficeNetwork: !!isOfficeNetwork,
        isLoading: false,
        lastChecked: new Date(),
        error: isOnline ? (isOfficeNetwork ? null : (reason || 'Not connected to office network')) : 'You are offline',
        ip: ip || null,
        network: network || null
      });
    });
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      cleanup();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    fetchTodayAttendance();
  }, [networkStatus.isOfficeNetwork]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await getTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const deviceInfo = navigator.userAgent || '';
      await checkIn({ location: 'office', notes: '', deviceInfo });
      toast.success('Checked in successfully!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const deviceInfo = navigator.userAgent || '';
      await checkOut({ notes: '', deviceInfo });
      toast.success('Checked out successfully!');
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1E1E2A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const { employee, shiftTiming, quickStats, upcomingHolidays, offThisWeek, birthdays, anniversaries, announcements } = dashboardData || {};

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-20 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your colleagues"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2A2A3A] text-white pl-12 pr-4 py-3 rounded-2xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/employee/leave/apply')}
            className="bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-3"
          >
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">Apply Leave</span>
          </button>
          <button
            onClick={() => navigate('/employee/leave/balance')}
            className="bg-[#2A2A3A] text-white p-4 rounded-2xl border border-gray-700 hover:border-[#A88BFF] transition-all flex items-center justify-center space-x-3"
          >
            <Clock className="w-6 h-6 text-[#A88BFF]" />
            <span className="font-semibold">Leave Balance</span>
          </button>
        </div>

        {/* Quick Attendance Action */}
        <div className="bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm">Quick Attendance</p>
              <p className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-100 text-sm">Today</p>
              <p className="text-primary-200 text-sm">
                {todayAttendance?.checkIn ? `In: ${formatTime(todayAttendance.checkIn)}` : 'Not checked in'}
                {todayAttendance?.checkOut ? ` / Out: ${formatTime(todayAttendance.checkOut)}` : ''}
              </p>
            </div>
          </div>

          {/* Network status */}
          <div className={`p-3 rounded-lg mb-4 bg-white/10 ${
            networkStatus.isLoading ? 'bg-yellow-100/20' :
            networkStatus.isOfficeNetwork ? 'bg-green-100/20' : 'bg-red-100/20'
          }`}>
            <div className="flex items-start space-x-2">
              {networkStatus.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-300 mt-0.5"></div>
              ) : networkStatus.isOfficeNetwork ? (
                <Wifi className="w-5 h-5 text-green-300 mt-0.5" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-300 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {networkStatus.isLoading ? 'Checking network...' :
                   networkStatus.isOfficeNetwork ? 'Connected to Office Network' :
                   'Network Access Required'}
                </p>
                {(networkStatus.network || networkStatus.ip) && networkStatus.isOfficeNetwork && (
                  <p className="text-xs text-primary-200 mt-1">
                    {networkStatus.network ? `${networkStatus.network}` : 'Verified'}
                    {networkStatus.ip ? ` • ${networkStatus.ip}` : ''}
                  </p>
                )}
                {!networkStatus.isOfficeNetwork && networkStatus.error && (
                  <p className="text-xs text-red-200 mt-1">{networkStatus.error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action button */}
          {!networkStatus.isOfficeNetwork ? (
            <button
              disabled
              className="w-full bg-white/20 text-white p-3 rounded-xl font-medium cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Connect to Office Network</span>
            </button>
          ) : !todayAttendance?.checkIn ? (
            <button
              onClick={handleCheckIn}
              className="w-full bg-white text-[#A88BFF] p-3 rounded-xl font-semibold hover:bg-primary-50 transition-all flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Check In</span>
            </button>
          ) : !todayAttendance?.checkOut ? (
            <button
              onClick={handleCheckOut}
              className="w-full bg-white text-[#A88BFF] p-3 rounded-xl font-semibold hover:bg-primary-50 transition-all flex items-center justify-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Check Out</span>
            </button>
          ) : (
            <div className="w-full bg-green-500 text-white p-3 rounded-xl font-semibold flex items-center justify-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Attendance Marked</span>
            </div>
          )}
        </div>

        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Shift Today</p>
              <h3 className="text-white text-xl font-bold">
                {shiftTiming?.name} ({shiftTiming?.startTime} - {shiftTiming?.endTime})
              </h3>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Worked Hours</p>
              <p className="text-[#A88BFF] text-xl font-bold">
                {shiftTiming?.workedToday} / {shiftTiming?.totalHours}h
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] h-2 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Off This Week Carousel */}
        {offThisWeek && offThisWeek.length > 0 && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">OFF THIS WEEK</h3>
            <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
              {offThisWeek.map((leave, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center mb-2">
                    {leave.employee.profileImage ? (
                      <img src={leave.employee.profileImage} alt={leave.employee.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">{leave.employee.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium w-20 truncate">{leave.employee.name.split(' ')[0]}</p>
                  <p className="text-gray-400 text-xs">{formatDateRange(leave.startDate, leave.endDate)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wish Them Section */}
        {(birthdays?.length > 0 || anniversaries?.length > 0) && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Wish Them 🎉</h3>
            <div className="space-y-3">
              {birthdays?.slice(0, 3).map((person, index) => (
                <div key={`birthday-${index}`} className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      {person.profileImage ? (
                        <img src={person.profileImage} alt={person.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Cake className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{person.name}</p>
                      <p className="text-gray-400 text-sm">{formatDate(person.date)}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs font-medium">
                    Birthday
                  </span>
                </div>
              ))}
              {anniversaries?.slice(0, 2).map((person, index) => (
                <div key={`anniversary-${index}`} className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      {person.profileImage ? (
                        <img src={person.profileImage} alt={person.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Award className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{person.name}</p>
                      <p className="text-gray-400 text-sm">{person.years} years</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                    Work Anniversary
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-semibold">Announcements</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          {announcements && announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((announcement, index) => (
                <div key={index} className="p-4 bg-[#1E1E2A] rounded-xl">
                  <h4 className="text-white font-medium mb-1">{announcement.title}</h4>
                  <p className="text-gray-400 text-sm">{announcement.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No announcements at the moment</p>
            </div>
          )}
        </div>

        {upcomingHolidays && upcomingHolidays.length > 0 && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Upcoming Holidays</h3>
            <div className="space-y-4">
              {upcomingHolidays.map((holiday, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {new Date(holiday.date).getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{holiday.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    holiday.type === 'public' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {holiday.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernEmployeeHome;
