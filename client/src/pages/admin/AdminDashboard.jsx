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
  Receipt,
  CreditCard,
  CalendarClock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('12'); // '6' or '12'

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

  const revenueData = (stats?.revenueChart || []).slice(
    chartRange === '6' ? -6 : -12
  );

  const subPieData = stats?.subscriptionDistribution?.filter((d) => d.value > 0) || [];
  const pieColors = ['#10B981', '#F59E0B', '#EF4444', '#64748B'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Executive Business Command Center</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time subscription ARR, billing lifecycle, customer health, and financial reconciliations.
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
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Open Reports & Analytics</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Revenue Collected</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5 font-mono">
                {loading ? '...' : `₹${(stats?.financials?.netRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </h3>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-gray-500">
              This Month: <strong className="text-emerald-700 font-mono">₹{(stats?.financials?.revenueThisMonth || 0).toLocaleString('en-IN')}</strong>
            </span>
            <Link to="/admin/payments" className="text-blue-600 font-semibold hover:underline">
              Ledger &rarr;
            </Link>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subscriptions</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.subscriptions?.active || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-gray-500">
              {stats?.subscriptions?.total || 0} total ({stats?.subscriptions?.paused || 0} paused)
            </span>
            <Link to="/admin/subscriptions" className="text-indigo-600 font-semibold hover:underline">
              Manage &rarr;
            </Link>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding Balance</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1.5 font-mono">
                {loading ? '...' : `₹${(stats?.financials?.totalOutstandingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              </h3>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-red-600 font-medium">
              Overdue: ₹{(stats?.financials?.overdueInvoiceAmount || 0).toLocaleString('en-IN')}
            </span>
            <Link to="/admin/invoices" className="text-amber-600 font-semibold hover:underline">
              Invoices &rarr;
            </Link>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1.5">
                {loading ? '...' : stats?.customers?.total || 0}
              </h3>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-gray-100 pt-2.5">
            <span className="text-emerald-700 font-medium">
              +{stats?.customers?.newThisMonth || 0} added this month
            </span>
            <Link to="/admin/customers" className="text-blue-600 font-semibold hover:underline">
              Clients &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Operational Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Catalog Products</p>
            <p className="text-base font-bold text-gray-900">
              {stats?.products?.active || 0} <span className="text-xs text-gray-400 font-normal">/ {stats?.products?.total || 0}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Subscription Plans</p>
            <p className="text-base font-bold text-gray-900">
              {stats?.products?.activePlans || 0} <span className="text-xs text-gray-400 font-normal">/ {stats?.products?.totalPlans || 0}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Expiring in 7 Days</p>
            <p className="text-base font-bold text-amber-600">
              {stats?.subscriptions?.expiringSoon || 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Invoices Settled</p>
            <p className="text-base font-bold text-gray-900">
              {stats?.invoices?.paid || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Net Revenue Performance Trend
              </h2>
              <p className="text-xs text-gray-500">Gross revenue receipts minus processed refunds (INR)</p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setChartRange('6')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  chartRange === '6'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Last 6M
              </button>
              <button
                onClick={() => setChartRange('12')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  chartRange === '12'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Last 12M
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Revenue']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="netRevenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status Distribution (1 col) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-600" />
              Subscription Status Mix
            </h2>
            <p className="text-xs text-gray-500">Distribution across active customer contracts</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {subPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-gray-400">No subscription data to visualize</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-gray-100">
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg text-center font-medium">
              {stats?.subscriptions?.active || 0} Active
            </div>
            <div className="bg-amber-50 text-amber-800 p-2 rounded-lg text-center font-medium">
              {stats?.subscriptions?.paused || 0} Paused
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Stream */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Recent System & Customer Activities</h2>
          </div>
          <span className="text-xs text-gray-400">Live Audit Stream</span>
        </div>

        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((act) => (
              <div key={act.id} className="p-4 hover:bg-gray-50 flex items-start justify-between gap-4 transition">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                        {act.action}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {act.customer?.companyName || act.customer?.contactPerson || act.user?.name || 'System'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{act.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-gray-400">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              No recent activity recorded. New actions will stream here automatically.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
