import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { api } from '../../services/api';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
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
      <div className="space-y-6">
        <Link to="/student/tickets"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} /> Back to My Tickets
        </Link>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">{error}</div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-40 w-full rounded-2xl" />
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        ) : !ticket ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-gray-500 text-sm">Ticket not found.</div>
        ) : (
          <>
            {/* Ticket Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ticket #{ticket.id}</p>
                  <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
                </div>
                <Badge status={ticket.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Priority</p>
                  <div className="mt-1"><Badge status={ticket.priority || 'medium'} /></div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-semibold text-gray-700 capitalize mt-1">{ticket.category || 'general'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{formatDate(ticket.created_at)}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {ticket.description || 'No description provided.'}
                </div>
              </div>
            </div>

            {/* Comments — READ ONLY for student */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-4">
                Comments ({comments.length})
              </h2>
              {comments.length === 0 ? (
                <div className="text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  No comments yet. An instructor or admin will respond here.
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {c.author_name || 'Staff'}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(c.created_at)}</p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.comment_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
