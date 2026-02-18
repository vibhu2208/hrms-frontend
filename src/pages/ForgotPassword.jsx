import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    companyId: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [companies, setCompanies] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/auth/companies');
      const result = await response.json();
      
      if (result.success) {
        setCompanies(result.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/logo2.png" 
                alt="Company Logo" 
                className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
              />
            </div>
            
            <div className="card">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-3">Email Sent!</h1>
              <p className="text-gray-400 mb-6">
                We've sent a password reset link to<br />
                <span className="text-primary-400 font-medium">{formData.email}</span>
              </p>
              
              <div className="bg-dark-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-white font-medium mb-2">What's next?</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Check your email inbox</li>
                  <li>• Look for the password reset email</li>
                  <li>• Click the reset link in the email</li>
                  <li>• Create your new password</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full btn-primary"
                >
                  Back to Login
                </button>
                
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setFormData({ email: '', companyId: '' });
                  }}
                  className="w-full btn-secondary"
                >
                  Try Another Email
                </button>
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mt-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo2.png" 
              alt="Company Logo" 
              className="h-16 w-auto rounded-2xl shadow-md border-2 border-white/10" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-gray-400">
            No worries! Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Company Selection (Optional) */}
            {companies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company (Optional - helps us find you faster)
                </label>
                <select
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select your company</option>
                  {companies.map((company) => (
                    <option key={company.companyId} value={company.companyId}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-primary-500 hover:text-primary-400 text-sm"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            Need help? Contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
