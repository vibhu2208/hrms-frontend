import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Settings,
  Package,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Shield,
  Building2,
  FileText,
  CheckSquare,
  UserPlus,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus(prev => {
      // Create a new object with all menus closed
      const newState = {};

      // If the clicked menu was already open, keep it closed
      // If it was closed, open only this one
      if (!prev[key]) {
        newState[key] = true;
      }
      // If it was already open, it will remain closed (newState[key] stays undefined/false)

      return newState;
    });
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      key: 'jobdesk',
      label: 'Job Desk',
      icon: Briefcase,
      path: '/job-desk'
    },
    {
      key: 'employee',
      label: 'Employee',
      icon: Users,
      submenu: [
        { label: 'All Employees', path: '/employees' },
        { label: 'Add Employee', path: '/employees/add' },
        { label: 'Onboarding', path: '/employees/onboarding' },
        { label: 'Offboarding', path: '/employees/offboarding' }
      ]
    },
    {
      key: 'leave',
      label: 'Leave',
      icon: Calendar,
      submenu: [
        { label: 'All Leaves', path: '/leave' },
        { label: 'Apply Leave', path: '/leave/apply' },
        { label: 'Leave Balance', path: '/leave/balance' }
      ]
    },
    {
      key: 'attendance',
      label: 'Attendance',
      icon: Clock,
      submenu: [
        { label: 'View Attendance', path: '/attendance' },
        { label: 'Mark Attendance', path: '/attendance/mark' },
        { label: 'Reports', path: '/attendance/reports' }
      ]
    },
    {
      key: 'payroll',
      label: 'Payroll',
      icon: DollarSign,
      submenu: [
        { label: 'All Payroll', path: '/payroll' },
        { label: 'Generate Payroll', path: '/payroll/generate' },
        { label: 'Salary Slips', path: '/payroll/slips' }
      ]
    },
    {
      key: 'clients',
      label: 'Clients & Projects',
      icon: Building2,
      submenu: [
        { label: 'All Clients', path: '/clients' },
        { label: 'All Projects', path: '/projects' },
        { label: 'Timesheets', path: '/timesheets' }
      ]
    },
    {
      key: 'recruitment',
      label: 'Recruitment',
      icon: UserPlus,
      submenu: [
        { label: 'Candidates', path: '/candidates' },
        { label: 'Job Postings', path: '/job-desk' }
      ]
    },
    {
      key: 'compliance',
      label: 'Compliance',
      icon: CheckSquare,
      submenu: [
        { label: 'Documents', path: '/documents' },
        { label: 'Compliance Tracker', path: '/compliance' }
      ]
    },
    {
      key: 'performance',
      label: 'Performance',
      icon: BarChart3,
      submenu: [
        { label: 'Feedback', path: '/feedback' },
        { label: 'Exit Process', path: '/exit-process' }
      ]
    },
    {
      key: 'administration',
      label: 'Administration',
      icon: Shield,
      submenu: [
        { label: 'Departments', path: '/administration/departments' },
        { label: 'Roles & Permissions', path: '/administration/roles' },
        { label: 'Policies', path: '/administration/policies' }
      ]
    },
    {
      key: 'assets',
      label: 'Assets',
      icon: Package,
      path: '/assets'
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: FileText,
      submenu: [
        { label: 'Export Data', path: '/reports/export' },
        { label: 'Compliance Report', path: '/reports/compliance' }
      ]
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: Settings,
      submenu: [
        { label: 'Profile', path: '/settings/profile' },
        { label: 'Security', path: '/settings/security' },
        { label: 'Theme', path: '/settings/theme' },
        { label: 'Preferences', path: '/settings/preferences' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen theme-surface border-r theme-border z-50 transition-transform duration-300 overflow-y-auto overflow-x-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Logo */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 border-b theme-border theme-surface"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="HRMS Logo"
              className="w-17 h-12 rounded-lg object-cover"
            />
            
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          {menuItems.map((item) => (
            <div key={item.key} className="mb-1">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isParentActive(item.submenu.map(sub => sub.path))
                        ? 'text-white'
                        : 'theme-text-secondary'
                    }`}
                    style={isParentActive(item.submenu.map(sub => sub.path)) 
                      ? { backgroundColor: 'var(--color-primary)' } 
                      : {}}
                    onMouseEnter={(e) => !isParentActive(item.submenu.map(sub => sub.path)) && (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
                    onMouseLeave={(e) => !isParentActive(item.submenu.map(sub => sub.path)) && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {expandedMenus[item.key] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedMenus[item.key] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subItem.path)
                              ? 'theme-primary-text'
                              : 'theme-text-secondary'
                          }`}
                          style={isActive(subItem.path) 
                            ? { backgroundColor: 'var(--color-primary)', opacity: 0.2 } 
                            : {}}
                          onMouseEnter={(e) => !isActive(subItem.path) && (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
                          onMouseLeave={(e) => !isActive(subItem.path) && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'theme-text-secondary'
                  }`}
                  style={isActive(item.path) 
                    ? { backgroundColor: 'var(--color-primary)' } 
                    : {}}
                  onMouseEnter={(e) => !isActive(item.path) && (e.currentTarget.style.backgroundColor = 'var(--color-surfaceHover)')}
                  onMouseLeave={(e) => !isActive(item.path) && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
