import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  School,
  ShieldCheck,
  Ticket,
  CalendarDays,
  Zap,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';
import { animateLogin, animateList } from '../utils/animations';

const ROLES = [
  { key: 'student',    label: 'Student',    desc: 'Access courses & submit tickets', icon: GraduationCap },
  { key: 'instructor', label: 'Instructor', desc: 'Manage classes & assignments',     icon: School },
  { key: 'admin',      label: 'Admin',      desc: 'Full system administration',       icon: ShieldCheck },
];

const FEATURES = [
  { icon: Ticket, label: 'Smart Ticketing', desc: 'Submit and track service requests easily' },
  { icon: CalendarDays, label: 'Schedule Management', desc: 'Organize events and appointments' },
  { icon: Zap, label: 'Real-time Updates', desc: 'Stay notified on all changes instantly' },
];

const DEMO = {
  student:    { email: 'student@runcademic.com',    password: 'student123' },
  instructor: { email: 'instructor@runcademic.com', password: 'instructor123' },
  admin:      { email: 'admin@runcademic.com',       password: 'admin123' },
};

const ROUTABLE_ROLES = new Set(['student', 'instructor', 'admin']);

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState('role'); // 'role' | 'form'
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const selectedRoleObj = ROLES.find((r) => r.key === selectedRole);
  const SelectedRoleIcon = selectedRoleObj?.icon || ShieldCheck;

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

  useEffect(() => {
    animateLogin('.login-panel');
  }, []);

  useEffect(() => {
    if (step === 'role') {
      animateList('.role-btn');
    }
  }, [step]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
    setError('');
    setStep('form');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.auth.login({ email, password });
      if (!ROUTABLE_ROLES.has(data.user.role)) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('runcademic_user');
        setError('This account role is not supported in the current app routing.');
        return;
      }
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('runcademic_user', JSON.stringify({
        id: data.user.id, email: data.user.email,
        name: data.user.name, role: data.user.role,
      }));
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="w-full lg:w-2/5 bg-[#141C27] flex flex-col justify-between p-6 sm:p-8 lg:p-12 min-h-[360px] lg:min-h-screen">
        <div className="pt-1">
          <img
            src="/runcademic-home-logo.png"
            alt="Runcademic logo"
            className="w-[190px] sm:w-[220px] lg:w-[240px] h-auto object-contain"
          />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug mb-4">
            Manage your<br />
            <span className="text-[#E05F6B]">university</span><br />
            seamlessly.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            A centralized platform for tickets, scheduling, and task management across your institution.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
              <div key={f.label} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-[#E05F6B]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.label}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2025 Runcademic. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F5F6FA]">
        <div className="login-panel w-full max-w-md">

          {step === 'role' ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                <p className="text-gray-500 text-sm mt-1">Select your role to continue</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.key}
                      onClick={() => handleSelectRole(r.key)}
                      className="role-btn btn-press w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#E05F6B] hover:shadow-md transition-all duration-200 group text-left"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gray-50 group-hover:bg-[#E05F6B]/10 flex items-center justify-center transition-colors shrink-0">
                        <Icon size={20} className="text-slate-600 group-hover:text-[#E05F6B]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                        <p className="text-xs text-gray-400">{r.desc}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#E05F6B] transition-colors" />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => { setStep('role'); setError(''); }}
                className="btn-press flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8 transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="mb-8 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#E05F6B]/10 flex items-center justify-center">
                  <SelectedRoleIcon size={20} className="text-[#E05F6B]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
                  <p className="text-gray-400 text-sm capitalize">{selectedRole} account</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E05F6B]/20 focus:border-[#E05F6B] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="btn-press absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-press w-full py-3 text-sm font-semibold text-white bg-[#E05F6B] hover:bg-[#d4515d] rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-400 font-medium mb-1">Demo credentials (pre-filled)</p>
                  <p className="text-xs text-gray-500">{DEMO[selectedRole]?.email}</p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
