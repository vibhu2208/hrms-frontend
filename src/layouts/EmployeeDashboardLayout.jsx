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
  ChevronDown
} from 'lucide-react';

const EmployeeDashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/employee/dashboard', icon: Home },
    { name: 'Leave', href: '/employee/leave', icon: Calendar },
    { name: 'Attendance', href: '/employee/attendance', icon: Clock },
    { name: 'Payslips', href: '/employee/payslips', icon: DollarSign },
    { name: 'Projects', href: '/employee/projects', icon: Briefcase },
    { name: 'Requests', href: '/employee/requests', icon: FileText },
    { name: 'Profile', href: '/employee/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'} border-r`}
        style={{ width: '260px' }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 px-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div>
                <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Employee Portal
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-600 text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-dark-800 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-[260px]' : 'ml-0'} transition-all duration-300`}>
        {/* Top Navigation */}
        <header
          className={`sticky top-0 z-30 ${
            theme === 'dark' ? 'bg-dark-900 border-dark-800' : 'bg-white border-gray-200'
          } border-b`}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:bg-dark-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:bg-dark-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button
                  className={`p-2 rounded-lg relative ${
                    theme === 'dark'
                      ? 'text-gray-400 hover:bg-dark-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-dark-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {profileMenuOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                        theme === 'dark' ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
                      } border`}
                    >
                      <div className="py-1">
                        <Link
                          to="/employee/profile"
                          className={`block px-4 py-2 text-sm ${
                            theme === 'dark'
                              ? 'text-gray-300 hover:bg-dark-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4 inline mr-2" />
                          My Profile
                        </Link>
                        <Link
                          to="/employee/settings"
                          className={`block px-4 py-2 text-sm ${
                            theme === 'dark'
                              ? 'text-gray-300 hover:bg-dark-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 inline mr-2" />
                          Settings
                        </Link>
                        <hr className={`my-1 ${theme === 'dark' ? 'border-dark-700' : 'border-gray-200'}`} />
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            theme === 'dark'
                              ? 'text-red-400 hover:bg-dark-700'
                              : 'text-red-600 hover:bg-gray-100'
                          }`}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default EmployeeDashboardLayout;
