import Layout from '../../components/Layout';
import I from '../../components/Icon';

const SCHEDULES = [
  { id: 1, title: 'PHIL-401 — Phenomenology lecture', date: '2026-04-28', start: '10:00', end: '11:20', location: 'Babbage Hall 214' },
  { id: 2, title: 'Office hours — Dr. Patel',          date: '2026-04-28', start: '13:00', end: '15:00', location: 'Gauss 308' },
  { id: 3, title: 'CS-220 lab session',                date: '2026-04-29', start: '09:00', end: '10:50', location: 'Turing Lab B' },
  { id: 4, title: 'Library research workshop',         date: '2026-04-30', start: '14:00', end: '15:30', location: 'Library Annex' },
  { id: 5, title: 'Departmental seminar — Renaissance Economics', date: '2026-05-02', start: '16:00', end: '17:30', location: 'Erasmus Hall' },
];

function formatWeekday(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function Schedules() {
  const schedules = SCHEDULES;

  return (
    <Layout role="student">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Student portal · This week</div>
            <h1>
              Your <span className="serif italic" style={{ color: 'var(--accent)' }}>schedule</span>.
            </h1>
            <p className="sub">Lectures, labs, and office hours coming up.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {schedules.map((s) => (
            <div key={s.id} className="card card-pad" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>{formatWeekday(s.date)}</div>
              <div className="serif" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.25, marginBottom: 14 }}>
                {s.title}
              </div>
              <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: 'var(--accent)' }}>{I.clock(13)}</span>
                <span className="mono">{s.start}–{s.end}</span>
              </div>
              <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>
                <span style={{ color: 'var(--ink-4)' }}>{I.pin(13)}</span>
                <span>{s.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
