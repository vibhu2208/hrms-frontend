const baseStep = (overrides) => ({
  id: `tpl_${Math.random().toString(16).slice(2)}_${Date.now()}`,
  role: 'hr',
  mode: 'sequential',
  permissions: { canReject: true, canSendBack: true, canDelegate: true, canAddComments: true },
  slaHours: 24,
  escalationRole: 'manager',
  autoApproveAfterTimeout: false,
  notifications: { email: true, inApp: true, sms: false },
  conditional: { enabled: false, skipIfEnabled: false, routeRulesEnabled: false },
  ...overrides
});

export const workflowTemplates = [
  {
    id: 'leave_standard',
    name: 'Leave Request — Standard',
    description: 'Employee submits → HR review → Manager approval → Admin final approval.',
    appliesTo: 'leave',
    status: 'draft',
    steps: [baseStep({ role: 'hr', escalationRole: 'manager' }), baseStep({ role: 'manager', escalationRole: 'admin' }), baseStep({ role: 'admin', escalationRole: null })]
  },
  {
    id: 'project_approval',
    name: 'Project Approval — Manager → Admin',
    description: 'Fast-track project approvals with escalation to Admin.',
    appliesTo: 'project',
    status: 'draft',
    steps: [baseStep({ role: 'manager', escalationRole: 'admin' }), baseStep({ role: 'admin', escalationRole: null, slaHours: 48 })]
  },
  {
    id: 'equipment_request',
    name: 'Equipment Request — HR → Admin',
    description: 'HR validates request, Admin approves budget/procurement.',
    appliesTo: 'asset',
    status: 'draft',
    steps: [baseStep({ role: 'hr', escalationRole: 'admin' }), baseStep({ role: 'admin', escalationRole: null })]
  }
];

