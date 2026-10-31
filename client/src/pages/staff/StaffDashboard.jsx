import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/dashboardService';
import {
  Package,
  Repeat,
  Percent,
  BadgePercent,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileText,
  Receipt,
  CreditCard,
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data || null);
    } catch (err) {
      console.error('Failed to load staff dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
            Internal Operations Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Staff Member'}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse available products, subscription plans, taxes, and promotional discount rules (read-only view).
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm w-fit"
          title="Refresh statistics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Available Commercial Catalog Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.products?.active || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-gray-500">{stats?.products?.total || 0} total</span>
            <Link to="/staff/products" className="text-blue-600 font-semibold hover:underline">
              Browse &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Plans</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.plans?.active || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-gray-500">{stats?.plans?.total || 0} total</span>
            <Link to="/staff/plans" className="text-blue-600 font-semibold hover:underline">
              Browse &rarr;
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax Rules</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.taxes?.active || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xs border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-gray-500">Applicable on billing</span>
            <Link to="/staff/taxes" className="text-blue-600 font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>

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
          <div className="mt-3 text-xs border-t border-gray-100 pt-2.5 flex justify-between">
            <span className="text-gray-500">Promotions active</span>
            <Link to="/staff/discounts" className="text-blue-600 font-semibold hover:underline">
              View &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Upcoming Roadmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Commercial & Billing Operations</h2>
        <p className="text-xs text-gray-500 mb-4">
          Manage quotations, contracts, invoicing, and collections for Brightloop Software customers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/staff/quotations" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <FileText className="w-4 h-4" />
              <h4 className="font-bold text-sm text-gray-900">Quotation System</h4>
            </div>
            <p className="text-xs text-gray-500">
              Pick plans, select variant add-ons, and issue quotes with validity dates.
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Active Module
            </span>
          </Link>

          <Link to="/staff/invoices" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <Receipt className="w-4 h-4" />
              <h4 className="font-bold text-sm text-gray-900">Invoicing & PDF Generator</h4>
            </div>
            <p className="text-xs text-gray-500">
              Manual and automated recurring invoice drafts, live PDF creation, and status tracking.
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Sprint 4 Live
            </span>
          </Link>

          <Link to="/staff/payments" className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CreditCard className="w-4 h-4" />
              <h4 className="font-bold text-sm text-gray-900">Payment Collection</h4>
            </div>
            <p className="text-xs text-gray-500">
              Record bank payments, match customer remittances, and track receivables.
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Sprint 4 Live
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
