# 🔐 Super Admin RBAC Credentials

## 🌟 SUPER ADMIN (FULL ACCESS)
**Use this account for complete system control**
- **📧 Email:** `superadmin@hrms.com`
- **🔑 Password:** `SuperAdmin@123`
- **🎯 Access:** ALL MODULES & FUNCTIONS
- **📋 Permissions:** Create, Read, Update, Delete, Export, Approve, Configure
- **🏢 Modules:** All 10 modules (Client Management, Package Management, Billing, Role Management, Audit Logs, System Config, Data Management, Analytics, Reports, Compliance)

---

## 👥 Other Role Accounts for Testing

### 🔧 System Manager
- **📧 Email:** `system.manager@hrms.com`
- **🔑 Password:** `SystemMgr@123`
- **🎯 Access:** Client & package management, system configuration
- **📋 Modules:** Client Management, Package Management, System Config, Analytics, Reports, Audit Logs

### 💰 Finance Admin
- **📧 Email:** `finance.admin@hrms.com`
- **🔑 Password:** `FinanceAdmin@123`
- **🎯 Access:** Billing, subscriptions, and financial reports
- **📋 Modules:** Subscription Billing, Analytics, Reports, Audit Logs

### 📋 Compliance Officer
- **📧 Email:** `compliance.officer@hrms.com`
- **🔑 Password:** `ComplianceOff@123`
- **🎯 Access:** Legal compliance, audit logs, and data management
- **📋 Modules:** Compliance Legal, Audit Logs, Data Management, System Config, Analytics, Reports

### 🔧 Tech Admin (DevOps)
- **📧 Email:** `tech.admin@hrms.com`
- **🔑 Password:** `TechAdmin@123`
- **🎯 Access:** Infrastructure, data management, system configuration
- **📋 Modules:** System Config, Data Management, Analytics, Reports, Audit Logs

### 👁️ Viewer/Analyst
- **📧 Email:** `viewer.analyst@hrms.com`
- **🔑 Password:** `ViewerAnalyst@123`
- **🎯 Access:** Read-only access to analytics and reports
- **📋 Modules:** Analytics, Reports, Audit Logs (Read-only)

---

## 🚀 Quick Start

1. **Login** with the Super Admin credentials above
2. **Navigate** to `/super-admin/dashboard` to see the main dashboard
3. **Test Role Management** at `/super-admin/roles`
4. **Check Audit Logs** at `/super-admin/audit`
5. **Try Different Roles** by logging out and using other credentials

## 🔒 Security Features

- **Role-Based Navigation:** Menu items appear based on user permissions
- **API Protection:** All endpoints protected by RBAC middleware
- **Audit Logging:** Every action is logged with full context
- **Permission Matrix:** Fine-grained control over module access
- **Self-Protection:** Users cannot demote themselves or escalate privileges

## 📊 Module Access Matrix

| Module | Super Admin | System Mgr | Finance | Compliance | Tech Admin | Viewer |
|--------|-------------|------------|---------|------------|------------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Client Management | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Package Management | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Subscription & Billing | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Role Management | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Audit Logs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Configuration | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| Data Management | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Analytics & Monitoring | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reports Center | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 🎯 Testing Scenarios

1. **Login as Super Admin** → Should see all menu items and full access
2. **Login as System Manager** → Should only see Client/Package management
3. **Login as Finance Admin** → Should only see Billing and Reports
4. **Try Role Management** → Only Super Admin should access `/super-admin/roles`
5. **Check Audit Logs** → All roles should see logs, but different levels of detail

---

**🔥 START HERE:** Use `superadmin@hrms.com` with password `SuperAdmin@123` for full system access!
