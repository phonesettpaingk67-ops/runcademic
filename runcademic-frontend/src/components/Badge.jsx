const STATUS_STYLES = {
  open:        'bg-blue-50 text-blue-700 border border-blue-100',
  in_progress: 'bg-amber-50 text-amber-700 border border-amber-100',
  'in progress':'bg-amber-50 text-amber-700 border border-amber-100',
  waiting:     'bg-orange-50 text-orange-700 border border-orange-100',
  resolved:    'bg-emerald-50 text-emerald-700 border border-emerald-100',
  closed:      'bg-gray-100 text-gray-500 border border-gray-200',
  pending:     'bg-amber-50 text-amber-700 border border-amber-100',
  done:        'bg-emerald-50 text-emerald-700 border border-emerald-100',
  scheduled:   'bg-blue-50 text-blue-700 border border-blue-100',
  cancelled:   'bg-red-50 text-red-700 border border-red-100',
  completed:   'bg-emerald-50 text-emerald-700 border border-emerald-100',
  active:      'bg-emerald-50 text-emerald-700 border border-emerald-100',
  inactive:    'bg-gray-100 text-gray-500 border border-gray-200',
  high:        'bg-red-50 text-red-700 border border-red-100',
  urgent:      'bg-red-100 text-red-800 border border-red-200',
  medium:      'bg-amber-50 text-amber-700 border border-amber-100',
  low:         'bg-green-50 text-green-700 border border-green-100',
};

const LABELS = {
  in_progress: 'In Progress',
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

export default function Badge({ status }) {
  if (!status) return null;
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const style = STATUS_STYLES[key] || STATUS_STYLES[status.toLowerCase()] || 'bg-gray-100 text-gray-600 border border-gray-200';
  const label = LABELS[key] || status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
