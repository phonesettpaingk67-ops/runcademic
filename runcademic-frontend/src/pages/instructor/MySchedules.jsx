import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import I from '../../components/Icon';
import { api } from '../../services/api';

function formatWeekdayShort(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const md = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${weekday} · ${md}`;
}

function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function MySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    api.schedules
      .list()
      .then((res) => setSchedules(res.data?.data || res.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedules.'))
      .finally(() => setLoading(false));
  }, []);

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
            <p className="sub">Sessions you've created across the term.</p>
          </div>
          <Link to="/instructor/create-schedule" className="btn btn-accent">
            {I.plus(14)} Create schedule
          </Link>
        </div>

        {error && (
          <div className="alert" data-tone="error" style={{ marginBottom: 14 }}>
            <span className="ic">{I.alert(16)}</span><span>{error}</span>
          </div>
        )}
        {info && (
          <div className="alert" data-tone="success" style={{ marginBottom: 14 }}>
            <span className="ic">{I.check(16)}</span><span>{info}</span>
          </div>
        )}

        {loading ? (
          <div className="card card-pad"><p className="muted">Loading schedules…</p></div>
        ) : schedules.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>No schedules yet</h4>
              <p>Create your first session to see it appear here.</p>
              <Link to="/instructor/create-schedule" className="btn btn-secondary btn-sm">
                {I.plus(12)} Create schedule
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {schedules.map((s) => {
              const start = s.start_time || s.startTime || s.date;
              const end = s.end_time || s.endTime;
              const studentCount = s.student_count ?? s.students;
              return (
                <div key={s.id} className="card card-pad" style={{ padding: 22 }}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                    <div className="eyebrow">{formatWeekdayShort(start)}</div>
                    {studentCount != null && (
                      <span className="mono fine">
                        {studentCount > 0 ? `${studentCount} students` : 'open'}
                      </span>
                    )}
                  </div>
                  <div className="serif" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25, marginBottom: 14 }}>
                    {s.title}
                  </div>
                  <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: 'var(--accent)' }}>{I.clock(13)}</span>
                    <span className="mono">{formatTime(start)}{end ? `–${formatTime(end)}` : ''}</span>
                  </div>
                  <div className="row gap-2" style={{ color: 'var(--ink-3)', fontSize: 12.5, marginBottom: 16 }}>
                    <span style={{ color: 'var(--ink-4)' }}>{I.pin(13)}</span>
                    <span>{s.location || '—'}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
