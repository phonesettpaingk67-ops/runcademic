import { useEffect, useState } from 'react';
import {
  Building2,
  Laptop2,
  Landmark,
  Wallet,
  Library,
  ClipboardList,
  GraduationCap,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

const DEPARTMENT_LIST = [
  { key: 'general', name: 'General', icon: Building2 },
  { key: 'it', name: 'IT Support', icon: Laptop2 },
  { key: 'admin', name: 'Administration', icon: Landmark },
  { key: 'finance', name: 'Finance', icon: Wallet },
  { key: 'library', name: 'Library', icon: Library },
  { key: 'registrar', name: 'Registrar', icon: ClipboardList },
  { key: 'academic', name: 'Academic Affairs', icon: GraduationCap },
];

export default function Departments() {
  const [ticketsByDept, setTicketsByDept] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.tickets.list();
        const tickets = res.data?.data || res.data || [];
        const counts = {};
        tickets.forEach((t) => {
          const d = t.category || t.department || 'general';
          counts[d] = (counts[d] || 0) + 1;
        });
        setTicketsByDept(counts);
      } catch {
        setTicketsByDept({});
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalTickets = Object.values(ticketsByDept).reduce((a, b) => a + b, 0);

  return (
    <Layout role="admin">
      <div className="space-y-6">
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-gray-500 text-sm mt-1">University departments with real-time ticket activity.</p>
          </div>
          <button
            onClick={() => setMessage('Feature coming soon.')}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all shadow-sm"
          >
            + Add Department
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
            Loading departments...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENT_LIST.map((dept) => {
              const Icon = dept.icon;
              const count = ticketsByDept[dept.key] || 0;
              const pct = totalTickets ? Math.round((count / totalTickets) * 100) : 0;
              return (
                <div key={dept.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#E05F6B]/10 flex items-center justify-center">
                      <Icon size={20} className="text-[#E05F6B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Tickets</span>
                      <span className="font-semibold text-gray-800">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#E05F6B]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{pct}% of all tickets</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setMessage('Feature coming soon.')}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setMessage('Feature coming soon.')}
                      className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
