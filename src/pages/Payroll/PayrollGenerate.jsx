import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PayrollGenerate = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate('/payroll')} className="p-2 hover:bg-dark-800 rounded-lg">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Payroll</h1>
          <p className="text-gray-400 mt-1">Generate payroll for selected period</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="input-field">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="input-field" />
          </div>
        </div>
        <button className="btn-primary mt-6">Generate Payroll</button>
      </div>
    </div>
  );
};

export default PayrollGenerate;
