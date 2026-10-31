import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomerSubscriptionById } from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  Repeat,
  ArrowLeft,
  Clock,
  Calendar,
  ShieldCheck,
  CreditCard,
  History,
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
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
                {subscription.billingFrequencySnapshot} (Every {subscription.billingIntervalSnapshot})
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
            Plan & Services
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Plan Name:</span>
              <span className="font-semibold text-gray-900">
                {subscription.plan?.name || 'Custom SaaS Package'}
              </span>
            </div>
            {subscription.paymentTerms && (
              <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
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
    </div>
  );
};

export default CustomerSubscriptionDetails;

