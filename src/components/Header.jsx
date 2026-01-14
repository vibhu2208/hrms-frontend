import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Sun, Moon, Maximize, Minimize, Users, Calendar, Clock, DollarSign, Briefcase, FileText, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'company_admin';
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';
  const showEmployeeFeatures = isAdmin || isHR || isManager;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-16 theme-surface border-b theme-border flex items-center justify-between px-6"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden theme-text-secondary"
          style={{ color: 'var(--color-textSecondary)' }}
        >
          <Menu size={24} />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold theme-text" style={{ color: 'var(--color-text)' }}>
            Welcome to HRMS
          </h1>
          <p className="text-sm theme-text-secondary" style={{ color: 'var(--color-textSecondary)' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 theme-text-secondary rounded-lg transition-colors"
          style={{ color: 'var(--color-textSecondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 theme-text-secondary rounded-lg transition-colors"
          style={{ color: 'var(--color-textSecondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 theme-text-secondary rounded-lg transition-colors"
          style={{ color: 'var(--color-textSecondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              <User size={18} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium theme-text" style={{ color: 'var(--color-text)' }}>
                {user?.employee?.firstName} {user?.employee?.lastName}
              </p>
              <p className="text-xs theme-text-secondary capitalize" style={{ color: 'var(--color-textSecondary)' }}>{user?.role}</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 theme-surface theme-border rounded-lg shadow-lg z-20"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/settings/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                    style={{ color: 'var(--color-text)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings/security');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                    style={{ color: 'var(--color-text)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  {showEmployeeFeatures && (
                    <>
                      <hr className="my-1 theme-border" style={{ borderColor: 'var(--color-border)' }} />
                      {/* Employee Self-Service Section */}
                      <button
                        onClick={() => {
                          navigate('/leave/apply');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Calendar size={16} />
                        <span>Apply Leave</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/leave/balance');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Calendar size={16} />
                        <span>Leave Balance</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/attendance');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Clock size={16} />
                        <span>Attendance</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/payroll/slips');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                        style={{ color: 'var(--color-text)' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <DollarSign size={16} />
                        <span>Payslips</span>
                      </button>
                      {!(isAdmin || isHR) && (
                        <button
                          onClick={() => {
                            navigate('/leave-encashment/requests');
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                          style={{ color: 'var(--color-text)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <DollarSign size={16} />
                          <span>Leave Encashment</span>
                        </button>
                      )}
                      
                      {/* Employee Management Section (Admin/HR only) */}
                      {(isAdmin || isHR) && (
                        <>
                          <hr className="my-1 theme-border" style={{ borderColor: 'var(--color-border)' }} />
                          <button
                            onClick={() => {
                              navigate('/employees');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                            style={{ color: 'var(--color-text)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Users size={16} />
                            <span>All Employees</span>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/employees/add');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                            style={{ color: 'var(--color-text)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <UserPlus size={16} />
                            <span>Add Employee</span>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/employees/onboarding');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                            style={{ color: 'var(--color-text)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <UserPlus size={16} />
                            <span>Onboarding</span>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/employees/offboarding');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-sm theme-text"
                            style={{ color: 'var(--color-text)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Users size={16} />
                            <span>Offboarding</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  <hr className="my-1 theme-border" style={{ borderColor: 'var(--color-border)' }} />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
