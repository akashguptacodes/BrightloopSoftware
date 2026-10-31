import { useState, useEffect } from 'react';
import {
  getRevenueReport,
  getSubscriptionReport,
  getCustomerReport,
  getInvoiceReport,
  getProductPlanReport,
  exportReportCsv,
  exportReportPdf,
} from '../../services/reportService';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  DollarSign,
  Repeat,
  Users,
  Receipt,
  Package,
  TrendingUp,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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

const TABS = [
  { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
  { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'invoices', label: 'Invoicing & Balances', icon: Receipt },
  { id: 'products', label: 'Products & Plans', icon: Package },
];

const PRESETS = [
  { id: '30days', label: 'Last 30 Days' },
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [datePreset, setDatePreset] = useState('30days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {
        datePreset,
        ...(datePreset === 'custom' ? { startDate, endDate } : {}),
      };

      let res;
      if (activeTab === 'revenue') res = await getRevenueReport(params);
      else if (activeTab === 'subscriptions') res = await getSubscriptionReport(params);
      else if (activeTab === 'customers') res = await getCustomerReport(params);
      else if (activeTab === 'invoices') res = await getInvoiceReport(params);
      else if (activeTab === 'products') res = await getProductPlanReport(params);

      setReportData(res?.data || null);
    } catch (err) {
      toast.error('Failed to load analytical report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, datePreset]);

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please specify both start and end dates.');
      return;
    }
    fetchReport();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = {
        datePreset,
        ...(datePreset === 'custom' ? { startDate, endDate } : {}),
      };
      const blob = await exportReportCsv(activeTab, params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Brightloop-${activeTab}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV report downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const params = {
        datePreset,
        ...(datePreset === 'custom' ? { startDate, endDate } : {}),
      };
      const blob = await exportReportPdf(activeTab, params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Brightloop-${activeTab}-executive-summary.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF executive report downloaded.');
    } catch (err) {
      toast.error('Failed to export PDF report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Business Intelligence & Financial Reporting</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Executive metrics, subscriber churn distributions, revenue realization, and cohort analytics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exporting || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition shadow-sm"
            title="Refresh current report"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            Period:
          </span>
          <div className="flex items-center gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  datePreset === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {datePreset === 'custom' && (
          <form onSubmit={handleApplyCustomDate} className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-400">&rarr;</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
            >
              Apply
            </button>
          </form>
        )}
      </div>

      {/* Report Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. REVENUE REPORT */}
          {activeTab === 'revenue' && reportData && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gross Collections</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                    ₹{Number(reportData.summary?.grossRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{reportData.summary?.paymentCount || 0} successful payments</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Processed Refunds</p>
                  <p className="text-2xl font-bold text-red-600 mt-1 font-mono">
                    -₹{Number(reportData.summary?.totalRefunds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{reportData.summary?.refundCount || 0} refunds returned</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Net Realized Revenue</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                    ₹{Number(reportData.summary?.netRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">Collections less refund deductions</p>
                </div>
              </div>

              {/* 12-Month Rolling Revenue Trend */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Monthly Net Revenue Trajectory (12 Months)
                </h3>
                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.monthlyTrend || []}>
                      <defs>
                        <linearGradient id="netRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Revenue']}
                        contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="netRevenue" stroke="#10B981" strokeWidth={2.5} fill="url(#netRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Collections by Payment Gateway / Instrument
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.methodBreakdown || []}
                          dataKey="amount"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                        >
                          {(reportData.methodBreakdown || []).map((_, i) => (
                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    {(reportData.methodBreakdown || []).map((m, i) => (
                      <div key={m.method} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                          <span className="text-gray-900 uppercase font-semibold">{m.method}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-gray-900">₹{Number(m.amount).toLocaleString('en-IN')}</span>
                          <span className="text-gray-400 ml-2">({m.count} txns)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SUBSCRIPTIONS REPORT */}
          {activeTab === 'subscriptions' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total Active</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary?.active || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Paused</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{reportData.summary?.paused || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{reportData.summary?.cancelled || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">New in Period</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary?.newInPeriod || 0}</p>
                </div>
              </div>

              {/* Status & Frequency Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Status Distribution</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData.statusDistribution || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                        >
                          {(reportData.statusDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Billing Frequency Distribution</h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.frequencyDistribution || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="frequency" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CUSTOMER REPORT */}
          {activeTab === 'customers' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary?.total || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">New Signups</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.summary?.newInPeriod || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Active Subscribers</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{reportData.summary?.withActiveSubscriptions || 0}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Overdue Accounts</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{reportData.summary?.withOverdueInvoices || 0}</p>
                </div>
              </div>

              {/* Top 10 Customers Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-base">Top 10 High-Value Accounts (Lifetime Revenue)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Customer / Company</th>
                        <th className="px-6 py-3.5">Contact Person</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5 text-right">Total Invoiced</th>
                        <th className="px-6 py-3.5 text-right">Revenue Contributed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.topCustomers || []).map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{c.companyName || 'Individual'}</td>
                          <td className="px-6 py-4">{c.contactPerson || 'N/A'}</td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">{c.email}</td>
                          <td className="px-6 py-4 font-mono text-right text-gray-600">
                            ₹{Number(c.invoicedTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-right text-emerald-600">
                            ₹{Number(c.revenuePaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. INVOICE REPORT */}
          {activeTab === 'invoices' && reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoiced Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">
                    ₹{Number(reportData.summary?.invoicedTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected Amount</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
                    ₹{Number(reportData.summary?.paidTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1 font-mono">
                    ₹{Number(reportData.summary?.outstandingTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-4">Invoice Volume by Status</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(reportData.statusBreakdown || []).map((s) => (
                    <div key={s.status} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500">{s.status}</span>
                      <p className="text-xl font-bold text-gray-900 mt-1">{s.count} invoices</p>
                      <p className="text-xs font-mono text-gray-600 mt-0.5">₹{Number(s.amount).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. PRODUCTS & PLANS REPORT */}
          {activeTab === 'products' && reportData && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-base">Top Performing Catalog Products & Variants</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Product Name</th>
                        <th className="px-6 py-3.5">Variant Snapshot</th>
                        <th className="px-6 py-3.5 text-right">Units Billed</th>
                        <th className="px-6 py-3.5 text-right">Total Invoiced Volume</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.topProducts || []).map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{p.productName}</td>
                          <td className="px-6 py-4 text-xs text-gray-500">{p.variantName}</td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">{p.unitsSold}</td>
                          <td className="px-6 py-4 font-mono font-bold text-right text-indigo-600">
                            ₹{Number(p.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-900 text-base">Subscription Plan Adoption</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Plan Name</th>
                        <th className="px-6 py-3.5 text-right">Invoiced Units</th>
                        <th className="px-6 py-3.5 text-right">Gross Invoiced Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(reportData.topPlans || []).map((pl, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{pl.planName}</td>
                          <td className="px-6 py-4 text-right font-medium text-gray-900">{pl.unitsSold}</td>
                          <td className="px-6 py-4 font-mono font-bold text-right text-emerald-600">
                            ₹{Number(pl.revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

