import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Home,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  Shield,
  CheckCircle,
  UserPlus,
  CalendarPlus,
  MessageSquare,
  Users,
  ClipboardList,
  TrendingUp,
  Search
} from 'lucide-react';

const EmployeeDashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hidden on mobile by default
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isManager = user?.role === 'manager';
  const isHR = user?.role === 'hr';
  const isAdmin = user?.role === 'admin';

  // Employee Navigation - Basic features for all employees
  const employeeNavigation = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: Home },
    { name: 'Leave', href: '/employee/leave', icon: Calendar },
    { name: 'Leave Encashment', href: '/employee/leave-encashment/requests', icon: DollarSign },
    { name: 'Attendance', href: '/employee/attendance', icon: Clock },
    { name: 'Work Schedule', href: '/employee/work-schedule/roster-calendar', icon: Calendar },
    { name: 'Payslips', href: '/employee/payslips', icon: DollarSign },
    { name: 'Projects', href: '/employee/projects', icon: Briefcase },
    { name: 'Requests', href: '/employee/requests', icon: FileText },
    { name: 'Profile', href: '/employee/profile', icon: User },
  ];

  // Manager Navigation - Team management and approvals
  const managerNavigation = [
    { name: 'Manager Home', href: '/employee/manager/home', icon: Shield },
    { name: 'Leave Approvals', href: '/employee/manager/leave-approvals', icon: CheckCircle },
    { name: 'Pending Approvals', href: '/approval-workflow/pending', icon: CheckCircle },
    { name: 'Team Reports', href: '/reports/analytics', icon: FileText },
    { name: 'Assign Project', href: '/employee/manager/assign-project', icon: UserPlus },
    { name: 'Schedule Meeting', href: '/employee/manager/schedule-meeting', icon: CalendarPlus },
    { name: 'Announcements', href: '/employee/manager/announcements', icon: MessageSquare },
  ];

  // HR Navigation - HR management features
  const hrNavigation = [
    { name: 'HR Dashboard', href: '/employee/hr/dashboard', icon: ClipboardList },
    { name: 'Employee Management', href: '/employee/hr/employees', icon: Users },
    { name: 'Leave Encashment Rules', href: '/employee/hr/leave-encashment-rules', icon: DollarSign },
    { name: 'Leave Accrual Policies', href: '/employee/hr/leave-accrual-policies', icon: Calendar },
    { name: 'Approval Workflows', href: '/employee/hr/approval-workflows', icon: CheckCircle },
    { name: 'Pending Approvals', href: '/employee/hr/pending-approvals', icon: CheckCircle },
    { name: 'Reports & Analytics', href: '/employee/hr/reports-analytics', icon: FileText },
    { name: 'Attendance Reports', href: '/employee/hr/attendance-reports', icon: Clock },
    { name: 'Payroll Management', href: '/employee/hr/payroll', icon: DollarSign },
    { name: 'Recruitment', href: '/employee/hr/recruitment', icon: UserPlus },
    { name: 'Candidate Pool', href: '/employee/hr/candidate-pool', icon: Users },
    { name: 'Resume Search', href: '/employee/hr/resume-search', icon: Search },
    { name: 'Performance', href: '/employee/hr/performance', icon: TrendingUp },
  ];

  // Admin Navigation - Full system access
  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/dashboard', icon: Shield },
    { name: 'Employee Management', href: '/employees', icon: Users },
    { name: 'Leave Management', href: '/leave', icon: Calendar },
    { name: 'Leave Encashment Rules', href: '/leave-encashment/rules', icon: DollarSign },
    { name: 'Leave Accrual Policies', href: '/leave-accrual/policies', icon: Calendar },
    { name: 'Manual Accrual', href: '/leave-accrual/manual', icon: Calendar },
    { name: 'Approval Workflows', href: '/approval-workflow/workflows', icon: CheckCircle },
    { name: 'Approval Matrix', href: '/approval-workflow/matrix', icon: CheckCircle },
    { name: 'Delegations', href: '/approval-workflow/delegations', icon: CheckCircle },
    { name: 'SLA Monitoring', href: '/approval-workflow/sla', icon: Clock },
    { name: 'Work Schedule', href: '/work-schedule/shift-templates', icon: Calendar },
    { name: 'Biometric Devices', href: '/biometric/devices', icon: Clock },
    { name: 'SAP Connections', href: '/sap/connections', icon: Shield },
    { name: 'Reports & Analytics', href: '/reports/analytics', icon: FileText },
    { name: 'Scheduled Reports', href: '/reports/scheduled', icon: FileText },
    { name: 'Departments', href: '/administration/departments', icon: Users },
    { name: 'Roles & Permissions', href: '/administration/roles', icon: Shield },
    { name: 'Policies', href: '/administration/policies', icon: FileText },
    { name: 'User Management', href: '/administration/users', icon: Users },
    { name: 'Leave Management', href: '/administration/leave-management', icon: Calendar },
  ];

  let navigation = employeeNavigation;
  if (isAdmin) {
    navigation = [...employeeNavigation, ...adminNavigation];
  } else if (isHR) {
    navigation = [...employeeNavigation, ...hrNavigation];
  } else if (isManager) {
    navigation = [...employeeNavigation, ...managerNavigation];
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-[#2A2A3A] border-r border-gray-800 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ width: '260px' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  HRMS Portal
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {/* Employee Navigation */}
            {employeeNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                      : 'text-gray-400 hover:bg-[#1E1E2A] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}

            {/* Admin Section Divider */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center space-x-2 px-3">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-xs text-gray-500 font-semibold">ADMINISTRATION</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                </div>

                {/* Admin Navigation */}
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                          : 'text-gray-400 hover:bg-[#1E1E2A] hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Manager Section Divider */}
            {isManager && !isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center space-x-2 px-3">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-xs text-gray-500 font-semibold">MANAGER</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                </div>

                {/* Manager Navigation */}
                {managerNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                          : 'text-gray-400 hover:bg-[#1E1E2A] hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}

            {/* HR Section Divider */}
            {isHR && !isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="flex items-center space-x-2 px-3">
                    <div className="flex-1 h-px bg-gray-700"></div>
                    <span className="text-xs text-gray-500 font-semibold">HR MANAGEMENT</span>
                    <div className="flex-1 h-px bg-gray-700"></div>
                  </div>
                </div>

                {/* HR Navigation */}
                {hrNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                          : 'text-gray-400 hover:bg-[#1E1E2A] hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-[260px] transition-all duration-300">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-[#2A2A3A] border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-[#1E1E2A] hover:text-white transition-colors"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-xl text-gray-400 hover:bg-[#1E1E2A] hover:text-white transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#A88BFF] rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-xl text-gray-300 hover:bg-[#1E1E2A] transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-[#2A2A3A] border border-gray-700">
                      <div className="py-1">
                        <Link
                          to="/employee/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#1E1E2A] rounded-lg transition-colors"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 inline mr-2" />
                          My Profile
                        </Link>
                        <hr className="my-1 border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1E1E2A] rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4 inline mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EmployeeDashboardLayout;
