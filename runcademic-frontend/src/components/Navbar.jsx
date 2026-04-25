export default function Navbar({ role }) {
  const user = JSON.parse(localStorage.getItem('runcademic_user') || '{}');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div>
        <p className="text-xs text-gray-400 font-medium">{today}</p>
        <p className="text-sm font-semibold text-gray-700 capitalize">{role} Portal</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name || 'User'}</p>
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
