import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const HREmployees = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the main employees page
    navigate('/employees', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1E1E2A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#A88BFF]" />
        <p className="text-gray-400">Redirecting to Employee Management...</p>
      </div>
    </div>
  );
};

export default HREmployees;
