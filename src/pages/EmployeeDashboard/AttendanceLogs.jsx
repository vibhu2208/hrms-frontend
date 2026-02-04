import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AttendanceLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        // TODO: replace with real endpoint once available
        const response = await api.get('/employee/attendance/history').catch(() => null);
        if (response?.data?.data) {
          setLogs(response.data.data.slice(0, 20));
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
        toast.error('Unable to load attendance logs right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Attendance Logs</h1>
            <p className="text-gray-400 text-sm">Recent check-ins, check-outs & shift details</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading logs…
          </div>
        ) : logs.length === 0 ? (
          <div className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-12 text-center text-gray-400">
            No attendance entries found. Once your attendance is recorded, you will see it here.
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log._id || log.id} className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-white text-lg font-semibold">
                    <Calendar className="w-5 h-5 text-[#A88BFF]" />
                    {new Date(log.date || log.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> Check-in: {log.checkInTime || log.checkIn || '--'} • Check-out: {log.checkOutTime || log.checkOut || '--'}</p>
                    {log.location && (
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {log.location}</p>
                    )}
                    {log.status && <p className="text-xs text-gray-500 uppercase">Status: {log.status}</p>}
                  </div>
                </div>
                {log.totalHours && (
                  <div className="text-right">
                    <p className="text-white text-lg font-semibold">{log.totalHours}</p>
                    <p className="text-gray-500 text-sm">Total hours</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AttendanceLogs;
