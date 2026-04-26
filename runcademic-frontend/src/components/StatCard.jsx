import { isValidElement } from 'react';

// Re-skinned chip-style stat card to match the calm-academic design.
// Uses serif numerals + mono uppercase label, in line with the design's .chip primitive.
export default function StatCard({ icon, label, value, trend }) {
  const isComponentIcon =
    (typeof icon === 'function') ||
    (typeof icon === 'object' && icon !== null && !isValidElement(icon) && '$$typeof' in icon);
  const Icon = isComponentIcon ? icon : null;

  return (
    <div className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {(Icon || isValidElement(icon)) && (
          <span
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--surface-2)',
              color: 'var(--ink-2)',
              display: 'grid', placeItems: 'center',
            }}
          >
            {Icon ? <Icon size={16} /> : icon}
          </span>
        )}
        <span className="chip-label">{label}</span>
      </div>
      <div className="chip-num" style={{ marginTop: 'auto' }}>{value}</div>
      {trend && <div className="fine">{trend}</div>}
    </div>
  );
}
