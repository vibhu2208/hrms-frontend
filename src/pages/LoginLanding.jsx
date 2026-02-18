import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, ArrowRight } from 'lucide-react';

const LoginLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-5xl">
        {/* Logo and Welcome Message */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo2.png" 
              alt="Company Logo" 
              className="h-20 w-auto rounded-2xl shadow-md border-2 border-white/10" 
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Welcome to HRMS</h1>
          <p className="text-gray-400 text-lg">Choose how you want to sign in</p>
        </div>

        {/* Login Type Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Company Login Card */}
          <div 
            onClick={() => navigate('/login/company-select')}
            className="card hover:border-primary-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/10 mb-6 group-hover:bg-primary-500/20 transition-colors">
                <Building2 size={40} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Company Login</h2>
              <p className="text-gray-400 mb-6">
                Sign in to your company's HRMS portal. Access employee management, payroll, attendance, and more.
              </p>
              <div className="flex items-center justify-center text-primary-500 group-hover:text-primary-400 font-medium">
                Continue to Company Login
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Super Admin Login Card */}
          <div 
            onClick={() => navigate('/login/super-admin')}
            className="card hover:border-purple-500 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 mb-6 group-hover:bg-purple-500/20 transition-colors">
                <Shield size={40} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Super Admin</h2>
              <p className="text-gray-400 mb-6">
                System administrators only. Manage all companies, subscriptions, packages, and system configuration.
              </p>
              <div className="flex items-center justify-center text-purple-500 group-hover:text-purple-400 font-medium">
                Continue to Admin Login
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-2">
            Need help? Contact your system administrator
          </p>
          <Link
            to="/forgot-password"
            className="text-primary-500 hover:text-primary-400 text-sm"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
