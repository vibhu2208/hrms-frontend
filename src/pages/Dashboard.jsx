import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock, DollarSign, Briefcase, Package, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.employees?.total || 0,
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Active Employees',
      value: stats?.employees?.active || 0,
      change: '+5%',
      icon: Users,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Pending Leaves',
      value: stats?.leaves?.pending || 0,
      change: '-3%',
      icon: Calendar,
      color: 'bg-yellow-500',
      trend: 'down'
    },
    {
      title: 'Today Attendance',
      value: stats?.attendance?.today || 0,
      change: '+8%',
      icon: Clock,
      color: 'bg-purple-500',
      trend: 'up'
    },
    {
      title: 'Pending Payroll',
      value: stats?.payroll?.pending || 0,
      change: '0%',
      icon: DollarSign,
      color: 'bg-red-500',
      trend: 'neutral'
    },
    {
      title: 'Active Jobs',
      value: stats?.jobs?.active || 0,
      change: '+2',
      icon: Briefcase,
      color: 'bg-indigo-500',
      trend: 'up'
    },
    {
      title: 'Total Assets',
      value: stats?.assets?.total || 0,
      change: '+15',
      icon: Package,
      color: 'bg-pink-500',
      trend: 'up'
    },
    {
      title: 'Assigned Assets',
      value: stats?.assets?.assigned || 0,
      change: '+10',
      icon: Package,
      color: 'bg-orange-500',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your organization</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown size={16} className="text-red-500 mr-1" />
                  ) : null}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon size={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Employees by Department</h3>
          <div className="space-y-3">
            {stats?.employeesByDepartment?.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300">{dept.department}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-dark-800 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(dept.count / stats.employees.active) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium w-8 text-right">{dept.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leaves */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {stats?.recentLeaves?.map((leave, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-dark-800 last:border-0">
                <div>
                  <p className="text-white font-medium">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </p>
                  <p className="text-sm text-gray-400 capitalize">{leave.leaveType} Leave</p>
                </div>
                <span className={`badge ${
                  leave.status === 'approved' ? 'badge-success' :
                  leave.status === 'pending' ? 'badge-warning' :
                  'badge-danger'
                }`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Attendance Trend (Last 7 Days)</h3>
        <div className="h-64 flex items-end justify-between space-x-2">
          {stats?.attendance?.trend?.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full space-y-1">
                <div
                  className="bg-green-600 rounded-t"
                  style={{ height: `${(day.present / stats.employees.active) * 200}px` }}
                  title={`Present: ${day.present}`}
                ></div>
                <div
                  className="bg-red-600"
                  style={{ height: `${(day.absent / stats.employees.active) * 200}px` }}
                  title={`Absent: ${day.absent}`}
                ></div>
              </div>
              <span className="text-xs text-gray-400 mt-2">
                {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-sm text-gray-400">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-400">Absent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
