import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getQuotationById,
  sendQuotation,
  acceptQuotation,
  rejectQuotation,
  convertToSubscription,
} from '../../services/quotationService';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Repeat,
  Building,
  Mail,
  Calendar,
  Clock,
  Check,
  X,
  CreditCard,
  Layers,
} from 'lucide-react';

const statusBadges = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const QuotationDetails = ({ basePath = '/admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Conversion modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState('');

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await getQuotationById(id);
      const data = res?.data?.quotation || null;
      setQuotation(data);
      if (data?.termsAndConditions) {
        setPaymentTerms(data.termsAndConditions);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleSend = async () => {
    if (!window.confirm(`Send quotation ${quotation.quotationNumber} to ${quotation.customer?.email}?`)) return;
    try {
      setActionLoading(true);
      await sendQuotation(id);
      toast.success('Quotation sent to customer email successfully!');
      fetchQuotation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await acceptQuotation(id);
      toast.success('Quotation marked as ACCEPTED!');
      fetchQuotation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Mark this quotation as REJECTED?')) return;
    try {
      setActionLoading(true);
      await rejectQuotation(id);
      toast.success('Quotation marked as REJECTED.');
      fetchQuotation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await convertToSubscription(id, {
        autoRenew,
        paymentTerms,
      });
      toast.success('Quotation successfully converted into an active subscription!');
      setIsConvertModalOpen(false);
      const subId = res?.data?.subscription?.id;
      if (subId) {
        navigate(`${basePath}/subscriptions/${subId}`);
      } else {
        fetchQuotation();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to convert quotation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading quotation...</div>;
  }

  if (!quotation) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Quotation not found</h2>
        <Link to={`${basePath}/quotations`} className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Quotations List
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
            onClick={() => navigate(`${basePath}/quotations`)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">
                {quotation.quotationNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                  statusBadges[quotation.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Issued on {new Date(quotation.issueDate).toLocaleDateString()} • Created by{' '}
              {quotation.createdBy?.name || 'Staff'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {quotation.status === 'DRAFT' && (
            <button
              onClick={handleSend}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send Quotation Email</span>
            </button>
          )}

          {quotation.status === 'SENT' && (
            <>
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark Accepted</span>
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition font-medium text-sm disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Rejected</span>
              </button>
            </>
          )}

          {(quotation.status === 'ACCEPTED' || quotation.status === 'SENT') && !quotation.subscription && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
            >
              <Repeat className="w-4 h-4" />
              <span>Convert to Subscription</span>
            </button>
          )}

          {quotation.subscription && (
            <Link
              to={`${basePath}/subscriptions/${quotation.subscription.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100 transition font-medium text-sm"
            >
              <Repeat className="w-4 h-4" />
              <span>View Subscription ({quotation.subscription.subscriptionNumber})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Info Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Customer Details
          </h3>
          <div className="space-y-1 text-sm">
            <Link
              to={`${basePath}/customers/${quotation.customerId}`}
              className="font-bold text-blue-600 hover:underline block"
            >
              {quotation.customer?.contactPerson}
            </Link>
            {quotation.customer?.companyName && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {quotation.customer.companyName}
              </p>
            )}
            <p className="text-xs text-gray-600 flex items-center gap-1 pt-1">
              <Mail className="w-3 h-3 text-gray-400" />
              {quotation.customer?.email}
            </p>
            {quotation.customer?.taxIdentificationNumber && (
              <p className="text-xs text-gray-500 font-mono">
                Tax ID: {quotation.customer.taxIdentificationNumber}
              </p>
            )}
          </div>
        </div>

        {/* Validity & Template */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Validity & Terms
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Issue Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(quotation.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">Valid Until:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                {new Date(quotation.validUntil).toLocaleDateString()}
              </span>
            </div>
            {quotation.template && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-500 text-xs">Template Preset:</span>
                <span className="text-xs font-medium text-blue-600">
                  {quotation.template.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Lifecycle Progress
          </h3>
          <div className="space-y-1.5 text-xs text-gray-600 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Draft created: {new Date(quotation.createdAt).toLocaleDateString()}</span>
            </div>
            {quotation.acceptedAt && (
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accepted on {new Date(quotation.acceptedAt).toLocaleDateString()}</span>
              </div>
            )}
            {quotation.rejectedAt && (
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <X className="w-3.5 h-3.5 text-red-600" />
                <span>Rejected on {new Date(quotation.rejectedAt).toLocaleDateString()}</span>
              </div>
            )}
            {quotation.subscription && (
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Repeat className="w-3.5 h-3.5 text-purple-600" />
                <span>Converted: {quotation.subscription.subscriptionNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Line Items Table */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Itemized Line Items</h3>
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
              {quotation.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/75">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {item.productNameSnapshot}
                    </div>
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
                    {item.description && (
                      <div className="text-xs text-gray-400 italic mt-0.5">
                        {item.description}
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

        {/* Calculation Totals Footer */}
        <div className="p-6 bg-gray-50/70 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-xs text-gray-500 max-w-md space-y-2">
            {quotation.customerNotes && (
              <div>
                <span className="font-semibold text-gray-700 block mb-0.5">Customer Notes:</span>
                <p className="text-gray-600 bg-white p-2.5 rounded border border-gray-200">
                  {quotation.customerNotes}
                </p>
              </div>
            )}
            {quotation.termsAndConditions && (
              <div>
                <span className="font-semibold text-gray-700 block mb-0.5">Terms and Conditions:</span>
                <p className="text-gray-600 bg-white p-2.5 rounded border border-gray-200 whitespace-pre-line">
                  {quotation.termsAndConditions}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 bg-white p-4 rounded border border-gray-200 shadow-sm space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900 font-mono">
                ₹{Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Total Discount:</span>
              <span className="font-semibold font-mono">
                -₹{Number(quotation.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Tax:</span>
              <span className="font-semibold text-gray-900 font-mono">
                +₹{Number(quotation.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Grand Total:</span>
              <span className="text-xl font-black text-blue-600 font-mono">
                ₹{Number(quotation.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Convert to Subscription Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded shadow-xl border border-gray-200 w-full max-w-md my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-purple-600">
                <Repeat className="w-5 h-5" />
                <h3 className="text-lg font-bold text-gray-900">Convert to Subscription</h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConvert} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                This will automatically create a new live Subscription for{' '}
                <span className="font-bold text-gray-900">{quotation.customer?.contactPerson}</span> with the itemized snapshots from quotation{' '}
                <span className="font-mono font-semibold text-blue-600">{quotation.quotationNumber}</span>.
              </p>

              <div className="bg-purple-50 p-3.5 rounded border border-purple-200 space-y-1 text-xs">
                <div className="font-semibold text-purple-900">Grand Total Snapshot:</div>
                <div className="text-lg font-black text-purple-700">
                  ₹{Number(quotation.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Enable Auto-Renewal for this subscription
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Payment / Subscription Terms
                </label>
                <textarea
                  rows="3"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Payment conditions, SLA, billing terms..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetails;

