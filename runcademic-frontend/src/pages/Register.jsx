import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import I from '../components/Icon';

const ROLES = [
  { key: 'student',    name: 'Student',       desc: 'Submit tickets, browse schedules, track requests.', icon: I.capStudent(22) },
  { key: 'instructor', name: 'Instructor',    desc: 'Manage assigned tickets, schedules, and tasks.',     icon: I.feather(22) },
  { key: 'admin',      name: 'Administrator', desc: 'Oversee tickets, users, departments, analytics.',    icon: I.shield(22) },
];

const ROLE_LABEL = { student: 'Student', instructor: 'Instructor', admin: 'Administrator' };
const ROUTABLE_ROLES = new Set(['student', 'instructor', 'admin']);

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('runcademic_user') || 'null');
      if (u?.role && ROUTABLE_ROLES.has(u.role)) {
        navigate(`/${u.role}`, { replace: true });
      }
    } catch {
      localStorage.removeItem('runcademic_user');
      localStorage.removeItem('access_token');
    }
  }, [navigate]);

  const pickRole = (r) => {
    setRole(r);
    setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setErr('');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErr('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErr('Passwords do not match.');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.auth.register({ name, email, password, role });
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('runcademic_user', JSON.stringify({
        id: data.user.id, email: data.user.email,
        name: data.user.name, role: data.user.role,
      }));
      navigate(`/${data.user.role}`);
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <div className="login-mark-row">
          <span className="em" style={{ fontSize: 28 }}>R</span>
          <span>Runcademic</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em', marginLeft: 'auto' }}>EST. 2026 · v4.0</span>
        </div>
        <h2>Join your <span className="em">university</span> workspace.</h2>
        <p className="lede">Create an account to submit tickets, manage schedules, and collaborate with your institution — all in a single, calm workspace.</p>

        <div className="feature-list">
          <div className="feature">
            <div className="feature-num">01</div>
            <div>
              <div className="feature-name">Smart Ticketing</div>
              <div className="feature-desc">Routed by department, prioritized by urgency, tracked through resolution.</div>
            </div>
          </div>
          <div className="feature">
            <div className="feature-num">02</div>
            <div>
              <div className="feature-name">Schedule Management</div>
              <div className="feature-desc">Lectures, labs, office hours — for students, faculty and rooms alike.</div>
            </div>
          </div>
          <div className="feature">
            <div className="feature-num">03</div>
            <div>
              <div className="feature-name">Real-time Updates</div>
              <div className="feature-desc">Lifecycle notifications the moment a ticket changes hands.</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          {step === 1 && (
            <div>
              <div className="login-step-tag">Step 01 / 02 · Choose your role</div>
              <h3>Create account.</h3>
              <p className="sub">Select the role that matches your place on campus.</p>
              {ROLES.map((r) => (
                <button key={r.key} className="role-card" onClick={() => pickRole(r.key)}>
                  <div className="role-ic">{r.icon}</div>
                  <div>
                    <div className="role-name">{r.name}</div>
                    <div className="role-desc">{r.desc}</div>
                  </div>
                  <span className="role-arr">{I.arrowRight(18)}</span>
                </button>
              ))}
              <div className="demo-box" style={{ marginTop: 20 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>Already have an account?</strong>
                  <Link to="/login" className="btn btn-ghost btn-sm" style={{ paddingRight: 0 }}>
                    Sign in {I.arrowRight(12)}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: 16, paddingLeft: 0 }}
                onClick={() => { setStep(1); setErr(''); }}
              >
                {I.arrowLeft(14)} Back to roles
              </button>
              <div className="login-step-tag">Step 02 / 02 · Details · {ROLE_LABEL[role]}</div>
              <h3>Sign up.</h3>
              <p className="sub">Tell us a little about you to get started.</p>

              {role === 'admin' && (
                <div className="alert" data-tone="error" style={{ marginTop: 16, marginBottom: 4 }}>
                  <span className="ic">{I.alert(16)}</span>
                  <span>Admin accounts require approval from your system administrator.</span>
                </div>
              )}

              <div className="field" style={{ marginTop: 16, marginBottom: 14 }}>
                <label>Full name</label>
                <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="off" />
              </div>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    style={{ position: 'absolute', right: 10, top: 8, color: 'var(--ink-3)', padding: 4 }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? I.eyeOff(16) : I.eye(16)}
                  </button>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 8 }}>
                <label>Confirm password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    style={{ position: 'absolute', right: 10, top: 8, color: 'var(--ink-3)', padding: 4 }}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPw ? I.eyeOff(16) : I.eye(16)}
                  </button>
                </div>
              </div>

              {err && (
                <div className="alert" data-tone="error" style={{ marginTop: 12 }}>
                  <span className="ic">{I.alert(16)}</span>
                  <span>{err}</span>
                </div>
              )}

              <button type="submit" className="btn btn-accent" style={{ marginTop: 16, width: '100%' }} disabled={busy}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {busy ? 'Creating account…' : 'Create account'}
                  {!busy && I.arrowRight(14)}
                </span>
              </button>

              <div className="demo-box">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>Already have an account?</strong>
                  <Link to="/login" className="btn btn-ghost btn-sm" style={{ paddingRight: 0 }}>
                    Sign in {I.arrowRight(12)}
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
