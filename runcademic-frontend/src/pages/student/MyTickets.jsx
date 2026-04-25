import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { api } from '../../services/api';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

function fmtDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyTickets() {
  const [filter, setFilter] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');

  useEffect(() => {
    api.tickets.list()
      .then(res => {
        const all = res.data?.data || res.data || [];
        const mine = all
          .filter(t => Number(t.user_id || t.created_by) === Number(user.id))
          .map(t => ({
            id: t.id, title: t.title,
            status: t.status || 'open',
            priority: t.priority || 'medium',
            department: t.category || 'general',
            created: t.created_at,
          }));
        setTickets(mine);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load tickets.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  const norm = s => (s || '').toLowerCase().replace(/\s+/g, '_');
  const filtered = filter === 'all' ? tickets : tickets.filter(t => norm(t.status) === filter);
  const count = key => key === 'all' ? tickets.length : tickets.filter(t => norm(t.status) === key).length;

  return (
    <Layout role="student">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Track all your submitted service requests.</p>
        </div>
        <Link to="/student/submit-ticket"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm">
          + New Ticket
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-6 w-fit">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-[#E05F6B] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}>
            {f.label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {count(f.key)}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Loading tickets...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm mb-3">No tickets found.</p>
            <Link to="/student/submit-ticket" className="text-xs font-semibold text-[#E05F6B] hover:underline">Submit your first ticket →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{t.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{t.title}</td>
                  <td className="px-5 py-4 text-gray-500 capitalize">{t.department}</td>
                  <td className="px-5 py-4"><Badge status={t.priority} /></td>
                  <td className="px-5 py-4"><Badge status={t.status} /></td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{fmtDate(t.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
