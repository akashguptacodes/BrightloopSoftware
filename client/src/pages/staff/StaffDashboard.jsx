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
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  SENT: 'bg-sky-50 text-sky-800 border-sky-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  DECLINED: 'bg-rose-50 text-rose-800 border-rose-200',
  CONVERTED: 'bg-teal-50 text-teal-800 border-teal-200',
  ISSUED: 'bg-sky-50 text-sky-800 border-sky-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-800 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  OVERDUE: 'bg-rose-50 text-rose-800 border-rose-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PAUSED: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
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
      {/* Top Banner — Classical Light Green */}
      <div className="bg-[#edf6f0] rounded border border-[#c4ded0] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#d9eee0] text-[#1c532e] border border-[#b3dbbe] mb-2">
            Staff Operations Portal
          </span>
          <h1 className="text-2xl font-bold text-[#143d22]">
            Welcome, {user?.name || 'Staff Member'}!
          </h1>
          <p className="text-[#355b42] text-sm mt-1">
            Real-time fulfillment queues: process proposals, monitor pending collections, and manage subscription contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 text-[#2d6a4f] hover:text-[#1b4332] bg-white border border-[#b3dbbe] rounded hover:bg-[#e4f3e9] transition shadow-xs w-fit"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/staff/reports"
            className="px-4 py-2 bg-[#2d6a4f] hover:bg-[#1e4836] text-white rounded text-xs font-semibold shadow-xs transition"
          >
            Business Reports
          </Link>
        </div>
      </div>

      {/* Operational KPI Strip — Decreased Border Radius & Light Green Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Subs */}
        <div className="bg-[#f8fbf9] rounded border border-[#cde2d4] p-4 shadow-xs hover:border-[#9ec9aa] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#446d52] uppercase tracking-wider">Active Subs</p>
              <h3 className="text-2xl font-bold text-[#2d6a4f] font-mono mt-1">
                {loading ? '...' : kpis.activeSubscriptions || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#e3f2e7] text-[#2d6a4f] rounded border border-[#bedec8] flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-[#daebde] pt-2 flex justify-between text-[#557e62]">
            <span>In Service</span>
            <Link to="/staff/subscriptions" className="text-[#2d6a4f] hover:text-[#19402c] font-semibold hover:underline">View</Link>
          </div>
        </div>

        {/* Pending Quotes */}
        <div className="bg-[#f8fbf9] rounded border border-[#cde2d4] p-4 shadow-xs hover:border-[#9ec9aa] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#446d52] uppercase tracking-wider">Pending Quotes</p>
              <h3 className="text-2xl font-bold text-amber-700 font-mono mt-1">
                {loading ? '...' : kpis.pendingQuotations || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-amber-50 text-amber-700 rounded border border-amber-200 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-[#daebde] pt-2 flex justify-between text-[#557e62]">
            <span>{kpis.totalQuotations || 0} total</span>
            <Link to="/staff/quotations" className="text-[#2d6a4f] hover:text-[#19402c] font-semibold hover:underline">Queue</Link>
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-[#f8fbf9] rounded border border-[#cde2d4] p-4 shadow-xs hover:border-[#9ec9aa] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#446d52] uppercase tracking-wider">Unpaid Invoices</p>
              <h3 className="text-2xl font-bold text-slate-800 font-mono mt-1">
                {loading ? '...' : kpis.pendingInvoices || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-sky-50 text-sky-700 rounded border border-sky-200 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-[#daebde] pt-2 flex justify-between text-[#557e62]">
            <span>Awaiting payment</span>
            <Link to="/staff/invoices" className="text-[#2d6a4f] hover:text-[#19402c] font-semibold hover:underline">Check</Link>
          </div>
        </div>

        {/* Overdue Bills */}
        <div className="bg-[#f8fbf9] rounded border border-[#cde2d4] p-4 shadow-xs hover:border-[#9ec9aa] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#446d52] uppercase tracking-wider">Overdue Bills</p>
              <h3 className="text-2xl font-bold text-rose-700 font-mono mt-1">
                {loading ? '...' : kpis.overdueInvoices || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-rose-50 text-rose-700 rounded border border-rose-200 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-[#daebde] pt-2 flex justify-between text-[#557e62]">
            <span>Past due date</span>
            <Link to="/staff/invoices?status=OVERDUE" className="text-rose-700 hover:text-rose-900 font-semibold hover:underline">Escalate</Link>
          </div>
        </div>

        {/* Payments Logged */}
        <div className="bg-[#f8fbf9] rounded border border-[#cde2d4] p-4 shadow-xs hover:border-[#9ec9aa] transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#446d52] uppercase tracking-wider">Payments Logged</p>
              <h3 className="text-2xl font-bold text-[#143d22] font-mono mt-1">
                {loading ? '...' : kpis.paymentsReceivedCount || 0}
              </h3>
            </div>
            <div className="w-9 h-9 bg-[#e3f2e7] text-[#2d6a4f] rounded border border-[#bedec8] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs border-t border-[#daebde] pt-2 flex justify-between text-[#557e62]">
            <span>Successful</span>
            <Link to="/staff/payments" className="text-[#2d6a4f] hover:text-[#19402c] font-semibold hover:underline">Receipts</Link>
          </div>
        </div>
      </div>

      {/* Operational Queues — Classical Styling with Decreased Border Radius */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quotations */}
        <div className="bg-white rounded border border-[#cde2d4] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-[#cde2d4] bg-[#edf6f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#2d6a4f]" />
                <h3 className="text-sm font-bold text-[#143d22]">Recent Quotations</h3>
              </div>
              <Link to="/staff/quotations" className="text-xs font-semibold text-[#2d6a4f] hover:text-[#143d22] hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-[#e9f2eb]">
              {recentQuotations.length > 0 ? (
                recentQuotations.map((q) => (
                  <div key={q.id} className="p-3.5 hover:bg-[#f5faf6] flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/quotations/${q.id}`} className="font-mono font-bold text-[#2d6a4f] hover:underline">
                        {q.quotationNumber}
                      </Link>
                      <p className="text-slate-700 font-medium truncate max-w-[140px]">{q.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900">₹{Number(q.grandTotal).toLocaleString('en-IN')}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge[q.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No recent quotations</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded border border-[#cde2d4] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-[#cde2d4] bg-[#edf6f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2d6a4f]" />
                <h3 className="text-sm font-bold text-[#143d22]">Recent Invoices</h3>
              </div>
              <Link to="/staff/invoices" className="text-xs font-semibold text-[#2d6a4f] hover:text-[#143d22] hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-[#e9f2eb]">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="p-3.5 hover:bg-[#f5faf6] flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/invoices/${inv.id}`} className="font-mono font-bold text-[#2d6a4f] hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                      <p className="text-slate-700 font-medium truncate max-w-[140px]">{inv.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-900">₹{Number(inv.totalAmount).toLocaleString('en-IN')}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge[inv.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No recent invoices</div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <div className="bg-white rounded border border-[#cde2d4] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-[#cde2d4] bg-[#edf6f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#2d6a4f]" />
                <h3 className="text-sm font-bold text-[#143d22]">Upcoming Renewals</h3>
              </div>
              <Link to="/staff/subscriptions" className="text-xs font-semibold text-[#2d6a4f] hover:text-[#143d22] hover:underline">
                All &rarr;
              </Link>
            </div>
            <div className="divide-y divide-[#e9f2eb]">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((sub) => (
                  <div key={sub.id} className="p-3.5 hover:bg-[#f5faf6] flex items-center justify-between text-xs transition">
                    <div>
                      <Link to={`/staff/subscriptions/${sub.id}`} className="font-mono font-bold text-[#2d6a4f] hover:underline">
                        {sub.subscriptionNumber}
                      </Link>
                      <p className="text-slate-700 font-medium truncate max-w-[140px]">{sub.customerName || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600 text-[11px]">Due {new Date(sub.nextBillingDate).toLocaleDateString()}</p>
                      <span className="text-[#1c532e] font-semibold text-[11px] bg-[#d9eee0] border border-[#b3dbbe] px-1.5 py-0.5 rounded">
                        {sub.planName || 'Recurring'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">No renewals due in next 14 days</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
