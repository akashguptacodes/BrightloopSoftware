import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getSubscriptionById,
  activateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription,
  closeSubscription,
} from '../../services/subscriptionService';
import toast from 'react-hot-toast';
import {
  Repeat,
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  XCircle,
  Building,
  Mail,
  Calendar,
  Clock,
  History,
  ShieldAlert,
  X,
  FileSpreadsheet,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const SubscriptionDetails = ({ basePath = '/admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals for Pause & Cancel
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [pauseNote, setPauseNote] = useState('');

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionById(id);
      setSubscription(res?.data?.subscription || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  // Lifecycle actions
  const handleActivate = async () => {
    try {
      setActionLoading(true);
      await activateSubscription(id);
      toast.success('Subscription activated successfully!');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await pauseSubscription(id, { note: pauseNote });
      toast.success('Subscription paused successfully.');
      setIsPauseModalOpen(false);
      setPauseNote('');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pause subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setActionLoading(true);
      await resumeSubscription(id);
      toast.success('Subscription resumed and now ACTIVE!');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await cancelSubscription(id, { reason: cancelReason });
      toast.success('Subscription has been cancelled.');
      setIsCancelModalOpen(false);
      setCancelReason('');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!window.confirm('Renew this subscription for the next billing cycle?')) return;
    try {
      setActionLoading(true);
      await renewSubscription(id);
      toast.success('Subscription renewed for next cycle!');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Close this subscription contract? This action finalizes the contract.')) return;
    try {
      setActionLoading(true);
      await closeSubscription(id);
      toast.success('Subscription closed.');
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close subscription');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Subscription not found</h2>
        <Link to={`${basePath}/subscriptions`} className="text-indigo-600 hover:underline mt-2 inline-block">
          Return to Subscriptions List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/subscriptions`)}
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
              {subscription.autoRenew && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Auto-Renew ON
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Started on {new Date(subscription.startDate).toLocaleDateString()}
              {subscription.quotation && (
                <span>
                  {' '}• Converted from{' '}
                  <Link
                    to={`${basePath}/quotations/${subscription.quotation.id}`}
                    className="text-blue-600 hover:underline font-mono"
                  >
                    {subscription.quotation.quotationNumber}
                  </Link>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Lifecycle Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {subscription.status === 'PENDING' && (
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Activate</span>
            </button>
          )}

          {subscription.status === 'ACTIVE' && (
            <>
              <button
                onClick={() => setIsPauseModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition font-medium text-sm disabled:opacity-50"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleRenew}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Renew</span>
              </button>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleClose}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close Contract
              </button>
            </>
          )}

          {subscription.status === 'PAUSED' && (
            <>
              <button
                onClick={handleResume}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Resume Subscription</span>
              </button>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Subscriber Details
          </h3>
          <div className="space-y-1 text-sm">
            <Link
              to={`${basePath}/customers/${subscription.customerId}`}
              className="font-bold text-blue-600 hover:underline block"
            >
              {subscription.customer?.contactPerson}
            </Link>
            {subscription.customer?.companyName && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {subscription.customer.companyName}
              </p>
            )}
            <p className="text-xs text-gray-600 flex items-center gap-1 pt-1">
              <Mail className="w-3 h-3 text-gray-400" />
              {subscription.customer?.email}
            </p>
            {subscription.customer?.taxIdentificationNumber && (
              <p className="text-xs text-gray-500 font-mono">
                Tax ID: {subscription.customer.taxIdentificationNumber}
              </p>
            )}
          </div>
        </div>

        {/* Billing Schedule Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Billing Frequency & Dates
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Cycle Frequency:</span>
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                {subscription.billingFrequencySnapshot} (Every {subscription.billingIntervalSnapshot})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Start Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(subscription.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Next Billing Date:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                {subscription.nextBillingDate
                  ? new Date(subscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            {subscription.endDate && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Contract End Date:</span>
                <span className="text-xs text-gray-600">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plan Policy Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Plan Policy Rules
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Allow Pausing:</span>
              <span className={subscription.plan?.allowPause ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                {subscription.plan?.allowPause ? 'Allowed' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Early Cancellation:</span>
              <span className={subscription.plan?.allowEarlyCancellation ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                {subscription.plan?.allowEarlyCancellation ? 'Allowed' : 'Not Allowed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Contract Renewal:</span>
              <span className={subscription.plan?.allowRenewal ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                {subscription.plan?.allowRenewal ? 'Permitted' : 'Disabled'}
              </span>
            </div>
            {subscription.cancellationReason && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 mt-2">
                <span className="font-bold">Cancellation Reason: </span>
                {subscription.cancellationReason}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Subscription Line Items (Snapshots)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Product / Plan Snapshot</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5">Qty</th>
                <th className="px-6 py-3.5">Discount</th>
                <th className="px-6 py-3.5">Tax Snapshot</th>
                <th className="px-6 py-3.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscription.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/75">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.productNameSnapshot}</div>
                    {item.variantNameSnapshot && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Variant: {item.variantNameSnapshot}
                      </div>
                    )}
                    {item.planNameSnapshot && (
                      <div className="text-xs text-indigo-600 font-medium mt-0.5">
                        Plan: {item.planNameSnapshot}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-800">
                    ₹{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    {Number(item.discountAmount) > 0
                      ? `-₹${Number(item.discountAmount).toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {Number(item.taxRateSnapshot) > 0 ? (
                      <div>
                        <span>{Number(item.taxRateSnapshot)}%</span>
                        <div className="text-gray-400 font-mono">
                          (+₹{Number(item.taxAmount).toFixed(2)})
                        </div>
                      </div>
                    ) : (
                      '0%'
                    )}
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
        <div className="p-6 bg-gray-50/70 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-xs text-gray-500 max-w-md">
            {subscription.paymentTerms && (
              <div>
                <span className="font-semibold text-gray-700 block mb-0.5">Payment Terms:</span>
                <p className="text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 whitespace-pre-line">
                  {subscription.paymentTerms}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Recurring Subtotal:</span>
              <span className="font-semibold text-gray-900 font-mono">
                ₹{Number(subscription.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Recurring Discounts:</span>
              <span className="font-semibold font-mono">
                -₹{Number(subscription.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Recurring Taxes:</span>
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

      {/* Subscription Audit History Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base">Subscription Audit Trail</h3>
        </div>

        {!subscription.history || subscription.history.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">No history events logged yet.</div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
            {subscription.history.map((h) => (
              <div key={h.id} className="relative group">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200"></span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 gap-1">
                  <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <span>{h.action}</span>
                    {h.previousStatus && h.newStatus && (
                      <span className="text-xs font-mono font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {h.previousStatus} → {h.newStatus}
                      </span>
                    )}
                  </div>
                  <span>{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                {(h.description || h.note) && <p className="text-xs text-gray-600 mt-1">{h.description || h.note}</p>}
                {h.performedBy && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Triggered by: {h.performedBy.name} ({h.performedBy.role})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pause Modal */}
      {isPauseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Pause Subscription</h3>
              <button onClick={() => setIsPauseModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handlePause} className="space-y-4">
              <p className="text-sm text-gray-600">
                Pausing halts recurring billing until resumed. Please provide an audit note.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Reason / Note
                </label>
                <textarea
                  rows="3"
                  value={pauseNote}
                  onChange={(e) => setPauseNote(e.target.value)}
                  placeholder="e.g. Customer requested temporary pause for holiday season..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPauseModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                >
                  {actionLoading ? 'Pausing...' : 'Confirm Pause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-red-600">Cancel Subscription</h3>
              <button onClick={() => setIsCancelModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCancel} className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel subscription{' '}
                <span className="font-mono font-bold text-gray-900">
                  {subscription.subscriptionNumber}
                </span>
                ? This action will mark it cancelled.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Cancellation Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer switched provider / project completed..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;

