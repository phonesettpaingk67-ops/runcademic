import { useCallback, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ role, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((p) => !p), []);

  return (
    <div className="app">
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div
        className="rail-backdrop"
        data-on={isSidebarOpen ? 'true' : 'false'}
        onClick={closeSidebar}
        aria-hidden="true"
      />
      <div className="main">
        <Navbar role={role} onMenuToggle={toggleSidebar} />
        <div className="scroll">{children}</div>
      </div>
    </div>
  );
}
