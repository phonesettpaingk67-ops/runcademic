import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const DEPARTMENTS = ['general', 'it', 'admin', 'finance', 'library', 'registrar', 'academic'];

function fmtDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.tickets.list(), api.users.list()])
      .then(([tr, ur]) => {
        setTickets(tr.data?.data || tr.data || []);
        setUsers(ur.data?.data || ur.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { open: 0, in_progress: 0, waiting: 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => { if (c[t.status] !== undefined) c[t.status] += 1; });
    return c;
  }, [tickets]);

  const total = tickets.length;
  const recent = [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const activeFocus = counts.open + counts.in_progress;

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator portal · Operations</div>
            <h1>The campus, <span className="serif italic" style={{ color: 'var(--accent)' }}>at a glance</span>.</h1>
            <p className="sub">Real-time view of tickets, users and infrastructure.</p>
          </div>
          <Link to="/admin/tickets" className="btn btn-secondary">All tickets {I.arrowRight(14)}</Link>
        </div>

        <div className="hero-metric">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-eyebrow">{I.bookmark(14)} Active queue · open + in progress</div>
            <div className="hero-num">{loading ? '—' : activeFocus}</div>
            <div className="hero-cap">
              <em>{loading ? '…' : `${activeFocus} tickets`}</em> active across {DEPARTMENTS.length} departments
              {loading ? '' : ` · ${users.length} users on file`}.
            </div>
          </div>
          <div className="chip-row">
            <div className="chip">
              <div className="chip-label">Total</div>
              <div className="chip-num">{loading ? '—' : total}</div>
            </div>
            <div className="chip">
              <div className="chip-label"><span className="dot" style={{ background: 'var(--st-open)' }} />Open</div>
              <div className="chip-num">{loading ? '—' : counts.open}</div>
            </div>
            <div className="chip">
              <div className="chip-label"><span className="dot" style={{ background: 'var(--st-progress)' }} />In progress</div>
              <div className="chip-num">{loading ? '—' : counts.in_progress}</div>
            </div>
          </div>
        </div>

        <div className="split">
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="card-head">
              <div>
                <h3 className="card-title">Recent tickets</h3>
                <div className="fine" style={{ marginTop: 2 }}>Newest {recent.length} of {total}</div>
              </div>
              <Link to="/admin/tickets" className="btn btn-ghost btn-sm">View all {I.arrowRight(12)}</Link>
            </div>
            {loading ? (
              <div className="empty"><p>Loading…</p></div>
            ) : recent.length === 0 ? (
              <div className="empty">
                <div className="glyph">¶</div>
                <h4>No tickets in the system</h4>
                <p>New requests will appear here as they're submitted.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>ID</th>
                    <th>Title</th>
                    <th style={{ width: 130 }}>Status</th>
                    <th style={{ width: 100 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id}>
                      <td className="id">#{t.id}</td>
                      <td className="title">{t.title}</td>
                      <td><Badge status={t.status} /></td>
                      <td className="date">{fmtDate(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="col gap-6">
            <div className="card">
              <div className="card-head"><h3 className="card-title">Operations</h3></div>
              <div className="qa">
                <Link to="/admin/tickets" className="qa-item">
                  <span className="ic">{I.ticket(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>All tickets</div><div className="fine">{total} total</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/admin/users" className="qa-item">
                  <span className="ic">{I.users(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>Users</div><div className="fine">{users.length} registered</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/admin/departments" className="qa-item">
                  <span className="ic">{I.building(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>Departments</div><div className="fine">{DEPARTMENTS.length} configured</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/admin/schedules" className="qa-item">
                  <span className="ic">{I.calendar(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>Schedules</div><div className="fine">All events</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/admin/reports" className="qa-item">
                  <span className="ic">{I.chart(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>Reports</div><div className="fine">Analytics</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
              </div>
            </div>

            {!loading && total > 0 && (
              <div className="card card-pad">
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 className="card-title" style={{ fontSize: 16 }}>Status summary</h3>
                  <span className="fine mono">{total} total</span>
                </div>
                <div className="col gap-3">
                  {['open', 'in_progress', 'waiting', 'resolved', 'closed'].map((s) => {
                    const v = counts[s] || 0;
                    const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                    const kind = s === 'in_progress' ? 'progress' : s;
                    return (
                      <div key={s} className="col" style={{ gap: 6 }}>
                        <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
                          <span style={{ color: 'var(--ink-2)', textTransform: 'capitalize' }}>{s.replace('_', ' ')}</span>
                          <span className="mono fine">{v} · {pct}%</span>
                        </div>
                        <div className={`bar s-${kind}`}><span style={{ width: pct + '%' }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
