import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import I from '../../components/Icon';
import { api } from '../../services/api';

const STATUS_LABEL = {
  open:        'Open',
  in_progress: 'In progress',
  waiting:     'Waiting',
  resolved:    'Resolved',
  closed:      'Closed',
};

const DEPT_GLYPH = {
  general: '¶', it: '⌘', admin: '§', finance: '$',
  library: '℞', registrar: '✎', academic: '𝒜',
};

function StatusBar({ status, value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const cls = status === 'in_progress' ? 's-progress' : `s-${status}`;
  return (
    <div className={`bar ${cls}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Reports() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [ticketsRes, usersRes] = await Promise.all([
          api.tickets.list(),
          api.users.list(),
        ]);
        setTickets(ticketsRes.data?.data || ticketsRes.data || []);
        setUsers(usersRes.data?.data || usersRes.data || []);
      } catch {
        setTickets([]); setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const total = tickets.length;
  const counts = ['open', 'in_progress', 'waiting', 'resolved', 'closed']
    .reduce((acc, k) => {
      acc[k] = tickets.filter((t) => (t.status || '').toLowerCase() === k).length;
      return acc;
    }, {});
  const resolved = counts.resolved + counts.closed;
  const rate = total ? Math.round((resolved / total) * 100) : 0;
  const openCount = counts.open;

  const deptMap = {};
  tickets.forEach((t) => {
    const d = t.category || t.department || 'general';
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const byDept = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  const roleMap = {};
  users.forEach((u) => { const r = u.role || 'student'; roleMap[r] = (roleMap[r] || 0) + 1; });
  const byRole = ['admin', 'instructor', 'student'].map((r) => ({ role: r, count: roleMap[r] || 0 }));

  const kpis = [
    { label: 'Total tickets',   value: total },
    { label: 'Open tickets',    value: openCount },
    { label: 'Resolution rate', value: `${rate}%` },
    { label: 'Total users',     value: users.length },
  ];

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator · Analytics</div>
            <h1>
              <span className="serif italic" style={{ color: 'var(--accent)' }}>Reports</span>.
            </h1>
            <p className="sub">A standing audit of system health, this term.</p>
          </div>
          <button className="btn btn-secondary btn-sm">Export PDF</button>
        </div>

        {loading ? (
          <div className="card card-pad"><p className="muted">Loading reports…</p></div>
        ) : (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
              background: 'var(--rule-soft)', borderRadius: 10, overflow: 'hidden',
              border: '1px solid var(--rule)', marginBottom: 24,
            }}>
              {kpis.map((k) => (
                <div key={k.label} style={{ background: 'var(--surface)', padding: '22px 24px' }}>
                  <div className="eyebrow">{k.label}</div>
                  <div className="serif" style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1 }}>
                    {k.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="split-narrow" style={{ marginBottom: 24 }}>
              <div className="card card-pad">
                <h3 className="card-title" style={{ fontSize: 18, marginBottom: 18 }}>Tickets by status</h3>
                {total === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>No ticket data yet.</p>
                ) : (
                  <div className="col gap-3">
                    {Object.keys(STATUS_LABEL).map((s) => {
                      const v = counts[s];
                      const pct = total > 0 ? Math.round((v / total) * 100) : 0;
                      return (
                        <div key={s} className="col" style={{ gap: 6 }}>
                          <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5 }}>
                            <span style={{ color: 'var(--ink)' }}>{STATUS_LABEL[s]}</span>
                            <span className="mono fine">{v} · {pct}%</span>
                          </div>
                          <StatusBar status={s} value={v} max={total} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="card card-pad">
                <h3 className="card-title" style={{ fontSize: 18, marginBottom: 18 }}>Tickets by department</h3>
                {byDept.length === 0 ? (
                  <p className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>No ticket data yet.</p>
                ) : (
                  <div className="col">
                    {byDept.map(([dept, count], i) => (
                      <div
                        key={dept}
                        className="row"
                        style={{
                          padding: '10px 0',
                          borderTop: i === 0 ? 0 : '1px solid var(--rule-soft)',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div className="row gap-3">
                          <span className="serif italic" style={{ color: 'var(--accent)', width: 20, textAlign: 'center', fontSize: 18 }}>
                            {DEPT_GLYPH[dept] || '¶'}
                          </span>
                          <span style={{ fontSize: 13.5, textTransform: 'capitalize' }}>{dept}</span>
                        </div>
                        <span
                          className="mono fine"
                          style={{
                            background: 'var(--surface-2)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            color: 'var(--ink-2)',
                          }}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card card-pad">
              <h3 className="card-title" style={{ fontSize: 18, marginBottom: 18 }}>Users by role</h3>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
                background: 'var(--rule-soft)', borderRadius: 8, overflow: 'hidden',
                border: '1px solid var(--rule)',
              }}>
                {byRole.map((r) => (
                  <div key={r.role} style={{ background: 'var(--surface)', padding: '20px 24px' }}>
                    <div className="eyebrow" style={{ textTransform: 'capitalize' }}>{r.role}</div>
                    <div className="serif" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1 }}>
                      {r.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
