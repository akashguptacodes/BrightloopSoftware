export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

export const getDashboardPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.STAFF:
      return '/staff/dashboard';
    case ROLES.CUSTOMER:
      return '/customer/dashboard';
    default:
      return '/login';
  }
};
