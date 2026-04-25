import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock3,
  RefreshCw,
  CheckCircle2,
  Plus,
  CalendarDays,
} from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { api } from '../../services/api';

export default function StudentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  const recent = tickets.slice(0, 5);
  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;

  return (
    <Layout role="student">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good {getGreeting()}, {firstName(user.name)}!</h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your account activity.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Ticket} label="Total Tickets" value={loading ? '—' : tickets.length} color="blue" />
        <StatCard icon={Clock3} label="Open" value={loading ? '—' : open} color="coral" />
        <StatCard icon={RefreshCw} label="In Progress" value={loading ? '—' : inProgress} color="yellow" />
        <StatCard icon={CheckCircle2} label="Resolved" value={loading ? '—' : resolved} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent Tickets</h2>
            <Link to="/student/tickets" className="text-xs text-[#E05F6B] font-semibold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-gray-400 text-sm mb-3">No tickets submitted yet.</p>
                <Link to="/student/submit-ticket" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#E05F6B] px-4 py-2 rounded-lg hover:bg-[#d4515d] transition-colors">
                  + Submit a ticket
                </Link>
              </div>
            ) : recent.map(t => (
              <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-500">#{t.id}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{t.department} · {t.priority} priority</p>
                  </div>
                </div>
                <Badge status={t.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/student/submit-ticket" className="flex items-center gap-3 p-3 rounded-xl bg-[#E05F6B]/5 hover:bg-[#E05F6B]/10 border border-[#E05F6B]/10 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-[#E05F6B] flex items-center justify-center shrink-0">
                  <Plus size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Submit Ticket</p>
                  <p className="text-xs text-gray-400">Report an issue</p>
                </div>
              </Link>
              <Link to="/student/tickets" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100/60 border border-blue-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                  <Ticket size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">My Tickets</p>
                  <p className="text-xs text-gray-400">Track your requests</p>
                </div>
              </Link>
              <Link to="/student/schedules" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                  <CalendarDays size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Schedules</p>
                  <p className="text-xs text-gray-400">View upcoming events</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Status summary */}
          {!loading && tickets.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Ticket Status</h2>
              <div className="space-y-2">
                {[
                  { label: 'Open', count: open, color: 'bg-blue-500' },
                  { label: 'In Progress', count: inProgress, color: 'bg-amber-500' },
                  { label: 'Resolved', count: resolved, color: 'bg-emerald-500' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-semibold text-gray-700">{s.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: tickets.length ? `${(s.count / tickets.length) * 100}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function firstName(name) {
  return name ? name.split(' ')[0] : 'there';
}
