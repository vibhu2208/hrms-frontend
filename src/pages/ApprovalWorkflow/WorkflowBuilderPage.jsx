import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Copy,
  GripVertical,
  Plus,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { approvalWorkflowsAPI } from '../../api/approvalWorkflows';

const ROLE_LEVEL = {
  employee: 1,
  hr: 2,
  manager: 3,
  admin: 4
};

const appliesToOptions = [
  { value: 'leave', label: 'Leave Request', icon: '🏖️' },
  { value: 'payroll', label: 'Payslip Approval', icon: '💵' },
  { value: 'onboarding_approval', label: 'Employee Onboarding', icon: '👤' },
  { value: 'offboarding', label: 'Employee Offboarding', icon: '🚪' },
  { value: 'project', label: 'Project Approval', icon: '📋' },
  { value: 'expense', label: 'Budget/Expense Approval', icon: '💰' },
  { value: 'asset', label: 'Equipment Request', icon: '💻' },
  { value: 'document', label: 'Document Approval', icon: '📄' },
  { value: 'other', label: 'Other', icon: '📌' }
];

const roleOptions = [
  { value: 'employee', label: 'Employee', level: ROLE_LEVEL.employee },
  { value: 'hr', label: 'HR', level: ROLE_LEVEL.hr },
  { value: 'manager', label: 'Manager', level: ROLE_LEVEL.manager },
  { value: 'admin', label: 'Admin', level: ROLE_LEVEL.admin }
];

const modeOptions = [
  { value: 'sequential', label: 'Sequential', help: 'One approver at a time' },
  { value: 'parallel', label: 'Parallel', help: 'All approvers must approve' },
  { value: 'any_one', label: 'Any One', help: 'First approval passes' }
];

const stepSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['employee', 'hr', 'manager', 'admin']),
  mode: z.enum(['sequential', 'parallel', 'any_one']).default('sequential'),
  permissions: z.object({
    canReject: z.boolean().default(true),
    canSendBack: z.boolean().default(true),
    canDelegate: z.boolean().default(true),
    canAddComments: z.boolean().default(true)
  }),
  slaHours: z.number().min(0).max(24 * 30).default(24),
  escalationRole: z.enum(['employee', 'hr', 'manager', 'admin']).optional().nullable(),
  autoApproveAfterTimeout: z.boolean().default(false),
  notifications: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
    sms: z.boolean().default(false)
  }),
  conditional: z.object({
    enabled: z.boolean().default(false),
    skipIfEnabled: z.boolean().default(false),
    routeRulesEnabled: z.boolean().default(false)
  })
});

const workflowSchema = z.object({
  workflowName: z.string().trim().min(1, 'Workflow name is required').max(50, 'Max 50 characters'),
  description: z.string().trim().max(200, 'Max 200 characters').optional().or(z.literal('')),
  appliesTo: z.string().min(1, 'Applies To is required'),
  requesterRole: z.enum(['employee', 'hr', 'manager', 'admin']).default('employee'),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  effectiveDate: z.string().optional().or(z.literal('')),
  autoArchiveAfterDays: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
    .refine((v) => v === undefined || (Number.isFinite(v) && v >= 0), 'Must be 0 or greater'),
  steps: z.array(stepSchema).min(1, 'Add at least one approval step')
});

