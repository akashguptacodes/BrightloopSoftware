import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCustomerInvoices,
  downloadCustomerInvoicePdf,
} from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  Receipt,
  Download,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

const statusBadges = {
  ISSUED: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getCustomerInvoices();
      setInvoices(res.data?.invoices || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPdf = async (e, inv) => {
    e.stopPropagation();
    try {
      setDownloadingId(inv.id);
      await downloadCustomerInvoicePdf(inv.id, `${inv.invoiceNumber}.pdf`);
      toast.success(`Downloaded ${inv.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
          <Receipt className="w-4 h-4" />
          <span>Billing & Statements</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">My Invoices</h1>
        <p className="text-sm text-gray-500">
          Review your subscription bills, download official PDF statements, and pay online securely.
        </p>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading your invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No invoices found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              You do not have any issued invoices at the moment. Invoices will appear here once your subscriptions cycle or billing statements are issued.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Invoice Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Grand Total</th>
                  <th className="px-6 py-3 text-right">Amount Due</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => {
                  const isOverdue = inv.status === 'OVERDUE';
                  const isPayable = ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status) && Number(inv.amountDue) > 0;

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4">
                        <Link
                          to={`/customer/invoices/${inv.id}`}
                          className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
                        >
                          <Receipt className="w-4 h-4 text-indigo-500" />
                          <span>{inv.invoiceNumber}</span>
                        </Link>
                        {inv.subscription && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            Subscription: {inv.subscription.subscriptionNumber}
                          </div>
                        )}
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
                          className={`font-bold ${
                            Number(inv.amountDue) > 0 ? (isOverdue ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'
                          }`}
                        >
                          ₹{Number(inv.amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                            statusBadges[inv.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPayable && (
                            <Link
                              to={`/customer/invoices/${inv.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-sm transition"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pay
                            </Link>
                          )}
                          <button
                            onClick={(e) => handleDownloadPdf(e, inv)}
                            disabled={downloadingId === inv.id}
                            title="Download PDF"
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/customer/invoices/${inv.id}`}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
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
      </div>
    </div>
  );
};

export default CustomerInvoices;

