import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';

const SCHEDULES = [
  { id: 1, num: 1, title: 'PHIL-401 — Phenomenology lecture',           createdBy: 'Idris Patel',    assignedTo: 'PHIL-401',          date: '2026-04-28', start: '10:00', end: '11:20', location: 'Babbage Hall 214' },
  { id: 2, num: 2, title: 'Office hours — Dr. Patel',                   createdBy: 'Idris Patel',    assignedTo: 'office hours',      date: '2026-04-28', start: '13:00', end: '15:00', location: 'Gauss 308' },
  { id: 3, num: 3, title: 'CS-220 lab session',                         createdBy: 'Idris Patel',    assignedTo: 'CS-220 students',   date: '2026-04-29', start: '09:00', end: '10:50', location: 'Turing Lab B' },
  { id: 4, num: 4, title: 'Library research workshop',                  createdBy: 'Karima Boutros', assignedTo: 'Library group',     date: '2026-04-30', start: '14:00', end: '15:30', location: 'Library Annex' },
  { id: 5, num: 5, title: 'Departmental seminar — Renaissance Economics', createdBy: 'Sigrid Olsen', assignedTo: 'Department',        date: '2026-05-02', start: '16:00', end: '17:30', location: 'Erasmus Hall' },
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AllSchedules() {
  const schedules = SCHEDULES;

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator</div>
            <h1>
              <span className="serif italic" style={{ color: 'var(--accent)' }}>Schedules</span>.
            </h1>
            <p className="sub">Every event across all instructors.</p>
          </div>
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          {schedules.length === 0 ? (
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>No schedules found</h4>
              <p>Schedules created by instructors will appear here.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Event</th>
                  <th style={{ width: 140 }}>Created by</th>
                  <th style={{ width: 160 }}>Assigned to</th>
                  <th style={{ width: 130 }}>Start</th>
                  <th style={{ width: 130 }}>End</th>
                  <th style={{ width: 160 }}>Location</th>
                  <th style={{ width: 120 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td className="id">{String(s.num).padStart(2, '0')}</td>
                    <td className="title">
                      <span className="row gap-2">
                        <span style={{ color: 'var(--accent)' }}>{I.calendar(13)}</span>
                        {s.title}
                      </span>
                    </td>
                    <td>{s.createdBy}</td>
                    <td className="muted">{s.assignedTo}</td>
                    <td className="date">{formatDate(s.date)} · {s.start}</td>
                    <td className="date">{formatDate(s.date)} · {s.end}</td>
                    <td>{s.location}</td>
                    <td><Badge status="open" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
