import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers } from '../../services/userService';
import { Users, UserCheck, FileText, DollarSign, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    staffCount: 0,
    customerCount: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [staffRes, customerRes] = await Promise.all([
          getAllUsers({ role: 'STAFF' }),
          getAllUsers({ role: 'CUSTOMER' }),
        ]);

        const staffData = staffRes?.data?.users || staffRes?.users || staffRes?.data || [];
        const customerData = customerRes?.data?.users || customerRes?.users || customerRes?.data || [];

        setStats({
          staffCount: Array.isArray(staffData) ? staffData.length : 0,
          customerCount: Array.isArray(customerData) ? customerData.length : 0,
          loading: false,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here is an overview of Brightloop Software's system foundation and team members.
          </p>
        </div>
        <Link
          to="/admin/staff"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm w-fit"
        >
          <Users className="w-4 h-4" />
          <span>Manage Staff</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Staff */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Staff Members</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.loading ? '...' : stats.staffCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <span>Verified internal staff accounts</span>
          </p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Registered Customers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {stats.loading ? '...' : stats.customerCount}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <span>Live customer accounts</span>
          </p>
        </div>

        {/* Active Subscriptions (Coming Soon) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Sprint 2</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-400 mt-2">—</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> Coming in Sprint 2
          </p>
        </div>

        {/* Monthly Revenue (Coming Soon) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Sprint 3</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-400 mt-2">—</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> Coming in Sprint 3
          </p>
        </div>
      </div>

      {/* Quick Actions & Foundation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/staff"
              className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Staff Management</h4>
                  <p className="text-xs text-gray-500">Create, activate, or deactivate internal staff accounts</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sprint 1 Foundation Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Role-Based Access Control</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">JWT & Cookie Security</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">ENFORCED</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Password Reset & Nodemailer</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">READY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

