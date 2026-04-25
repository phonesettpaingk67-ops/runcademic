export default function PriorityBadge({ priority }) {
  const priorityStyles = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityStyles[priority] || priorityStyles.medium}`}>
      {priorityLabels[priority] || priority}
    </span>
  );
}
