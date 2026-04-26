import { Menu } from 'lucide-react';

export default function Navbar({ role, onMenuToggle }) {
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="hidden sm:block text-xs text-gray-400 font-medium truncate">{today}</p>
          <p className="text-sm font-semibold text-gray-700 capitalize truncate">{role} Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[180px]">{user.name || 'User'}</p>
          <p className="text-xs text-gray-400 capitalize">{role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#E05F6B]/10 border-2 border-[#E05F6B]/20 flex items-center justify-center">
          <span className="text-[#E05F6B] text-xs font-bold">
            {(user.name || user.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
