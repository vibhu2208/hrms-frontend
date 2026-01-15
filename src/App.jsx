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
import DocumentUpload from './pages/Public/DocumentUpload';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import JobDesk from './pages/JobDesk';
import ViewApplicants from './pages/ViewApplicants';
import CandidateTimeline from './pages/CandidateTimeline';

// Employee Pages
import EmployeeList from './pages/Employee/EmployeeList';
import EmployeeAdd from './pages/Employee/EmployeeAdd';
import EmployeeEdit from './pages/Employee/EmployeeEdit';
import EmployeeDetail from './pages/Employee/EmployeeDetail';
import Onboarding from './pages/Employee/Onboarding';
import Offboarding from './pages/Employee/Offboarding';
import BulkEmployeeUpload from './pages/Employee/BulkEmployeeUpload';

// Leave Pages
import LeaveList from './pages/Leave/LeaveList';
import LeaveApply from './pages/Leave/LeaveApply';
import LeaveBalance from './pages/Leave/LeaveBalance';
import LeaveCalendar from './pages/Leave/LeaveCalendar';

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
import LeaveManagement from './pages/Administration/LeaveManagement';

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
import TeamReports from './pages/ManagerDashboard/TeamReports';

// HR Dashboard Pages
import HRHome from './pages/HRDashboard/HRHome';
import HREmployees from './pages/HRDashboard/HREmployees';
import ResumeSearch from './pages/HRDashboard/ResumeSearch';
import HRCandidatePool from './pages/HRDashboard/HRCandidatePool';
import DocumentVerification from './pages/HR/DocumentVerification';

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

// Work Schedule Pages
import ShiftTemplates from './pages/WorkSchedule/ShiftTemplates';
import RosterManagement from './pages/WorkSchedule/RosterManagement';
import RosterCalendar from './pages/WorkSchedule/RosterCalendar';
import RosterChangeRequest from './pages/WorkSchedule/RosterChangeRequest';

// Leave Encashment Pages
import EncashmentRules from './pages/LeaveEncashment/EncashmentRules';
import EncashmentRequests from './pages/LeaveEncashment/EncashmentRequests';
import EncashmentHistory from './pages/LeaveEncashment/EncashmentHistory';

// Advanced Reports Pages
import LeaveReports from './pages/Reports/LeaveReports';
import AdvancedAttendanceReports from './pages/Reports/AttendanceReports';
import ComplianceReports from './pages/Reports/ComplianceReports';
import ScheduledReports from './pages/Reports/ScheduledReports';
import AnalyticsDashboard from './pages/Reports/AnalyticsDashboard';

// Leave Accrual Pages
import AccrualPolicies from './pages/LeaveAccrual/AccrualPolicies';
import AccrualHistory from './pages/LeaveAccrual/AccrualHistory';
import ManualAccrual from './pages/LeaveAccrual/ManualAccrual';

// Approval Workflow Pages
import Workflows from './pages/ApprovalWorkflow/Workflows';
import ApprovalMatrix from './pages/ApprovalWorkflow/ApprovalMatrix';
import Delegations from './pages/ApprovalWorkflow/Delegations';
import PendingApprovals from './pages/ApprovalWorkflow/PendingApprovals';
import SLAMonitoring from './pages/ApprovalWorkflow/SLAMonitoring';

// Biometric Integration Pages
import DeviceManagement from './pages/Biometric/DeviceManagement';
import { default as BiometricEmployeeSync } from './pages/Biometric/EmployeeSync';
import AttendancePull from './pages/Biometric/AttendancePull';
import { default as BiometricSyncLogs } from './pages/Biometric/SyncLogs';

