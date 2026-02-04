import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDashboardOverview } from '../../api/employeeDashboard';

const AttendanceHolidays = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await getDashboardOverview();
        const data = response?.data || {};
        setHolidays(data.upcomingHolidays || []);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        toast.error('Unable to load upcoming holidays right now.');
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Upcoming Holidays</h1>
            <p className="text-gray-400 text-sm">Stay updated with the next company-wide breaks</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading holidays…
          </div>
        ) : holidays.length === 0 ? (
          <div className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-12 text-center text-gray-400">
            No upcoming holidays found. Check back later for updates.
          </div>
        ) : (
          <div className="space-y-4">
            {holidays.map((holiday) => (
              <div key={holiday._id || holiday.name} className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#A88BFF]/20 flex flex-col items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {new Date(holiday.date).getDate()}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-lg">{holiday.name}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  {holiday.description && <p className="text-gray-500 text-sm mt-1">{holiday.description}</p>}
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-[#A88BFF]/20 text-[#A88BFF] capitalize">
                  {holiday.type || 'public'}
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

export default AttendanceHolidays;
