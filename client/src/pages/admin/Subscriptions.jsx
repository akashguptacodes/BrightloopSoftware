import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getSubscriptions } from '../../services/subscriptionService';
import toast from 'react-hot-toast';
import {
  Repeat,
  Search,
  Eye,
  Building,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PAUSED: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const Subscriptions = ({ basePath = '/admin' }) => {
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchSubscriptions = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getSubscriptions({
        search,
        status: statusFilter,
        customerId: customerIdParam,
        page,
        limit: 20,
      });
      const data = res?.data || {};
      setSubscriptions(data.subscriptions || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(1);
  }, [search, statusFilter, customerIdParam]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
            <Repeat className="w-4 h-4" />
            <span>Recurring Contracts</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-sm text-gray-500">
            Monitor active recurring subscriptions, manage contract lifecycles (pause, resume, renew, cancel), and view audit trails.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sub #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Total: <span className="font-semibold text-gray-800">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading subscriptions...</div>
        ) : subscriptions.length === 0 ? (
          <div className="py-16 text-center">
            <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Subscriptions Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Convert accepted customer quotations into recurring subscriptions to see them appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Subscription #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Plan / Cycle</th>
                  <th className="px-6 py-3.5">Next Billing</th>
                  <th className="px-6 py-3.5">Recurring Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                      <Link to={`${basePath}/subscriptions/${s.id}`} className="hover:underline">
                        {s.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{s.customer?.contactPerson}</div>
                      {s.customer?.companyName && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{s.customer.companyName}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-gray-900">
                        {s.plan?.name || 'Custom Bundle'}
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        {s.plan?.billingFrequency || 'MONTHLY'} (every {s.plan?.billingInterval || 1})
                      </div>
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                          statusBadges[s.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`${basePath}/subscriptions/${s.id}`}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition inline-flex items-center gap-1 text-xs font-semibold"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSubscriptions(pagination.page - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSubscriptions(pagination.page + 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

