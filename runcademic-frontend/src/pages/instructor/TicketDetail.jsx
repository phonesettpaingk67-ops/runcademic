import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'waiting',     label: 'Waiting' },
  { value: 'resolved',    label: 'Resolved' },
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittedBy, setSubmittedBy] = useState('Unknown user');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          api.tickets.getById(id),
          api.comments.list(id),
        ]);
        const ticketData = ticketRes.data?.data || ticketRes.data;
        const commentData = commentsRes.data?.data || commentsRes.data || [];
        if (!mounted) return;
        setTicket(ticketData);
        setComments(commentData);

        if (ticketData?.user_id) {
          try {
            const userRes = await api.users.getById(ticketData.user_id);
            const userData = userRes.data?.data || userRes.data;
            const name = userData?.name
              || [userData?.first_name, userData?.last_name].filter(Boolean).join(' ').trim();
            if (mounted && name) setSubmittedBy(name);
          } catch {
            if (mounted) setSubmittedBy('Unknown user');
          }
        }
      } catch (err) {
        if (mounted) setErrorMessage(err.response?.data?.message || 'Failed to load ticket details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  const handleStatusUpdate = async (status) => {
    if (!ticket) return;
    try {
      await api.tickets.update(ticket.id, { status });
      setTicket((prev) => ({ ...prev, status }));
      flashSuccess('Ticket status updated.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    setErrorMessage('');
    try {
      await api.comments.create({ ticket_id: ticket.id, comment_text: commentText.trim() });
      setCommentText('');
      const refreshed = await api.comments.list(ticket.id);
      setComments(refreshed.data?.data || refreshed.data || []);
      flashSuccess('Comment added.');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Layout role="instructor">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal · Ticket detail</div>
            <h1>
              {loading || !ticket ? (
                <>Ticket <span className="serif italic" style={{ color: 'var(--accent)' }}>—</span></>
              ) : (
                <>Ticket <span className="serif italic" style={{ color: 'var(--accent)' }}>#{ticket.id}</span>.</>
              )}
            </h1>
            <p className="sub">Review the request, update status, and respond with comments.</p>
          </div>
          <Link to="/instructor/tickets" className="btn btn-ghost btn-sm">
            {I.arrowLeft(14)} Back to assigned tickets
          </Link>
        </div>

        {errorMessage && (
          <div className="alert" data-tone="error" style={{ marginBottom: 14 }}>
            <span className="ic">{I.alert(16)}</span><span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="alert" data-tone="success" style={{ marginBottom: 14 }}>
            <span className="ic">{I.check(16)}</span><span>{successMessage}</span>
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
              <p>This ticket may have been removed or reassigned.</p>
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
                  <div className="eyebrow">Submitted by</div>
                  <div style={{ marginTop: 6, fontSize: 13.5 }}>{submittedBy}</div>
                </div>
                <div>
                  <div className="eyebrow">Date submitted</div>
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
                    <p>Add the first reply to keep the student in the loop.</p>
                  </div>
                ) : (
                  <div className="col gap-3">
                    {comments.map((c) => (
                      <div key={c.id} className="card" style={{ padding: 14, background: 'var(--surface-2)' }}>
                        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: 13.5 }}>{c.author_name || 'Unknown user'}</strong>
                          <span className="fine mono">{formatDate(c.created_at)}</span>
                        </div>
                        <div style={{ marginTop: 6, fontSize: 13.5, whiteSpace: 'pre-wrap', color: 'var(--ink-2)' }}>
                          {c.comment_text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddComment} className="col gap-3" style={{ marginTop: 18 }}>
                  <div className="field">
                    <label>Add comment</label>
                    <textarea
                      className="textarea"
                      rows={4}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your reply…"
                    />
                  </div>
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-accent btn-sm" disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? 'Adding…' : <>Post comment {I.arrowRight(12)}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="col gap-6">
              <div className="card card-pad">
                <div className="card-head" style={{ marginBottom: 14 }}>
                  <h3 className="card-title">Update status</h3>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select
                    className="input"
                    value={ticket.status || 'open'}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <p className="fine" style={{ marginTop: 10 }}>
                  Changes save automatically. The student will see the new status on their dashboard.
                </p>
              </div>

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
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
