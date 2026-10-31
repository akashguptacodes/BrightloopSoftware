import { useState, useEffect } from 'react';
import { getCustomerProfile, updateCustomerProfile } from '../../services/customerPortalService';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Copy,
  Shield,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    contactPerson: '',
    companyName: '',
    phone: '',
    alternatePhone: '',
    taxIdentificationNumber: '',
    billingAddress: '',
    shippingAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getCustomerProfile();
      if (res?.data?.customer) {
        const c = res.data.customer;
        setCustomer(c);
        setFormData({
          contactPerson: c.contactPerson || '',
          companyName: c.companyName || '',
          phone: c.phone || '',
          alternatePhone: c.alternatePhone || '',
          taxIdentificationNumber: c.taxIdentificationNumber || '',
          billingAddress: c.billingAddress || '',
          shippingAddress: c.shippingAddress || '',
          city: c.city || '',
          state: c.state || '',
          postalCode: c.postalCode || '',
          country: c.country || 'India',
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyBillingToShipping = () => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: prev.billingAddress,
    }));
    toast.success('Billing address copied to shipping address.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.contactPerson.trim()) {
      toast.error('Contact person name is required.');
      return;
    }

    try {
      setSaving(true);
      const res = await updateCustomerProfile(formData);
      toast.success(res?.message || 'Profile updated successfully!');
      if (res?.data) {
        setCustomer(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <User className="w-4 h-4" />
            <span>Customer Profile & Billing Information</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer?.companyName || customer?.contactPerson || 'My Account'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your corporate identity, tax registration, and primary billing & shipping destinations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {customer?.customerCode && (
            <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded text-xs font-mono font-bold">
              ID: {customer.customerCode}
            </div>
          )}
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
            Active Account
          </span>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">Account Email</p>
            <p className="text-sm font-semibold text-gray-900 truncate" title={customer?.email}>
              {customer?.email}
            </p>
            <span className="text-[11px] text-gray-400">Primary login credential</span>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Customer Code</p>
            <p className="text-sm font-mono font-bold text-emerald-700">
              {customer?.customerCode || 'N/A'}
            </p>
            <span className="text-[11px] text-gray-400">Unique corporate identifier</span>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Member Since</p>
            <p className="text-sm font-semibold text-gray-900">
              {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <span className="text-[11px] text-gray-400">Customer portal registration</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Contact & Company */}
        <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Company & Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                placeholder="e.g. Akash Gupta"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Company / Organization Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Tech Solutions"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Primary Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Alternate Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="alternatePhone"
                  value={formData.alternatePhone}
                  onChange={handleChange}
                  placeholder="Optional alternate line"
                  className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Tax Identification Number / GSTIN / VAT
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  name="taxIdentificationNumber"
                  value={formData.taxIdentificationNumber}
                  onChange={handleChange}
                  placeholder="e.g. 29ABCDE1234F1Z5"
                  className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Will be printed automatically on your official tax invoices and receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Addresses */}
        <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Address & Billing Locations
            </h2>
            <button
              type="button"
              onClick={handleCopyBillingToShipping}
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700 hover:underline"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Billing &rarr; Shipping</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Billing Address (Invoicing)
              </label>
              <textarea
                name="billingAddress"
                rows="3"
                value={formData.billingAddress}
                onChange={handleChange}
                placeholder="Street address, building, suite..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Shipping Address (Deliveries)
              </label>
              <textarea
                name="shippingAddress"
                rows="3"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Shipping or operational facility address..."
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bangalore"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Karnataka"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Postal Code / PIN
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g. 560001"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. India"
                className="w-full px-3.5 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={fetchProfile}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;

