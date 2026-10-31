import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPayments } from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  SUCCESSFUL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
  PARTIALLY_REFUNDED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const methodLabels = {
  RAZORPAY: 'Razorpay Online',
  BANK_TRANSFER: 'Bank Transfer (NEFT/RTGS)',
  UPI: 'UPI',
  CASH: 'Cash',
  CARD: 'Card Terminal',
  CHEQUE: 'Cheque',
  OTHER: 'Other',
};

const Payments = ({ basePath = '/admin' }) => {
  const [searchParams] = useSearchParams();
  const invoiceIdParam = searchParams.get('invoiceId') || '';
  const customerIdParam = searchParams.get('customerId') || '';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getPayments({
        search,
        status: statusFilter,
        paymentMethod: methodFilter,
        invoiceId: invoiceIdParam,
        customerId: customerIdParam,
        page,
        limit: 15,
      });
      setPayments(res?.data || []);
      setPagination(res?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [search, statusFilter, methodFilter, invoiceIdParam, customerIdParam]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Treasury & Collections</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
          <p className="text-sm text-gray-500">
            View all incoming collections, Razorpay online checkouts, offline bank payments, and refunds.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by payment reference, invoice #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Payment Methods</option>
            <option value="RAZORPAY">Razorpay Online</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card POS</option>
            <option value="CHEQUE">Cheque</option>
          </select>

          {(search || statusFilter || methodFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setMethodFilter('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading payments...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No payment transactions found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Payments recorded offline or completed via Razorpay online checkout will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Payment #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((pmt) => (
                  <tr key={pmt.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`${basePath}/payments/${pmt.id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4 text-indigo-500" />
                        <span>{pmt.paymentNumber}</span>
                      </Link>
                      {pmt.paymentReference && (
                        <div className="text-xs text-gray-400 font-mono mt-0.5">
                          Ref: {pmt.paymentReference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{pmt.customer?.name}</div>
                      <div className="text-xs text-gray-500">{pmt.customer?.companyName || pmt.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {pmt.invoice ? (
                        <Link
                          to={`${basePath}/invoices/${pmt.invoice.id}`}
                          className="font-medium text-gray-700 hover:text-indigo-600"
                        >
                          {pmt.invoice.invoiceNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {methodLabels[pmt.paymentMethod] || pmt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {pmt.paymentDate ? new Date(pmt.paymentDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{Number(pmt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusBadges[pmt.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pmt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`${basePath}/payments/${pmt.id}`}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchPayments(pagination.page - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchPayments(pagination.page + 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
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

export default Payments;

