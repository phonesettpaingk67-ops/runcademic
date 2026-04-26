import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import I from '../../components/Icon';
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

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError('');
    setSubmitting(true);
    try {
      await api.tickets.create({
        title: form.title,
        description: form.description,
        priority: form.priority,
        category: form.department,
      });
      setSuccess(true);
      setForm({ title: '', description: '', priority: 'medium', department: 'general' });
    } catch (err) {
      const d = err.response?.data?.details;
      setError(Array.isArray(d) ? d.map((x) => x.message).join(', ') : err.response?.data?.message || 'Failed to submit ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout role="student">
      <div className="page" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow">Student portal · New request</div>
            <h1>Submit a ticket.</h1>
            <p className="sub">Tell us what you need. Routed to the right department in seconds.</p>
          </div>
        </div>

        {success && (
          <div className="alert" data-tone="success" style={{ marginBottom: 20 }}>
            <span className="ic">{I.check(16)}</span>
            <div>
              <strong>Ticket submitted.</strong> You'll be notified the moment it's assigned.
              <div style={{ marginTop: 10 }} className="row gap-2">
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student/tickets')}>View my tickets</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSuccess(false)}>Submit another</button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card card-pad col gap-6">
          <div className="field">
            <label>Title <span className="req">*</span></label>
            <input
              className="input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Briefly, what's the issue?"
              required
            />
            <div className="help">Be specific — e.g. "Wi-Fi keeps dropping in Babbage 214" not "internet broken".</div>
          </div>

          <div className="field">
            <label>Description <span className="req">*</span></label>
            <textarea
              className="textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Include when it happened, what you tried, and any error messages."
              required
            />
          </div>

          <div className="split-narrow">
            <div className="field">
              <label>Priority</label>
              <select className="input" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low — minor inconvenience</option>
                <option value="medium">Medium — affects my day</option>
                <option value="high">High — blocking my coursework</option>
                <option value="urgent">Urgent — academic deadline at risk</option>
              </select>
            </div>
            <div className="field">
              <label>Department</label>
              <select className="input" name="department" value={form.department} onChange={handleChange}>
                {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="alert" data-tone="error">
              <span className="ic">{I.alert(16)}</span><span>{error}</span>
            </div>
          )}

          <div className="row gap-3" style={{ justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--rule-soft)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/student')}>Cancel</button>
            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? 'Submitting…' : (<>Submit ticket {I.arrowRight(14)}</>)}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
