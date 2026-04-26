import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import I from '../../components/Icon';

export default function CreateSchedule() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(`"${form.title || 'Event'}" is on the calendar.`);
    setTimeout(() => navigate('/instructor/schedules'), 900);
  };

  return (
    <Layout role="instructor">
      <div className="page" style={{ maxWidth: 760 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal · New event</div>
            <h1>
              Create a <span className="serif italic" style={{ color: 'var(--accent)' }}>schedule</span>.
            </h1>
            <p className="sub">Add a lecture, office-hours block, or one-off session.</p>
          </div>
        </div>

        {success && (
          <div className="alert" data-tone="success" style={{ marginBottom: 20 }}>
            <span className="ic">{I.check(16)}</span>
            <span><strong>Saved.</strong> {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card card-pad col gap-6">
          <div className="field">
            <label>Event title <span className="req">*</span></label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="e.g. CS-220 lab session"
              required
            />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Topics, prerequisites, materials to bring."
              rows={4}
            />
          </div>

          <div className="split-narrow">
            <div className="field">
              <label>Start time <span className="req">*</span></label>
              <input
                className="input"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => update('startTime', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>End time <span className="req">*</span></label>
              <input
                className="input"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => update('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Location <span className="req">*</span></label>
            <input
              className="input"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Building & room"
              required
            />
          </div>

          <div className="row gap-3" style={{ justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--rule-soft)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/instructor')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              Create schedule {I.arrowRight(14)}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
