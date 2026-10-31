import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/roleHelpers';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { user } = useAuth();
  const targetPath = user ? getDashboardPath(user.role) : '/login';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded flex items-center justify-center mb-4 shadow-xs">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-md mt-2">
        The page you are looking for doesn't exist, was removed, or you don't have permission to access it.
      </p>

      <Link
        to={targetPath}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{user ? 'Return to Dashboard' : 'Back to Login'}</span>
      </Link>
    </div>
  );
};

export default NotFound;

