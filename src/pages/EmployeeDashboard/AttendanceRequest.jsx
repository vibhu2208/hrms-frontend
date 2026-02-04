import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Send, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { createRequest } from '../../api/employeeDashboard';

const requestTypes = [
  { id: 'attendance-wfh', label: 'Work From Home' },
  { id: 'attendance-on-duty', label: 'On Duty' },
  { id: 'attendance-partial-day', label: 'Partial Day' },
  { id: 'attendance-regularization', label: 'Regularize Attendance' }
];

const AttendanceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestType: requestTypes[0].id,
    date: '',
    fromTime: '',
    toTime: '',
    location: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const typeConfig = requestTypes.find((t) => t.id === formData.requestType);
      const subject = `${typeConfig?.label || 'Attendance Request'} - ${formData.date}`;
      const descriptionLines = [
        formData.reason,
        `Date: ${formData.date}`,
        formData.fromTime || formData.toTime ? `Time: ${formData.fromTime || '--'} to ${formData.toTime || '--'}` : null,
        formData.location ? `Location: ${formData.location}` : null,
      ].filter(Boolean);

      await createRequest({
        requestType: formData.requestType,
        priority: 'medium',
        subject,
        description: descriptionLines.join('\n'),
        metadata: {
          category: 'attendance',
          date: formData.date,
          fromTime: formData.fromTime || null,
          toTime: formData.toTime || null,
          location: formData.location || null,
        },
      });

      toast.success('Attendance request submitted');
      navigate('/employee/requests');
    } catch (error) {
      console.error('Attendance request submission failed:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">Raise Attendance Request</h1>
            <p className="text-gray-400 text-sm">WFH, On Duty, Partial Day & more</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="flex gap-3 flex-wrap">
          {requestTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFormData(prev => ({ ...prev, requestType: type.id }))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                formData.requestType === type.id
                  ? 'bg-[#A88BFF] text-white border-transparent'
                  : 'bg-[#2A2A3A] text-gray-300 border-gray-700 hover:border-[#A88BFF]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-[#2A2A3A] border border-gray-700 rounded-2xl p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" /> Date *
              </span>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#1E1E2A] px-3 py-2 text-white focus:outline-none focus:border-[#A88BFF]"
                required
              />
            </label>
            <label className="space-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4" /> Location (optional)
              </span>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Home, Client site"
                className="w-full rounded-lg border border-gray-700 bg-[#1E1E2A] px-3 py-2 text-white focus:outline-none focus:border-[#A88BFF]"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" /> From Time
              </span>
              <input
                type="time"
                name="fromTime"
                value={formData.fromTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#1E1E2A] px-3 py-2 text-white focus:outline-none focus:border-[#A88BFF]"
              />
            </label>
            <label className="space-y-2 text-sm text-gray-300">
              <span className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" /> To Time
              </span>
              <input
                type="time"
                name="toTime"
                value={formData.toTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-700 bg-[#1E1E2A] px-3 py-2 text-white focus:outline-none focus:border-[#A88BFF]"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-gray-300">
            <span className="text-gray-400">Reason *</span>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Explain the request in a few sentences"
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-[#1E1E2A] px-3 py-2 text-white focus:outline-none focus:border-[#A88BFF] resize-none"
              required
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A88BFF] text-white font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AttendanceRequest;
