import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { approvalWorkflowsAPI } from '../../api/approvalWorkflows';
import { workflowTemplates } from './workflowTemplates';

const appliesToOptions = [
  { value: 'leave', label: 'Leave Request', badgeClass: 'badge-info' },
  { value: 'payroll', label: 'Payslip Approval', badgeClass: 'badge-info' },
  { value: 'onboarding_approval', label: 'Employee Onboarding', badgeClass: 'badge-info' },
  { value: 'offboarding', label: 'Employee Offboarding', badgeClass: 'badge-info' },
  { value: 'project', label: 'Project Approval', badgeClass: 'badge-info' },
  { value: 'expense', label: 'Budget/Expense Approval', badgeClass: 'badge-info' },
  { value: 'asset', label: 'Equipment Request', badgeClass: 'badge-info' },
  { value: 'document', label: 'Document Approval', badgeClass: 'badge-info' },
  { value: 'other', label: 'Other', badgeClass: 'badge-default' }
];

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '-';
  }
}

function initials(user) {
  const first = user?.firstName?.[0] || '';
  const last = user?.lastName?.[0] || '';
  const both = `${first}${last}`.trim();
  if (both) return both.toUpperCase();
  const email = user?.email?.[0] || '';
  return String(email).toUpperCase();
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

const Workflows = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sorting, setSorting] = useState([{ id: 'updatedAt', desc: true }]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [appliesTo, setAppliesTo] = useState('');
  const [validity, setValidity] = useState(''); // '', 'valid', 'invalid'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [rowActionOpenFor, setRowActionOpenFor] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await approvalWorkflowsAPI.stats();
      setStats(res.data.data);
    } catch (e) {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const sort = sorting?.[0] || { id: 'updatedAt', desc: true };
      const params = {
        page: pageIndex + 1,
        limit: pageSize,
        sortBy: sort.id,
        sortDir: sort.desc ? 'desc' : 'asc',
        ...(q ? { q } : {}),
        ...(status ? { status } : {}),
        ...(appliesTo ? { appliesTo } : {}),
        ...(validity === 'valid' ? { isValid: true } : {}),
        ...(validity === 'invalid' ? { isValid: false } : {})
      };

      const res = await approvalWorkflowsAPI.list(params);
      setData(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, sorting, status, appliesTo, validity]);

  // local-only date range filter (until backend supports it)
  const filteredData = useMemo(() => {
    if (!dateFrom && !dateTo) return data;
    const from = dateFrom ? new Date(dateFrom).getTime() : null;
    const to = dateTo ? new Date(dateTo).getTime() : null;
    return data.filter((w) => {
      const t = w?.updatedAt ? new Date(w.updatedAt).getTime() : null;
      if (!t) return false;
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
  }, [data, dateFrom, dateTo]);

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            aria-label="Select all workflows on this page"
            type="checkbox"
            className="h-4 w-4"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            aria-label={`Select workflow ${row.original?.workflowName || row.original?.name || ''}`}
            type="checkbox"
            className="h-4 w-4"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false,
        size: 40
      },
      {
        accessorKey: 'workflowName',
        id: 'workflowName',
        header: 'Workflow Name',
        cell: ({ row }) => {
          const w = row.original;
          const name = w.workflowName || w.name || '(Untitled)';
          return (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg theme-surface border theme-border flex items-center justify-center text-sm">
                W
              </div>
              <div className="min-w-0">
                <div className="font-medium theme-text truncate">{name}</div>
                <div className="text-xs theme-text-secondary truncate">
                  {w.appliesTo || w.requestType || w.entityType || '—'}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'appliesTo',
        id: 'appliesTo',
        header: 'Applies To',
        cell: ({ row }) => {
          const w = row.original;
          const value = w.appliesTo || w.requestType || w.entityType || 'other';
          const opt = appliesToOptions.find((o) => o.value === value) || appliesToOptions[appliesToOptions.length - 1];
          return <span className={`badge ${opt.badgeClass}`}>{opt.label}</span>;
        }
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const w = row.original;
          const isValid = w?.validation?.isValid !== false;
          if (!isValid) return <span className="badge badge-danger">Invalid</span>;
          if (w.status === 'active') return <span className="badge badge-success">Active</span>;
          if (w.status === 'archived') return <span className="badge badge-default">Archived</span>;
          return <span className="badge badge-warning">Draft</span>;
        }
      },
      {
        accessorKey: 'versionLabel',
        id: 'versionLabel',
        header: 'Version',
        cell: ({ row }) => {
          const w = row.original;
          const label = w.versionLabel || `v${w.versionMajor || 1}.${w.versionMinor || 0}`;
          return <span className="font-mono text-sm theme-text-secondary">{label}</span>;
        }
      },
      {
        id: 'totalSteps',
        header: 'Total Steps',
        accessorFn: (w) => (w.steps?.length || w.approvalSteps?.length || w.levels?.length || 0),
        cell: ({ getValue }) => <span className="theme-text">{getValue()}</span>
      },
      {
        id: 'activeRequests',
        header: 'Active Requests',
        accessorFn: () => 0,
        cell: ({ getValue }) => <span className="theme-text-secondary">{getValue()}</span>,
        enableSorting: false
      },
      {
        accessorKey: 'updatedAt',
        id: 'updatedAt',
        header: 'Last Modified',
        cell: ({ row }) => {
          const w = row.original;
          const user = w.lastModifiedBy || w.createdBy;
          return (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-semibold">
                {initials(user)}
              </div>
              <div className="min-w-0">
                <div className="text-sm theme-text truncate">{formatDate(w.updatedAt)}</div>
                <div className="text-xs theme-text-secondary truncate">{user?.email || ''}</div>
              </div>
            </div>
          );
        }
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const w = row.original;
          const open = rowActionOpenFor === w._id;
          return (
            <div className="relative">
              <button
                aria-label="Workflow actions"
                className="p-2 rounded-lg hover:theme-surface"
                onClick={() => setRowActionOpenFor((prev) => (prev === w._id ? null : w._id))}
              >
                <MoreVertical size={16} className="theme-text-secondary" />
              </button>
              {open && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border theme-border theme-surface shadow-lg z-20"
                  role="menu"
                >
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                    onClick={() => {
                      setRowActionOpenFor(null);
                      navigate(`/approval-workflow/workflows/${w._id}/edit`);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                    onClick={async () => {
                      setRowActionOpenFor(null);
                      try {
                        const res = await approvalWorkflowsAPI.duplicate(w._id);
                        toast.success('Workflow duplicated');
                        setData((prev) => [res.data.data, ...prev]);
                        fetchStats();
                      } catch (e) {
                        toast.error(e?.response?.data?.message || 'Failed to duplicate workflow');
                      }
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                    onClick={() => {
                      setRowActionOpenFor(null);
                      navigate(`/approval-workflow/workflows/${w._id}/analytics`);
                    }}
                  >
                    View Analytics
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                    onClick={() => {
                      setRowActionOpenFor(null);
                      navigate(`/approval-workflow/workflows/${w._id}/history`);
                    }}
                  >
                    View History
                  </button>
                  {w.status !== 'active' && w?.validation?.isValid !== false && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                      onClick={async () => {
                        setRowActionOpenFor(null);
                        try {
                          await approvalWorkflowsAPI.update(w._id, { status: 'active' });
                          toast.success('Workflow activated');
                          setData((prev) =>
                            prev.map((x) => (x._id === w._id ? { ...x, status: 'active', isActive: true } : x))
                          );
                          fetchStats();
                        } catch (e) {
                          toast.error(e?.response?.data?.message || 'Failed to activate workflow');
                        }
                      }}
                    >
                      Activate
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/10"
                    onClick={async () => {
                      setRowActionOpenFor(null);
                      try {
                        const res = await approvalWorkflowsAPI.exportJSON(w._id);
                        downloadBlob(res.data, `workflow_${w._id}.json`);
                      } catch (e) {
                        toast.error('Failed to export workflow JSON');
                      }
                    }}
                  >
                    Export JSON
                  </button>
                  <div className="h-px theme-border my-1" />
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-black/10"
                    onClick={async () => {
                      setRowActionOpenFor(null);
                      if (!window.confirm('Archive this workflow?')) return;
                      try {
                        await approvalWorkflowsAPI.archive(w._id);
                        toast.success('Workflow archived');
                        setData((prev) => prev.map((x) => (x._id === w._id ? { ...x, status: 'archived', isActive: false } : x)));
                        fetchStats();
                      } catch (e) {
                        toast.error(e?.response?.data?.message || 'Failed to archive workflow');
                      }
                    }}
                  >
                    Archive
                  </button>
                </div>
              )}
            </div>
          );
        }
      }
    ],
    [navigate, rowActionOpenFor]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    enableRowSelection: true
  });

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original?._id).filter(Boolean);

  const bulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Archive ${selectedIds.length} workflow(s)?`)) return;
    const prev = data;
    setData((d) => d.map((w) => (selectedIds.includes(w._id) ? { ...w, status: 'archived', isActive: false } : w)));
    try {
      await Promise.all(selectedIds.map((id) => approvalWorkflowsAPI.archive(id)));
      toast.success('Archived selected workflows');
      fetchStats();
    } catch (e) {
      setData(prev);
      toast.error('Failed to archive one or more workflows');
    }
  };

  const bulkActivate = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Activate ${selectedIds.length} workflow(s)?`)) return;
    const prev = data;
    setData((d) => d.map((w) => (selectedIds.includes(w._id) ? { ...w, status: 'active', isActive: true } : w)));
    try {
      await Promise.all(selectedIds.map((id) => approvalWorkflowsAPI.update(id, { status: 'active' })));
      toast.success('Activated selected workflows');
      fetchStats();
    } catch (e) {
      setData(prev);
      toast.error('Failed to activate one or more workflows');
    }
  };

  const exportCSV = async () => {
    try {
      const res = await approvalWorkflowsAPI.exportCSV();
      downloadBlob(res.data, 'workflows.csv');
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  const importJSONFile = async (file) => {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const res = await approvalWorkflowsAPI.importJSON(payload);
      toast.success('Workflow imported');
      setData((prev) => [res.data.data, ...prev]);
      fetchStats();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to import workflow JSON');
    }
  };

  const startFromTemplate = (tpl) => {
    try {
      const draft = {
        workflowName: tpl.name,
        description: tpl.description || '',
        appliesTo: tpl.appliesTo,
        status: tpl.status || 'draft',
        effectiveDate: '',
        autoArchiveAfterDays: '',
        steps: tpl.steps
      };
      sessionStorage.setItem('workflowTemplateDraft', JSON.stringify(draft));
      setTemplateModalOpen(false);
      navigate('/approval-workflow/workflows/new');
    } catch {
      toast.error('Failed to apply template');
    }
  };

  const quickStat = (label, value, hint) => (
    <div className="card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm theme-text-secondary">{label}</div>
          <div className="text-2xl font-semibold theme-text">{statsLoading ? '—' : value}</div>
        </div>
        {hint ? <div className="text-xs theme-text-secondary text-right">{hint}</div> : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold theme-text">Approval Workflow Management</h1>
          <p className="theme-text-secondary text-sm">Design, validate, and govern approval flows across HRMS modules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary flex items-center gap-2" onClick={() => setTemplateModalOpen(true)}>
            <Upload size={16} />
            Import Template
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importJSONFile(file);
              e.target.value = '';
            }}
          />
          <button className="btn-primary flex items-center gap-2" onClick={() => navigate('/approval-workflow/workflows/new')}>
            <Plus size={16} />
            Create New Workflow
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" />
              <input
                aria-label="Search workflows by name"
                className="input-field pl-9"
                placeholder="Search workflows…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPageIndex(0);
                    fetchWorkflows();
                  }
                }}
              />
            </div>
            <button
              className="btn-outline flex items-center gap-2"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="workflow-filters"
            >
              <Filter size={16} />
              Filters
              <ChevronDown size={16} className={filtersOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            <button className="btn-outline flex items-center gap-2" onClick={exportCSV}>
              <Download size={16} />
              Export CSV
            </button>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm theme-text-secondary">{selectedIds.length} selected</span>
              <button className="btn-outline" onClick={bulkActivate}>
                Activate Selected
              </button>
              <button className="btn-outline text-red-400 border-red-800" onClick={bulkArchive}>
                Archive Selected
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 theme-text-secondary text-sm">
              <SlidersHorizontal size={16} />
              <span>Advanced sorting, bulk actions, and exports</span>
            </div>
          )}
        </div>

        {filtersOpen && (
          <div id="workflow-filters" className="mt-4 pt-4 border-t theme-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Status</label>
                <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPageIndex(0); }}>
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Applies To</label>
                <select className="input-field" value={appliesTo} onChange={(e) => { setAppliesTo(e.target.value); setPageIndex(0); }}>
                  <option value="">All</option>
                  {appliesToOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Validity</label>
                <select className="input-field" value={validity} onChange={(e) => { setValidity(e.target.value); setPageIndex(0); }}>
                  <option value="">All</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Modified From</label>
                <input className="input-field" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs theme-text-secondary mb-1">Modified To</label>
                <input className="input-field" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setQ('');
                  setStatus('');
                  setAppliesTo('');
                  setValidity('');
                  setDateFrom('');
                  setDateTo('');
                  setPageIndex(0);
                  setSorting([{ id: 'updatedAt', desc: true }]);
                  fetchWorkflows();
                }}
              >
                Reset
              </button>
              <button className="btn-primary" onClick={() => { setPageIndex(0); fetchWorkflows(); }}>
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickStat('Total Active Workflows', stats?.totalActiveWorkflows ?? 0)}
        {quickStat('Pending Approvals', stats?.pendingApprovals ?? 0, 'Based on current backend support')}
        {quickStat('Average Approval Time', `${stats?.averageApprovalTimeHours ?? 0}h`, 'Initial rollout')}
        {quickStat('Workflows Requiring Attention', stats?.workflowsRequiringAttention ?? 0)}
      </div>

      {/* Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        className={canSort ? 'cursor-pointer select-none' : ''}
                        aria-sort={
                          sortState === 'asc' ? 'ascending' : sortState === 'desc' ? 'descending' : 'none'
                        }
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-xs theme-text-secondary">
                              {sortState === 'asc' ? '▲' : sortState === 'desc' ? '▼' : ''}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                [...Array(Math.min(pageSize, 10))].map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={columns.length} className="py-6">
                      <div className="animate-pulse h-4 bg-white/10 rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-10 text-center theme-text-secondary">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm">No workflows found.</div>
                      <button className="btn-primary" onClick={() => navigate('/approval-workflow/workflows/new')}>
                        Create your first workflow
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border-t theme-border">
          <div className="flex items-center gap-2">
            <button
              className="btn-outline flex items-center gap-2"
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
            >
              <ChevronLeft size={16} />
              Prev
            </button>
            <button
              className="btn-outline flex items-center gap-2"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={(pageIndex + 1) * pageSize >= total}
            >
              Next
              <ChevronRight size={16} />
            </button>
            <span className="text-sm theme-text-secondary">
              Page {pageIndex + 1} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm theme-text-secondary">Rows</span>
            <select
              className="input-field w-28"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(0);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-sm theme-text-secondary">{total} total</span>
          </div>
        </div>
      </div>

      {/* Templates / Import Modal */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl rounded-xl border theme-border theme-surface shadow-lg">
            <div className="p-5 border-b theme-border flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold theme-text">Import Template</div>
                <div className="text-sm theme-text-secondary">Start from a vetted template or import a JSON workflow configuration.</div>
              </div>
              <button className="btn-outline" onClick={() => setTemplateModalOpen(false)} aria-label="Close">
                Close
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <div className="text-sm font-semibold theme-text mb-3">Built-in Templates</div>
                <div className="space-y-3">
                  {workflowTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      className="w-full text-left rounded-lg border theme-border theme-surface hover:bg-black/10 p-4"
                      onClick={() => startFromTemplate(tpl)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium theme-text truncate">{tpl.name}</div>
                          <div className="text-sm theme-text-secondary mt-1">{tpl.description}</div>
                        </div>
                        <span className="badge badge-info">{tpl.appliesTo}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold theme-text mb-3">Import from JSON</div>
                <div className="rounded-lg border theme-border p-4">
                  <p className="text-sm theme-text-secondary">
                    Upload a workflow JSON exported from another tenant/environment. Imported workflows are saved as <strong>Draft</strong>.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button className="btn-primary flex items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} />
                      Choose JSON File
                    </button>
                    <button className="btn-outline" onClick={exportCSV}>
                      <Download size={16} />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t theme-border flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={() => setTemplateModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

