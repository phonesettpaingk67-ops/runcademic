import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

export default function AllTickets() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [usersByIdFull, setUsersByIdFull] = useState({});
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
  });

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [ticketsResponse, usersResponse] = await Promise.all([
          api.tickets.list(),
          api.users.list(),
        ]);

        const data = ticketsResponse.data?.data || ticketsResponse.data || [];
        const users = usersResponse.data?.data || usersResponse.data || [];

        const userMap = {};
        const userFullMap = {};
        users.forEach((user) => {
          const id = user.user_id ?? user.id;
          if (id == null) return;

           const normalized = {
            id,
            role: String(user.role || '').toLowerCase(),
            email: user.email || '',
            name:
              user.name ||
              [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
              user.email ||
              `User ${id}`,
          };

          userFullMap[id] = normalized;
          userMap[id] =
            normalized.name;
        });

        setUsersById(userMap);
        setUsersByIdFull(userFullMap);
        setAssigneeOptions(
          Object.values(userFullMap).filter((u) => u.role && u.role !== 'student')
        );

        setTickets(
          data.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description || '',
            submittedBy: ticket.user_id || ticket.created_by || null,
            department: ticket.category || ticket.department || 'general',
            priority: ticket.priority || 'medium',
            status: ticket.status || 'open',
            assignedTo: ticket.assigned_to || null,
            created: ticket.created || ticket.created_at || '-',
            createdAt: ticket.created_at || null,
          }))
        );
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const normalizeStatus = (status) => (status || '').toLowerCase().replace(/\s+/g, '_');

  const formatDateTime = (value) => {
    if (!value || value === '-') return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const statusBadgeClass = (status) => {
    const key = normalizeStatus(status);
    if (key === 'open') return 'bg-blue-100 text-blue-700';
    if (key === 'in_progress') return 'bg-amber-100 text-amber-700';
    if (key === 'waiting') return 'bg-orange-100 text-orange-700';
    if (key === 'resolved') return 'bg-emerald-100 text-emerald-700';
    if (key === 'closed') return 'bg-slate-100 text-slate-700';
    return 'bg-gray-100 text-gray-700';
  };

  const priorityBadgeClass = (priority) => {
    const key = String(priority || '').toLowerCase();
    if (key === 'urgent') return 'bg-red-100 text-red-700';
    if (key === 'high') return 'bg-rose-100 text-rose-700';
    if (key === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-emerald-100 text-emerald-700';
  };

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter((ticket) => normalizeStatus(ticket.status) === normalizeStatus(filterStatus));

  const handleStatusChange = async (ticketId, status) => {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await api.tickets.update(ticketId, { status });
      setTickets((prev) => prev.map((ticket) => (
        ticket.id === ticketId ? { ...ticket, status } : ticket
      )));
      setSuccessMessage(`Ticket #${ticketId} status updated.`);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleAssign = async (ticketId, assignedToRaw) => {
    setErrorMessage('');
    setSuccessMessage('');
    const assigned_to = assignedToRaw === '' ? null : Number(assignedToRaw);

    try {
      await api.tickets.update(ticketId, { assigned_to });
      setTickets((prev) => prev.map((ticket) => (
        ticket.id === ticketId ? { ...ticket, assignedTo: assigned_to } : ticket
      )));
      setSuccessMessage(
        assigned_to
          ? `Ticket #${ticketId} assigned successfully.`
          : `Ticket #${ticketId} is now unassigned.`
      );
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  const openViewModal = async (ticketId) => {
    setIsViewOpen(true);
    setViewLoading(true);
    setErrorMessage('');

    try {
      const response = await api.tickets.getById(ticketId);
      const raw = response.data?.data || response.data || {};
      setViewTicket({
        id: raw.id,
        title: raw.title || '',
        description: raw.description || '',
        submittedBy: raw.user_id || raw.created_by || null,
        department: raw.category || raw.department || 'general',
        priority: raw.priority || 'medium',
        status: raw.status || 'open',
        assignedTo: raw.assigned_to || null,
        createdAt: raw.created_at || raw.created || null,
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load ticket details.');
      setViewTicket(null);
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setViewTicket(null);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setEditForm({
      title: ticket.title || '',
      description: ticket.description || '',
      category: ticket.department || 'general',
      priority: ticket.priority || 'medium',
      status: normalizeStatus(ticket.status) || 'open',
      assigned_to: ticket.assignedTo != null ? String(ticket.assignedTo) : '',
    });
    setIsEditOpen(true);
    setErrorMessage('');
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingTicket(null);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingTicket) return;

    setSavingEdit(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category.trim(),
        priority: editForm.priority,
        status: editForm.status,
        assigned_to: editForm.assigned_to === '' ? null : Number(editForm.assigned_to),
      };

      await api.tickets.update(editingTicket.id, payload);

      setTickets((prev) => prev.map((ticket) => (
        ticket.id === editingTicket.id
          ? {
              ...ticket,
              title: payload.title,
              description: payload.description,
              department: payload.category,
              priority: payload.priority,
              status: payload.status,
              assignedTo: payload.assigned_to,
            }
          : ticket
      )));

      setSuccessMessage(`Ticket #${editingTicket.id} updated successfully.`);
      closeEditModal();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Layout role="admin" wide>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">System-wide ticket overview and management.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('all')}
              className={filterStatus === 'all'
                ? 'px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm'
                : 'px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilterStatus('open')}
              className={filterStatus === 'open'
                ? 'px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm'
                : 'px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={filterStatus === 'in_progress'
                ? 'px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm'
                : 'px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={filterStatus === 'resolved'
                ? 'px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm'
                : 'px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={filterStatus === 'closed'
                ? 'px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm'
                : 'px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all'}
            >
              Closed
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 rounded-2xl text-red-600 px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 px-4 py-3 text-sm">
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No tickets found.</div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5 shadow-sm">
                  <div className="flex flex-col 2xl:flex-row gap-5">
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">{ticket.title}</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600">#{ticket.id}</span>
                      </div>

                      <p className="text-sm text-gray-500 leading-relaxed">
                        {ticket.description ? ticket.description : 'No description provided.'}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Submitted By</p>
                          <p className="text-sm font-semibold text-gray-800 mt-1">
                            {usersById[ticket.submittedBy] || `User ${ticket.submittedBy ?? '-'}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 break-all">
                            {usersByIdFull[ticket.submittedBy]?.email || 'No email available'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Category</p>
                          <p className="text-sm font-semibold text-gray-700 mt-1 capitalize">{ticket.department}</p>
                          <p className="text-xs text-gray-500 mt-1">Created: {formatDateTime(ticket.createdAt || ticket.created)}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                          <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">Current State</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusBadgeClass(ticket.status)}`}>
                              {String(ticket.status || '').replace('_', ' ')}
                            </span>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${priorityBadgeClass(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full 2xl:w-[360px] shrink-0 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</label>
                        <select
                          value={normalizeStatus(ticket.status)}
                          onChange={(event) => handleStatusChange(ticket.id, event.target.value)}
                          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting">Waiting</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assign To</label>
                        <select
                          value={ticket.assignedTo != null ? String(ticket.assignedTo) : ''}
                          onChange={(event) => handleAssign(ticket.id, event.target.value)}
                          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                        >
                          <option value="">Unassigned</option>
                          {assigneeOptions.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => openViewModal(ticket.id)}
                          className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(ticket)}
                          className="px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isViewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-lg">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Ticket Details</h2>
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
              <div className="p-6">
                {viewLoading ? (
                  <p className="text-gray-500">Loading details...</p>
                ) : viewTicket ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Title</p>
                      <p className="text-gray-900 font-medium mt-1">{viewTicket.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Description</p>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{viewTicket.description || 'No description provided.'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Submitted By</p>
                        <p className="text-gray-900 font-medium mt-1">
                          {usersById[viewTicket.submittedBy] || `User ${viewTicket.submittedBy ?? '-'}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {usersByIdFull[viewTicket.submittedBy]?.email || 'No email available'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Assigned To</p>
                        <p className="text-gray-900 font-medium mt-1">
                          {viewTicket.assignedTo
                            ? usersById[viewTicket.assignedTo] || `User ${viewTicket.assignedTo}`
                            : 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Category</p>
                        <p className="text-gray-900 font-medium mt-1 capitalize">{viewTicket.department}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Priority</p>
                        <p className="text-gray-900 font-medium mt-1 capitalize">{viewTicket.priority}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Status</p>
                        <p className="text-gray-900 font-medium mt-1 capitalize">{viewTicket.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Created</p>
                        <p className="text-gray-900 font-medium mt-1">{formatDateTime(viewTicket.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No ticket data available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {isEditOpen && editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-lg">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Edit Ticket #{editingTicket.id}</h2>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
                  <input
                    value={editForm.title}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    required
                    minLength={5}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    rows={4}
                    required
                    minLength={10}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                    <input
                      value={editForm.category}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                    <select
                      value={editForm.priority}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, priority: event.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting">Waiting</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assign To</label>
                    <select
                      value={editForm.assigned_to}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, assigned_to: event.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                    >
                      <option value="">Unassigned</option>
                      {assigneeOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm disabled:opacity-60"
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
