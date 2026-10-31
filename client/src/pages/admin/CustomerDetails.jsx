import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomerById, updateCustomer } from '../../services/customerService';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  Repeat,
  Calendar,
  Edit,
  Plus,
  X,
  CreditCard,
} from 'lucide-react';

const CustomerDetails = ({ basePath = '/admin' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await getCustomerById(id);
      const data = res?.data?.customer || null;
      setCustomer(data);
      if (data) {
        setFormData({
          contactPerson: data.contactPerson || '',
          companyName: data.companyName || '',
          email: data.email || '',
          phone: data.phone || '',
          alternatePhone: data.alternatePhone || '',
          billingAddress: data.billingAddress || '',
          shippingAddress: data.shippingAddress || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postalCode: data.postalCode || '',
          taxIdentificationNumber: data.taxIdentificationNumber || '',
          notes: data.notes || '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateCustomer(id, formData);
      toast.success('Customer updated successfully!');
      setIsEditModalOpen(false);
      fetchCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-800">Customer not found</h2>
        <Link to={`${basePath}/customers`} className="text-blue-600 hover:underline mt-2 inline-block">
          Return to Customer List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/customers`)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{customer.contactPerson}</h1>
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                {customer.customerCode}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  customer.isActive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {customer.companyName && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5" />
                {customer.companyName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <Link
            to={`${basePath}/quotations/create?customerId=${customer.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </Link>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Contact Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-800">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-gray-800">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.alternatePhone && (
              <div className="flex items-center gap-2 text-gray-500 text-xs pl-6">
                <span>Alt: {customer.alternatePhone}</span>
              </div>
            )}
            {customer.taxIdentificationNumber && (
              <div className="flex items-center gap-2 text-gray-800 pt-1">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-mono">Tax ID: {customer.taxIdentificationNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Billing & Location
          </h3>
          <div className="text-sm text-gray-800 space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>{customer.billingAddress || 'No billing address specified'}</span>
            </div>
            {(customer.city || customer.state || customer.country) && (
              <p className="text-xs text-gray-500 pl-6">
                {[customer.city, customer.state, customer.postalCode, customer.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Account Activity Summary */}
        <div className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-3">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Overview Stats
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-amber-50 border border-amber-200/60 rounded p-3">
              <div className="text-xs text-amber-700 font-medium">Quotations</div>
              <div className="text-2xl font-bold text-amber-900">
                {customer._count?.quotations || 0}
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200/60 rounded p-3">
              <div className="text-xs text-indigo-700 font-medium">Subscriptions</div>
              <div className="text-2xl font-bold text-indigo-900">
                {customer._count?.subscriptions || 0}
              </div>
            </div>
          </div>
          {customer.notes && (
            <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-100">
              <span className="font-semibold text-gray-700">Note: </span>
              {customer.notes}
            </p>
          )}
        </div>
      </div>

      {/* Linked Quotations */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-gray-900 text-base">Recent Quotations</h3>
          </div>
          <Link
            to={`${basePath}/quotations?customerId=${customer.id}`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View All ({customer._count?.quotations || 0})
          </Link>
        </div>

        {!customer.quotations || customer.quotations.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No quotations created for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Quotation #</th>
                  <th className="px-6 py-3">Issue Date</th>
                  <th className="px-6 py-3">Valid Until</th>
                  <th className="px-6 py-3">Grand Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/75">
                    <td className="px-6 py-3 font-mono font-medium text-blue-600">
                      {q.quotationNumber}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(q.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(q.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      ₹{Number(q.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`${basePath}/quotations/${q.id}`}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Linked Subscriptions */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-base">Active & Past Subscriptions</h3>
          </div>
          <Link
            to={`${basePath}/subscriptions?customerId=${customer.id}`}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            View All ({customer._count?.subscriptions || 0})
          </Link>
        </div>

        {!customer.subscriptions || customer.subscriptions.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            No subscriptions linked to this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Subscription #</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">Next Billing</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/75">
                    <td className="px-6 py-3 font-mono font-medium text-indigo-600">
                      {s.subscriptionNumber}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {new Date(s.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      {s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      ₹{Number(s.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`${basePath}/subscriptions/${s.id}`}
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded shadow-xl border border-gray-200 w-full max-w-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit Customer Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Billing Address
                </label>
                <textarea
                  rows="2"
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;

