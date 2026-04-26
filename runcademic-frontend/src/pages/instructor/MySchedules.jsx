import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import I from '../../components/Icon';

const SCHEDULES = [
  { id: 1, title: 'PHIL-401 — Phenomenology lecture', date: '2026-04-28', start: '10:00', end: '11:20', location: 'Babbage Hall 214', count: 32 },
  { id: 2, title: 'Office hours — Dr. Patel',          date: '2026-04-28', start: '13:00', end: '15:00', location: 'Gauss 308',        count: 0 },
  { id: 3, title: 'CS-220 lab session',                date: '2026-04-29', start: '09:00', end: '10:50', location: 'Turing Lab B',     count: 24 },
  { id: 4, title: 'Library research workshop',         date: '2026-04-30', start: '14:00', end: '15:30', location: 'Library Annex',    count: 18 },
  { id: 5, title: 'Departmental seminar — Renaissance Economics', date: '2026-05-02', start: '16:00', end: '17:30', location: 'Erasmus Hall', count: 60 },
];

function formatWeekdayShort(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const md = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${weekday} · ${md}`;
}

export default function MySchedules() {
  const [info, setInfo] = useState('');
  const flashInfo = (msg) => {
    setInfo(msg);
    setTimeout(() => setInfo(''), 2500);
  };

  return (
    <Layout role="instructor">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal · Calendar</div>
            <h1>
              My <span className="serif italic" style={{ color: 'var(--accent)' }}>schedules</span>.
            </h1>
            <p className="sub">Five sessions across the next two weeks.</p>
          </div>
          <Link to="/instructor/create-schedule" className="btn btn-accent">
            {I.plus(14)} Create schedule
          </Link>
        </div>

        {info && (
          <div className="alert" data-tone="success" style={{ marginBottom: 14 }}>
            <span className="ic">{I.check(16)}</span><span>{info}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {SCHEDULES.map((s) => (
            <div key={s.id} className="card card-pad" style={{ padding: 22 }}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="eyebrow">{formatWeekdayShort(s.date)}</div>
                <span className="mono fine">{s.count > 0 ? `${s.count} students` : 'open'}</span>
              </div>
              <div className="serif" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25, marginBottom: 14 }}>
                {s.title}
              </div>
              <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ color: 'var(--accent)' }}>{I.clock(13)}</span>
                <span className="mono">{s.start}–{s.end}</span>
              </div>
              <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 16 }}>
                <span style={{ color: 'var(--ink-4)' }}>{I.pin(13)}</span>
                <span>{s.location}</span>
              </div>
              <div className="row gap-2" style={{ paddingTop: 14, borderTop: '1px solid var(--rule-soft)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => flashInfo('Schedule editing will be available soon.')}>
                  {I.edit(13)} Edit
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => flashInfo('Schedule deletion will be available soon.')}>
                  {I.trash(13)} Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
