import { isValidElement } from 'react';

const palette = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   icon: 'bg-blue-100',   border: 'border-blue-100' },
  red:    { bg: 'bg-red-50',    text: 'text-red-600',    icon: 'bg-red-100',    border: 'border-red-100' },
  green:  { bg: 'bg-emerald-50',text: 'text-emerald-600',icon: 'bg-emerald-100',border: 'border-emerald-100' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600', icon: 'bg-violet-100', border: 'border-violet-100' },
  yellow: { bg: 'bg-amber-50',  text: 'text-amber-600',  icon: 'bg-amber-100',  border: 'border-amber-100' },
  coral:  { bg: 'bg-rose-50',   text: 'text-rose-600',   icon: 'bg-rose-100',   border: 'border-rose-100' },
};

export default function StatCard({ icon, label, value, color = 'blue', trend }) {
  const c = palette[color] || palette.blue;
  const isComponentIcon =
    (typeof icon === 'function') ||
    (typeof icon === 'object' && icon !== null && !isValidElement(icon) && '$$typeof' in icon);
  const Icon = isComponentIcon ? icon : null;

  return (
    <div className={`hover-lift bg-white rounded-2xl border ${c.border} p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
      <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center shrink-0`}>
        {Icon ? (
          <Icon size={20} className={c.text} />
        ) : isValidElement(icon) ? (
          icon
        ) : (
          <span className="text-xl">{icon}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
