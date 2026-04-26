import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const DEPT_LABELS = {
  general: 'General',
  it: 'IT Support',
  admin: 'Administration',
  finance: 'Finance',
  library: 'Library',
  registrar: 'Registrar',
  academic: 'Academic Affairs',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function firstName(name) { return name ? name.split(' ')[0] : 'there'; }

export default function StudentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');

  useEffect(() => {
    api.tickets.list()
      .then((res) => {
        const all = res.data?.data || res.data || [];
        const mine = all
          .filter((t) => Number(t.user_id || t.created_by) === Number(user.id))
          .map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status || 'open',
            priority: t.priority || 'medium',
            department: t.category || 'general',
            created: t.created_at,
          }));
        setTickets(mine);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const counts = useMemo(() => {
    const c = { open: 0, in_progress: 0, waiting: 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => { if (c[t.status] !== undefined) c[t.status] += 1; });
    return c;
  }, [tickets]);

  const total = tickets.length;
  const recent = tickets.slice(0, 5);
  const activeFocus = counts.open + counts.in_progress;
  const distinctDepts = new Set(tickets.filter((t) => t.status !== 'closed' && t.status !== 'resolved').map((t) => t.department)).size;

  return (
    <Layout role="student">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Student portal · Spring 2026</div>
            <h1>{getGreeting()}, <span className="serif italic" style={{ color: 'var(--accent)' }}>{firstName(user.name)}</span>.</h1>
            <p className="sub">Here's where your requests stand today.</p>
          </div>
          <div className="row gap-3">
            <Link to="/student/submit-ticket" className="btn btn-accent">{I.plus(14)} New ticket</Link>
          </div>
        </div>

        <div className="hero-metric">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-eyebrow">{I.bookmark(14)} Active focus · open + in progress</div>
            <div className="hero-num">
              {loading ? '—' : activeFocus}
            </div>
            <div className="hero-cap">
              You have <em>{loading ? '…' : `${activeFocus} open requests`}</em>
              {!loading && ` across ${distinctDepts} ${distinctDepts === 1 ? 'department' : 'departments'}`}.
            </div>
          </div>
          <div className="chip-row">
            <div className="chip">
              <div className="chip-label">Total</div>
              <div className="chip-num">{loading ? '—' : total}</div>
            </div>
            <div className="chip">
              <div className="chip-label"><span className="dot" style={{ background: 'var(--st-progress)' }} />In progress</div>
              <div className="chip-num">{loading ? '—' : counts.in_progress}</div>
            </div>
            <div className="chip">
              <div className="chip-label"><span className="dot" style={{ background: 'var(--st-resolved)' }} />Resolved</div>
              <div className="chip-num">{loading ? '—' : counts.resolved}</div>
            </div>
          </div>
        </div>

        <div className="split">
          <div className="card">
            <div className="card-head">
              <div>
                <h3 className="card-title">Recent tickets</h3>
                <div className="fine" style={{ marginTop: 2 }}>Last {recent.length} of {total}</div>
              </div>
              <Link to="/student/tickets" className="btn btn-ghost btn-sm">View all {I.arrowRight(12)}</Link>
            </div>
            <div className="list">
              {loading ? (
                <div className="empty"><p>Loading…</p></div>
              ) : recent.length === 0 ? (
                <div className="empty">
                  <div className="glyph">¶</div>
                  <h4>No tickets yet</h4>
                  <p>Submit your first request and it'll appear here.</p>
                  <Link to="/student/submit-ticket" className="btn btn-accent">{I.plus()} Submit a ticket</Link>
                </div>
              ) : recent.map((t) => (
                <Link key={t.id} to="/student/tickets" className="list-row">
                  <span className="id mono">#{t.id}</span>
                  <div>
                    <div className="ttl">{t.title}</div>
                    <div className="meta">
                      <span>{DEPT_LABELS[t.department] || t.department}</span>
                      <span style={{ color: 'var(--ink-4)' }}>·</span>
                      <span className="pri" data-pri={t.priority}>{t.priority}</span>
                    </div>
                  </div>
                  <Badge status={t.status} />
                  <span className="row-action">{I.arrowRight(12)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="col gap-6">
            <div className="card">
              <div className="card-head"><h3 className="card-title">Quick actions</h3></div>
              <div className="qa">
                <Link to="/student/submit-ticket" className="qa-item">
                  <span className="ic">{I.send(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>Submit a ticket</div><div className="fine">2 min</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/student/tickets" className="qa-item">
                  <span className="ic">{I.ticket(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>My tickets</div><div className="fine">{total} total</div></div>
                  <span className="arrow">{I.arrowRight(14)}</span>
                </Link>
                <Link to="/student/schedules" className="qa-item">
                  <span className="ic">{I.calendar(16)}</span>
                  <div><div style={{ fontWeight: 500 }}>My schedule</div><div className="fine">This week</div></div>
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
