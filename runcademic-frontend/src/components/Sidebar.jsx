import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Plus,
  Ticket,
  CalendarDays,
  Bell,
  CheckCheck,
  Users,
  Building2,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { animateSidebar, animateList } from '../utils/animations';

const roleMenus = {
  student: [
    { path: '/student', label: 'Dashboard', icon: Home, end: true },
    { path: '/student/submit-ticket', label: 'Submit Ticket', icon: Plus },
    { path: '/student/tickets', label: 'My Tickets', icon: Ticket },
    { path: '/student/schedules', label: 'Schedules', icon: CalendarDays },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  instructor: [
    { path: '/instructor', label: 'Dashboard', icon: Home, end: true },
    { path: '/instructor/tickets', label: 'Assigned Tickets', icon: Ticket },
    { path: '/instructor/create-schedule', label: 'Create Schedule', icon: Plus },
    { path: '/instructor/schedules', label: 'My Schedules', icon: CalendarDays },
    { path: '/instructor/tasks', label: 'My Tasks', icon: CheckCheck },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: Home, end: true },
    { path: '/admin/tickets', label: 'All Tickets', icon: Ticket },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/departments', label: 'Departments', icon: Building2 },
    { path: '/admin/schedules', label: 'Schedules', icon: CalendarDays },
    { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ],
};

const roleLabels = {
  student: 'Student Portal',
  instructor: 'Instructor Portal',
  admin: 'Admin Portal',
};

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const items = roleMenus[role] || [];
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
  const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('runcademic_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    animateSidebar('aside');
    animateList('.nav-item');
  }, []);

  return (
    <aside className="w-60 min-h-screen bg-[#141C27] flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <img
          src="/runcademic-home-logo.png"
          alt="Runcademic logo"
          className="w-40 h-auto object-contain"
        />
        <p className="text-slate-500 text-[10px] font-medium mt-2">{roleLabels[role] || 'Portal'}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#E05F6B] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all cursor-default">
          <div className="w-8 h-8 rounded-full bg-[#E05F6B]/20 border border-[#E05F6B]/30 flex items-center justify-center shrink-0">
            <span className="text-[#E05F6B] text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user.name || 'User'}</p>
            <p className="text-slate-500 text-[10px] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
