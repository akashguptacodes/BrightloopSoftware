import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/dashboardService';
import {
  Users,
  UserCheck,
  Package,
  Repeat,
  Percent,
  BadgePercent,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data || null);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Control Panel — Sprint 2</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time catalog, plans, taxes, discounts, and team operations for Brightloop Software.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Package className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {/* Primary Sprint 2 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Catalog Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.products?.total || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-emerald-700 font-medium">
              {stats?.products?.active || 0} active in catalog
            </span>
            <Link to="/admin/products" className="text-blue-600 hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription Plans</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.plans?.total || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-emerald-700 font-medium">
              {stats?.plans?.active || 0} active plans
            </span>
            <Link to="/admin/plans" className="text-blue-600 hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

        {/* Taxes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Rules</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.taxes?.total || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-gray-600">
              {stats?.taxes?.active || 0} active rules
            </span>
            <Link to="/admin/taxes" className="text-blue-600 hover:underline">
              Configure &rarr;
            </Link>
          </div>
        </div>

        {/* Discounts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Discounts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.discounts?.active || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-gray-500">
              {stats?.discounts?.total || 0} total rules
            </span>
            <Link to="/admin/discounts" className="text-blue-600 hover:underline">
              Manage &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* User Accounts & Future Sprints */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Staff Members */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Accounts</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.users?.staffCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2.5 flex justify-between">
            <span>Internal team</span>
            <Link to="/admin/staff" className="text-blue-600 hover:underline">Staff List &rarr;</Link>
          </div>
        </div>

        {/* Registered Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.users?.customerCount || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-2.5">
            <span>Verified portal accounts</span>
          </div>
        </div>

        {/* Active Subscriptions (Sprint 3) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Sprint 3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mt-1.5">—</h3>
            </div>
            <div className="w-11 h-11 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-600 border-t border-gray-100 pt-2.5 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> Coming in Sprint 3 (Quotations & Subs)
          </div>
        </div>

        {/* Recurring Invoices (Sprint 3) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recurring Billing</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Sprint 3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mt-1.5">—</h3>
            </div>
            <div className="w-11 h-11 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-600 border-t border-gray-100 pt-2.5 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> Coming in Sprint 3 (Invoicing & Auto-billing)
          </div>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sprint 2 Commercial Operations</h2>
          <div className="space-y-2.5">
            <Link
              to="/admin/products"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Product Catalog & Variants</h4>
                  <p className="text-xs text-gray-500">Configure base software items and variant price add-ons</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/admin/plans"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Subscription Cadences & Plans</h4>
                  <p className="text-xs text-gray-500">Manage daily, weekly, monthly, and yearly recurring models</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition group-hover:translate-x-0.5" />
            </Link>

            <Link
              to="/admin/discounts"
              className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <BadgePercent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Discount & Promo Rules</h4>
                  <p className="text-xs text-gray-500">Define fixed and percentage discounts with threshold criteria</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sprint 2 Architecture Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">PostgreSQL Catalog Models</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">SYNCHRONIZED</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Monetary Precision (Prisma Decimal)</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Discount Eligibility Engine</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">STANDBY FOR S3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Itemized Price Calculator</span>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">STANDBY FOR S3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
