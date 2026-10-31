import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getCustomerQuotationById,
  customerAcceptQuotation,
  customerRejectQuotation,
} from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Building,
  Mail,
  X,
} from 'lucide-react';

const statusBadges = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CustomerQuotationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Decline modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await getCustomerQuotationById(id);
      setQuotation(res?.data?.quotation || null);
      setCustomer(res?.data?.customer || null);
    } catch (err) {
      toast.error('Failed to load quotation details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleAccept = async () => {
    if (!window.confirm('Do you agree to approve and accept this quotation?')) return;
    try {
      setActionLoading(true);
      await customerAcceptQuotation(id);
      toast.success('Thank you! You have approved this quotation.');
      fetchQuotation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve quotation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await customerRejectQuotation(id, rejectReason);
      toast.success('Quotation has been declined.');
      setIsRejectModalOpen(false);
      setRejectReason('');
      fetchQuotation();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline quotation.');
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
        <Link to="/customer/quotations" className="text-blue-600 hover:underline mt-2 inline-block">
          Return to My Quotations
        </Link>
      </div>
    );
  }

  const isActionable = quotation.status === 'SENT' || quotation.status === 'DRAFT';
  const isExpired = new Date(quotation.validUntil) < new Date();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/customer/quotations')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 font-mono">
                {quotation.quotationNumber}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  statusBadges[quotation.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {quotation.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Issued: {new Date(quotation.issueDate).toLocaleDateString()} • Valid until:{' '}
              <span className={isExpired ? 'text-red-600 font-bold' : 'text-gray-700 font-medium'}>
                {new Date(quotation.validUntil).toLocaleDateString()}
              </span>
            </p>
          </div>
        </div>

        {/* Customer Actions */}
        {isActionable && !isExpired && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRejectModalOpen(true)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Decline</span>
            </button>
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve Quotation</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Alert Banner */}
      {quotation.status === 'ACCEPTED' && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Quotation Approved!</span> Our team is preparing your subscription activation.
          </div>
        </div>
      )}

      {quotation.status === 'CONVERTED' && (
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-3 text-purple-800 text-sm">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <div>
            <span className="font-bold">Contract Active!</span> This quotation has been converted into an active recurring subscription.
          </div>
        </div>
      )}

      {isExpired && quotation.status !== 'CONVERTED' && quotation.status !== 'ACCEPTED' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3 text-amber-800 text-sm">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Quotation Expired.</span> The validity date for this proposal has passed. Please contact our sales team for an updated quote.
          </div>
        </div>
      )}

      {/* Itemized Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-base">Proposed Services & Products</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Item Description</th>
                <th className="px-6 py-3.5">Unit Price</th>
                <th className="px-6 py-3.5">Qty</th>
                <th className="px-6 py-3.5">Discount</th>
                <th className="px-6 py-3.5">Tax</th>
                <th className="px-6 py-3.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotation.items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/75">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{item.productNameSnapshot}</div>
                    {item.variantNameSnapshot && (
                      <div className="text-xs text-gray-500">Variant: {item.variantNameSnapshot}</div>
                    )}
                    {item.planNameSnapshot && (
                      <div className="text-xs text-indigo-600 font-medium">Plan: {item.planNameSnapshot}</div>
                    )}
                    {item.description && (
                      <div className="text-xs text-gray-400 italic">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-800">
                    ₹{Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.quantity}</td>
                  <td className="px-6 py-4 text-emerald-600 font-medium">
                    {Number(item.discountAmount) > 0 ? `-₹${Number(item.discountAmount).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {Number(item.taxRateSnapshot) > 0 ? `${Number(item.taxRateSnapshot)}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-right font-mono">
                    ₹{Number(item.lineTotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="p-6 bg-gray-50/70 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-xs text-gray-500 max-w-md space-y-2">
            {quotation.customerNotes && (
              <div>
                <span className="font-semibold text-gray-700 block mb-0.5">Note from Brightloop:</span>
                <p className="text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200">
                  {quotation.customerNotes}
                </p>
              </div>
            )}
            {quotation.termsAndConditions && (
              <div>
                <span className="font-semibold text-gray-700 block mb-0.5">Terms and Conditions:</span>
                <p className="text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200 whitespace-pre-line">
                  {quotation.termsAndConditions}
                </p>
              </div>
            )}
          </div>

          <div className="w-full md:w-80 bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900 font-mono">
                ₹{Number(quotation.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Discounts:</span>
              <span className="font-semibold font-mono">
                -₹{Number(quotation.discountTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes:</span>
              <span className="font-semibold text-gray-900 font-mono">
                +₹{Number(quotation.taxTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total Payable:</span>
              <span className="text-xl font-black text-blue-600 font-mono">
                ₹{Number(quotation.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900">Decline Quotation</h3>
              <button onClick={() => setIsRejectModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleReject} className="space-y-4">
              <p className="text-sm text-gray-600">
                Please let us know why you are declining this proposal so our team can provide a tailored alternative:
              </p>
              <div>
                <textarea
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Budget constraints, different feature requirements..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  {actionLoading ? 'Submitting...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerQuotationDetails;

