import React from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Clock, Briefcase } from 'lucide-react';

const HRHome = () => {
  const stats = [
    { name: 'Total Employees', value: '0', icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Pending Leaves', value: '0', icon: Calendar, color: 'from-orange-500 to-orange-600' },
    { name: 'Payroll This Month', value: '₹0', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { name: 'Open Positions', value: '0', icon: Briefcase, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">HR Dashboard</h1>
        <p className="text-gray-400">Welcome to HR Management Portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.name}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left">
            <Users className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Manage Employees</h3>
            <p className="text-gray-400 text-sm">View and manage employee records</p>
          </button>
          <button className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left">
            <Calendar className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Leave Approvals</h3>
            <p className="text-gray-400 text-sm">Review pending leave requests</p>
          </button>
          <button className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left">
            <DollarSign className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Process Payroll</h3>
            <p className="text-gray-400 text-sm">Generate and manage payroll</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRHome;
