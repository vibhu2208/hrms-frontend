# 🚀 Superadmin Quick Reference Guide

## 🔐 Login Credentials
```
Email: superadminb41fitot@hrms.com
Password: admin123
Role: superadmin
```

## 🌐 Quick Access URLs
- **Dashboard**: `http://localhost:5173/super-admin/dashboard`
- **Client Management**: `http://localhost:5173/super-admin/clients`
- **Package Management**: `http://localhost:5173/super-admin/packages`

## ⚡ Quick Actions

### Client Management
| Action | How To |
|--------|--------|
| **View Clients** | Navigate to Client Management page |
| **Add Client** | Click "Add Client" button (top-right) |
| **Edit Client** | Click edit icon on client card |
| **Delete Client** | Click delete icon → confirm |
| **Change Status** | Click status dropdown on client card |
| **Search Clients** | Use search box in filters section |

### Client Status Options
- ✅ **Active**: Full access
- ⏸️ **Inactive**: Limited access
- 🚫 **Suspended**: No access

### Required Client Fields
- Company Name ✅
- Client Code (auto-generated)
- Email ✅
- Phone ✅
- Address ✅
- Contact Person ✅
- Subscription Plan ✅

## 🔧 Troubleshooting

### Common Fixes
| Problem | Solution |
|---------|----------|
| Can't login | Check credentials, clear cache |
| Clients not showing | Refresh page (Ctrl+F5) |
| Create button missing | Check if logged in as superadmin |
| API errors | Check backend server (port 5000) |

### Debug Commands (Browser Console)
```javascript
// Check auth status
localStorage.getItem('token')
JSON.parse(localStorage.getItem('user'))

// Test API
fetch('/api/super-admin/clients', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
```

## 📊 User Roles Hierarchy
1. **Superadmin** → Manages everything
2. **Admin** → Manages their client
3. **HR Manager** → HR functions only
4. **Employee** → Self-service only

## 🛠️ System Status Check
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Database: MongoDB Atlas (auto-connected)

---
*For detailed documentation, see SUPERADMIN_DOCUMENTATION.md*
