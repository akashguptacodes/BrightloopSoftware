import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerQuotations } from '../../services/customerPortalService';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const statusBadges = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-purple-50 text-purple-700 border-purple-200',
};

const CustomerQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await getCustomerQuotations();
      setQuotations(res?.data?.quotations || []);
    } catch (err) {
      toast.error('Failed to load your quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
          <FileSpreadsheet className="w-4 h-4" />
          <span>My Quotations & Proposals</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
        <p className="text-sm text-gray-500">
          Review, approve, or decline pricing proposals sent to your company by Brightloop Software.
        </p>
      </div>

      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading your quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="py-16 text-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No Quotations Available</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              You do not have any open or pending quotations at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Quotation #</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Valid Until</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">
                      <Link to={`/customer/quotations/${q.id}`} className="hover:underline">
                        {q.quotationNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(q.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{new Date(q.validUntil).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                      ₹{Number(q.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                          statusBadges[q.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/customer/quotations/${q.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>
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

export default CustomerQuotations;

