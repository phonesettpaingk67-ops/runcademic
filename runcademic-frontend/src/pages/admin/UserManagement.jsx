import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import I from '../../components/Icon';
import { api } from '../../services/api';

const ROLE_DOT = {
  admin:      'var(--accent)',
  instructor: 'var(--st-open)',
  student:    'var(--st-resolved)',
};

const initials = (n) =>
  (n || '?').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 2500);
  };
  const flashError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3500);
  };

  useEffect(() => {
    api.users
      .list()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setUsers(
          data.map((u) => ({
            id: u.user_id ?? u.id,
            email: u.email,
            name:
              u.name ||
              [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
              u.email,
            role: u.role || 'student',
            status: u.status || 'active',
          })),
        );
      })
      .catch(() => flashError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.users.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      flashSuccess('User deleted successfully.');
    } catch (err) {
      flashError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    instructor: users.filter((u) => u.role === 'instructor').length,
    student: users.filter((u) => u.role === 'student').length,
  };
  const filtered = tab === 'all' ? users : users.filter((u) => u.role === tab);

  return (
    <Layout role="admin">
      <div className="page">
        <div className="page-head">
          <div>
            <div className="eyebrow">Administrator · {users.length} accounts</div>
            <h1>
              <span className="serif italic" style={{ color: 'var(--accent)' }}>Users</span>.
            </h1>
            <p className="sub">Manage roles, status, and access across campus.</p>
          </div>
          <button className="btn btn-accent" onClick={() => flashError('Add-user feature coming soon.')}>
            {I.plus(14)} Add user
          </button>
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

        <div className="tabs">
          {[
            { id: 'all',        label: 'All' },
            { id: 'admin',      label: 'Admin' },
            { id: 'instructor', label: 'Instructor' },
            { id: 'student',    label: 'Student' },
          ].map((t) => (
            <button key={t.id} className="tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}<span className="count">{counts[t.id] || 0}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div className="empty"><p>Loading users…</p></div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="glyph">¶</div>
              <h4>No users in this view</h4>
              <p>Try a different role filter.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th style={{ width: 140 }}>Role</th>
                  <th style={{ width: 120 }}>Status</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="row gap-3">
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--surface-2)',
                          display: 'grid', placeItems: 'center',
                          fontFamily: 'var(--serif)', fontWeight: 500,
                          color: 'var(--ink-2)', fontSize: 12,
                        }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <div style={{ color: 'var(--ink)', fontWeight: 450 }}>{u.name}</div>
                          <div className="fine mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ textTransform: 'capitalize' }}>
                        <span className="dot" style={{ background: ROLE_DOT[u.role] || 'var(--ink-4)' }} />
                        {u.role}
                      </span>
                    </td>
                    <td><Badge status={u.status === 'active' ? 'resolved' : 'closed'} /></td>
                    <td>
                      <div className="row gap-2">
                        <button className="row-action" title="Edit" onClick={() => flashError('Edit feature coming soon.')}>
                          {I.edit(14)}
                        </button>
                        <button className="row-action" title="Delete" onClick={() => handleDelete(u.id)}>
                          {I.trash(14)}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
