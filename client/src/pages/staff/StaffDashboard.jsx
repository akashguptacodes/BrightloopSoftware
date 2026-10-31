import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStaffDashboardStats } from '../../services/dashboardService';
import {
  FileSpreadsheet,
  Repeat,
  Receipt,
  CreditCard,
  UserCheck,
  CalendarClock,
  ArrowRight,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';

const statusBadge = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-50 text-blue-700',
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  DECLINED: 'bg-red-50 text-red-700',
  CONVERTED: 'bg-purple-50 text-purple-700',
  ISSUED: 'bg-blue-50 text-blue-700',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  OVERDUE: 'bg-red-50 text-red-700',
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-yellow-50 text-yellow-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getStaffDashboardStats();
      setData(res?.data || null);
    } catch (err) {
      console.error('Failed to load staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const kpis = data?.kpis || {};
  const recentQuotations = data?.recentQuotations || [];
  const recentInvoices = data?.recentInvoices || [];
  const upcomingRenewals = data?.upcomingRenewals || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
            Staff Operations Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || 'Staff Member'}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time fulfillment queues: process proposals, monitor pending collections, and manage subscription contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition shadow-sm w-fit"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/staff/reports"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            Business Reports
          </Link>
        </div>
      </div>

      {/* Operational KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subs</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {loading ? '...' : kpis.activeSubscriptions || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-gray-100 pt-2 flex justify-between text-gray-400">
            <span>In Service</span>
            <Link to="/staff/subscriptions" className="text-blue-600 hover:underline">View</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Quotes</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {loading ? '...' : kpis.pendingQuotations || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-gray-100 pt-2 flex justify-between text-gray-400">
            <span>{kpis.totalQuotations || 0} total</span>
            <Link to="/staff/quotations" className="text-blue-600 hover:underline">Queue</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unpaid Invoices</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">
                {loading ? '...' : kpis.pendingInvoices || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-gray-100 pt-2 flex justify-between text-gray-400">
            <span>Awaiting payment</span>
            <Link to="/staff/invoices" className="text-blue-600 hover:underline">Check</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue Bills</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">
                {loading ? '...' : kpis.overdueInvoices || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-gray-100 pt-2 flex justify-between text-gray-400">
            <span>Past due date</span>
            <Link to="/staff/invoices?status=OVERDUE" className="text-red-600 hover:underline">Escalate</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payments Logged</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : kpis.paymentsReceivedCount || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-gray-100 pt-2 flex justify-between text-gray-400">
            <span>Successful</span>
            <Link to="/staff/payments" className="text-blue-600 hover:underline">Receipts</Link>
          </div>
        </div>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-gray-900">Recent Quotations</h3>
              </div>
              <Link to="/staff/quotations" className="text-xs font-semibold text-blue-600 hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentQuotations.length > 0 ? (
                recentQuotations.map((q) => (
                  <div key={q.id} className="p-3.5 hover:bg-gray-50 flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/quotations/${q.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {q.quotationNumber}
                      </Link>
                      <p className="text-gray-600 font-medium truncate max-w-[140px]">{q.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-900">₹{Number(q.grandTotal).toLocaleString('en-IN')}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge[q.status] || 'bg-gray-100 text-gray-700'}`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">No recent quotations</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-900">Recent Invoices</h3>
              </div>
              <Link to="/staff/invoices" className="text-xs font-semibold text-blue-600 hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 hover:bg-gray-50 flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/invoices/${inv.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-gray-600 font-medium truncate max-w-[140px]">{inv.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-900">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadge[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">No recent invoices</div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">Upcoming Renewals</h3>
              </div>
              <Link to="/staff/subscriptions" className="text-xs font-semibold text-blue-600 hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((sub) => (
                  <div key={sub.id} className="p-3.5 hover:bg-gray-50 flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/subscriptions/${sub.id}`} className="font-mono font-bold text-blue-600 hover:underline">
                        {sub.subscriptionNumber}
                      </Link>
                      <p className="text-gray-600 font-medium truncate max-w-[140px]">{sub.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-[11px]">Due {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                      <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded">
                        {sub.planName || 'Recurring'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">No renewals due in next 14 days</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
