import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import I from '../components/Icon';
import Logo from '../components/Logo';

const ROLES = [
  { key: 'student',    name: 'Student',       desc: 'Submit tickets, browse schedules, track requests.', icon: I.capStudent(22) },
  { key: 'instructor', name: 'Instructor',    desc: 'Manage assigned tickets, schedules, and tasks.',     icon: I.feather(22) },
  { key: 'admin',      name: 'Administrator', desc: 'Oversee tickets, users, departments, analytics.',    icon: I.shield(22) },
];

const ROLE_LABEL = { student: 'Student', instructor: 'Instructor', admin: 'Administrator' };

const DEMO = {
  student:    { email: 'student@runcademic.com',    password: 'student123' },
  instructor: { email: 'instructor@runcademic.com', password: 'instructor123' },
  admin:      { email: 'admin@runcademic.com',      password: 'admin123' },
};

const ROUTABLE_ROLES = new Set(['student', 'instructor', 'admin']);

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('runcademic_user') || 'null');
      if (u?.role && ROUTABLE_ROLES.has(u.role)) {
        navigate(`/${u.role}`, { replace: true });
      } else if (u?.role) {
        localStorage.removeItem('runcademic_user');
        localStorage.removeItem('access_token');
      }
    } catch {
      localStorage.removeItem('runcademic_user');
      localStorage.removeItem('access_token');
    }
  }, [navigate]);

  const pickRole = (r) => {
    setRole(r);
    setEmail(DEMO[r].email);
    setPassword(DEMO[r].password);
    setErr('');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setErr('Please fill in all fields.'); return; }
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.auth.login({ email, password });
      if (!ROUTABLE_ROLES.has(data.user.role)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('runcademic_user');
        setErr('This account role is not supported in the current app routing.');
        return;
      }
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('runcademic_user', JSON.stringify({
        id: data.user.id, email: data.user.email,
        name: data.user.name, role: data.user.role,
      }));
      navigate(`/${data.user.role}`);
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <aside className="login-aside">
        <div className="login-mark-row">
          <Logo size={28} />
          <span>Runcademic</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em', marginLeft: 'auto' }}>EST. 2026 · v4.0</span>
        </div>
        <h2>The university, <span className="em">in order.</span></h2>
        <p className="lede">A single workspace for tickets, schedules, and the people who keep a campus running. Quiet by design — every action where you'd expect it.</p>

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
              <h3>Welcome back.</h3>
              <p className="sub">Sign in to the portal that matches your role on campus.</p>
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
                <strong>Demo environment</strong> — credentials prefill on selection.
              </div>
              <div className="demo-box" style={{ marginTop: 12 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>New to Runcademic?</strong>
                  <Link to="/register" className="btn btn-ghost btn-sm" style={{ paddingRight: 0 }}>
                    Create an account {I.arrowRight(12)}
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
              <div className="login-step-tag">Step 02 / 02 · Credentials · {ROLE_LABEL[role]}</div>
              <h3>Sign in</h3>
              <p className="sub">Demo values are prefilled — just press Sign in.</p>

              <div className="field" style={{ marginBottom: 14 }}>
                <label>Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
              </div>
              <div className="field" style={{ marginBottom: 8 }}>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingRight: 40 }}
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

              {err && (
                <div className="alert" data-tone="error" style={{ marginTop: 12 }}>
                  <span className="ic">{I.alert(16)}</span>
                  <span>{err}</span>
                </div>
              )}

              <button type="submit" className="btn btn-accent" style={{ marginTop: 16, width: '100%' }} disabled={busy}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {busy ? 'Signing in…' : 'Sign in'}
                  {!busy && I.arrowRight(14)}
                </span>
              </button>

              <div className="demo-box">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>Demo credentials</strong>
                  <span className="fine">read-only</span>
                </div>
                <div className="creds">
                  <div className="row"><span style={{ color: 'var(--ink-4)' }}>email</span><span>{DEMO[role]?.email}</span></div>
                  <div className="row"><span style={{ color: 'var(--ink-4)' }}>pass</span><span>{DEMO[role]?.password}</span></div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
