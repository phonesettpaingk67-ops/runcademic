import { useLocation } from 'react-router-dom';
import I from './Icon';
import { useTheme } from '../utils/theme';

const ROLE_LABEL = { student: 'Student', instructor: 'Instructor', admin: 'Admin' };

const PAGE_TITLES = {
  '/student': 'Dashboard',
  '/student/submit-ticket': 'Submit Ticket',
  '/student/tickets': 'My Tickets',
  '/student/schedules': 'Schedules',
  '/student/notifications': 'Notifications',
  '/student/assignments': 'Assignments',
  '/student/grades': 'Grades',
  '/instructor': 'Dashboard',
  '/instructor/tickets': 'Assigned Tickets',
  '/instructor/create-schedule': 'Create Schedule',
  '/instructor/schedules': 'My Schedules',
  '/instructor/tasks': 'My Tasks',
  '/instructor/students': 'My Students',
  '/instructor/grading': 'Assignment Grading',
  '/instructor/reports': 'Reports',
  '/admin': 'Dashboard',
  '/admin/tickets': 'All Tickets',
  '/admin/users': 'Users',
  '/admin/departments': 'Departments',
  '/admin/schedules': 'Schedules',
  '/admin/reports': 'Reports & Analytics',
};

function pageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // best-effort fallback
  const last = pathname.split('/').filter(Boolean).pop() || '';
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Dashboard';
}

export default function Navbar({ role, onMenuToggle }) {
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();

  return (
    <div className="topbar">
      <button className="tb-menu" onClick={onMenuToggle} aria-label="Open menu">
        {I.menu(20)}
      </button>
      <div className="crumbs">
        <span>{ROLE_LABEL[role] || 'Portal'}</span>
        <span className="sep">/</span>
        <span className="here">{pageTitle(pathname)}</span>
      </div>
      <div className="search">
        <span style={{ color: 'var(--ink-4)' }}>{I.search(14)}</span>
        <input placeholder="Search tickets, people, courses…" />
        <span className="kbd">⌘K</span>
      </div>
      <div className="tb-toggle" role="group" aria-label="Theme">
        <button data-on={theme === 'light'} onClick={() => setTheme('light')} aria-label="Light mode" title="Light">
          {I.sun(14)}
        </button>
        <button data-on={theme === 'dark'} onClick={() => setTheme('dark')} aria-label="Dark mode" title="Dark">
          {I.moon(14)}
        </button>
      </div>
      <button className="tb-icon" title="Notifications" aria-label="Notifications">
        {I.bell(16)}
        <span className="tb-dot" />
      </button>
    </div>
  );
}
