import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

const STATUS_COLORS = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  waiting: 'bg-orange-400',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

const DEPT_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];

export default function Reports() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, usersRes] = await Promise.all([
          api.tickets.list(),
          api.users.list(),
        ]);
        setTickets(ticketsRes.data?.data || ticketsRes.data || []);
        setUsers(usersRes.data?.data || usersRes.data || []);
      } catch {
        setTickets([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats from real data
  const total = tickets.length;
  const byStatus = ['open', 'in_progress', 'waiting', 'resolved', 'closed'].map((s) => ({
    status: s.replace('_', ' '),
    key: s,
    count: tickets.filter((t) => (t.status || '').toLowerCase() === s).length,
    percentage: total ? Math.round((tickets.filter((t) => (t.status || '').toLowerCase() === s).length / total) * 100) : 0,
  })).filter((s) => s.count > 0);

  const deptMap = {};
  tickets.forEach((t) => {
    const d = t.category || t.department || 'general';
    deptMap[d] = (deptMap[d] || 0) + 1;
  });
  const byDept = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  const resolved = tickets.filter((t) => ['resolved', 'closed'].includes((t.status || '').toLowerCase())).length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  const openCount = tickets.filter((t) => (t.status || '').toLowerCase() === 'open').length;

  const roleMap = {};
  users.forEach((u) => { roleMap[u.role] = (roleMap[u.role] || 0) + 1; });

  return (
    <Layout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time system analytics.</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
            Loading reports...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{openCount}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Resolution Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{resolutionRate}%</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Tickets by Status</h2>
                {byStatus.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No ticket data yet.</p>
                ) : (
                  <div className="space-y-4">
                    {byStatus.map((item) => (
                      <div key={item.key}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700 capitalize">{item.status}</span>
                          <span className="text-gray-500 text-sm">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div className={`h-3 rounded-full ${STATUS_COLORS[item.key] || 'bg-gray-400'}`} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Tickets by Department</h2>
                {byDept.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No ticket data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {byDept.map(([dept, count], idx) => (
                      <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${DEPT_COLORS[idx % DEPT_COLORS.length]}`} />
                          <span className="font-medium text-gray-700 capitalize">{dept}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-[#E05F6B]">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Users by Role</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(roleMap).map(([role, count]) => (
                  <div key={role} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-gray-500 text-sm capitalize mt-1">{role}s</p>
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
