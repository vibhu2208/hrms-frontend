import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Loader2, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // TODO: replace with dedicated attendance request history endpoint when available
        const response = await api.get('/employee/leaves?status=pending').catch(() => null);
        if (response?.data?.data) {
          const mapped = response.data.data.map((item) => ({
            id: item._id,
            title: item.leaveType || 'Attendance Request',
            submittedOn: item.appliedOn || item.createdAt,
            status: item.status || 'submitted',
            days: item.numberOfDays || 0,
            notes: item.reason || 'No notes provided',
          }));
          setHistory(mapped.slice(0, 10));
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error loading request history:', error);
        toast.error('Unable to load request history right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Attendance Requests History</h1>
            <p className="text-gray-400 text-sm">Track attendance-related submissions and their status</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading history…
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-12 text-center text-gray-400">
            You haven’t submitted any attendance-related requests yet.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#A88BFF]/20 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-[#A88BFF]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">{entry.title}</p>
                    <p className="text-gray-400 text-sm">Submitted on {entry.submittedOn ? new Date(entry.submittedOn).toLocaleString() : '--'}</p>
                    <p className="text-gray-500 text-sm mt-1">{entry.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold capitalize">{entry.status}</p>
                  {entry.days > 0 && <p className="text-gray-500 text-sm">Days: {entry.days}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AttendanceHistory;
