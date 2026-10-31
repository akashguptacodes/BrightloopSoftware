import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleBadgeColors = {
  ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
  STAFF: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CUSTOMER: 'bg-sky-100 text-sky-800 border-sky-200',
};

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#edf5fc] border-b border-[#c8deef] shadow-xs">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded text-slate-600 hover:bg-sky-100 hover:text-slate-900 border border-transparent hover:border-sky-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden md:inline-block text-xs font-semibold uppercase tracking-wider text-sky-900/80 font-mono">
          Brightloop ERP &bull; Operations
        </span>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5 bg-white/80 px-3 py-1.5 rounded border border-[#c4dcf0] shadow-xs">
          <div className="flex items-center justify-center h-7 w-7 rounded bg-[#d8ecfa] text-sky-800 border border-[#b3d7f3]">
            <User className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-800 text-xs leading-tight">{user?.name}</p>
            <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-medium rounded border ${roleBadgeColors[user?.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-red-700 bg-white/80 hover:bg-red-50 border border-slate-300 hover:border-red-300 rounded transition-colors shadow-xs"
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
