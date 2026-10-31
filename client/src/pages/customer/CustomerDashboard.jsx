import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCustomerProfile } from '../../services/customerPortalService';
import {
  User,
  Mail,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Repeat,
  Receipt,
  ArrowRight,
  Building,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await getCustomerProfile();
        setProfileData(res?.data || null);
      } catch (err) {
        // Fallback for customer without linked profile yet
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const customer = profileData?.customer;
  const stats = profileData?.stats || { totalQuotations: 0, activeSubscriptions: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Customer Self-Service Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {customer?.contactPerson || user?.name || 'Customer'}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve Brightloop proposals, manage your active subscription plans, and inspect contract details.
          </p>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Customer / Company</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer?.companyName || customer?.contactPerson || user?.name}
              </p>
              {customer?.customerCode && (
                <span className="text-xs font-mono text-blue-600 font-medium">
                  Code: {customer.customerCode}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Registered Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={user?.email}>
                {customer?.email || user?.email || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Account Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-700">Active Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quotations Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">My Quotations</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
              Review custom proposals and pricing quotes provided for your company. You can review, approve, or decline them online.
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {stats.totalQuotations} Available
            </span>
            <Link
              to="/customer/quotations"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View Quotes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Subscriptions Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">My Subscriptions</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
              Track your recurring active services, renewal dates, and contract terms.
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {stats.activeSubscriptions} Active
            </span>
            <Link
              to="/customer/subscriptions"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Invoices (Sprint 4) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between opacity-80">
          <div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Invoices & Receipts</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
              PDF downloadable invoices, payment links, and billing history will be generated directly from your active subscriptions.
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              Coming in Sprint 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
