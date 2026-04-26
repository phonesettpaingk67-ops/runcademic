import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import I from '../../components/Icon';
import { api } from '../../services/api';

const DEPARTMENT_LIST = [
  { key: 'general',   name: 'General',          glyph: '¶' },
  { key: 'it',        name: 'IT Support',       glyph: '⌘' },
  { key: 'admin',     name: 'Administration',   glyph: '§' },
  { key: 'finance',   name: 'Finance',          glyph: '$' },
  { key: 'library',   name: 'Library',          glyph: '℞' },
  { key: 'registrar', name: 'Registrar',        glyph: '✎' },
  { key: 'academic',  name: 'Academic Affairs', glyph: '𝒜' },
];

export default function Departments() {
  const [ticketsByDept, setTicketsByDept] = useState({});
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState('');

  const flashInfo = (msg) => {
    setInfo(msg);
    setTimeout(() => setInfo(''), 2500);
  };

  useEffect(() => {
    api.tickets
      .list()
      .then((res) => {
        const tickets = res.data?.data || res.data || [];
        const counts = {};
        tickets.forEach((t) => {
          const d = t.category || t.department || 'general';
          counts[d] = (counts[d] || 0) + 1;
        });
        setTicketsByDept(counts);
      })
      .catch(() => setTicketsByDept({}))
      .finally(() => setLoading(false));
  }, []);

  const totalTickets = Object.values(ticketsByDept).reduce((a, b) => a + b, 0);

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator</div>
            <h1>
              <span className="serif italic" style={{ color: 'var(--accent)' }}>Departments</span>.
            </h1>
            <p className="sub">Seven channels, one routing system.</p>
          </div>
          <button className="btn btn-accent" onClick={() => flashInfo('Add-department feature coming soon.')}>
            {I.plus(14)} Add department
          </button>
        </div>

        {info && (
          <div className="alert" data-tone="success" style={{ marginBottom: 14 }}>
            <span className="ic">{I.check(16)}</span><span>{info}</span>
          </div>
        )}

        {loading ? (
          <div className="card card-pad"><p className="muted">Loading departments…</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {DEPARTMENT_LIST.map((d) => {
              const c = ticketsByDept[d.key] || 0;
              const pct = totalTickets ? Math.round((c / totalTickets) * 100) : 0;
              return (
                <div key={d.key} className="card card-pad" style={{ padding: 22 }}>
                  <div className="row gap-3" style={{ marginBottom: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 6,
                      background: 'var(--accent-soft)',
                      display: 'grid', placeItems: 'center',
                      fontFamily: 'var(--serif)', fontStyle: 'italic',
                      fontSize: 24, color: 'var(--accent-ink)', fontWeight: 600,
                    }}>
                      {d.glyph}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>{d.name}</div>
                      <div className="fine mono">{d.key}</div>
                    </div>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span className="muted">Tickets</span>
                    <span className="mono">
                      <strong style={{ color: 'var(--ink)' }}>{c}</strong> · {pct}%
                    </span>
                  </div>
                  <div className="bar"><span style={{ width: `${pct}%` }} /></div>
                  <div className="row gap-2" style={{ paddingTop: 16, marginTop: 16, borderTop: '1px solid var(--rule-soft)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => flashInfo('Edit feature coming soon.')}>
                      {I.edit(13)} Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => flashInfo('Delete feature coming soon.')}>
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
