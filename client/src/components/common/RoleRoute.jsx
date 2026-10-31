import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleHelpers';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const toastShown = useRef(false);

  const hasAccess = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (user && !hasAccess && !toastShown.current) {
      toastShown.current = true;
      toast.error('You do not have permission to access that page.');
    }
  }, [user, hasAccess]);

  if (!hasAccess) {
    const redirectPath = getDashboardPath(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
