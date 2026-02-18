import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { approvalWorkflowsAPI } from '../../api/approvalWorkflows';

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function WorkflowHistoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState(null);
  const [history, setHistory] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [wRes, hRes] = await Promise.all([approvalWorkflowsAPI.get(id), approvalWorkflowsAPI.history(id)]);
        setWorkflow(wRes.data.data);
        setHistory(hRes.data.data);
      } catch (e) {
        toast.error('Failed to load workflow history');
        navigate('/approval-workflow/workflows');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const exportJSON = async () => {
    try {
      const res = await approvalWorkflowsAPI.exportJSON(id);
      downloadBlob(res.data, `workflow_${id}.json`);
    } catch {
      toast.error('Failed to export workflow JSON');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="theme-text-secondary">Loading history…</div>
      </div>
    );
  }

  const name = workflow?.workflowName || workflow?.name || 'Workflow';
  const version = workflow?.versionLabel || `v${workflow?.versionMajor || 1}.${workflow?.versionMinor || 0}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-outline" onClick={() => navigate('/approval-workflow/workflows')} aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold theme-text">Workflow History</h1>
            <p className="text-sm theme-text-secondary">
              {name} • <span className="font-mono">{version}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2" onClick={exportJSON}>
            <Download size={16} />
            Export JSON
          </button>
          <button className="btn-primary" onClick={() => navigate(`/approval-workflow/workflows/${id}/edit`)}>
            Open Builder
          </button>
        </div>
      </div>

      <div className="card">
        <div className="text-sm theme-text-secondary">
          Versioning entries are recorded in the audit trail. Rollback can be added once snapshot storage is enabled.
        </div>
      </div>

      <div className="card p-0">
        <div className="p-5 border-b theme-border">
          <div className="text-sm font-semibold theme-text">Audit Trail</div>
          <div className="text-xs theme-text-secondary">{(history?.auditTrail || []).length} event(s)</div>
        </div>

        <div className="divide-y theme-border">
          {(history?.auditTrail || []).length === 0 ? (
            <div className="p-6 theme-text-secondary text-sm">No audit entries found.</div>
          ) : (
            (history.auditTrail || []).slice().reverse().map((entry, idx) => (
              <div key={idx} className="p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <div className="font-medium theme-text">{entry.action}</div>
                    <div className="text-sm theme-text-secondary">
                      {formatDate(entry.timestamp)} • {entry.performedByEmail || entry.performedBy?.email || 'Unknown'}
                    </div>
                  </div>
                  <div className="text-xs theme-text-secondary font-mono">#{(history.auditTrail || []).length - idx}</div>
                </div>

                {entry.changes ? (
                  <div className="mt-3 rounded-lg border theme-border p-3">
                    <div className="text-xs theme-text-secondary mb-2">Changes</div>
                    <pre className="text-xs theme-text whitespace-pre-wrap">
{JSON.stringify(entry.changes, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

