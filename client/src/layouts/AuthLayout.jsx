import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f3f7f4] via-[#edf5fc] to-[#e7eff8] px-4 py-8">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded bg-[#2d6a4f] shadow-sm mb-4 border border-[#1b4332]">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Brightloop Software</h1>
        <p className="text-sm text-slate-500 mt-1">Subscription Management Platform</p>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded shadow-sm border border-[#cde2d4] p-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-slate-400">&copy; {new Date().getFullYear()} Brightloop Software. All rights reserved.</p>
    </div>
  );
};

export default AuthLayout;
