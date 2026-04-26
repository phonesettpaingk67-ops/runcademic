import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import I from '../../components/Icon';
import { api } from '../../services/api';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

const TYPE_META = {
  created:     { glyph: I.send(14),  tone: 'var(--ink-3)',       label: 'created' },
  assigned:    { glyph: I.users(14), tone: 'var(--st-open)',     label: 'assigned' },
  in_progress: { glyph: I.spark(14), tone: 'var(--st-progress)', label: 'in progress' },
  resolved:    { glyph: I.check(14), tone: 'var(--st-resolved)', label: 'resolved' },
  closed:      { glyph: I.x(14),     tone: 'var(--st-closed)',   label: 'closed' },
};

const STATUS_FOR_BADGE = {
  created: 'open',
  assigned: 'open',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
};

function ticketToNotifications(ticket) {
  const out = [];
  out.push({
    id: `created-${ticket.id}`,
    type: 'created',
    msg: `Ticket #${ticket.id} "${ticket.title}" was submitted.`,
    date: ticket.created_at,
  });
  if (ticket.assigned_to) {
    out.push({
      id: `assigned-${ticket.id}`,
      type: 'assigned',
      msg: `Ticket #${ticket.id} "${ticket.title}" was assigned to a staff member.`,
      date: ticket.assigned_at || ticket.updated_at || ticket.created_at,
    });
  }
  if (ticket.status === 'in_progress') {
    out.push({
      id: `inprogress-${ticket.id}`,
      type: 'in_progress',
      msg: `Ticket #${ticket.id} "${ticket.title}" is now being worked on.`,
      date: ticket.updated_at || ticket.created_at,
    });
  }
  if (ticket.status === 'resolved') {
    out.push({
      id: `resolved-${ticket.id}`,
      type: 'resolved',
      msg: `Ticket #${ticket.id} "${ticket.title}" was resolved — please review and close.`,
      date: ticket.resolved_at || ticket.updated_at || ticket.created_at,
    });
  }
  if (ticket.status === 'closed') {
    out.push({
      id: `closed-${ticket.id}`,
      type: 'closed',
      msg: `Ticket #${ticket.id} "${ticket.title}" was closed.`,
      date: ticket.updated_at || ticket.created_at,
    });
  }
  return out;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.tickets.list();
        const data = res.data?.data || res.data || [];
        const mine = data.filter(
          (t) => Number(t.user_id || t.created_by) === Number(user.id),
        );
        const notifs = mine.flatMap(ticketToNotifications)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setNotifications(notifs);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user.id]);

  return (
    <Layout role="student">
      <div className="page" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow">Student portal · Activity</div>
            <h1>
              Notifications{' '}
              <span className="mono" style={{ fontSize: 18, color: 'var(--ink-4)', verticalAlign: 'middle', marginLeft: 8 }}>
                {notifications.length}
              </span>
            </h1>
            <p className="sub">Lifecycle events from your tickets, in chronological order.</p>
          </div>
        </div>

        {loading ? (
          <div className="card card-pad"><p className="muted">Loading notifications…</p></div>
        ) : notifications.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>You're all caught up</h4>
              <p>Notifications will appear here as your tickets move through the queue.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            {notifications.map((n, i) => {
              const m = TYPE_META[n.type] || TYPE_META.created;
              const badgeStatus = STATUS_FOR_BADGE[n.type] || 'open';
              return (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 20px',
                    borderTop: i === 0 ? 0 : '1px solid var(--rule-soft)',
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr auto',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 4,
                    background: 'var(--surface-2)',
                    display: 'grid', placeItems: 'center',
                    color: m.tone,
                  }}>
                    {m.glyph}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink)', fontSize: 13.5 }}>{n.msg}</div>
                    <div className="fine mono" style={{ marginTop: 4 }}>{timeAgo(n.date)}</div>
                  </div>
                  <span className="badge" data-status={badgeStatus}>
                    <span className="dot" />
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
