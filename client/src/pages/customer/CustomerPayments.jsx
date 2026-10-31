import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerPayments } from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await getCustomerPayments();
      setPayments(res.data?.payments || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payments history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
          <CreditCard className="w-4 h-4" />
          <span>Payment History</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Receipts</h1>
        <p className="text-sm text-gray-500">
          All receipts for subscription renewals and one-time invoices paid online or offline.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading payment receipts...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No payment receipts found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Any invoice payments made online or recorded by staff will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Receipt #</th>
                  <th className="px-6 py-3">Associated Invoice</th>
                  <th className="px-6 py-3">Payment Method</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Amount Paid</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      <span>{p.paymentNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.invoice ? (
                        <Link
                          to={`/customer/invoices/${p.invoice.id}`}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          {p.invoice.invoiceNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
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

export default CustomerPayments;

