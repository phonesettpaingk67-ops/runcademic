import { useState } from 'react';
import Layout from '../../components/Layout';
import I from '../../components/Icon';

const INITIAL_TASKS = [
  { id: 1, title: 'Grade midterm essays — PHIL-401', due: 'Apr 30', priority: 'high',   status: 'in_progress' },
  { id: 2, title: 'Submit annual review materials',  due: 'May 04', priority: 'medium', status: 'pending' },
  { id: 3, title: 'Approve guest lecturer for May 12', due: 'May 02', priority: 'low',  status: 'pending' },
  { id: 4, title: 'Update CS-220 syllabus addendum', due: 'Apr 29', priority: 'urgent', status: 'in_progress' },
  { id: 5, title: 'Confirm room booking for finals', due: 'Apr 28', priority: 'high',   status: 'done' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const setStatus = (id, status) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status } : t)));

  return (
    <Layout role="instructor">
      <div className="page" style={{ maxWidth: 880 }}>
        <div className="page-head">
          <div>
            <div className="eyebrow">Instructor portal</div>
            <h1>
              My <span className="serif italic" style={{ color: 'var(--accent)' }}>tasks</span>.
            </h1>
            <p className="sub">A focused list of things only you can do.</p>
          </div>
        </div>

        <div className="card">
          {tasks.map((t, i) => (
            <div
              key={t.id}
              className="task-row"
              style={{
                padding: '18px 22px',
                borderTop: i === 0 ? 0 : '1px solid var(--rule-soft)',
              }}
            >
              <div>
                <div
                  style={{
                    color: t.status === 'done' ? 'var(--ink-4)' : 'var(--ink)',
                    textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    fontSize: 14,
                    fontWeight: 450,
                  }}
                >
                  {t.title}
                </div>
                <div className="fine mono" style={{ marginTop: 3 }}>Due {t.due}</div>
              </div>

              <span className="pri" data-pri={t.priority}>{t.priority}</span>

              <select
                className="input"
                style={{ height: 28, padding: '0 8px', fontSize: 12, width: 130 }}
                value={t.status}
                onChange={(e) => setStatus(t.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>

              <button className="row-action" aria-label="More">{I.more(14)}</button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
