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
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        className={`fixed top-0 left-0 h-full bg-dark-900 border-r border-dark-800 z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-white">HRMS</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => (
            <div key={item.key} className="mb-1">
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isParentActive(item.submenu.map(sub => sub.path))
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                    }`}
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
                              ? 'bg-primary-600/20 text-primary-400'
                              : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                          }`}
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
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                  }`}
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
