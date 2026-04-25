import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

function formatDateTime(str) {
  if (!str) return '-';
  const d = new Date(str);
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AllSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [schedulesRes, usersRes] = await Promise.all([
          api.schedules.list(),
          api.users.list(),
        ]);

        const users = usersRes.data?.data || usersRes.data || [];
        const userMap = {};
        users.forEach((u) => {
          const id = u.user_id ?? u.id;
          if (id == null) return;
          userMap[id] = u.name || [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email || `User ${id}`;
        });
        setUsersById(userMap);

        const data = schedulesRes.data?.data || schedulesRes.data || [];
        setSchedules(data.map((s) => ({
          id: s.id,
          title: s.event_title || s.title || 'Untitled',
          createdBy: s.user_id,
          assignedTo: s.assigned_to,
          startTime: s.start_time,
          endTime: s.end_time,
          location: s.location || '-',
          type: s.event_type || s.type || 'event',
          status: s.status || 'scheduled',
          description: s.description || '',
        })));
      } catch (err) {
        // If schedules API doesn't exist yet, show empty state
        if (err.response?.status === 404) {
          setSchedules([]);
        } else {
          setError(err.response?.data?.message || 'Failed to load schedules.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'scheduled') return 'bg-blue-100 text-blue-800';
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Schedules</h1>
          <p className="text-gray-500 text-sm mt-1">View all schedules across the system.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-500 py-12">Loading schedules...</p>
          ) : schedules.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E05F6B]/10 mb-4">
                <CalendarDays size={22} className="text-[#E05F6B]" />
              </div>
              <p className="text-gray-500 text-lg">No schedules found.</p>
              <p className="text-gray-400 text-sm mt-2">Schedules created by instructors will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Event</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created By</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned To</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Start</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">End</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-500">#{s.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{s.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{usersById[s.createdBy] || `User ${s.createdBy ?? '-'}`}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.assignedTo ? usersById[s.assignedTo] || `User ${s.assignedTo}` : '-'}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDateTime(s.startTime)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{formatDateTime(s.endTime)}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">{s.location}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
