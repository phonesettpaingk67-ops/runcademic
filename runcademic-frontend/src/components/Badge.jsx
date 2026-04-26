// Re-skinned to match the calm-academic design — uses .badge / data-status.
const STATUS_KEYS = new Set(['open', 'in_progress', 'waiting', 'resolved', 'closed']);

const LABELS = {
  in_progress: 'In progress',
  open: 'Open',
  resolved: 'Resolved',
  closed: 'Closed',
  waiting: 'Waiting',
  pending: 'Pending',
  done: 'Done',
  scheduled: 'Scheduled',
  cancelled: 'Cancelled',
  completed: 'Completed',
  active: 'Active',
  inactive: 'Inactive',
};

const STATUS_ALIAS = {
  pending: 'open',
  scheduled: 'open',
  done: 'resolved',
  completed: 'resolved',
  active: 'resolved',
  cancelled: 'closed',
  inactive: 'closed',
};

const PRIORITY_KEYS = new Set(['low', 'medium', 'high', 'urgent']);

export default function Badge({ status }) {
  if (!status) return null;
  const key = String(status).toLowerCase().replace(/\s+/g, '_');

  if (PRIORITY_KEYS.has(key)) {
    return <span className="pri" data-pri={key}>{key}</span>;
  }

  const mapped = STATUS_KEYS.has(key) ? key : (STATUS_ALIAS[key] || 'open');
  const label = LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="badge" data-status={mapped}>
      <span className="dot" />
      {label}
    </span>
  );
}
