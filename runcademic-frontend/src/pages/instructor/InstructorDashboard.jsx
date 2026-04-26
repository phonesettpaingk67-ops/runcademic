import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, CalendarDays, CheckSquare, Plus, Clock3 } from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { api } from '../../services/api';
import { animateCards, animateList, animatePageEnter } from '../../utils/animations';

export default function InstructorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');

  useEffect(() => {
    api.tickets.list()
      .then(res => {
        const all = res.data?.data || res.data || [];
        const assigned = all.filter(t =>
          Number(t.assigned_to) === Number(user.id)
        );
        setTickets(assigned);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => {
    animatePageEnter('.page-content');
  }, []);

  useEffect(() => {
    if (!loading) {
      animateCards('.stat-card');
      animateList('.quick-action');
      animateList('.ticket-row');
    }
  }, [loading, tickets.length]);

  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const recent = tickets.slice(0, 4);

  return (
    <Layout role="instructor">
      <div ref={pageRef} className="page-content">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user.name?.split(' ')[0] || 'Instructor'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your classes, schedules, and assigned tickets.
        </p>
      </div>

      {/* Stats */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
      )}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card"><StatCard icon={Ticket} label="Assigned Tickets" value={tickets.length} color="blue" /></div>
          <div className="stat-card"><StatCard icon={Clock3} label="Open" value={open} color="coral" /></div>
          <div className="stat-card"><StatCard icon={CheckSquare} label="In Progress" value={inProgress} color="yellow" /></div>
          <div className="stat-card"><StatCard icon={CalendarDays} label="Schedules" value="—" color="green" /></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assigned Tickets */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Assigned Tickets</h2>
            <Link to="/instructor/tickets" className="text-xs text-[#E05F6B] font-semibold hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-6 py-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400 text-sm">
                No tickets assigned to you yet.
              </div>
            ) : (
              recent.map(t => (
                <div key={t.id} className="ticket-row flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-gray-500">#{t.id}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400 capitalize">
                        {t.category || 'general'} · {t.priority || 'medium'} priority
                      </p>
                    </div>
                  </div>
                  <Badge status={t.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/instructor/tickets"
                className="quick-action flex items-center gap-3 p-3 rounded-xl bg-[#E05F6B]/5 hover:bg-[#E05F6B]/10 border border-[#E05F6B]/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#E05F6B] flex items-center justify-center shrink-0">
                  <Ticket size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Assigned Tickets</p>
                  <p className="text-xs text-gray-400">Review student requests</p>
                </div>
              </Link>
              <Link to="/instructor/create-schedule"
                className="quick-action flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100/60 border border-blue-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                  <Plus size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Create Schedule</p>
                  <p className="text-xs text-gray-400">Add a new event</p>
                </div>
              </Link>
              <Link to="/instructor/schedules"
                className="quick-action flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/60 border border-emerald-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                  <CalendarDays size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">My Schedules</p>
                  <p className="text-xs text-gray-400">View your events</p>
                </div>
              </Link>
              <Link to="/instructor/tasks"
                className="quick-action flex items-center gap-3 p-3 rounded-xl bg-violet-50 hover:bg-violet-100/60 border border-violet-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center shrink-0">
                  <CheckSquare size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">My Tasks</p>
                  <p className="text-xs text-gray-400">Track your tasks</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
