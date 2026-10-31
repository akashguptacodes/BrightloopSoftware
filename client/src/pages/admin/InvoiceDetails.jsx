import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getInvoiceById,
  issueInvoice,
  voidInvoice,
  downloadInvoicePdf,
} from '../../services/invoiceService';
import { recordManualPayment } from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  Receipt,
  ArrowLeft,
  Download,
  Send,
  Ban,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  User,
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

const InvoiceDetails = ({ basePath = '/admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Modals
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await getInvoiceById(id);
      setInvoice(res.data);
      if (res.data) {
        setPaymentForm((prev) => ({
          ...prev,
          amount: Number(res.data.amountDue).toFixed(2),
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await downloadInvoicePdf(invoice.id, `${invoice.invoiceNumber}.pdf`);
      toast.success(`Downloaded ${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (!window.confirm(`Issue invoice ${invoice.invoiceNumber}? This will mark it as payable and email the customer.`)) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await issueInvoice(invoice.id);
      toast.success(res.message || 'Invoice issued successfully');
      fetchInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoidInvoice = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await voidInvoice(invoice.id, { reason: voidReason });
      toast.success(res.message || 'Invoice voided successfully');
      setShowVoidModal(false);
      fetchInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to void invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amountNum = Number(paymentForm.amount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    if (amountNum > Number(invoice.amountDue) + 0.01) {
      toast.error(`Payment amount (₹${amountNum}) exceeds amount due (₹${invoice.amountDue})`);
      return;
    }

    try {
      setActionLoading(true);
      const res = await recordManualPayment({
        invoiceId: invoice.id,
        amount: amountNum,
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.paymentReference,
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes,
      });

      toast.success(res.message || 'Payment recorded successfully');
      setShowPaymentModal(false);
      fetchInvoice();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading invoice details...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
        <Link to={`${basePath}/invoices`} className="text-indigo-600 hover:underline">
          Return to Invoices
        </Link>
      </div>
    );
  }

  const isDraft = invoice.status === 'DRAFT';
  const isPayable = ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status);
  const isVoid = invoice.status === 'VOID';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to={`${basePath}/invoices`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>{downloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {isDraft && (
            <button
              onClick={handleIssueInvoice}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Issue Invoice</span>
            </button>
          )}

          {isPayable && (
            <>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded shadow-sm transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => setShowVoidModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-sm font-medium rounded transition"
              >
                <Ban className="w-4 h-4" />
                <span>Void</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Document Canvas */}
      <div className="bg-white rounded border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold border ${
                  statusBadges[invoice.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {invoice.status}
              </span>
              {invoice.isRecurring && (
                <span className="bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                  Recurring Billing
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Created on {new Date(invoice.createdAt).toLocaleDateString()}
              {invoice.issuedAt && ` • Issued on ${new Date(invoice.issuedAt).toLocaleDateString()}`}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Brightloop Software Inc.
            </div>
            <div className="text-sm text-gray-600 mt-1">Billing & Cloud Operations</div>
            <div className="text-xs text-gray-400">billing@brightloop.com</div>
          </div>
        </div>

        {/* Customer & Dates Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/70 p-6 rounded border border-gray-200">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Billed To
            </div>
            <div className="font-bold text-gray-900 text-base">
              {invoice.customer?.companyName || invoice.customer?.contactPerson || invoice.customer?.name}
            </div>
            {invoice.customer?.contactPerson && invoice.customer?.companyName && (
              <div className="text-sm text-gray-600">Attn: {invoice.customer.contactPerson}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">{invoice.customer?.email}</div>
            {invoice.customer?.phone && (
              <div className="text-xs text-gray-500">{invoice.customer.phone}</div>
            )}
            {invoice.customer?.address && (
              <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                {invoice.customer.address}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Invoice Dates
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Invoice Date:</span>
                <span className="font-medium text-gray-900">
                  {invoice.invoiceDate || invoice.issueDate ? new Date(invoice.invoiceDate || invoice.issueDate).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span className={`font-semibold ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-900'}`}>
                  {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between text-emerald-600">
                  <span>Paid At:</span>
                  <span className="font-semibold">{new Date(invoice.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Subscription Reference
            </div>
            {invoice.subscription ? (
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-indigo-600">
                  <Link to={`${basePath}/subscriptions/${invoice.subscription.id}`} className="hover:underline">
                    {invoice.subscription.subscriptionNumber}
                  </Link>
                </div>
                <div className="text-gray-500">
                  Frequency: {invoice.subscription.billingFrequencySnapshot || 'MONTHLY'}
                </div>
                {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
                  <div className="text-gray-500">
                    Period: {new Date(invoice.billingPeriodStart).toLocaleDateString()} -{' '}
                    {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic">Manual one-time invoice (No recurring contract)</div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">Itemized Breakdown</h2>
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Unit Price</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Discount</th>
                  <th className="px-6 py-3 text-right">Tax</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.productNameSnapshot}</div>
                      {item.variantNameSnapshot && (
                        <div className="text-xs text-gray-500">Variant: {item.variantNameSnapshot}</div>
                      )}
                      {item.planNameSnapshot && (
                        <div className="text-xs text-indigo-600">Plan: {item.planNameSnapshot}</div>
                      )}
                      {item.description && (
                        <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-600 text-xs">
                      {Number(item.discountAmount) > 0 ? (
                        <>
                          -₹{Number(item.discountAmount).toFixed(2)}
                          {item.discountNameSnapshot && (
                            <div className="text-[10px] text-gray-400">{item.discountNameSnapshot}</div>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs">
                      {Number(item.taxAmount) > 0 ? (
                        <>
                          +₹{Number(item.taxAmount).toFixed(2)}
                          {item.taxRateSnapshot && (
                            <div className="text-[10px] text-gray-400">{Number(item.taxRateSnapshot)}%</div>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ₹{Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Balances Summary */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-6">
          <div className="space-y-4 w-full md:w-1/2">
            {invoice.notes && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Notes
                </div>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  {invoice.notes}
                </p>
              </div>
            )}
            {(invoice.terms || invoice.termsAndConditions) && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Terms & Conditions
                </div>
                <p className="text-xs text-gray-500 whitespace-pre-line">
                  {invoice.terms || invoice.termsAndConditions}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 bg-gray-50 p-5 rounded border border-gray-200 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Total Discount:</span>
              <span>-₹{Number(invoice.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Tax:</span>
              <span>+₹{Number(invoice.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Grand Total:</span>
              <span className="text-indigo-600">
                ₹{Number(invoice.grandTotal ?? invoice.totalAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Amount Paid:</span>
              <span>₹{Number(invoice.amountPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-base">
              <span>Amount Due:</span>
              <span className={Number(invoice.amountDue) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                ₹{Number(invoice.amountDue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payments Recorded Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payments Applied ({invoice.payments?.length || 0})</span>
            </h2>
            {isPayable && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                + Record Payment
              </button>
            )}
          </div>

          {!invoice.payments || invoice.payments.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded border border-dashed border-gray-200">
              No payments have been applied to this invoice yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((pmt) => (
                <div
                  key={pmt.id}
                  className="p-3 bg-white border border-gray-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <Link to={`${basePath}/payments/${pmt.id}`} className="text-indigo-600 hover:underline">
                        {pmt.paymentReference || pmt.paymentNumber}
                      </Link>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-normal">
                        {pmt.method || pmt.paymentMethod}
                      </span>
                      {pmt.paymentReference && (
                        <span className="text-gray-400 font-mono">Ref: {pmt.paymentReference}</span>
                      )}
                    </div>
                    <div className="text-gray-500">
                      Paid on {new Date(pmt.paymentDate).toLocaleDateString()}
                      {pmt.recordedBy && ` • Recorded by ${pmt.recordedBy.name}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-sm text-emerald-600">
                      ₹{Number(pmt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-gray-400">{pmt.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Record Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={Number(invoice.amountDue)}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-gray-400">
                  Maximum amount due: ₹{Number(invoice.amountDue).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Method *
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque / Demand Draft</option>
                  <option value="CARD">Debit / Credit Card (POS Terminal)</option>
                  <option value="OTHER">Other Offline Channel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Transaction / Cheque Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Cheque #123456"
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Additional remarks..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Void Invoice</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to void invoice {invoice.invoiceNumber}? This action marks the invoice invalid and cancels any outstanding balance.
            </p>

            <form onSubmit={handleVoidInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Void Reason
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Specify reason for voiding this invoice..."
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium rounded shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Voiding...' : 'Confirm Void'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;

