import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import HomeRedirect from './components/HomeRedirect';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import EmployeeDashboardLayout from './layouts/EmployeeDashboardLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Auth Pages
import Login from './pages/Login';
import LoginLanding from './pages/LoginLanding';
import CompanySelect from './pages/CompanySelect';
import CompanyLogin from './pages/CompanyLogin';
import SuperAdminLogin from './pages/SuperAdminLogin';

// Public Pages
import CareersPage from './pages/Public/CareersPage';
import CandidateDocuments from './pages/CandidateDocuments';

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
import UserManagement from './pages/Administration/UserManagement';

// Assets Page
import Assets from './pages/Assets';

// Settings Pages
import Profile from './pages/Settings/Profile';
import Security from './pages/Settings/Security';
import Preferences from './pages/Settings/Preferences';
import ThemeSettings from './pages/Settings/ThemeSettings';

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

// Employee Dashboard Pages
import EmployeeHome from './pages/EmployeeDashboard/EmployeeHome';
import EmployeeLeave from './pages/EmployeeDashboard/EmployeeLeave';
import EmployeeAttendance from './pages/EmployeeDashboard/EmployeeAttendance';
import EmployeePayslips from './pages/EmployeeDashboard/EmployeePayslips';
import EmployeeProjects from './pages/EmployeeDashboard/EmployeeProjects';
import EmployeeRequests from './pages/EmployeeDashboard/EmployeeRequests';
import EmployeeProfile from './pages/EmployeeDashboard/EmployeeProfile';

// Modern Employee Dashboard Pages
import ModernEmployeeHome from './pages/EmployeeDashboard/ModernEmployeeHome';
import ModernLeaveBalance from './pages/EmployeeDashboard/ModernLeaveBalance';
import ModernApplyLeave from './pages/EmployeeDashboard/ModernApplyLeave';
import ModernAttendance from './pages/EmployeeDashboard/ModernAttendance';
import ModernMyTeam from './pages/EmployeeDashboard/ModernMyTeam';
import ModernPayslips from './pages/EmployeeDashboard/ModernPayslips';
import ModernProjects from './pages/EmployeeDashboard/ModernProjects';
import ModernProfile from './pages/EmployeeDashboard/ModernProfile';

// Manager Dashboard Pages
import ManagerHome from './pages/ManagerDashboard/ManagerHome';
import LeaveApprovals from './pages/ManagerDashboard/LeaveApprovals';
import AssignProject from './pages/ManagerDashboard/AssignProject';
import ScheduleMeeting from './pages/ManagerDashboard/ScheduleMeeting';
import Announcements from './pages/ManagerDashboard/Announcements';

// HR Dashboard Pages
import HRHome from './pages/HRDashboard/HRHome';
import HREmployees from './pages/HRDashboard/HREmployees';
import ResumeSearch from './pages/HRDashboard/ResumeSearch';
import HRCandidatePool from './pages/HRDashboard/HRCandidatePool';

// Super Admin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import ClientManagement from './pages/SuperAdmin/ClientManagement';
import PackageManagement from './pages/SuperAdmin/PackageManagement';
import RoleManagement from './pages/SuperAdmin/RoleManagement';
import AuditLogs from './components/SuperAdmin/AuditLogs';
import AnalyticsReports from './components/SuperAdmin/AnalyticsReports';
import SystemConfiguration from './components/SuperAdmin/SystemConfiguration';
import DataManagement from './components/SuperAdmin/DataManagement';
import SubscriptionManagement from './pages/SuperAdmin/SubscriptionManagement';
import InvoiceCenter from './pages/SuperAdmin/InvoiceCenter';
import RevenueDashboard from './pages/SuperAdmin/RevenueDashboard';
import BillingAlerts from './pages/SuperAdmin/BillingAlerts';

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
          <Route path="/login" element={<LoginLanding />} />
          <Route path="/login/company-select" element={<CompanySelect />} />
          <Route path="/login/super-admin" element={<SuperAdminLogin />} />
          <Route path="/login/old" element={<Login />} />
          <Route path="/login/:companySlug" element={<CompanyLogin />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/jobs" element={<CareersPage />} />
          <Route path="/candidate-documents" element={<CandidateDocuments />} />
          
          {/* Root redirect based on role */}
          <Route path="/" element={<HomeRedirect />} />

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
            <Route path="administration/users" element={<UserManagement />} />

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
            <Route path="settings/theme" element={<ThemeSettings />} />
          </Route>

          {/* Employee Dashboard Routes (includes Manager and HR) */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute roles={['employee', 'manager', 'hr']}>
                <EmployeeDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ModernEmployeeHome />} />
            <Route path="home" element={<ModernEmployeeHome />} />
            <Route path="leave" element={<EmployeeLeave />} />
            <Route path="leave/balance" element={<ModernLeaveBalance />} />
            <Route path="leave/apply" element={<ModernApplyLeave />} />
            <Route path="attendance" element={<ModernAttendance />} />
            <Route path="team" element={<ModernMyTeam />} />
            <Route path="payslips" element={<ModernPayslips />} />
            <Route path="projects" element={<ModernProjects />} />
            <Route path="requests" element={<EmployeeRequests />} />
            <Route path="profile" element={<ModernProfile />} />
            <Route path="settings/theme" element={<ThemeSettings />} />
            
            {/* Manager Extra Routes */}
            <Route path="manager/home" element={<ManagerHome />} />
            <Route path="manager/leave-approvals" element={<LeaveApprovals />} />
            <Route path="manager/assign-project" element={<AssignProject />} />
            <Route path="manager/schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="manager/announcements" element={<Announcements />} />
            
            {/* HR Extra Routes */}
            <Route path="hr/dashboard" element={<HRHome />} />
            <Route path="hr/employees" element={<HREmployees />} />
            <Route path="hr/attendance" element={<HREmployees />} />
            <Route path="hr/payroll" element={<HREmployees />} />
            <Route path="hr/recruitment" element={<JobDesk />} />
            <Route path="hr/recruitment/:jobId/applicants" element={<ViewApplicants />} />
            <Route path="hr/recruitment/candidates/:candidateId/timeline" element={<CandidateTimeline />} />
            <Route path="hr/resume-search" element={<ResumeSearch />} />
            <Route path="hr/candidate-pool" element={<HRCandidatePool />} />
            <Route path="hr/performance" element={<HREmployees />} />
          </Route>

          {/* Super Admin Routes */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute roles={['superadmin']}>
                <SuperAdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="packages" element={<PackageManagement />} />
            <Route path="subscriptions" element={<SubscriptionManagement />} />
            <Route path="invoices" element={<InvoiceCenter />} />
            <Route path="revenue" element={<RevenueDashboard />} />
            <Route path="billing-alerts" element={<BillingAlerts />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="audit" element={<AuditLogs />} />
            <Route path="analytics" element={<AnalyticsReports />} />
            <Route path="config" element={<SystemConfiguration />} />
            <Route path="data" element={<DataManagement />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
