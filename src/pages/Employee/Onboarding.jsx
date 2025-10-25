import React, { useEffect, useState } from 'react';
import { Plus, CheckCircle, Circle, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const stageLabels = [
  { key: 'interview1', label: 'Interview 1' },
  { key: 'hrDiscussion', label: 'HR Discussion' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'success', label: 'Success' }
];

const StageProgress = ({ stages, currentStage, status }) => {
  const currentIndex = stages.indexOf(currentStage);
  
  return (
    <div className="flex items-center space-x-1">
      {stages.map((stage, idx) => {
        const done = status === 'completed' || idx < currentIndex;
        const current = idx === currentIndex && status !== 'completed';
        const isLast = idx === stages.length - 1;
        
        return (
          <div key={stage} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                done ? 'bg-green-500 text-white' : 
                current ? 'bg-blue-500 text-white animate-pulse' : 
                'bg-gray-700 text-gray-400'
              }`}>
                {done ? <CheckCircle size={18} /> : current ? <Clock size={18} /> : <Circle size={18} />}
              </div>
              <div className={`mt-1 text-xs font-medium text-center ${
                done ? 'text-green-400' : current ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {stageLabels.find(x => x.key === stage)?.label || stage}
              </div>
            </div>
            {!isLast && (
              <div className={`mx-3 h-0.5 w-16 transition-all duration-300 ${
                done ? 'bg-green-500' : 'bg-gray-700'
              }`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const Onboarding = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get('/onboarding');
      setList(res?.data?.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load onboarding list');
    } finally {
      setLoading(false);
    }
  };

  const advanceStage = async (id) => {
    try {
      await api.post(`/api/onboarding/${id}/advance`);
      toast.success('Stage advanced successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to advance stage');
    }
  };

  const setJoiningDate = async (id) => {
    const val = prompt('Enter joining date (YYYY-MM-DD)');
    if (!val) return;
    
    try {
      await api.post(`/api/onboarding/${id}/joining`, { joiningDate: val });
      toast.success('Joining date set successfully');
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to set joining date');
    }
  };

  const filteredList = list.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding</h1>
          <p className="text-gray-400 mt-1">Manage new employee onboarding</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredList.map((item) => (
          <div key={item._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{item.candidateName}</h3>
                <p className="text-sm text-gray-400">{item.candidateEmail}</p>
                <p className="text-sm text-gray-400">{item.position}</p>
              </div>
              <span className={`badge ${
                item.status === 'completed' ? 'badge-success' :
                item.status === 'in-progress' ? 'badge-info' :
                'badge-danger'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="mb-4">
              <StageProgress 
                stages={item.stages} 
                currentStage={item.currentStage} 
                status={item.status}
              />
            </div>

            {item.joiningDate && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-sm text-green-400">
                  Joining Date: {new Date(item.joiningDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {item.status === 'in-progress' && (
                <>
                  <button
                    onClick={() => advanceStage(item._id)}
                    className="btn-primary text-sm"
                  >
                    Advance Stage
                  </button>
                  {!item.joiningDate && (
                    <button
                      onClick={() => setJoiningDate(item._id)}
                      className="btn-outline text-sm"
                    >
                      Set Joining Date
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No onboarding records found</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
