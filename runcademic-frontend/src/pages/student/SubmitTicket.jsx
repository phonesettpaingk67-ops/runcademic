import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { api } from '../../services/api';

const DEPARTMENTS = [
  { value: 'general',   label: 'General' },
  { value: 'it',        label: 'IT Support' },
  { value: 'admin',     label: 'Administration' },
  { value: 'finance',   label: 'Finance' },
  { value: 'library',   label: 'Library' },
  { value: 'registrar', label: 'Registrar' },
  { value: 'academic',  label: 'Academic Affairs' },
];

export default function SubmitTicket() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', department: 'general' });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false); setError(''); setSubmitting(true);
    try {
      await api.tickets.create({ title: form.title, description: form.description, priority: form.priority, category: form.department });
      setSuccess(true);
      setForm({ title: '', description: '', priority: 'medium', department: 'general' });
    } catch (err) {
      const d = err.response?.data?.details;
      setError(Array.isArray(d) ? d.map(x => x.message).join(', ') : err.response?.data?.message || 'Failed to submit ticket.');
    } finally { setSubmitting(false); }
  };

  return (
    <Layout role="student">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Ticket</h1>
        <p className="text-gray-500 text-sm mt-1">Describe your issue and we'll route it to the right team.</p>
      </div>

      <div className="max-w-2xl">
        {success && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={18} className="shrink-0" />
            Ticket submitted successfully! We'll get back to you soon.
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            <AlertTriangle size={18} className="shrink-0" /> {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
              <input
                name="title" value={form.title} onChange={handleChange} required
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all"
                placeholder="Brief summary of your issue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange} required rows={5}
                className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all resize-none"
                placeholder="Provide as much detail as possible..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Department</label>
                <select name="department" value={form.department} onChange={handleChange}
                  className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] focus:bg-white transition-all">
                  {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md">
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button type="button" onClick={() => navigate('/student/tickets')}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                View My Tickets
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
