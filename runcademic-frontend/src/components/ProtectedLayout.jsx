/**
 * Protected Layout - Wraps protected pages with Sidebar
 */

import Sidebar from './Sidebar';
import '../styles/Layout.css';

export default function ProtectedLayout({ children }) {
  return (
    <div className="protected-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
