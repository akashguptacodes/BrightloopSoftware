import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getQuotations, sendQuotation } from '../../services/quotationService';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Repeat,
  Clock,
  Building,
} from 'lucide-react';

const statusBadges = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const Quotations = ({ basePath = '/admin' }) => {
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [sendingId, setSendingId] = useState(null);

  const fetchQuotations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getQuotations({
        search,
        status: statusFilter,
        customerId: customerIdParam,
        page,
        limit: 20,
      });
      const data = res?.data || {};
      setQuotations(data.quotations || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations(1);
  }, [search, statusFilter, customerIdParam]);

  const handleSend = async (id, quotationNumber) => {
    if (!window.confirm(`Send quotation ${quotationNumber} to customer via email?`)) return;
    try {
      setSendingId(id);
      await sendQuotation(id);
      toast.success(`Quotation ${quotationNumber} sent successfully!`);
      fetchQuotations(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send quotation');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Sales & Proposals</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Management</h1>
          <p className="text-sm text-gray-500">
            Create itemized proposals with product snapshots, send to customers, and convert accepted quotes into recurring subscriptions.
          </p>
        </div>

        <Link
          to={`${basePath}/quotations/create`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotation #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SENT">SENT</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="CONVERTED">CONVERTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Total: <span className="font-semibold text-gray-800">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Quotations Found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              Create your first sales proposal or adjust the search and status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Quotation #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Issue & Expiry</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Grand Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">
                      <Link to={`${basePath}/quotations/${q.id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{q.customer?.contactPerson}</div>
                      {q.customer?.companyName && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{q.customer.companyName}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="text-gray-900 font-medium">
                        {new Date(q.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Valid: {new Date(q.validUntil).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                      {q._count?.items || 0} line {q._count?.items === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{Number(q.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          statusBadges[q.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSend(q.id, q.quotationNumber)}
                            disabled={sendingId === q.id}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Send to Customer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`${basePath}/quotations/${q.id}`}
                          className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
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
                onClick={() => fetchQuotations(pagination.page - 1)}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchQuotations(pagination.page + 1)}
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

export default Quotations;

