# 🔐 Superadmin User Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Access](#authentication--access)
3. [Dashboard](#dashboard)
4. [Client Management](#client-management)
5. [Package Management](#package-management)
6. [System Administration](#system-administration)
7. [User Roles & Permissions](#user-roles--permissions)
8. [API Endpoints](#api-endpoints)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The **Superadmin** is the highest-level administrative role in the HRMS system with complete control over all aspects of the platform. Superadmins manage multiple client organizations, system configurations, and have access to all data across the platform.

### Key Responsibilities
- 🏢 **Client Management**: Create, edit, and manage all client organizations
- 📦 **Package Management**: Define subscription plans and pricing
- 👥 **User Administration**: Oversee all user accounts across clients
- 📊 **System Monitoring**: Monitor system health and performance
- 🔧 **Configuration**: System-wide settings and configurations
- 📈 **Analytics**: Access to platform-wide analytics and reports

---

## Authentication & Access

### Login Credentials
- **Email**: `superadminb41fitot@hrms.com`
- **Password**: `admin123`
- **Role**: `superadmin`

### Access URLs
- **Login Page**: `http://localhost:5173/login`
- **Dashboard**: `http://localhost:5173/super-admin/dashboard`
- **Client Management**: `http://localhost:5173/super-admin/clients`
- **Package Management**: `http://localhost:5173/super-admin/packages`

### Authentication Flow
1. Navigate to login page
2. Enter superadmin credentials
3. System validates credentials and role
4. Automatic redirect to `/super-admin/dashboard`
5. Access to all superadmin features

---

## Dashboard

### Overview Statistics
The superadmin dashboard provides a comprehensive view of the entire platform:

#### Key Metrics
- 📊 **Total Clients**: Number of registered client organizations
- 👥 **Total Users**: All users across all clients
- 💰 **Revenue Metrics**: Subscription revenue and billing data
- 📈 **Growth Statistics**: User and client growth trends
- ⚡ **System Health**: Server status and performance metrics

#### Dashboard Widgets
1. **Client Overview Card**
   - Active clients count
   - Inactive/suspended clients
   - New clients this month

2. **User Statistics Card**
   - Total platform users
   - Active users
   - User growth rate

3. **Revenue Card**
   - Monthly recurring revenue (MRR)
   - Annual recurring revenue (ARR)
   - Payment status overview

4. **System Health Card**
   - Server uptime
   - Database status
   - API response times

---

## Client Management

### Overview
Complete management of all client organizations on the platform.

### Features

#### 1. View Clients
- **Grid Layout**: Visual cards showing client information
- **Search**: Find clients by name, code, or email
- **Filters**: Filter by status (Active, Inactive, Suspended)
- **Pagination**: Navigate through large client lists

#### 2. Create New Client
**Button Location**: Top-right "Add Client" button

**Required Fields**:
- 🏢 **Company Name**: Client organization name
- 🔢 **Client Code**: Unique identifier (auto-generated if empty)
- 📧 **Email**: Primary contact email
- 📞 **Phone**: Contact phone number
- 📍 **Address**: Business address
- 👤 **Contact Person**: Primary contact details
  - Name
  - Email
  - Phone
- 📦 **Subscription Plan**: Basic, Standard, Premium, Enterprise
- 📅 **Subscription Dates**: Start and end dates
- 👥 **Max Users**: Maximum allowed users
- 🏭 **Industry**: Business industry (optional)
- 🌐 **Website**: Company website (optional)
- 📝 **Notes**: Additional notes (optional)

#### 3. Edit Client
- Click **Edit** button on any client card
- Modify any client information
- Update subscription details
- Change contact information

#### 4. Client Status Management
**Available Statuses**:
- ✅ **Active**: Full access to all features
- ⏸️ **Inactive**: Limited access, billing paused
- 🚫 **Suspended**: No access, account locked

#### 5. Delete Client
- Click **Delete** button with confirmation
- ⚠️ **Warning**: Cannot delete clients with active users
- Must deactivate all users first

### Client Data Structure
```javascript
{
  clientCode: "CLT00001",
  name: "Company Name",
  companyName: "Full Company Name Ltd",
  email: "contact@company.com",
  phone: "+1234567890",
  address: "Business Address",
  contactPerson: {
    name: "John Doe",
    email: "john@company.com",
    phone: "+1234567890"
  },
  status: "active",
  subscription: {
    plan: "premium",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    maxUsers: 100,
    status: "active"
  },
  industry: "Technology",
  website: "https://company.com",
  notes: "Additional information"
}
```

---

## Package Management

### Subscription Plans

#### 1. Basic Plan
- **Price**: $29/month
- **Users**: Up to 10 users
- **Features**:
  - Employee management
  - Basic attendance tracking
  - Simple reporting

#### 2. Standard Plan
- **Price**: $79/month
- **Users**: Up to 50 users
- **Features**:
  - All Basic features
  - Payroll management
  - Advanced reporting
  - Leave management

#### 3. Premium Plan
- **Price**: $149/month
- **Users**: Up to 200 users
- **Features**:
  - All Standard features
  - Performance management
  - Recruitment module
  - Custom workflows

#### 4. Enterprise Plan
- **Price**: Custom pricing
- **Users**: Unlimited
- **Features**:
  - All Premium features
  - Custom integrations
  - Dedicated support
  - White-label options

### Package Management Features
- Create custom packages
- Set pricing and limits
- Define feature sets
- Manage trial periods
- Configure billing cycles

---

## System Administration

### User Management Across Clients

#### User Roles Hierarchy
1. **Superadmin** (Platform Level)
   - Complete system access
   - Manages all clients
   - System configuration

2. **Admin** (Client Level)
   - Full access within their client
   - User management for their organization
   - Client-specific configurations

3. **HR Manager** (Client Level)
   - HR module access
   - Employee management
   - Reporting and analytics

4. **Employee** (Client Level)
   - Self-service portal
   - Personal data management
   - Time tracking and requests

### System Configuration
- **Global Settings**: Platform-wide configurations
- **Feature Flags**: Enable/disable features globally
- **Security Settings**: Password policies, session timeouts
- **Integration Settings**: Third-party service configurations

### Monitoring & Analytics
- **User Activity**: Login patterns, feature usage
- **System Performance**: Response times, error rates
- **Business Metrics**: Revenue, growth, churn rates
- **Security Monitoring**: Failed login attempts, suspicious activity

---

## User Roles & Permissions

### Superadmin Permissions
✅ **Full Access To**:
- All client data and configurations
- User management across all clients
- System-wide settings and configurations
- Financial data and billing information
- Platform analytics and reporting
- Security and audit logs

❌ **Restrictions**:
- None - Superadmin has unrestricted access

### Role-Based Access Control (RBAC)

#### Permission Matrix
| Feature | Superadmin | Admin | HR Manager | Employee |
|---------|------------|-------|------------|----------|
| Client Management | ✅ | ❌ | ❌ | ❌ |
| User Management (Own Client) | ✅ | ✅ | ✅ | ❌ |
| User Management (All Clients) | ✅ | ❌ | ❌ | ❌ |
| Employee Records | ✅ | ✅ | ✅ | Own Only |
| Payroll Management | ✅ | ✅ | ✅ | View Only |
| System Settings | ✅ | Limited | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ✅ | Limited |

---

## API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
```

### Client Management
```
GET    /api/super-admin/clients          # Get all clients
GET    /api/super-admin/clients/:id      # Get specific client
POST   /api/super-admin/clients          # Create new client
PUT    /api/super-admin/clients/:id      # Update client
PATCH  /api/super-admin/clients/:id/status  # Update client status
DELETE /api/super-admin/clients/:id      # Delete client
```

### Dashboard & Analytics
```
GET /api/super-admin/dashboard/stats     # Dashboard statistics
GET /api/super-admin/dashboard/health    # System health check
```

### Package Management
```
GET    /api/super-admin/packages         # Get all packages
POST   /api/super-admin/packages         # Create package
PUT    /api/super-admin/packages/:id     # Update package
DELETE /api/super-admin/packages/:id     # Delete package
```

### API Response Format
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {  // For paginated responses
    "current": 1,
    "pages": 5,
    "total": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Login Issues
**Problem**: Cannot login as superadmin
**Solutions**:
- Verify credentials: `superadminb41fitot@hrms.com` / `admin123`
- Check backend server is running on port 5000
- Clear browser cache and cookies
- Check network connectivity

#### 2. Clients Not Displaying
**Problem**: Client list is empty or not loading
**Solutions**:
- Check browser console for errors
- Verify API endpoints are responding
- Check authentication token validity
- Refresh the page (Ctrl+F5)

#### 3. Create Client Not Working
**Problem**: Cannot create new clients
**Solutions**:
- Verify all required fields are filled
- Check for validation errors
- Ensure unique client code
- Check backend logs for errors

#### 4. Permission Denied Errors
**Problem**: Getting 403 Forbidden errors
**Solutions**:
- Verify user role is 'superadmin'
- Check authentication token
- Re-login to refresh permissions
- Contact system administrator

### Debug Information

#### Browser Console Commands
```javascript
// Check authentication status
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Test API connectivity
fetch('/api/super-admin/clients', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log);
```

#### Network Debugging
- Open Developer Tools (F12)
- Go to Network tab
- Perform action that's failing
- Check for failed requests (red status codes)
- Examine request/response details

### Support Contacts
- **Technical Support**: Contact development team
- **System Issues**: Check system status page
- **Emergency**: Use emergency contact procedures

---

## Security Considerations

### Best Practices
1. **Strong Passwords**: Use complex passwords for superadmin accounts
2. **Regular Updates**: Keep credentials updated regularly
3. **Audit Logs**: Monitor all superadmin activities
4. **Access Control**: Limit superadmin access to necessary personnel
5. **Session Management**: Use secure session handling

### Security Features
- **Two-Factor Authentication**: Enable 2FA for superadmin accounts
- **IP Restrictions**: Limit access to specific IP addresses
- **Session Timeouts**: Automatic logout after inactivity
- **Audit Logging**: All actions are logged and monitored

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete client management system
- ✅ Role-based authentication and redirection
- ✅ Dashboard with system statistics
- ✅ Client CRUD operations
- ✅ Status management for clients
- ✅ Search and filtering capabilities
- ✅ Responsive design for all devices

### Upcoming Features
- 🔄 Package management interface
- 📊 Advanced analytics dashboard
- 🔐 Enhanced security features
- 📱 Mobile app support
- 🔌 API management tools

---

*Last Updated: November 10, 2025*
*Version: 1.0.0*
*Author: HRMS Development Team*