// SAP Integration Pages
import ConnectionConfig from './pages/SAPIntegration/ConnectionConfig';
import { default as SAPEmployeeSync } from './pages/SAPIntegration/EmployeeSync';
import LeaveSync from './pages/SAPIntegration/LeaveSync';
import AttendanceSync from './pages/SAPIntegration/AttendanceSync';
import { default as SAPSyncLogs } from './pages/SAPIntegration/SyncLogs';

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
          <Route path="/public/upload-documents/:token" element={<DocumentUpload />} />
          
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
            <Route path="employees/:id/edit" element={<EmployeeEdit />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="employees/onboarding" element={<Onboarding />} />
            <Route path="employees/offboarding" element={<Offboarding />} />

            {/* Leave Routes */}
            <Route path="leave" element={<LeaveList />} />
            <Route path="leave/apply" element={<LeaveApply />} />
            <Route path="leave/balance" element={<LeaveBalance />} />
            <Route path="leave/calendar" element={<LeaveCalendar />} />

            {/* Attendance Routes */}
            <Route path="attendance" element={<AttendanceList />} />
            <Route path="attendance/mark" element={<AttendanceMark />} />
            <Route path="attendance/reports" element={<AttendanceReports />} />

            {/* Work Schedule Routes */}
            <Route path="work-schedule/shift-templates" element={<ShiftTemplates />} />
            <Route path="work-schedule/rosters" element={<RosterManagement />} />
            <Route path="work-schedule/roster-calendar" element={<RosterCalendar />} />
            <Route path="work-schedule/roster-change-requests" element={<RosterChangeRequest />} />

            {/* Payroll Routes */}
            <Route path="payroll" element={<PayrollList />} />
            <Route path="payroll/generate" element={<PayrollGenerate />} />
            <Route path="payroll/slips" element={<PayrollSlips />} />

            {/* Administration Routes */}
            <Route path="administration/departments" element={<Departments />} />
            <Route path="administration/roles" element={<Roles />} />
            <Route path="administration/policies" element={<Policies />} />
            <Route path="administration/users" element={<UserManagement />} />
            <Route path="administration/leave-management" element={<LeaveManagement />} />

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
            <Route path="document-verification" element={<DocumentVerification />} />

            {/* Talent Pool Routes */}
            <Route path="talent-pool" element={<TalentPoolList />} />

            {/* Performance Routes */}
            <Route path="feedback" element={<FeedbackList />} />
            <Route path="exit-process" element={<ExitProcessList />} />

            {/* Report Routes */}
            <Route path="reports/export" element={<ReportExport />} />
            <Route path="reports/compliance" element={<ComplianceReport />} />
            <Route path="reports/leave" element={<LeaveReports />} />
            <Route path="reports/attendance" element={<AdvancedAttendanceReports />} />
            <Route path="reports/compliance-reports" element={<ComplianceReports />} />
            <Route path="reports/scheduled" element={<ScheduledReports />} />
            <Route path="reports/analytics" element={<AnalyticsDashboard />} />

            {/* Leave Encashment Routes */}
            <Route path="leave-encashment/rules" element={<EncashmentRules />} />
            <Route path="leave-encashment/requests" element={<EncashmentRequests />} />
            <Route path="leave-encashment/history" element={<EncashmentHistory />} />

            {/* Leave Accrual Routes */}
            <Route path="leave-accrual/policies" element={<AccrualPolicies />} />
            <Route path="leave-accrual/history" element={<AccrualHistory />} />
            <Route path="leave-accrual/manual" element={<ManualAccrual />} />

            {/* Approval Workflow Routes */}
            <Route path="approval-workflow/workflows" element={<Workflows />} />
            <Route path="approval-workflow/matrix" element={<ApprovalMatrix />} />
            <Route path="approval-workflow/delegations" element={<Delegations />} />
            <Route path="approval-workflow/pending" element={<PendingApprovals />} />
            <Route path="approval-workflow/sla" element={<SLAMonitoring />} />

            {/* Biometric Integration Routes */}
            <Route path="biometric/devices" element={<DeviceManagement />} />
            <Route path="biometric/employee-sync" element={<BiometricEmployeeSync />} />
            <Route path="biometric/attendance-pull" element={<AttendancePull />} />
            <Route path="biometric/sync-logs" element={<BiometricSyncLogs />} />

            {/* SAP Integration Routes */}
            <Route path="sap/connections" element={<ConnectionConfig />} />
            <Route path="sap/employee-sync" element={<SAPEmployeeSync />} />
            <Route path="sap/leave-sync" element={<LeaveSync />} />
            <Route path="sap/attendance-sync" element={<AttendanceSync />} />
            <Route path="sap/sync-logs" element={<SAPSyncLogs />} />

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
            
            {/* Work Schedule Routes for Employees */}
            <Route path="work-schedule/shift-templates" element={<ShiftTemplates />} />
            <Route path="work-schedule/rosters" element={<RosterManagement />} />
            <Route path="work-schedule/roster-calendar" element={<RosterCalendar />} />
            <Route path="work-schedule/roster-change-requests" element={<RosterChangeRequest />} />
            
            {/* Manager Extra Routes */}
            <Route path="manager/home" element={<ManagerHome />} />
            <Route path="manager/leave-approvals" element={<LeaveApprovals />} />
            <Route path="manager/team-reports" element={<TeamReports />} />
            <Route path="manager/assign-project" element={<AssignProject />} />
            <Route path="manager/schedule-meeting" element={<ScheduleMeeting />} />
            <Route path="manager/announcements" element={<Announcements />} />
            
            {/* HR Extra Routes */}
            <Route path="hr/dashboard" element={<HRHome />} />
            <Route path="hr/employees" element={<HREmployees />} />
            <Route path="hr/attendance" element={<AttendanceList />} />
            <Route path="hr/payroll" element={<PayrollList />} />
            <Route path="hr/recruitment" element={<JobDesk />} />
            <Route path="hr/recruitment/:jobId/applicants" element={<ViewApplicants />} />
            <Route path="hr/recruitment/candidates/:candidateId/timeline" element={<CandidateTimeline />} />
            <Route path="hr/resume-search" element={<ResumeSearch />} />
            <Route path="hr/candidate-pool" element={<HRCandidatePool />} />
            <Route path="hr/performance" element={<FeedbackList />} />
            <Route path="hr/onboarding" element={<Onboarding />} />
            <Route path="hr/offboarding" element={<Offboarding />} />
            
            {/* Employee Leave Encashment Routes */}
            <Route path="leave-encashment/requests" element={<EncashmentRequests />} />
            <Route path="leave-encashment/history" element={<EncashmentHistory />} />
            
            {/* HR Management Routes (accessible from employee dashboard) */}
            <Route path="hr/leave-encashment-rules" element={<EncashmentRules />} />
            <Route path="hr/leave-accrual-policies" element={<AccrualPolicies />} />
            <Route path="hr/approval-workflows" element={<Workflows />} />
            <Route path="hr/pending-approvals" element={<PendingApprovals />} />
            <Route path="hr/reports/analytics" element={<AnalyticsDashboard />} />
            <Route path="hr/attendance-reports" element={<AdvancedAttendanceReports />} />
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
