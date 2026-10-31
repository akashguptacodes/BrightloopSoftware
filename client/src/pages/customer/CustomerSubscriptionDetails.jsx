import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCustomerSubscriptionById,
  customerPauseSubscription,
  customerResumeSubscription,
  customerCancelSubscription,
  customerRenewSubscription,
} from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  Repeat,
  ArrowLeft,
  Clock,
  Calendar,
  ShieldCheck,
  CreditCard,
  History,
  Pause,
  Play,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const CustomerSubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [modalType, setModalType] = useState(null); // 'pause' | 'cancel'
  const [reason, setReason] = useState('');

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await getCustomerSubscriptionById(id);
      setSubscription(res?.data?.subscription || null);
    } catch (err) {
      toast.error('Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const handlePause = async () => {
    try {
      setActionLoading(true);
      const res = await customerPauseSubscription(id, reason);
      toast.success(res?.message || 'Subscription paused successfully.');
      setModalType(null);
      setReason('');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pause subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!window.confirm('Are you sure you want to resume this subscription? Regular billing cycles will resume.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await customerResumeSubscription(id);
      toast.success(res?.message || 'Subscription resumed successfully.');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resume subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      const res = await customerCancelSubscription(id, reason);
      toast.success(res?.message || 'Subscription cancelled successfully.');
      setModalType(null);
      setReason('');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!window.confirm('Confirm renewal? This will extend your subscription into the next billing cycle.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await customerRenewSubscription(id);
      toast.success(res?.message || 'Subscription renewed successfully!');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading subscription...</div>;
  }

  if (!subscription) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Subscription not found</h2>
        <Link to="/customer/subscriptions" className="text-indigo-600 hover:underline mt-2 inline-block">
          Return to My Subscriptions
        </Link>
      </div>
    );
  }

  const plan = subscription.plan;
  const canPause = subscription.status === 'ACTIVE' && (plan?.allowPause ?? true);
  const canResume = subscription.status === 'PAUSED';
  const canCancel = ['ACTIVE', 'PAUSED'].includes(subscription.status) && (plan?.allowEarlyCancellation ?? true);
  const canRenew = ['ACTIVE', 'EXPIRED'].includes(subscription.status) && (plan?.allowRenewal ?? true);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/subscriptions')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">
                {subscription.subscriptionNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  statusBadges[subscription.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Active Since: {new Date(subscription.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Self-Service Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {canResume && (
            <button
              onClick={handleResume}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Service</span>
            </button>
          )}

          {canPause && (
            <button
              onClick={() => {
                setReason('');
                setModalType('pause');
              }}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Service</span>
            </button>
          )}

          {canRenew && (
            <button
              onClick={handleRenew}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew Now</span>
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => {
                setReason('');
                setModalType('cancel');
              }}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Billing Schedule
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Frequency:</span>
              <span className="font-semibold text-gray-900">
                {subscription.billingFrequencySnapshot} (Every {subscription.billingIntervalSnapshot || 1})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Next Renewal Date:</span>
              <span className="font-semibold text-emerald-700">
                {subscription.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Auto-Renewal:</span>
              <span className={subscription.autoRenew ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                {subscription.autoRenew ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Plan & Policy Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Plan Name:</span>
              <span className="font-semibold text-gray-900">
                {plan?.name || subscription.items?.[0]?.planNameSnapshot || 'Custom SaaS Package'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 pt-1 border-t border-gray-100">
              <span>Pause Allowed:</span>
              <span className={plan?.allowPause ? 'text-emerald-600 font-semibold' : 'text-gray-400'}>
                {plan?.allowPause ? 'Yes' : 'No (Commitment)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Early Cancellation:</span>
              <span className={plan?.allowEarlyCancellation ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {plan?.allowEarlyCancellation ? 'Allowed' : 'Restricted'}
              </span>
            </div>
            {subscription.paymentTerms && (
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                <span className="font-semibold text-gray-700">Terms: </span>
                {subscription.paymentTerms}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Subscription Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Item Description</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5">Qty</th>
                <th className="px-6 py-3.5">Tax Snapshot</th>
                <th className="px-6 py-3.5 text-right">Cycle Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscription.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/75">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.productNameSnapshot}</div>
                    {item.variantNameSnapshot && (
                      <div className="text-xs text-gray-500">Variant: {item.variantNameSnapshot}</div>
                    )}
                    {item.planNameSnapshot && (
                      <div className="text-xs text-indigo-600 font-medium">Plan: {item.planNameSnapshot}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-800">
                    ₹{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {Number(item.taxRateSnapshot) > 0 ? `${Number(item.taxRateSnapshot)}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right font-mono">
                    ₹{Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="p-6 bg-gray-50/70 border-t border-gray-200 flex justify-end">
          <div className="w-full md:w-80 bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900 font-mono">
                ₹{Number(subscription.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Discounts:</span>
              <span className="font-semibold font-mono">
                -₹{Number(subscription.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes:</span>
              <span className="font-semibold text-gray-900 font-mono">
                +₹{Number(subscription.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total Per Cycle:</span>
              <span className="text-xl font-black text-indigo-600 font-mono">
                ₹{Number(subscription.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Audit Timeline */}
      {subscription.history && subscription.history.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-base">Subscription History</h3>
          </div>
          <div className="space-y-4 pl-4 border-l-2 border-indigo-100">
            {subscription.history.map((h) => (
              <div key={h.id} className="text-xs text-gray-600">
                <div className="font-semibold text-gray-800">{h.action}</div>
                <div className="text-gray-400 text-xxs">{new Date(h.createdAt).toLocaleString()}</div>
                {(h.description || h.note) && <p className="mt-0.5 text-gray-500">{h.description || h.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {modalType === 'pause' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <Pause className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Pause Subscription</h3>
                <p className="text-xs text-gray-500">Temporarily suspend recurring billing</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Your subscription and access will be paused. You can resume at any time from this portal.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for pause (optional)
              </label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Vacation, seasonal hiatus, project delay..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePause}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
              >
                {actionLoading ? 'Pausing...' : 'Confirm Pause'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {modalType === 'cancel' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Cancel Subscription</h3>
                <p className="text-xs text-gray-500">Terminate your recurring service plan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to cancel subscription <strong className="font-mono">{subscription.subscriptionNumber}</strong>? Future renewals will cease immediately.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Reason for cancellation (optional)
              </label>
              <textarea
                rows="3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              ></textarea>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Active
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSubscriptionDetails;
