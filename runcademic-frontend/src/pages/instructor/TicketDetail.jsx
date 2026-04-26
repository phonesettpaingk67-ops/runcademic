import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, MessageSquarePlus } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { api } from '../../services/api';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittedBy, setSubmittedBy] = useState('Unknown user');
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
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
            const name = userData?.name || [userData?.first_name, userData?.last_name].filter(Boolean).join(' ').trim();
            if (mounted && name) {
              setSubmittedBy(name);
            }
          } catch {
            if (mounted) setSubmittedBy('Unknown user');
          }
        }
      } catch (err) {
        if (mounted) {
          setErrorMessage(err.response?.data?.message || 'Failed to load ticket details.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (status) => {
    if (!ticket) return;

    try {
      await api.tickets.update(ticket.id, { status });
      setTicket((prev) => ({ ...prev, status }));
      setSuccessToast('Ticket status updated successfully.');
      setTimeout(() => setSuccessToast(''), 2500);
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
      setSuccessToast('Comment added successfully.');
      setTimeout(() => setSuccessToast(''), 2500);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Layout role="instructor">
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl shadow-sm">
          {successToast}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/instructor/tickets" className="btn-press inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft size={16} />
            Back to Assigned Tickets
          </Link>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-40 w-full" />
            <div className="skeleton h-56 w-full" />
          </div>
        ) : !ticket ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-gray-500 text-sm">
            Ticket not found.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ticket #{ticket.id}</p>
                  <h1 className="text-2xl font-bold text-gray-900 break-words">{ticket.title}</h1>
                </div>
                <div className="shrink-0">
                  <Badge status={ticket.status} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Priority</p>
                  <div className="mt-1"><Badge status={ticket.priority || 'medium'} /></div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold text-gray-700 capitalize mt-1">{ticket.category || 'general'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Submitted By</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{submittedBy}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date Submitted</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{formatDate(ticket.created_at)}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {ticket.description}
                </div>
              </div>

              <div className="mt-6 max-w-xs">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</label>
                <select
                  value={ticket.status || 'open'}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">Comments</h2>

              <div className="space-y-3 mb-5">
                {comments.length === 0 ? (
                  <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    No comments yet.
                  </div>
                ) : comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <p className="text-sm font-semibold text-gray-800">{comment.author_name || 'Unknown user'}</p>
                      <p className="text-xs text-gray-400">{formatDate(comment.created_at)}</p>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.comment_text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Comment</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={4}
                  placeholder="Write your comment here..."
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment}
                  className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all disabled:opacity-50 shadow-sm"
                >
                  <MessageSquarePlus size={16} />
                  {submittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}
