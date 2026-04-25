import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { api } from '../../services/api';

const ROLE_COLORS = {
  admin:      'bg-violet-100 text-violet-700',
  instructor: 'bg-blue-100 text-blue-700',
  student:    'bg-emerald-100 text-emerald-700',
  user:       'bg-gray-100 text-gray-600',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.users.list()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setUsers(data.map(u => ({
          id: u.user_id ?? u.id,
          email: u.email,
          name: u.name || [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email,
          role: u.role || 'student',
          status: u.status || 'active',
        })));
      })
      .catch(() => showToast('Failed to load users.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.users.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const roles = ['all', ...new Set(users.map(u => u.role))];
  const filtered = roleFilter === 'all' ? users : users.filter(u => u.role === roleFilter);

  return (
    <Layout role="admin">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users in the system.</p>
        </div>
        <button onClick={() => showToast('Feature coming soon.', 'error')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm">
          + Add User
        </button>
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm mb-6 w-fit">
        {roles.map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              roleFilter === r ? 'bg-[#E05F6B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}>
            {r === 'all' ? `All (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E05F6B]/10 border border-[#E05F6B]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#E05F6B] text-xs font-bold">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4"><Badge status={u.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => showToast('Edit feature coming soon.', 'error')}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-700 mr-3 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
