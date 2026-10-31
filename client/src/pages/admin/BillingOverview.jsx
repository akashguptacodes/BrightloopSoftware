import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBillingStatus, runBillingNow, checkOverdueNow } from '../../services/billingService';
import toast from 'react-hot-toast';
import {
  CalendarClock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Repeat,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const BillingOverview = ({ basePath = '/admin' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [runningOverdue, setRunningOverdue] = useState(false);
  const [lastRunResult, setLastRunResult] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getBillingStatus();
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch billing status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRunBillingNow = async () => {
    if (!window.confirm('Trigger automated recurring billing now? This will scan all active subscriptions due today and generate recurring invoices.')) {
      return;
    }
    try {
      setRunningJob(true);
      setLastRunResult(null);
      const res = await runBillingNow();
      toast.success(res.message || 'Billing job completed successfully');
      setLastRunResult(res.data);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run recurring billing');
    } finally {
      setRunningJob(false);
    }
  };

  const handleCheckOverdueNow = async () => {
    try {
      setRunningOverdue(true);
      const res = await checkOverdueNow();
      toast.success(res.message || 'Overdue check completed');
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check overdue invoices');
    } finally {
      setRunningOverdue(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading billing scheduler diagnostics...
      </div>
    );
  }

  const counts = data?.counts || {};
  const scheduler = data?.scheduler || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
            <CalendarClock className="w-4 h-4" />
            <span>Automated Recurring Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Billing Schedule</h1>
          <p className="text-sm text-gray-500">
            Control automated recurring invoice creation, overdue payment scanners, and trigger manual batch billing runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStatus}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            title="Refresh status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCheckOverdueNow}
            disabled={runningOverdue}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-medium rounded-lg transition disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{runningOverdue ? 'Scanning...' : 'Scan Overdue Invoices'}</span>
          </button>

          <button
            onClick={handleRunBillingNow}
            disabled={runningJob}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{runningJob ? 'Processing Billing...' : 'Run Billing Now'}</span>
          </button>
        </div>
      </div>

      {/* Scheduler Status Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SCHEDULER {scheduler.status || 'RUNNING'}
          </div>
          <h2 className="text-xl font-bold">Node.js In-Process Recurring Billing Worker</h2>
          <p className="text-indigo-200 text-xs max-w-xl">
            Automatically queries all active subscriptions whose next billing date is due, clamps calendar end-of-months, captures snapshots, and emits issued invoices with zero duplicate generation.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs space-y-1.5 min-w-[240px]">
          <div className="flex justify-between text-indigo-200">
            <span>Recurring Invoice Job:</span>
            <span className="text-white font-mono font-medium">00:05 AM Daily</span>
          </div>
          <div className="flex justify-between text-indigo-200">
            <span>Overdue Scanner Job:</span>
            <span className="text-white font-mono font-medium">01:00 AM Daily</span>
          </div>
          <div className="flex justify-between text-indigo-200">
            <span>Server Clock:</span>
            <span className="text-white font-mono font-medium">
              {new Date(scheduler.serverTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Run Result Feedback */}
      {lastRunResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-sm space-y-2 text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-base text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Manual Recurring Run Completed</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block">Total Due Checked:</span>
              <span className="text-base font-bold text-gray-900">{lastRunResult.totalChecked}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block">Invoices Generated:</span>
              <span className="text-base font-bold text-emerald-600">{lastRunResult.generated}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block">Already Invoiced / Skipped:</span>
              <span className="text-base font-bold text-gray-600">{lastRunResult.skipped}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <span className="text-gray-500 block">Errors:</span>
              <span className="text-base font-bold text-rose-600">{lastRunResult.failed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
            <Repeat className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{counts.activeSubscriptions || 0}</div>
          <p className="text-xs text-gray-500">Live billable recurring subscriptions</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Due For Billing</span>
            <CalendarClock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{counts.dueSubscriptions || 0}</div>
          <p className="text-xs text-gray-500">Next billing date is on or before today</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{counts.overdueInvoices || 0}</div>
          <p className="text-xs text-gray-500">Unpaid past due date</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid Invoices</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{counts.paidInvoices || 0}</div>
          <p className="text-xs text-gray-500">Settled and revenue recognized</p>
        </div>
      </div>

      {/* Recent Recurring Invoices Generated */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <span>Recent Recurring Invoices</span>
          </h2>
          <Link
            to={`${basePath}/invoices`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            View All Invoices &rarr;
          </Link>
        </div>

        {!data?.recentRecurringInvoices || data.recentRecurringInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No recurring invoices have been generated yet. When subscriptions reach their billing dates, invoices will appear here automatically.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recentRecurringInvoices.map((inv) => (
              <div
                key={inv.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-gray-50/50 transition px-2 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`${basePath}/invoices/${inv.id}`}
                      className="font-bold text-indigo-600 hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                    <span className="font-semibold text-gray-900">
                      {inv.customer?.companyName || inv.customer?.contactPerson || inv.customer?.name}
                    </span>
                    <span className="text-gray-400">
                      (Sub: {inv.subscription?.subscriptionNumber})
                    </span>
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Generated: {new Date(inv.createdAt).toLocaleString()} • Due:{' '}
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">
                    ₹{Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingOverview;

