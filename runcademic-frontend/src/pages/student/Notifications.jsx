import { useEffect, useState } from 'react';
import {
  FileText,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  Lock,
  Bell,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function ticketToNotifications(ticket) {
  const notifs = [];

  notifs.push({
    id: `created-${ticket.id}`,
    type: 'ticket',
    message: `Your ticket #${ticket.id} "${ticket.title}" was submitted successfully.`,
    date: ticket.created_at,
    icon: 'created',
  });

  if (ticket.assigned_to) {
    notifs.push({
      id: `assigned-${ticket.id}`,
      type: 'ticket',
      message: `Ticket #${ticket.id} "${ticket.title}" has been assigned to a staff member.`,
      date: ticket.assigned_at || ticket.updated_at || ticket.created_at,
      icon: 'assigned',
    });
  }

  if (ticket.status === 'in_progress') {
    notifs.push({
      id: `inprogress-${ticket.id}`,
      type: 'ticket',
      message: `Ticket #${ticket.id} "${ticket.title}" is now being worked on.`,
      date: ticket.updated_at || ticket.created_at,
      icon: 'in_progress',
    });
  }

  if (ticket.status === 'resolved') {
    notifs.push({
      id: `resolved-${ticket.id}`,
      type: 'ticket',
      message: `Ticket #${ticket.id} "${ticket.title}" has been resolved.`,
      date: ticket.resolved_at || ticket.updated_at || ticket.created_at,
      icon: 'resolved',
    });
  }

  if (ticket.status === 'closed') {
    notifs.push({
      id: `closed-${ticket.id}`,
      type: 'ticket',
      message: `Ticket #${ticket.id} "${ticket.title}" has been closed.`,
      date: ticket.updated_at || ticket.created_at,
      icon: 'closed',
    });
  }

  return notifs;
}

function NotificationIcon({ type }) {
  if (type === 'created') return <FileText size={16} className="text-blue-600" />;
  if (type === 'assigned') return <UserCheck size={16} className="text-violet-600" />;
  if (type === 'in_progress') return <RefreshCw size={16} className="text-amber-600" />;
  if (type === 'resolved') return <CheckCircle2 size={16} className="text-emerald-600" />;
  if (type === 'closed') return <Lock size={16} className="text-slate-600" />;
  return <Bell size={16} className="text-gray-600" />;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await api.tickets.list();
        const data = response.data?.data || response.data || [];

        // Filter only this student's tickets
        const myTickets = data.filter(
          (t) => Number(t.user_id || t.created_by) === Number(user.id)
        );

        // Generate notifications from real ticket events
        const notifs = myTickets
          .flatMap(ticketToNotifications)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setNotifications(notifs);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user.id]);

  return (
    <Layout role="student">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">Stay updated with your ticket activity.</p>
          </div>
          {notifications.length > 0 && (
            <span className="px-3 py-1.5 text-sm font-semibold text-white bg-[#E05F6B] rounded-xl shadow-sm">
              {notifications.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#E05F6B]/10 mb-4">
              <Bell size={22} className="text-[#E05F6B]" />
            </div>
            <p className="text-gray-600 text-lg">No notifications yet.</p>
            <p className="text-gray-400 text-sm mt-2">Notifications will appear here when your tickets are updated.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      <NotificationIcon type={notif.icon} />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{notif.message}</p>
                      <p className="text-sm text-gray-400 mt-1">{timeAgo(notif.date)}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 shrink-0">ticket</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
