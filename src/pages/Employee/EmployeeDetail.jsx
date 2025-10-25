import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data.data);
    } catch (error) {
      toast.error('Failed to load employee details');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/employees')}
          className="p-2 hover:bg-dark-800 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Details</h1>
          <p className="text-gray-400 mt-1">{employee.employeeCode}</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl">
              {employee.firstName[0]}{employee.lastName[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {employee.firstName} {employee.lastName}
            </h2>
            <p className="text-gray-400 mt-1">{employee.designation}</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail size={16} />
                <span>{employee.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone size={16} />
                <span>{employee.phone}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`badge ${
                employee.status === 'active' ? 'badge-success' :
                employee.status === 'on-leave' ? 'badge-warning' :
                'badge-danger'
              }`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Briefcase size={20} />
            <span>Employment Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Department</p>
              <p className="text-white">{employee.department?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Employment Type</p>
              <p className="text-white capitalize">{employee.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Joining Date</p>
              <p className="text-white">
                {new Date(employee.joiningDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Reporting Manager</p>
              <p className="text-white">
                {employee.reportingManager ? 
                  `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}` : 
                  'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <DollarSign size={20} />
            <span>Salary Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Basic Salary</p>
              <p className="text-white">${employee.salary?.basic || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">HRA</p>
              <p className="text-white">${employee.salary?.hra || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Allowances</p>
              <p className="text-white">${employee.salary?.allowances || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Salary</p>
              <p className="text-white font-bold text-lg">${employee.salary?.total || 0}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Calendar size={20} />
            <span>Personal Information</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Date of Birth</p>
              <p className="text-white">
                {employee.dateOfBirth ? 
                  new Date(employee.dateOfBirth).toLocaleDateString() : 
                  'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Gender</p>
              <p className="text-white capitalize">{employee.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="text-white">
                {employee.address?.street && `${employee.address.street}, `}
                {employee.address?.city && `${employee.address.city}, `}
                {employee.address?.state && `${employee.address.state} `}
                {employee.address?.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Phone size={20} />
            <span>Emergency Contact</span>
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-white">{employee.emergencyContact?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Relationship</p>
              <p className="text-white">{employee.emergencyContact?.relationship || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-white">{employee.emergencyContact?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
