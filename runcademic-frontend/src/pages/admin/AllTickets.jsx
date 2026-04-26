import { Fragment, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import I from '../../components/Icon';
import { api } from '../../services/api';

const TABS = [
  { id: 'all',         label: 'All' },
  { id: 'open',        label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'waiting',     label: 'Waiting' },
  { id: 'resolved',    label: 'Resolved' },
  { id: 'closed',      label: 'Closed' },
];

const DEPT_LABELS = {
  general: 'General', it: 'IT Support', admin: 'Administration', finance: 'Finance',
  library: 'Library', registrar: 'Registrar', academic: 'Academic Affairs',
};

const normalizeStatus = (s) => (s || '').toLowerCase().replace(/\s+/g, '_');

const formatDateTime = (v) => {
  if (!v || v === '-') return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
};

const formatDate = (v) => {
  if (!v || v === '-') return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AllTickets() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [usersByIdFull, setUsersByIdFull] = useState({});
  const [assigneeOptions, setAssigneeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [viewComments, setViewComments] = useState([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', description: '', category: 'general', priority: 'medium', status: 'open', assigned_to: '',
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [tr, ur] = await Promise.all([api.tickets.list(), api.users.list()]);
        const data = tr.data?.data || tr.data || [];
        const users = ur.data?.data || ur.data || [];

        const userMap = {};
        const userFullMap = {};
        users.forEach((u) => {
          const id = u.user_id ?? u.id;
          if (id == null) return;
          const normalized = {
            id,
            role: String(u.role || '').toLowerCase(),
            email: u.email || '',
            name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email || `User ${id}`,
          };
          userFullMap[id] = normalized;
          userMap[id] = normalized.name;
        });
        setUsersById(userMap);
        setUsersByIdFull(userFullMap);
        setAssigneeOptions(Object.values(userFullMap).filter((u) => u.role && u.role !== 'student'));

        setTickets(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || '',
            submittedBy: t.user_id || t.created_by || null,
            department: t.category || t.department || 'general',
            priority: t.priority || 'medium',
            status: t.status || 'open',
            assignedTo: t.assigned_to || null,
            created: t.created || t.created_at || '-',
            createdAt: t.created_at || null,
          })),
        );
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const counts = useMemo(() => {
    const c = { all: tickets.length, open: 0, in_progress: 0, waiting: 0, resolved: 0, closed: 0 };
    tickets.forEach((t) => { const k = normalizeStatus(t.status); if (c[k] !== undefined) c[k] += 1; });
    return c;
  }, [tickets]);

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter((t) => normalizeStatus(t.status) === filterStatus);

  const handleStatusChange = async (id, status) => {
    setErrorMessage(''); setSuccessMessage('');
    try {
      await api.tickets.update(id, { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      setSuccessMessage(`Ticket #${id} status updated.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  const handleAssign = async (id, assignedToRaw) => {
    setErrorMessage(''); setSuccessMessage('');
    const assigned_to = assignedToRaw === '' ? null : Number(assignedToRaw);
    try {
      await api.tickets.update(id, { assigned_to });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assignedTo: assigned_to } : t)));
      setSuccessMessage(assigned_to ? `Ticket #${id} assigned.` : `Ticket #${id} is now unassigned.`);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  const openViewModal = async (id) => {
    setIsViewOpen(true); setViewLoading(true); setErrorMessage('');
    try {
      const [r1, r2] = await Promise.all([api.tickets.getById(id), api.comments.list(id)]);
      const raw = r1.data?.data || r1.data || {};
      setViewTicket({
        id: raw.id, title: raw.title || '', description: raw.description || '',
        submittedBy: raw.user_id || raw.created_by || null,
        department: raw.category || raw.department || 'general',
        priority: raw.priority || 'medium',
        status: raw.status || 'open',
        assignedTo: raw.assigned_to || null,
        createdAt: raw.created_at || raw.created || null,
      });
      setViewComments(r2.data?.data || r2.data || []);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load ticket details.');
      setViewTicket(null); setViewComments([]);
    } finally {
      setViewLoading(false);
    }
  };
  const closeViewModal = () => { setIsViewOpen(false); setViewTicket(null); setViewComments([]); };

  const openEditModal = (t) => {
    setEditingTicket(t);
    setEditForm({
      title: t.title || '',
      description: t.description || '',
      category: t.department || 'general',
      priority: t.priority || 'medium',
      status: normalizeStatus(t.status) || 'open',
      assigned_to: t.assignedTo != null ? String(t.assignedTo) : '',
    });
    setIsEditOpen(true);
    setErrorMessage('');
  };
  const closeEditModal = () => { setIsEditOpen(false); setEditingTicket(null); };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setSavingEdit(true); setErrorMessage(''); setSuccessMessage('');
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
      setTickets((prev) => prev.map((t) =>
        t.id === editingTicket.id
          ? { ...t, title: payload.title, description: payload.description, department: payload.category, priority: payload.priority, status: payload.status, assignedTo: payload.assigned_to }
          : t,
      ));
      setSuccessMessage(`Ticket #${editingTicket.id} updated.`);
      closeEditModal();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator portal · Triage</div>
            <h1>All tickets.</h1>
            <p className="sub">System-wide overview. Click a row to expand inline actions.</p>
          </div>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className="tab" data-active={filterStatus === t.id} onClick={() => setFilterStatus(t.id)}>
              {t.label}<span className="count">{counts[t.id] || 0}</span>
            </button>
          ))}
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

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="empty"><p>Loading tickets…</p></div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>No tickets in this view</h4>
              <p>Try a different filter.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 90 }}>ID</th>
                  <th>Title</th>
                  <th style={{ width: 160 }}>Department</th>
                  <th style={{ width: 110 }}>Priority</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 100 }}>Created</th>
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => {
                  const isExpanded = expandedId === t.id;
                  return (
                    <Fragment key={t.id}>
                      <tr onClick={() => setExpandedId(isExpanded ? null : t.id)} style={{ cursor: 'pointer' }}>
                        <td className="id">#{t.id}</td>
                        <td className="title">{t.title}</td>
                        <td>{DEPT_LABELS[t.department] || t.department}</td>
                        <td><span className="pri" data-pri={t.priority}>{t.priority}</span></td>
                        <td><Badge status={t.status} /></td>
                        <td className="date">{formatDate(t.createdAt || t.created)}</td>
                        <td><span className="row-action">{I.more(16)}</span></td>
                      </tr>
                      {isExpanded && (
                        <tr onClick={(e) => e.stopPropagation()}>
                          <td colSpan={7} style={{ background: 'var(--surface-2)', padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                              <div>
                                <div className="eyebrow">Description</div>
                                <p style={{ marginTop: 8, color: 'var(--ink-2)', fontSize: 14 }}>
                                  {t.description || 'No description provided.'}
                                </p>
                                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                  <div>
                                    <div className="eyebrow">Submitted by</div>
                                    <div style={{ marginTop: 4, fontSize: 13.5 }}>
                                      {usersById[t.submittedBy] || `User ${t.submittedBy ?? '—'}`}
                                    </div>
                                    <div className="fine mono" style={{ marginTop: 2 }}>
                                      {usersByIdFull[t.submittedBy]?.email || '—'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="eyebrow">Created</div>
                                    <div className="mono" style={{ marginTop: 4, fontSize: 13 }}>
                                      {formatDateTime(t.createdAt || t.created)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="col gap-3">
                                <div className="field">
                                  <label>Status</label>
                                  <select
                                    className="input"
                                    value={normalizeStatus(t.status)}
                                    onChange={(e) => handleStatusChange(t.id, e.target.value)}
                                  >
                                    <option value="open">Open</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="waiting">Waiting</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                </div>
                                <div className="field">
                                  <label>Assigned to</label>
                                  <select
                                    className="input"
                                    value={t.assignedTo != null ? String(t.assignedTo) : ''}
                                    onChange={(e) => handleAssign(t.id, e.target.value)}
                                  >
                                    <option value="">Unassigned</option>
                                    {assigneeOptions.map((u) => (
                                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="row gap-2" style={{ marginTop: 4 }}>
                                  <button className="btn btn-secondary btn-sm" onClick={() => openViewModal(t.id)}>{I.view(14)} View</button>
                                  <button className="btn btn-accent btn-sm" onClick={() => openEditModal(t)}>{I.edit(14)} Edit</button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View modal */}
      <Modal isOpen={isViewOpen} onClose={closeViewModal} title="Ticket details">
        {viewLoading ? (
          <p className="muted">Loading details…</p>
        ) : viewTicket ? (
          <div className="col gap-4">
            <div>
              <div className="eyebrow">Title</div>
              <div className="serif" style={{ fontSize: 18, marginTop: 4 }}>{viewTicket.title}</div>
            </div>
            <div>
              <div className="eyebrow">Description</div>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', fontSize: 14 }}>
                {viewTicket.description || 'No description provided.'}
              </div>
            </div>
            <div className="split-narrow">
              <div>
                <div className="eyebrow">Submitted by</div>
                <div style={{ marginTop: 4, fontSize: 13.5 }}>{usersById[viewTicket.submittedBy] || `User ${viewTicket.submittedBy ?? '—'}`}</div>
                <div className="fine mono" style={{ marginTop: 2 }}>{usersByIdFull[viewTicket.submittedBy]?.email || '—'}</div>
              </div>
              <div>
                <div className="eyebrow">Assigned to</div>
                <div style={{ marginTop: 4, fontSize: 13.5 }}>
                  {viewTicket.assignedTo ? (usersById[viewTicket.assignedTo] || `User ${viewTicket.assignedTo}`) : 'Unassigned'}
                </div>
              </div>
              <div>
                <div className="eyebrow">Department</div>
                <div style={{ marginTop: 4, fontSize: 13.5, textTransform: 'capitalize' }}>{viewTicket.department}</div>
              </div>
              <div>
                <div className="eyebrow">Priority</div>
                <div style={{ marginTop: 4 }}><span className="pri" data-pri={viewTicket.priority}>{viewTicket.priority}</span></div>
              </div>
              <div>
                <div className="eyebrow">Status</div>
                <div style={{ marginTop: 4 }}><Badge status={viewTicket.status} /></div>
              </div>
              <div>
                <div className="eyebrow">Created</div>
                <div className="mono" style={{ marginTop: 4, fontSize: 12.5 }}>{formatDateTime(viewTicket.createdAt)}</div>
              </div>
            </div>
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Comments ({viewComments.length})</div>
              {viewComments.length === 0 ? (
                <p className="muted">No comments yet.</p>
              ) : (
                <div className="col gap-2">
                  {viewComments.map((c) => (
                    <div key={c.id} className="card card-pad" style={{ padding: 12 }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: 13.5 }}>{c.author_name || 'Staff'}</strong>
                        <span className="fine mono">{formatDateTime(c.created_at)}</span>
                      </div>
                      <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', fontSize: 13.5 }}>{c.comment_text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="muted">No ticket data available.</p>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={isEditOpen && !!editingTicket}
        onClose={closeEditModal}
        title={editingTicket ? `Edit ticket #${editingTicket.id}` : 'Edit ticket'}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeEditModal}>Cancel</button>
            <button type="submit" form="edit-ticket-form" className="btn btn-accent" disabled={savingEdit}>
              {savingEdit ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="edit-ticket-form" onSubmit={handleEditSubmit} className="col gap-4">
          <div className="field">
            <label>Title</label>
            <input
              className="input"
              value={editForm.title}
              onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              required
              minLength={5}
            />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              value={editForm.description}
              onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
              required
              minLength={10}
              rows={4}
            />
          </div>
          <div className="split-narrow">
            <div className="field">
              <label>Category</label>
              <input
                className="input"
                value={editForm.category}
                onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Priority</label>
              <select
                className="input"
                value={editForm.priority}
                onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select
                className="input"
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting">Waiting</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="field">
              <label>Assign to</label>
              <select
                className="input"
                value={editForm.assigned_to}
                onChange={(e) => setEditForm((p) => ({ ...p, assigned_to: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
