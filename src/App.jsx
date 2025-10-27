import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';

// Public Pages
import CareersPage from './pages/Public/CareersPage';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import JobDesk from './pages/JobDesk';
import ViewApplicants from './pages/ViewApplicants';
import CandidateTimeline from './pages/CandidateTimeline';

// Employee Pages
import EmployeeList from './pages/Employee/EmployeeList';
import EmployeeAdd from './pages/Employee/EmployeeAdd';
import EmployeeDetail from './pages/Employee/EmployeeDetail';
import Onboarding from './pages/Employee/Onboarding';
import Offboarding from './pages/Employee/Offboarding';
import BulkEmployeeUpload from './pages/Employee/BulkEmployeeUpload';

// Leave Pages
import LeaveList from './pages/Leave/LeaveList';
import LeaveApply from './pages/Leave/LeaveApply';
import LeaveBalance from './pages/Leave/LeaveBalance';

// Attendance Pages
import AttendanceList from './pages/Attendance/AttendanceList';
import AttendanceMark from './pages/Attendance/AttendanceMark';
import AttendanceReports from './pages/Attendance/AttendanceReports';

// Payroll Pages
import PayrollList from './pages/Payroll/PayrollList';
import PayrollGenerate from './pages/Payroll/PayrollGenerate';
import PayrollSlips from './pages/Payroll/PayrollSlips';

// Administration Pages
import Departments from './pages/Administration/Departments';
import Roles from './pages/Administration/Roles';
import Policies from './pages/Administration/Policies';

// Assets Page
import Assets from './pages/Assets';

// Settings Pages
import Profile from './pages/Settings/Profile';
import Security from './pages/Settings/Security';
import Preferences from './pages/Settings/Preferences';

// Client & Project Pages
import ClientList from './pages/Clients/ClientList';
import ProjectList from './pages/Projects/ProjectList';
import TimesheetList from './pages/Timesheets/TimesheetList';

// Compliance Pages
import DocumentList from './pages/Documents/DocumentList';
import ComplianceList from './pages/Compliance/ComplianceList';

// Recruitment Pages
import CandidateList from './pages/Candidates/CandidateList';

// Talent Pool Pages
import TalentPoolList from './pages/TalentPool/TalentPoolList';

// Performance Pages
import FeedbackList from './pages/Feedback/FeedbackList';
import ExitProcessList from './pages/ExitProcess/ExitProcessList';

// Report Pages
import ReportExport from './pages/Reports/ReportExport';
import ComplianceReport from './pages/Reports/ComplianceReport';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9',
                },
              },
            }}
          />
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/jobs" element={<CareersPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="job-desk" element={<JobDesk />} />
            <Route path="job-desk/:jobId/applicants" element={<ViewApplicants />} />
            <Route path="candidates/:candidateId/timeline" element={<CandidateTimeline />} />

            {/* Employee Routes */}
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/add" element={<EmployeeAdd />} />
            <Route path="employees/bulk-upload" element={<BulkEmployeeUpload />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="employees/onboarding" element={<Onboarding />} />
            <Route path="employees/offboarding" element={<Offboarding />} />

            {/* Leave Routes */}
            <Route path="leave" element={<LeaveList />} />
            <Route path="leave/apply" element={<LeaveApply />} />
            <Route path="leave/balance" element={<LeaveBalance />} />

            {/* Attendance Routes */}
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="attendance/mark" element={<AttendanceMark />} />
            <Route path="attendance/reports" element={<AttendanceReports />} />

            {/* Payroll Routes */}
            <Route path="payroll" element={<PayrollList />} />
            <Route path="payroll/generate" element={<PayrollGenerate />} />
            <Route path="payroll/slips" element={<PayrollSlips />} />

            {/* Administration Routes */}
            <Route path="administration/departments" element={<Departments />} />
            <Route path="administration/roles" element={<Roles />} />
            <Route path="administration/policies" element={<Policies />} />

            {/* Assets Route */}
            <Route path="assets" element={<Assets />} />

            {/* Client & Project Routes */}
            <Route path="clients" element={<ClientList />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="timesheets" element={<TimesheetList />} />

            {/* Compliance Routes */}
            <Route path="documents" element={<DocumentList />} />
            <Route path="compliance" element={<ComplianceList />} />

            {/* Recruitment Routes */}
            <Route path="candidates" element={<CandidateList />} />

            {/* Talent Pool Routes */}
            <Route path="talent-pool" element={<TalentPoolList />} />

            {/* Performance Routes */}
            <Route path="feedback" element={<FeedbackList />} />
            <Route path="exit-process" element={<ExitProcessList />} />

            {/* Report Routes */}
            <Route path="reports/export" element={<ReportExport />} />
            <Route path="reports/compliance" element={<ComplianceReport />} />

            {/* Settings Routes */}
            <Route path="settings/profile" element={<Profile />} />
            <Route path="settings/security" element={<Security />} />
            <Route path="settings/preferences" element={<Preferences />} />
          </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