function uid() {
  return `step_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function computeClientValidation(values) {
  const errors = [];
  const warnings = [];

  // hierarchy non-decreasing
  let prev = ROLE_LEVEL.employee;
  const sequentialSeen = new Set();
  values.steps.forEach((s, idx) => {
    const level = ROLE_LEVEL[s.role];
    if (level < prev) {
      errors.push(`Step ${idx + 1} violates hierarchy (cannot go downward).`);
    } else {
      prev = level;
    }

    if (s.mode === 'sequential') {
      if (sequentialSeen.has(s.role)) {
        errors.push(`Sequential flow cannot contain duplicate roles (duplicate: ${s.role}).`);
      }
      sequentialSeen.add(s.role);
    }

    if (s.escalationRole) {
      const esc = ROLE_LEVEL[s.escalationRole];
      if (esc <= level) errors.push(`Step ${idx + 1} escalation target must be higher than the step role.`);
    } else {
      warnings.push(`Step ${idx + 1} has no escalation target.`);
    }
  });

  return { errors, warnings };
}

function minutesFromHours(h) {
  const n = Number(h) || 0;
  return Math.round(n * 60);
}

function estimateDurationHours(steps) {
  return steps.reduce((sum, s) => sum + (Number(s.slaHours) || 0), 0);
}

function SortableStep({ id, children, disabled }) {
  const sortable = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition
  };

  return (
    <div ref={sortable.setNodeRef} style={style} className={disabled ? 'opacity-100' : ''}>
      {typeof children === 'function' ? children(sortable) : children}
    </div>
  );
}

export default function WorkflowBuilderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [serverValidation, setServerValidation] = useState({ errors: [], warnings: [] });
  const [expandedSteps, setExpandedSteps] = useState(() => new Set([0]));
  const validateTimer = useRef(null);

  const form = useForm({
    resolver: zodResolver(workflowSchema),
    mode: 'onChange',
    defaultValues: {
      workflowName: '',
      description: '',
      appliesTo: 'leave',
      status: 'draft',
      effectiveDate: '',
      autoArchiveAfterDays: '',
      steps: [
        {
          id: uid(),
          role: 'hr',
          mode: 'sequential',
          permissions: { canReject: true, canSendBack: true, canDelegate: true, canAddComments: true },
          slaHours: 24,
          escalationRole: 'manager',
          autoApproveAfterTimeout: false,
          notifications: { email: true, inApp: true, sms: false },
          conditional: { enabled: false, skipIfEnabled: false, routeRulesEnabled: false }
        }
      ]
    }
  });

  const { control, watch, setValue, reset, handleSubmit, formState, register } = form;
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'steps' });

  const values = watch();
  const clientValidation = useMemo(() => computeClientValidation(values), [values]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Keyboard shortcuts: Cmd/Ctrl+S to save
  useEffect(() => {
    const onKeyDown = (e) => {
      const isSave = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
      if (isSave) {
        e.preventDefault();
        handleSubmit(onSave)();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load existing workflow
  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        setLoading(true);
        const res = await approvalWorkflowsAPI.get(id);
        const w = res.data.data;

        const steps =
          (w.steps || [])
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((s) => ({
              id: uid(),
              role: s.role,
              mode: s.mode || 'sequential',
              permissions: {
                canReject: s.permissions?.canReject ?? true,
                canSendBack: s.permissions?.canSendBack ?? true,
                canDelegate: s.permissions?.canDelegate ?? true,
                canAddComments: s.permissions?.canAddComments ?? true
              },
              slaHours: Math.round((Number(s.sla?.timeLimitMinutes || 1440) / 60) * 10) / 10,
              escalationRole: s.escalation?.escalateToRole || null,
              autoApproveAfterTimeout: Boolean(s.sla?.autoApproveAfterMinutes),
              notifications: {
                email: s.notifications?.email ?? true,
                inApp: s.notifications?.inApp ?? true,
                sms: s.notifications?.sms ?? false
              },
              conditional: { enabled: false, skipIfEnabled: false, routeRulesEnabled: false }
            })) ||
          [];

        const legacyStepsFallback =
          steps.length > 0
            ? steps
            : (w.levels || w.approvalSteps || []).map((s) => {
                const role =
                  s.approverType === 'reporting_manager' || s.approverType === 'manager'
                    ? 'manager'
                    : s.approverType === 'hr'
                      ? 'hr'
                      : 'admin';
                return {
                  id: uid(),
                  role,
                  mode: 'sequential',
                  permissions: { canReject: true, canSendBack: true, canDelegate: true, canAddComments: true },
                  slaHours: Math.round((Number(s.slaMinutes || 1440) / 60) * 10) / 10,
                  escalationRole: null,
                  autoApproveAfterTimeout: false,
                  notifications: { email: true, inApp: true, sms: false },
                  conditional: { enabled: false, skipIfEnabled: false, routeRulesEnabled: false }
                };
              });

        reset({
          workflowName: w.workflowName || w.name || '',
          description: w.description || '',
          appliesTo: w.appliesTo || w.requestType || w.entityType || 'leave',
          requesterRole: w.requesterRole || 'employee',
          status: w.status || (w.isActive ? 'active' : 'draft'),
          effectiveDate: w.effectiveDate ? new Date(w.effectiveDate).toISOString().slice(0, 10) : '',
          autoArchiveAfterDays: w.autoArchiveAfterDays ?? '',
          steps: legacyStepsFallback.length ? legacyStepsFallback : form.getValues('steps')
        });
      } catch (e) {
        toast.error('Failed to load workflow');
        navigate('/approval-workflow/workflows');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  // Apply template draft (from templates modal) for new workflows
  useEffect(() => {
    if (isEdit) return;
    try {
      const raw = sessionStorage.getItem('workflowTemplateDraft');
      if (!raw) return;
      const draft = JSON.parse(raw);
      sessionStorage.removeItem('workflowTemplateDraft');
      if (!draft || typeof draft !== 'object') return;
      if (!Array.isArray(draft.steps) || draft.steps.length === 0) return;
      reset({
        workflowName: draft.workflowName || '',
        description: draft.description || '',
        appliesTo: draft.appliesTo || 'leave',
        requesterRole: draft.requesterRole || 'employee',
        status: draft.status || 'draft',
        effectiveDate: draft.effectiveDate || '',
        autoArchiveAfterDays: draft.autoArchiveAfterDays || '',
        steps: draft.steps.map((s) => ({ ...s, id: uid() }))
      });
      toast.success('Template applied');
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  // Debounced server-side validation
  useEffect(() => {
    if (validateTimer.current) window.clearTimeout(validateTimer.current);
    validateTimer.current = window.setTimeout(async () => {
      try {
        const payload = buildPayload(values);
        const res = await approvalWorkflowsAPI.validate(payload);
        setServerValidation({
          errors: res.data.data.errors || [],
          warnings: res.data.data.warnings || []
        });
      } catch {
        // keep last
      }
    }, 350);

    return () => {
      if (validateTimer.current) window.clearTimeout(validateTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const buildPayload = (v) => {
    return {
      workflowName: v.workflowName,
      description: v.description || '',
      appliesTo: v.appliesTo,
      requesterRole: v.requesterRole,
      status: v.status,
      effectiveDate: v.effectiveDate ? new Date(v.effectiveDate).toISOString() : undefined,
      autoArchiveAfterDays: v.autoArchiveAfterDays === '' ? undefined : Number(v.autoArchiveAfterDays),
      steps: v.steps.map((s, idx) => ({
        order: idx + 1,
        name: `Step ${idx + 1}`,
        role: s.role,
        mode: s.mode,
        permissions: s.permissions,
        sla: {
          timeLimitMinutes: minutesFromHours(s.slaHours),
          autoApproveAfterMinutes: s.autoApproveAfterTimeout ? minutesFromHours(s.slaHours) : undefined
        },
        escalation: {
          enabled: true,
          escalateToRole: s.escalationRole || undefined,
          escalateAfterMinutes: minutesFromHours(Math.max(Number(s.slaHours) || 0, 0))
        },
        notifications: s.notifications
      }))
    };
  };

  const onSave = async (v) => {
    if (clientValidation.errors.length > 0) {
      toast.error('Fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(v);
      if (isEdit) {
        await approvalWorkflowsAPI.update(id, payload);
        toast.success('Workflow updated');
      } else {
        const res = await approvalWorkflowsAPI.create(payload);
        toast.success('Workflow created');
        navigate(`/approval-workflow/workflows/${res.data.data._id}/edit`, { replace: true });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save workflow';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const onTest = async () => {
    if (clientValidation.errors.length > 0) {
      toast.error('Fix validation errors before testing');
      return;
    }

    setTesting(true);
    try {
      const payload = buildPayload(values);
      const res = await approvalWorkflowsAPI.validate(payload);
      const errors = res.data.data.errors || [];
      if (errors.length > 0) {
        toast.error('Validation failed. Review the validation panel.');
      } else {
        toast.success('Dry-run validation passed');
      }
    } catch (e) {
      toast.error('Dry-run validation failed');
    } finally {
      setTesting(false);
    }
  };

  const addStep = () => {
    const last = values.steps[values.steps.length - 1];
    const lastLevel = ROLE_LEVEL[last.role];
    const nextRole =
      lastLevel <= ROLE_LEVEL.hr ? 'manager' : lastLevel <= ROLE_LEVEL.manager ? 'admin' : 'admin';
    append({
      id: uid(),
      role: nextRole,
      mode: 'sequential',
      permissions: { canReject: true, canSendBack: true, canDelegate: true, canAddComments: true },
      slaHours: 24,
      escalationRole: nextRole === 'admin' ? null : 'admin',
      autoApproveAfterTimeout: false,
      notifications: { email: true, inApp: true, sms: false },
      conditional: { enabled: false, skipIfEnabled: false, routeRulesEnabled: false }
    });
    setExpandedSteps((prev) => new Set([...prev, values.steps.length]));
  };

  const duplicateStep = (index) => {
    const s = values.steps[index];
    append({ ...s, id: uid() });
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    move(oldIndex, newIndex);
  };

  const totalSteps = values.steps.length;
  const estimatedHours = estimateDurationHours(values.steps);
  const escalationPoints = values.steps.filter((s) => Boolean(s.escalationRole)).length;
  const notificationTriggers = values.steps.reduce((sum, s) => {
    const n = s.notifications;
    return sum + (n.email ? 1 : 0) + (n.inApp ? 1 : 0) + (n.sms ? 1 : 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="theme-text-secondary">Loading workflow…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button className="btn-outline" onClick={() => navigate('/approval-workflow/workflows')} aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold theme-text">{isEdit ? 'Edit Workflow' : 'Create New Workflow'}</h1>
            <p className="text-sm theme-text-secondary">
              Drag and drop steps, configure SLAs, and validate hierarchy rules in real time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline flex items-center gap-2" onClick={onTest} disabled={testing}>
            <Play size={16} />
            {testing ? 'Testing…' : 'Dry-run Validate'}
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSubmit(onSave)}
            disabled={saving || !formState.isValid}
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Main builder */}
        <div className="space-y-6">
          {/* Basic configuration */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text">Basic Configuration</h2>
              <span className="text-xs theme-text-secondary">Cmd/Ctrl+S to save</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Workflow Name *</label>
                <input
                  className="input-field"
                  maxLength={50}
                  value={values.workflowName}
                  onChange={(e) => setValue('workflowName', e.target.value, { shouldValidate: true })}
                  aria-invalid={Boolean(formState.errors.workflowName)}
                />
                {formState.errors.workflowName && (
                  <p className="text-sm text-red-400 mt-1">{formState.errors.workflowName.message}</p>
                )}
                <p className="text-xs theme-text-secondary mt-1">{(values.workflowName || '').length}/50</p>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Applies To *</label>
                <select
                  className="input-field"
                  value={values.appliesTo}
                  onChange={(e) => setValue('appliesTo', e.target.value, { shouldValidate: true })}
                >
                  {appliesToOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.icon} {o.label}
                    </option>
                  ))}
                </select>
                {formState.errors.appliesTo && (
                  <p className="text-sm text-red-400 mt-1">{formState.errors.appliesTo.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-secondary mb-1">Description</label>
                <textarea
                  className="input-field"
                  rows={3}
                  maxLength={200}
                  value={values.description || ''}
                  onChange={(e) => setValue('description', e.target.value, { shouldValidate: true })}
                />
                {formState.errors.description && (
                  <p className="text-sm text-red-400 mt-1">{formState.errors.description.message}</p>
                )}
                <p className="text-xs theme-text-secondary mt-1">{(values.description || '').length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Status *</label>
                <select className="input-field" value={values.status} onChange={(e) => setValue('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Effective Date</label>
                <input
                  className="input-field"
                  type="date"
                  value={values.effectiveDate || ''}
                  onChange={(e) => setValue('effectiveDate', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">Auto-Archive After (Days)</label>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={values.autoArchiveAfterDays ?? ''}
                  onChange={(e) => setValue('autoArchiveAfterDays', e.target.value, { shouldValidate: true })}
                />
                {formState.errors.autoArchiveAfterDays && (
                  <p className="text-sm text-red-400 mt-1">{formState.errors.autoArchiveAfterDays.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Approval flow builder */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold theme-text">Approval Flow Builder</h2>
              <button className="btn-primary flex items-center gap-2" onClick={addStep}>
                <Plus size={16} />
                Add Approval Step
              </button>
            </div>

            {/* Requester Configuration */}
            <div className="mt-4 card">
              <h3 className="text-sm font-semibold theme-text mb-3">Requester Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium theme-text mb-2">
                    Who can request this workflow?
                  </label>
                  <select
                    {...register('requesterRole', { required: true })}
                    className="w-full px-3 py-2 border theme-border theme-surface theme-text rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select requester role</option>
                    <option value="employee">Employee</option>
                    <option value="hr">HR</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formState.errors.requesterRole && (
                    <p className="text-red-500 text-xs mt-1">{formState.errors.requesterRole.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text mb-2">
                    First approval goes to
                  </label>
                  <div className="px-3 py-2 border theme-border theme-surface theme-text rounded-lg bg-gray-50">
                    {values.steps[0]?.role ? roleOptions.find(r => r.value === values.steps[0].role)?.label || values.steps[0].role : 'Not configured'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field, index) => (
                    <SortableStep key={field.id} id={field.id}>
                      {(sortable) => {
                        const step = values.steps[index];
                        const isExpanded = expandedSteps.has(index);
                        const stepRole = roleOptions.find((r) => r.value === step.role);
                        const stepLevel = stepRole?.level || 0;
                        const escalationOptions = roleOptions.filter((r) => r.level > stepLevel);

                        return (
                          <div className="rounded-lg border theme-border theme-surface p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <button
                                  className="mt-1 cursor-grab theme-text-secondary"
                                  {...sortable.attributes}
                                  {...sortable.listeners}
                                  aria-label={`Drag step ${index + 1}`}
                                >
                                  <GripVertical size={18} />
                                </button>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <div className="font-semibold theme-text">Step {index + 1}</div>
                                    <span className="badge badge-info">{stepRole?.label}</span>
                                    <span className="badge badge-default">{modeOptions.find((m) => m.value === step.mode)?.label}</span>
                                  </div>
                                  <div className="text-xs theme-text-secondary">
                                    SLA: {step.slaHours}h {step.escalationRole ? `• Escalate to ${step.escalationRole}` : ''}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  className="btn-outline"
                                  onClick={() =>
                                    setExpandedSteps((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(index)) next.delete(index);
                                      else next.add(index);
                                      return next;
                                    })
                                  }
                                  aria-label={isExpanded ? 'Collapse step details' : 'Expand step details'}
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                <button className="btn-outline" onClick={() => duplicateStep(index)} aria-label="Duplicate step">
                                  <Copy size={16} />
                                </button>
                                <button
                                  className="btn-outline border-red-800 text-red-400"
                                  onClick={() => {
                                    if (fields.length === 1) return;
                                    if (!window.confirm(`Delete Step ${index + 1}?`)) return;
                                    remove(index);
                                  }}
                                  aria-label="Delete step"
                                  disabled={fields.length === 1}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t theme-border grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium theme-text-secondary mb-1">Role *</label>
                                  <select
                                    className="input-field"
                                    value={step.role}
                                    onChange={(e) => update(index, { ...step, role: e.target.value })}
                                  >
                                    {roleOptions.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label} (Level {r.level})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium theme-text-secondary mb-1">Approval Mode</label>
                                  <select
                                    className="input-field"
                                    value={step.mode}
                                    onChange={(e) => update(index, { ...step, mode: e.target.value })}
                                  >
                                    {modeOptions.map((m) => (
                                      <option key={m.value} value={m.value}>
                                        {m.label} — {m.help}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium theme-text-secondary mb-2">Permissions</label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                      ['canReject', 'Can Reject'],
                                      ['canSendBack', 'Can Send Back'],
                                      ['canDelegate', 'Can Delegate'],
                                      ['canAddComments', 'Can Add Comments']
                                    ].map(([key, label]) => (
                                      <label key={key} className="flex items-center gap-2 text-sm theme-text">
                                        <input
                                          type="checkbox"
                                          checked={step.permissions[key]}
                                          onChange={(e) =>
                                            update(index, {
                                              ...step,
                                              permissions: { ...step.permissions, [key]: e.target.checked }
                                            })
                                          }
                                        />
                                        {label}
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium theme-text-secondary mb-1">SLA (Hours)</label>
                                  <input
                                    className="input-field"
                                    type="number"
                                    min={0}
                                    value={step.slaHours}
                                    onChange={(e) => update(index, { ...step, slaHours: Number(e.target.value) || 0 })}
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium theme-text-secondary mb-1">Escalate To</label>
                                  <select
                                    className="input-field"
                                    value={step.escalationRole || ''}
                                    onChange={(e) =>
                                      update(index, { ...step, escalationRole: e.target.value ? e.target.value : null })
                                    }
                                  >
                                    <option value="">No escalation</option>
                                    {escalationOptions.map((r) => (
                                      <option key={r.value} value={r.value}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium theme-text-secondary mb-2">Notifications</label>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {[
                                      ['email', 'Email'],
                                      ['inApp', 'In-app'],
                                      ['sms', 'SMS']
                                    ].map(([key, label]) => (
                                      <label key={key} className="flex items-center gap-2 text-sm theme-text">
                                        <input
                                          type="checkbox"
                                          checked={step.notifications[key]}
                                          onChange={(e) =>
                                            update(index, {
                                              ...step,
                                              notifications: { ...step.notifications, [key]: e.target.checked }
                                            })
                                          }
                                        />
                                        {label}
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div className="md:col-span-2">
                                  <div className="rounded-lg border theme-border p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm font-medium theme-text">Advanced (Conditional Routing)</div>
                                      <label className="flex items-center gap-2 text-sm theme-text-secondary">
                                        <input
                                          type="checkbox"
                                          checked={step.conditional.enabled}
                                          onChange={(e) =>
                                            update(index, {
                                              ...step,
                                              conditional: { ...step.conditional, enabled: e.target.checked }
                                            })
                                          }
                                        />
                                        Enable
                                      </label>
                                    </div>
                                    <p className="text-xs theme-text-secondary mt-1">
                                      Skip steps or route based on request attributes (initial rollout stores configuration; execution routing can be expanded).
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }}
                    </SortableStep>
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold theme-text mb-3">Real-time Validation</h3>

            <div className="space-y-2">
              {clientValidation.errors.length === 0 ? (
                <div className="text-sm text-green-400">✅ Client checks passed</div>
              ) : (
                clientValidation.errors.map((e, idx) => (
                  <div key={idx} className="text-sm text-red-400">
                    ❌ {e}
                  </div>
                ))
              )}

              {clientValidation.warnings.map((w, idx) => (
                <div key={idx} className="text-sm text-amber-400">
                  ⚠️ {w}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t theme-border">
              <div className="text-xs theme-text-secondary mb-2">Server validations</div>
              <div className="space-y-2">
                {(serverValidation.errors || []).slice(0, 5).map((e, idx) => (
                  <div key={idx} className="text-sm text-red-400">
                    ❌ {e.message || 'Validation error'}
                  </div>
                ))}
                {(serverValidation.warnings || []).slice(0, 5).map((w, idx) => (
                  <div key={idx} className="text-sm text-amber-400">
                    ⚠️ {w.message || 'Warning'}
                  </div>
                ))}
                {(serverValidation.errors || []).length === 0 && (serverValidation.warnings || []).length === 0 && (
                  <div className="text-sm theme-text-secondary">No server messages.</div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold theme-text mb-3">Workflow Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-semibold theme-text">{totalSteps}</div>
                <div className="text-xs theme-text-secondary">Total Steps</div>
              </div>
              <div>
                <div className="text-2xl font-semibold theme-text">{estimatedHours}h</div>
                <div className="text-xs theme-text-secondary">Est. Duration</div>
              </div>
              <div>
                <div className="text-2xl font-semibold theme-text">{escalationPoints}</div>
                <div className="text-xs theme-text-secondary">Escalation Points</div>
              </div>
              <div>
                <div className="text-2xl font-semibold theme-text">{notificationTriggers}</div>
                <div className="text-xs theme-text-secondary">Notification Triggers</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold theme-text mb-3">Execution Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="theme-text-secondary">
                {values.requesterRole ? `${values.requesterRole.charAt(0).toUpperCase() + values.requesterRole.slice(1)} submits → ${values.steps[0]?.role || 'HR'} receives` : 'Configure requester and first step'}
              </div>
              {values.steps.slice(0, 6).map((s, idx) => {
                const next = values.steps[idx + 1]?.role;
                return (
                  <div key={s.id} className="theme-text-secondary">
                    Day {idx + 2}: {s.role} approves → {next ? `${next} receives` : 'Request Complete ✓'}
                  </div>
                );
              })}
              {values.steps.length > 6 && <div className="theme-text-secondary">…</div>}
            </div>
            <div className="mt-4 pt-4 border-t theme-border">
              <div className="text-xs theme-text-secondary mb-1">Scenarios</div>
              <div className="text-sm theme-text-secondary">✅ Happy path • ❌ Rejection • ⏱️ Escalation • 🔄 Send-back</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

