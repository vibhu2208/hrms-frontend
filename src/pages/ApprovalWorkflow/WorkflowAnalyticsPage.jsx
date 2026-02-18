import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { approvalWorkflowsAPI } from '../../api/approvalWorkflows';

export default function WorkflowAnalyticsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await approvalWorkflowsAPI.get(id);
        setWorkflow(res.data.data);
      } catch (e) {
        toast.error('Failed to load workflow analytics');
        navigate('/approval-workflow/workflows');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="theme-text-secondary">Loading analytics…</div>
      </div>
    );
  }

  const name = workflow?.workflowName || workflow?.name || 'Workflow';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="btn-outline" onClick={() => navigate('/approval-workflow/workflows')} aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold theme-text">Workflow Analytics</h1>
          <p className="text-sm theme-text-secondary">{name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm theme-text-secondary">Approval Rate</div>
          <div className="text-2xl font-semibold theme-text">—</div>
          <div className="text-xs theme-text-secondary mt-1">Coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm theme-text-secondary">Average Time</div>
          <div className="text-2xl font-semibold theme-text">—</div>
          <div className="text-xs theme-text-secondary mt-1">Coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm theme-text-secondary">Bottleneck Step</div>
          <div className="text-2xl font-semibold theme-text">—</div>
          <div className="text-xs theme-text-secondary mt-1">Coming soon</div>
        </div>
        <div className="card">
          <div className="text-sm theme-text-secondary">SLA Breach Rate</div>
          <div className="text-2xl font-semibold theme-text">—</div>
          <div className="text-xs theme-text-secondary mt-1">Coming soon</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold theme-text">Notes</h2>
        <p className="text-sm theme-text-secondary mt-2">
          This UI is wired for analytics navigation. Once approval instances and timings are unified across entity types,
          we can surface approval rates, step-level throughput, and SLA breach trends here.
        </p>
      </div>
    </div>
  );
}

