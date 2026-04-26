import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function StudentTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          api.tickets.getById(id),
          api.comments.list(id),
        ]);
        if (!mounted) return;
        setTicket(ticketRes.data?.data || ticketRes.data);
        setComments(commentsRes.data?.data || commentsRes.data || []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load ticket.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  return (
    <Layout role="student">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">My tickets · Detail</div>
            <h1>
              {loading || !ticket ? (
                <>Ticket <span className="serif italic" style={{ color: 'var(--accent)' }}>—</span></>
              ) : (
                <>Ticket <span className="serif italic" style={{ color: 'var(--accent)' }}>#{ticket.id}</span>.</>
              )}
            </h1>
            <p className="sub">Track the status of your request and read responses from staff.</p>
          </div>
          <Link to="/student/tickets" className="btn btn-ghost btn-sm">
            {I.arrowLeft(14)} Back to my tickets
          </Link>
        </div>

        {error && (
          <div className="alert" data-tone="error" style={{ marginBottom: 14 }}>
            <span className="ic">{I.alert(16)}</span><span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="card card-pad">
            <p className="muted">Loading ticket…</p>
          </div>
        ) : !ticket ? (
          <div className="card">
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>Ticket not found</h4>
              <p>We couldn't find this ticket. It may have been removed.</p>
            </div>
          </div>
        ) : (
          <div className="split">
            <div className="card card-pad">
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="eyebrow">Ticket #{ticket.id}</div>
                  <div className="serif" style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.01em' }}>
                    {ticket.title}
                  </div>
                </div>
                <Badge status={ticket.status} />
              </div>

              <div className="split-narrow" style={{ marginTop: 20 }}>
                <div>
                  <div className="eyebrow">Priority</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="pri" data-pri={ticket.priority || 'medium'}>{ticket.priority || 'medium'}</span>
                  </div>
                </div>
                <div>
                  <div className="eyebrow">Department</div>
                  <div style={{ marginTop: 6, fontSize: 13.5, textTransform: 'capitalize' }}>
                    {ticket.category || 'general'}
                  </div>
                </div>
                <div>
                  <div className="eyebrow">Submitted</div>
                  <div className="mono" style={{ marginTop: 6, fontSize: 12.5, color: 'var(--ink-3)' }}>
                    {formatDate(ticket.created_at)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>Description</div>
                <div style={{ fontSize: 14.5, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {ticket.description || 'No description provided.'}
                </div>
              </div>

              <div style={{ marginTop: 28, borderTop: '1px solid var(--rule-soft)', paddingTop: 20 }}>
                <div className="card-head" style={{ marginBottom: 14 }}>
                  <h3 className="card-title">Comments</h3>
                  <span className="fine">{comments.length} total</span>
                </div>

                {comments.length === 0 ? (
                  <div className="empty" style={{ padding: '32px 16px' }}>
                    <div className="glyph">¶</div>
                    <h4>No comments yet</h4>
                    <p>An instructor or admin will respond here once your ticket is reviewed.</p>
                  </div>
                ) : (
                  <div className="col gap-3">
                    {comments.map((c) => (
                      <div key={c.id} className="card" style={{ padding: 14, background: 'var(--surface-2)' }}>
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: 13.5 }}>{c.author_name || 'Staff'}</strong>
                          <span className="fine mono">{formatDate(c.created_at)}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13.5, whiteSpace: 'pre-wrap', color: 'var(--ink-2)' }}>
                          {c.comment_text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col gap-6">
              <div className="card card-pad">
                <div className="card-head" style={{ marginBottom: 10 }}>
                  <h3 className="card-title">At a glance</h3>
                </div>
                <div className="col gap-2">
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="fine">Status</span>
                    <Badge status={ticket.status} />
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="fine">Priority</span>
                    <span className="pri" data-pri={ticket.priority || 'medium'}>{ticket.priority || 'medium'}</span>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="fine">Comments</span>
                    <span className="mono" style={{ fontSize: 13 }}>{comments.length}</span>
                  </div>
                </div>
              </div>

              <div className="card card-pad">
                <div className="card-head" style={{ marginBottom: 10 }}>
                  <h3 className="card-title">Need to add more?</h3>
                </div>
                <p className="fine" style={{ marginBottom: 12 }}>
                  Students can submit a new ticket if extra detail is needed. Staff will reply on this thread.
                </p>
                <Link to="/student/submit-ticket" className="btn btn-secondary btn-sm">
                  {I.plus(12)} Submit new ticket
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
