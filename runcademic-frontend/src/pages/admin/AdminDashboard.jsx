import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { api } from '../../services/api';
import { animateCards, animateList, animatePageEnter } from '../../utils/animations';

const DEPARTMENTS = ['general','it','admin','finance','library','registrar','academic'];

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);

  useEffect(() => {
    Promise.all([api.tickets.list(), api.users.list()])
      .then(([tr, ur]) => {
        const t = tr.data?.data || tr.data || [];
        const u = ur.data?.data || ur.data || [];
        const map = {};
        u.forEach(usr => {
          const id = usr.user_id ?? usr.id;
          map[id] = usr.name || [usr.first_name, usr.last_name].filter(Boolean).join(' ').trim() || usr.email;
        });
        setTickets(t); setUsers(u); setUsersById(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    animatePageEnter('.page-content');
  }, []);

  useEffect(() => {
    if (!loading) {
      animateCards('.stat-card');
      animateList('.ticket-row');
    }
  }, [loading, tickets.length]);

  const open = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in_progress').length;
  const resolved = tickets.filter(t => ['resolved','closed'].includes(t.status)).length;
  const recent = [...tickets].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const QUICK_LINKS = [
    { to: '/admin/tickets', icon: Ticket, label: 'All Tickets', desc: `${tickets.length} total`, color: 'border-blue-100 bg-blue-50 hover:bg-blue-100/60' },
    { to: '/admin/users', icon: Users, label: 'Users', desc: `${users.length} registered`, color: 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100/60' },
    { to: '/admin/departments', icon: Building2, label: 'Departments', desc: `${DEPARTMENTS.length} departments`, color: 'border-violet-100 bg-violet-50 hover:bg-violet-100/60' },
    { to: '/admin/schedules', icon: CalendarDays, label: 'Schedules', desc: 'View all events', color: 'border-amber-100 bg-amber-50 hover:bg-amber-100/60' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports', desc: 'Analytics & insights', color: 'border-rose-100 bg-rose-50 hover:bg-rose-100/60' },
  ];

  return (
    <Layout role="admin">
      <div ref={pageRef} className="page-content">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time overview of your system.</p>
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
          <div className="stat-card"><StatCard icon={Ticket} label="Total Tickets" value={tickets.length} color="blue" /></div>
          <div className="stat-card"><StatCard icon={AlertTriangle} label="Open" value={open} color="red" /></div>
          <div className="stat-card"><StatCard icon={RefreshCw} label="In Progress" value={inProgress} color="yellow" /></div>
          <div className="stat-card"><StatCard icon={Users} label="Total Users" value={users.length} color="green" /></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent Tickets</h2>
            <Link to="/admin/tickets" className="text-xs text-[#E05F6B] font-semibold hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="px-6 py-6 space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No tickets yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map(t => (
                <div key={t.id} className="ticket-row flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-gray-500">#{t.id}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{usersById[t.user_id] || 'Unknown'} · {t.category || 'general'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge status={t.priority || 'medium'} />
                    <Badge status={t.status || 'open'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Quick nav */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Navigation</h2>
            <div className="space-y-2">
              {QUICK_LINKS.map(q => {
                const Icon = q.icon;
                return (
                <Link key={q.to} to={q.to} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${q.color}`}>
                  <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-slate-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{q.label}</p>
                    <p className="text-xs text-gray-500">{loading ? '...' : q.desc}</p>
                  </div>
                </Link>
              );
              })}
            </div>
          </div>

          {/* Ticket breakdown */}
          {!loading && tickets.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Resolution Rate</h2>
              <div className="space-y-2.5">
                {[
                  { label: 'Open', count: open, color: 'bg-blue-500' },
                  { label: 'In Progress', count: inProgress, color: 'bg-amber-500' },
                  { label: 'Resolved / Closed', count: resolved, color: 'bg-emerald-500' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-semibold text-gray-700">{s.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${s.color} transition-all`} style={{ width: `${tickets.length ? (s.count / tickets.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </Layout>
  );
}
