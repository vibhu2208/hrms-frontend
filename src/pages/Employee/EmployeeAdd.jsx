import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: '', // Added employeeCode field
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    maritalStatus: 'single',
    alternatePhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'full-time',
    status: 'active', // Added status field with default value
    salary: {
      basic: '',
      hra: '',
      allowances: '',
      deductions: '',
      total: ''
    },
    bankDetails: {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: '',
      branch: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Failed to load departments');
    }
  };

  const calculateTotalSalary = (basic, hra, allowances, deductions) => {
    const basicNum = parseFloat(basic) || 0;
    const hraNum = parseFloat(hra) || 0;
    const allowancesNum = parseFloat(allowances) || 0;
    const deductionsNum = parseFloat(deductions) || 0;
    return basicNum + hraNum + allowancesNum - deductionsNum;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'salary') {
        setFormData(prev => {
          const updatedSalary = {
            ...prev.salary,
            [child]: value
          };

          // Auto-calculate total salary when salary fields change
          const total = calculateTotalSalary(
            updatedSalary.basic,
            updatedSalary.hra,
            updatedSalary.allowances,
            updatedSalary.deductions
          );

          return {
            ...prev,
            salary: {
              ...updatedSalary,
              total: total.toString()
            }
          };
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.department || !formData.designation || !formData.joiningDate) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Prepare data for backend (convert salary fields to numbers)
    const submitData = {
      ...formData,
      ...(formData.employeeCode && formData.employeeCode.trim() ? { employeeCode: formData.employeeCode } : {}),
      salary: {
        basic: parseFloat(formData.salary.basic) || 0,
        hra: parseFloat(formData.salary.hra) || 0,
        allowances: parseFloat(formData.salary.allowances) || 0,
        deductions: parseFloat(formData.salary.deductions) || 0,
        total: parseFloat(formData.salary.total) || 0
      }
    };

    try {
      const response = await api.post('/employees', submitData);
      toast.success('Employee added successfully');
      console.log('Employee created:', response.data);
      navigate('/employees');
    } catch (error) {
      console.error('Employee creation error details:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Please check all required fields and try again');
      } else if (error.response?.status === 401) {
        toast.error('You are not authorized to add employees');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin or HR permissions required');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check if MongoDB is running and properly connected.');
      } else {
        toast.error('Failed to add employee. Please try again.');
      }
      console.error('Employee creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-2 hover:bg-dark-800 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
            <p className="text-gray-400 mt-1">Fill in the employee details</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/employees/bulk-upload')}
            className="btn-outline flex items-center space-x-2"
            title="Bulk Upload Employees"
          >
            <Upload size={20} />
            <span>Bulk Upload</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Employee Code *
              </label>
              <input
                type="text"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                className="input-field"
                placeholder="Leave blank for auto-generation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender (Optional)
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Blood Group (Optional)
              </label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marital Status (Optional)
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="input-field"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alternate Phone (Optional)
              </label>
              <input
                type="tel"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Employment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Designation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Joining Date *
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Employment Type (Optional)
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Salary Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Basic Salary
              </label>
              <input
                type="number"
                name="salary.basic"
                value={formData.salary.basic}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                HRA
              </label>
              <input
                type="number"
                name="salary.hra"
                value={formData.salary.hra}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Allowances
              </label>
              <input
                type="number"
                name="salary.allowances"
                value={formData.salary.allowances}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deductions
              </label>
              <input
                type="number"
                name="salary.deductions"
                value={formData.salary.deductions}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Salary (Auto-calculated)
              </label>
              <input
                type="number"
                name="salary.total"
                value={formData.salary.total}
                className="input-field bg-gray-700 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Bank Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Number
              </label>
              <input
                type="text"
                name="bankDetails.accountNumber"
                value={formData.bankDetails.accountNumber}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Name
              </label>
              <input
                type="text"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                IFSC Code
              </label>
              <input
                type="text"
                name="bankDetails.ifscCode"
                value={formData.bankDetails.ifscCode}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                name="bankDetails.accountHolderName"
                value={formData.bankDetails.accountHolderName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <input
                type="text"
                name="bankDetails.branch"
                value={formData.bankDetails.branch}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : 'Save Employee'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAdd;
