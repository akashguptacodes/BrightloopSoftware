import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getInvoices, downloadInvoicePdf } from '../../services/invoiceService';
import toast from 'react-hot-toast';
import {
  Receipt,
  Search,
  Eye,
  Download,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  FileSpreadsheet,
} from 'lucide-react';

const statusBadges = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
  ISSUED: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  VOID: 'bg-gray-100 text-gray-500 border-gray-200 line-through',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const Invoices = ({ basePath = '/admin' }) => {
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';
  const subscriptionIdParam = searchParams.get('subscriptionId') || '';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchInvoices = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getInvoices({
        search,
        status: statusFilter,
        customerId: customerIdParam,
        subscriptionId: subscriptionIdParam,
        page,
        limit: 15,
      });
      setInvoices(res?.data || []);
      setPagination(res?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [search, statusFilter, customerIdParam, subscriptionIdParam]);

  const handleDownloadPdf = async (e, invoice) => {
    e.stopPropagation();
    try {
      setDownloadingId(invoice.id);
      await downloadInvoicePdf(invoice.id, `${invoice.invoiceNumber}.pdf`);
      toast.success(`Downloaded ${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
            <Receipt className="w-4 h-4" />
            <span>Billing & Receivables</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-sm text-gray-500">
            Create, issue, and manage manual & automated subscription billing invoices with live PDF generation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`${basePath}/invoices/create`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Invoice Statuses</option>
            <option value="DRAFT">Draft (Unissued)</option>
            <option value="ISSUED">Issued (Open / Unpaid)</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Void</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
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
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No invoices found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
              {search || statusFilter
                ? 'No invoices match your selected search or filter criteria.'
                : 'No invoices have been generated yet. Create a manual invoice or activate subscriptions.'}
            </p>
            <Link
              to={`${basePath}/invoices/create`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
            >
              <Plus className="w-4 h-4" />
              Create First Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Invoice Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Grand Total</th>
                  <th className="px-6 py-3 text-right">Amount Due</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const isPaid = inv.status === 'PAID';
                  const isOverdue = inv.status === 'OVERDUE';
                  const isDraft = inv.status === 'DRAFT';

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`${basePath}/invoices/${inv.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                        >
                          <Receipt className="w-4 h-4 text-indigo-500" />
                          <span>{inv.invoiceNumber}</span>
                          {inv.isRecurring && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-semibold px-1.5 py-0.5 rounded">
                              Auto
                            </span>
                          )}
                        </Link>
                        {inv.subscription && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Sub: {inv.subscription.subscriptionNumber}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{inv.customer?.name}</div>
                        <div className="text-xs text-gray-500">{inv.customer?.companyName || inv.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₹{Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            Number(inv.amountDue) > 0 ? (isOverdue ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'
                          }`}
                        >
                          ₹{Number(inv.amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            statusBadges[inv.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleDownloadPdf(e, inv)}
                            disabled={downloadingId === inv.id}
                            title="Download PDF"
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Link
                            to={`${basePath}/invoices/${inv.id}`}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} invoices)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchInvoices(pagination.page - 1)}
                className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchInvoices(pagination.page + 1)}
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

export default Invoices;

