import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Briefcase, Users, Calendar, Plus, X } from 'lucide-react';

const AssignProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    selectedEmployees: []
  });

  const [teamMembers, setTeamMembers] = useState([]);

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/manager/team-members`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          // Format data for display
          const formattedMembers = data.data.map(member => ({
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            designation: member.designation || 'Employee',
            avatar: `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
          }));
          setTeamMembers(formattedMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API call to assign project
    console.log('Assigning project:', formData);
    navigate('/employee/manager/home');
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => navigate('/employee/manager/home')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Assign Project</h1>
            <p className="text-gray-400 text-sm">Create and assign new project to team</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details Card */}
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white text-lg font-semibold">Project Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  placeholder="Enter project name"
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the project objectives and scope"
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assign Team Members Card */}
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-lg font-semibold">Assign Team Members</h2>
                <p className="text-gray-400 text-sm">
                  {formData.selectedEmployees.length} member(s) selected
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleEmployeeToggle(member.id)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    formData.selectedEmployees.includes(member.id)
                      ? 'bg-[#A88BFF]/20 border-2 border-[#A88BFF]'
                      : 'bg-[#1E1E2A] border-2 border-transparent hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                      <span className="text-white font-bold">{member.avatar}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{member.name}</h3>
                      <p className="text-gray-400 text-sm">{member.designation}</p>
                    </div>
                  </div>
                  {formData.selectedEmployees.includes(member.id) && (
                    <div className="w-6 h-6 rounded-full bg-[#A88BFF] flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formData.selectedEmployees.length === 0}
            className="w-full bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Project to Team
          </button>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default AssignProject;
