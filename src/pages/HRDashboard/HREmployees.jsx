import React from 'react';
import { Users } from 'lucide-react';

const HREmployees = () => {
  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Employee Management</h1>
        <p className="text-gray-400">Manage all employee records and information</p>
      </div>
      
      <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-800 text-center">
        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Employee Management</h3>
        <p className="text-gray-400">This page is under development</p>
      </div>
    </div>
  );
};

export default HREmployees;
