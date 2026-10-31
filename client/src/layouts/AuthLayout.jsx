import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 px-4 py-8">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 shadow-lg shadow-primary-600/30 mb-4">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Brightloop Software</h1>
        <p className="text-sm text-gray-500 mt-1">Subscription Management Platform</p>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <Outlet />
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-gray-400">&copy; {new Date().getFullYear()} Brightloop Software. All rights reserved.</p>
    </div>
  );
};

export default AuthLayout;
