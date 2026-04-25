import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AssignedTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const currentUser = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
        const response = await api.tickets.list();
        const data = response.data?.data || response.data || [];

        const assigned = data
          .filter((ticket) => Number(ticket.assigned_to) === Number(currentUser.id))
          .map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status || 'open',
            priority: ticket.priority || 'medium',
            department: ticket.category || 'general',
            created: ticket.created || ticket.created_at || '-',
          }));

        setTickets(assigned);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || 'Failed to load assigned tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTickets();
  }, []);

  const handleStatusChange = async (ticketId, status) => {
    try {
      await api.tickets.update(ticketId, { status });
      setTickets((prevTickets) => prevTickets.map((ticket) => (
        ticket.id === ticketId ? { ...ticket, status } : ticket
      )));
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  return (
    <Layout role="instructor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Manage student requests and update ticket progress.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 rounded-2xl text-red-600 px-4 py-3 text-sm">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading assigned tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No assigned tickets found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-600">#{ticket.id}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">{ticket.title}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{ticket.department}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{ticket.priority}</td>
                      <td className="px-5 py-4">
                        <select
                          value={(ticket.status || '').toLowerCase()}
                          onChange={(event) => handleStatusChange(ticket.id, event.target.value)}
                          className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="waiting">Waiting</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">{ticket.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
