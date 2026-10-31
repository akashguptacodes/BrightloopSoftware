import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerSubscriptions } from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  Repeat,
  Clock,
  Eye,
  CheckCircle,
  PauseCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const CustomerSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getCustomerSubscriptions();
      setSubscriptions(res?.data?.subscriptions || []);
    } catch (err) {
      toast.error('Failed to load your subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
          <Repeat className="w-4 h-4" />
          <span>My Active Services</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
        <p className="text-sm text-gray-500">
          View your recurring software licenses, billing cycles, and subscription statuses.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="py-16 text-center">
            <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Subscriptions Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Once an approved quotation is converted by our team, your active recurring subscription will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Subscription #</th>
                  <th className="px-6 py-3.5">Plan / Bundle</th>
                  <th className="px-6 py-3.5">Cycle</th>
                  <th className="px-6 py-3.5">Next Renewal</th>
                  <th className="px-6 py-3.5">Recurring Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                      <Link to={`/customer/subscriptions/${s.id}`} className="hover:underline">
                        {s.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {s.plan?.name || 'Custom Plan'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {s.billingFrequencySnapshot} (Every {s.billingIntervalSnapshot})
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {s.nextBillingDate ? (
                        <div className="flex items-center gap-1 text-gray-800 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{new Date(s.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                      ₹{Number(s.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          statusBadges[s.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/customer/subscriptions/${s.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSubscriptions;

