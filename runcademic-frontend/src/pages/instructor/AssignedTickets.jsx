import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const DEPT_LABELS = {
  general: 'General', it: 'IT Support', admin: 'Administration', finance: 'Finance',
  library: 'Library', registrar: 'Registrar', academic: 'Academic Affairs',
};

function fmtDate(str) {
  if (!str || str === '-') return '—';
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AssignedTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const currentUser = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
        const response = await api.tickets.list();
        const data = response.data?.data || response.data || [];
        const assigned = data
          .filter((t) => Number(t.assigned_to) === Number(currentUser.id))
          .map((t) => ({
            id: t.id, title: t.title,
            status: t.status || 'open',
            priority: t.priority || 'medium',
            department: t.category || 'general',
            created: t.created || t.created_at || '-',
          }));
        setTickets(assigned);
      } catch (e) {
        setErrorMessage(e.response?.data?.message || 'Failed to load assigned tickets.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.tickets.update(id, { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e) {
      setErrorMessage(e.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleRowClick = (e, id) => {
    if (e.target.closest('select') || e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/instructor/tickets/${id}`);
  };

  return (
    <Layout role="instructor">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal · Queue</div>
            <h1>Assigned tickets.</h1>
            <p className="sub">Update status inline or open a ticket for full triage.</p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert" data-tone="error" style={{ marginBottom: 16 }}>
            <span className="ic">{I.alert(16)}</span><span>{errorMessage}</span>
          </div>
        )}

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="empty"><p>Loading assigned tickets…</p></div>
          ) : tickets.length === 0 ? (
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>Queue is clear</h4>
              <p>No tickets are currently assigned to you.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th>Title</th>
                  <th style={{ width: 160 }}>Department</th>
                  <th style={{ width: 110 }}>Priority</th>
                  <th style={{ width: 180 }}>Status</th>
                  <th style={{ width: 100 }}>Created</th>
                  <th style={{ width: 100 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} onClick={(e) => handleRowClick(e, t.id)} style={{ cursor: 'pointer' }}>
                    <td className="id">#{t.id}</td>
                    <td className="title">{t.title}</td>
                    <td>{DEPT_LABELS[t.department] || t.department}</td>
                    <td><span className="pri" data-pri={t.priority}>{t.priority}</span></td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: '6px 10px', fontSize: 13 }}
                        value={(t.status || '').toLowerCase()}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="waiting">Waiting</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="date">{fmtDate(t.created)}</td>
                    <td>
                      <Link to={`/instructor/tickets/${t.id}`} className="btn btn-ghost btn-sm" style={{ padding: '0 8px' }}>
                        View {I.arrowRight(12)}
                      </Link>
                    </td>
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
