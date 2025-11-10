import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  Users,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getPackages, togglePackageStatus, deletePackage } from '../../api/superAdmin';
import toast from 'react-hot-toast';

const PackageManagement = () => {
  const { theme } = useTheme();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, [searchTerm, typeFilter]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        type: typeFilter
      };

      const response = await getPackages(params);
      setPackages(response.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (packageId) => {
    try {
      await togglePackageStatus(packageId);
      toast.success('Package status updated successfully');
      fetchPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
      toast.error('Failed to update package status');
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (window.confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      try {
        await deletePackage(packageId);
        toast.success('Package deleted successfully');
        fetchPackages();
      } catch (error) {
        console.error('Error deleting package:', error);
        toast.error(error.response?.data?.message || 'Failed to delete package');
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      starter: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400',
      professional: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
      enterprise: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
      custom: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400'
    };
    return colors[type] || colors.starter;
  };

  const PackageCard = ({ pkg }) => (
    <div className={`p-6 rounded-xl border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    } hover:shadow-lg transition-all duration-200 relative`}>
      
      {/* Popular Badge */}
      {pkg.isPopular && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Popular</span>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            pkg.type === 'starter' ? 'bg-green-100 dark:bg-green-900/20' :
            pkg.type === 'professional' ? 'bg-blue-100 dark:bg-blue-900/20' :
            pkg.type === 'enterprise' ? 'bg-purple-100 dark:bg-purple-900/20' :
            'bg-orange-100 dark:bg-orange-900/20'
          }`}>
            <Package className={`w-6 h-6 ${
              pkg.type === 'starter' ? 'text-green-600 dark:text-green-400' :
              pkg.type === 'professional' ? 'text-blue-600 dark:text-blue-400' :
              pkg.type === 'enterprise' ? 'text-purple-600 dark:text-purple-400' :
              'text-orange-600 dark:text-orange-400'
            }`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {pkg.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pkg.type)}`}>
              {pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleStatus(pkg._id)}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              pkg.isActive 
                ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20' 
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={pkg.isActive ? 'Deactivate Package' : 'Activate Package'}
          >
            {pkg.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <p className={`text-sm mb-4 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {pkg.description}
      </p>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ${pkg.pricing.monthly}
          </span>
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            /month
          </span>
        </div>
        {pkg.pricing.yearly && (
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
          }`}>
            ${pkg.pricing.yearly}/year (Save {Math.round((1 - (pkg.pricing.yearly / 12) / pkg.pricing.monthly) * 100)}%)
          </p>
        )}
      </div>

      {/* Features */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Max Employees
          </span>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {pkg.features.maxEmployees === -1 ? 'Unlimited' : pkg.features.maxEmployees}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Storage
          </span>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {pkg.features.storageLimit}GB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            API Access
          </span>
          {pkg.features.apiAccess ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Custom Branding
          </span>
          {pkg.features.customBranding ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="mb-4">
        <p className={`text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Included Modules ({pkg.includedModules.length})
        </p>
        <div className="flex flex-wrap gap-1">
          {pkg.includedModules.slice(0, 3).map((module) => (
            <span
              key={module}
              className={`px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {module.toUpperCase()}
            </span>
          ))}
          {pkg.includedModules.length > 3 && (
            <span className={`px-2 py-1 rounded text-xs ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              +{pkg.includedModules.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {pkg.usageCount || 0} clients
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPackage(pkg)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              // Handle edit
            }}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
            title="Edit Package"
          >
            <Edit className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleDeletePackage(pkg._id)}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
            title="Delete Package"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Package Management
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Create and manage subscription packages for clients
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Package</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">All Types</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
            <option value="custom">Custom</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
            }}
            className={`flex items-center justify-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
              theme === 'dark' 
                ? 'border-gray-600 text-gray-300' 
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className={`text-center py-12 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No packages found</p>
          <p>Try adjusting your search criteria or create a new package.</p>
        </div>
      )}

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedPackage.name}
                </h2>
                <button
                  onClick={() => setSelectedPackage(null)}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  ×
                </button>
              </div>
              
              {/* Package details content would go here */}
              <div className="space-y-4">
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedPackage.description}
                </p>
                
                {/* More detailed package information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Pricing
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>Monthly: ${selectedPackage.pricing.monthly}</p>
                      {selectedPackage.pricing.quarterly && (
                        <p>Quarterly: ${selectedPackage.pricing.quarterly}</p>
                      )}
                      {selectedPackage.pricing.yearly && (
                        <p>Yearly: ${selectedPackage.pricing.yearly}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Features
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>Max Employees: {selectedPackage.features.maxEmployees === -1 ? 'Unlimited' : selectedPackage.features.maxEmployees}</p>
                      <p>Storage: {selectedPackage.features.storageLimit}GB</p>
                      <p>API Access: {selectedPackage.features.apiAccess ? 'Yes' : 'No'}</p>
                      <p>Custom Branding: {selectedPackage.features.customBranding ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagement;
