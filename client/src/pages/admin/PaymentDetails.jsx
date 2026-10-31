import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaymentById, refundPayment } from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  CreditCard,
  ArrowLeft,
  Receipt,
  User,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';

const statusBadges = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  SUCCESSFUL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
  PARTIALLY_REFUNDED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const PaymentDetails = ({ basePath = '/admin' }) => {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });
  const [refundLoading, setRefundLoading] = useState(false);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const res = await getPaymentById(id);
      setPayment(res.data);
      if (res.data) {
        setRefundForm({
          amount: Number(res.data.amount).toFixed(2),
          reason: 'Customer requested refund',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    const amountNum = Number(refundForm.amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Refund amount must be greater than zero');
      return;
    }

    try {
      setRefundLoading(true);
      const res = await refundPayment(payment.id, {
        amount: amountNum,
        reason: refundForm.reason,
      });

      toast.success(res.message || 'Refund processed successfully');
      setShowRefundModal(false);
      fetchPayment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading transaction details...
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-12 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Record Not Found</h2>
        <Link to={`${basePath}/payments`} className="text-indigo-600 hover:underline">
          Return to Payments
        </Link>
      </div>
    );
  }

  const isSuccessful = payment.status === 'SUCCESSFUL';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`${basePath}/payments`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Payments
        </Link>

        {isSuccessful && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-semibold rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Issue Refund
          </button>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">{payment.paymentNumber}</h1>
            </div>
            <p className="text-xs text-gray-500">
              Recorded on {new Date(payment.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                statusBadges[payment.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {payment.status}
            </span>
            <span className="text-2xl font-extrabold text-emerald-600">
              ₹{Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm">
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Payment Metadata
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Method:</span>
              <span className="font-semibold text-gray-900">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Date:</span>
              <span className="font-medium text-gray-900">
                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '—'}
              </span>
            </div>
            {payment.paymentReference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Reference:</span>
                <span className="font-mono text-gray-900">{payment.paymentReference}</span>
              </div>
            )}
            {payment.razorpayOrderId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Razorpay Order ID:</span>
                <span className="font-mono text-gray-900 text-xs">{payment.razorpayOrderId}</span>
              </div>
            )}
            {payment.razorpayPaymentId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Razorpay Payment ID:</span>
                <span className="font-mono text-gray-900 text-xs">{payment.razorpayPaymentId}</span>
              </div>
            )}
            {payment.recordedBy && (
              <div className="flex justify-between">
                <span className="text-gray-500">Recorded By:</span>
                <span className="text-gray-900 font-medium">{payment.recordedBy.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Customer & Associated Invoice
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="font-semibold text-gray-900">{payment.customer?.name}</span>
            </div>
            {payment.customer?.companyName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Company:</span>
                <span className="text-gray-900">{payment.customer.companyName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Email:</span>
              <span className="text-gray-900">{payment.customer?.email}</span>
            </div>
            {payment.invoice && (
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-gray-500">Invoice:</span>
                <Link
                  to={`${basePath}/invoices/${payment.invoice.id}`}
                  className="font-bold text-indigo-600 hover:underline"
                >
                  {payment.invoice.invoiceNumber}
                </Link>
              </div>
            )}
          </div>
        </div>

        {payment.notes && (
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Internal Notes
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
              {payment.notes}
            </p>
          </div>
        )}

        {/* Refunds List */}
        {payment.refunds && payment.refunds.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>Refund Records ({payment.refunds.length})</span>
            </h3>
            <div className="space-y-2">
              {payment.refunds.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-purple-900">
                      Refund #{ref.refundNumber} — ₹{Number(ref.amount).toFixed(2)}
                    </div>
                    <div className="text-purple-600 text-[11px]">
                      {ref.reason || 'No reason specified'} • Processed on{' '}
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                    {ref.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Issue Payment Refund</h3>
            <p className="text-xs text-gray-500">
              Process an offline or gateway refund for payment {payment.paymentNumber}.
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={Number(payment.amount)}
                  value={refundForm.amount}
                  onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-[10px] text-gray-400">
                  Maximum refundable: ₹{Number(payment.amount).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Reason for Refund *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Specify reason for refund..."
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg shadow-sm disabled:opacity-50"
                >
                  {refundLoading ? 'Processing...' : 'Confirm Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetails;

