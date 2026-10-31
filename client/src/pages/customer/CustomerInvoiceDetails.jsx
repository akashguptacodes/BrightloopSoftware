import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCustomerInvoiceById,
  downloadCustomerInvoicePdf,
} from '../../services/customerPortalService';
import {
  initiateRazorpayOrder,
  verifyRazorpayPayment,
} from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  Receipt,
  ArrowLeft,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  ShieldCheck,
} from 'lucide-react';

const statusBadges = {
  ISSUED: 'bg-blue-50 text-blue-700 border-blue-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
};

function loadRazorpaySdk() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CustomerInvoiceDetails = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await getCustomerInvoiceById(id);
      setData(res.data);
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
      await downloadCustomerInvoicePdf(data.invoice.id, `${data.invoice.invoiceNumber}.pdf`);
      toast.success(`Downloaded ${data.invoice.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setPaying(true);
      const isLoaded = await loadRazorpaySdk();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please verify your internet connection.');
        return;
      }

      // Step 1: Request order from server
      const orderRes = await initiateRazorpayOrder(data.invoice.id);
      const orderData = orderRes.data;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Brightloop Software',
        description: `Payment for Invoice ${orderData.invoiceNumber}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 3: Backend signature verification
            await verifyRazorpayPayment({
              invoiceId: data.invoice.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success('Payment completed successfully! Thank you.');
            fetchInvoice();
          } catch (err) {
            console.error('Verification error:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: orderData.customer?.name || data.customer?.name || '',
          email: orderData.customer?.email || data.customer?.email || '',
          contact: orderData.customer?.phone || data.customer?.phone || '',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate online payment');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading invoice statement...
      </div>
    );
  }

  if (!data?.invoice) {
    return (
      <div className="p-12 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Found</h2>
        <Link to="/customer/invoices" className="text-indigo-600 hover:underline">
          Return to My Invoices
        </Link>
      </div>
    );
  }

  const { invoice, customer } = data;
  const isPayable =
    ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status) && Number(invoice.amountDue) > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/customer/invoices"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>{downloadingPdf ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          {isPayable && (
            <button
              onClick={handlePayNow}
              disabled={paying}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{paying ? 'Connecting Gateway...' : `Pay ₹${Number(invoice.amountDue).toFixed(2)} Online`}</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Canvas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-gray-200 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusBadges[invoice.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
              {invoice.dueDate && ` • Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Issued By
            </div>
            <div className="font-bold text-gray-900 text-base mt-0.5">Brightloop Software Inc.</div>
            <div className="text-xs text-gray-500">Cloud Billing Dept.</div>
          </div>
        </div>

        {/* Billed To / Subscription */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Billed To
            </div>
            <div className="font-bold text-gray-900">{customer?.name}</div>
            {customer?.companyName && <div className="text-gray-600">{customer.companyName}</div>}
            <div className="text-xs text-gray-500 mt-1">{customer?.email}</div>
            {customer?.phone && <div className="text-xs text-gray-500">{customer.phone}</div>}
          </div>

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Subscription
            </div>
            {invoice.subscription ? (
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-indigo-600">
                  {invoice.subscription.subscriptionNumber}
                </div>
                <div className="text-gray-600">
                  Frequency: {invoice.subscription.billingFrequencySnapshot || 'MONTHLY'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">One-time invoice</div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items?.map((it) => (
                <tr key={it.id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{it.productNameSnapshot}</div>
                    {it.variantNameSnapshot && (
                      <div className="text-xs text-gray-500">Variant: {it.variantNameSnapshot}</div>
                    )}
                    {it.planNameSnapshot && (
                      <div className="text-xs text-indigo-600">Plan: {it.planNameSnapshot}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    ₹{Number(it.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{it.quantity}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ₹{Number(it.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-t border-gray-200 pt-6">
          <div className="w-full md:w-1/2 text-xs text-gray-500 space-y-2">
            {invoice.terms && (
              <div>
                <span className="font-semibold text-gray-700 block mb-1">Terms:</span>
                <p className="whitespace-pre-line">{invoice.terms}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mt-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Payments are processed with 256-bit encryption through Razorpay PCI-DSS compliant checkout.</span>
            </div>
          </div>

          <div className="w-full md:w-72 bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {Number(invoice.discountTotal) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-₹{Number(invoice.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {Number(invoice.taxTotal) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>+₹{Number(invoice.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Grand Total:</span>
              <span className="text-indigo-600">
                ₹{Number(invoice.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium text-xs">
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

        {/* Payments Applied */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Receipts for this statement</h3>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-gray-900">{p.paymentNumber}</span>
                    <span className="text-gray-500 ml-2">via {p.paymentMethod}</span>
                    <div className="text-[11px] text-gray-400">
                      Paid on {new Date(p.paymentDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600">
                      ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-gray-400">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInvoiceDetails;

