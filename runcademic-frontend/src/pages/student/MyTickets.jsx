import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const DEPT_LABELS = {
  general: 'General',
  it: 'IT Support',
  admin: 'Administration',
  finance: 'Finance',
  library: 'Library',
  registrar: 'Registrar',
  academic: 'Academic Affairs',
};

function fmtDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');

export default function MyTickets() {
  const [tab, setTab] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
  const navigate = useNavigate();

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
      .catch((err) => setError(err.response?.data?.message || 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const counts = useMemo(() => {
    const c = { all: tickets.length, open: 0, in_progress: 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => { const k = norm(t.status); if (c[k] !== undefined) c[k] += 1; });
    return c;
  }, [tickets]);

  const filtered = tab === 'all' ? tickets : tickets.filter((t) => norm(t.status) === tab);

  return (
    <Layout role="student">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Student portal · Requests</div>
            <h1>My tickets.</h1>
            <p className="sub">Everything you've submitted, with current status.</p>
          </div>
          <Link to="/student/submit-ticket" className="btn btn-accent">{I.plus(14)} New ticket</Link>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className="tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}<span className="count">{counts[t.id] || 0}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="empty"><p>Loading…</p></div>
          ) : error ? (
            <div className="alert" data-tone="error" style={{ margin: 24 }}>
              <span className="ic">{I.alert(16)}</span><span>{error}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>No tickets in this view</h4>
              <p>Try a different filter or submit a new request.</p>
              <Link to="/student/submit-ticket" className="btn btn-accent">{I.plus()} Submit a ticket</Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>ID</th>
                  <th>Title</th>
                  <th style={{ width: 160 }}>Department</th>
                  <th style={{ width: 110 }}>Priority</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 110 }} className="sortable" data-sort>Date <span className="arr">↓</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/student/tickets/${t.id}`)} style={{ cursor: 'pointer' }}>
                    <td className="id">#{t.id}</td>
                    <td className="title">{t.title}</td>
                    <td>{DEPT_LABELS[t.department] || t.department}</td>
                    <td><span className="pri" data-pri={t.priority}>{t.priority}</span></td>
                    <td><Badge status={t.status} /></td>
                    <td className="date">{fmtDate(t.created)}</td>
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
