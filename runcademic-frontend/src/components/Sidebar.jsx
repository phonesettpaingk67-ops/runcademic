import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import I from './Icon';
import Logo from './Logo';

const roleMenus = {
  student: [
    { path: '/student',                 label: 'Dashboard',      icon: 'dashboard', end: true },
    { path: '/student/submit-ticket',   label: 'Submit Ticket',  icon: 'send' },
    { path: '/student/tickets',         label: 'My Tickets',     icon: 'ticket' },
    { path: '/student/schedules',       label: 'Schedules',      icon: 'calendar' },
    { path: '/student/notifications',   label: 'Notifications',  icon: 'bell' },
  ],
  instructor: [
    { path: '/instructor',                  label: 'Dashboard',        icon: 'dashboard', end: true },
    { path: '/instructor/tickets',          label: 'Assigned Tickets', icon: 'inbox' },
    { path: '/instructor/create-schedule',  label: 'Create Schedule',  icon: 'send' },
    { path: '/instructor/schedules',        label: 'My Schedules',     icon: 'calendar' },
    { path: '/instructor/tasks',            label: 'My Tasks',         icon: 'tasks' },
  ],
  admin: [
    { path: '/admin',             label: 'Dashboard',    icon: 'dashboard', end: true },
    { path: '/admin/tickets',     label: 'All Tickets',  icon: 'ticket' },
    { path: '/admin/users',       label: 'Users',        icon: 'users' },
    { path: '/admin/departments', label: 'Departments',  icon: 'building' },
    { path: '/admin/schedules',   label: 'Schedules',    icon: 'calendar' },
    { path: '/admin/reports',     label: 'Reports',      icon: 'chart' },
  ],
};

const roleLabels = {
  student: 'Student portal',
  instructor: 'Instructor portal',
  admin: 'Admin portal',
};

export default function Sidebar({ role, isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = roleMenus[role] || [];
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
  const initials = (user.name || user.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('runcademic_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    onClose();
    navigate('/login');
  };

  const isActive = (item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  return (
    <aside className="rail" data-mobile-open={isOpen ? 'true' : 'false'}>
      <div className="rail-brand">
        <div className="rail-mark"><Logo size={20} /></div>
        <div className="rail-name">Runcademic</div>
      </div>
      <div className="rail-section">
        <div className="rail-section-label">{roleLabels[role] || 'Portal'}</div>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className="rail-link"
            data-active={isActive(item) ? 'true' : 'false'}
          >
            <span className="rail-icon">{I[item.icon] && I[item.icon](18)}</span>
            <span className="rail-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="rail-foot">
        <div className="rail-avatar">{initials}</div>
        <div className="rail-foot-meta">
          <div className="rail-foot-name">{user.name || 'User'}</div>
          <div className="rail-foot-mail">{user.email || ''}</div>
        </div>
        <button className="rail-foot-out" onClick={handleLogout} title="Sign out" aria-label="Sign out">
          {I.signOut(14)}
        </button>
      </div>
    </aside>
  );
}
