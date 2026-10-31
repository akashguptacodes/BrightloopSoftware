import { useState, useEffect } from 'react';
import { X, Repeat, AlertCircle } from 'lucide-react';

const PlanForm = ({ isOpen, onClose, onSubmit, products = [], initialData = null, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    price: '',
    billingFrequency: 'MONTHLY',
    billingInterval: 1,
    minimumQuantity: 1,
    availableFrom: new Date().toISOString().split('T')[0],
    availableUntil: '',
    allowRenewal: true,
    allowPause: false,
    allowEarlyCancellation: true,
    autoCloseOnExpiry: true,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        productId: initialData.productId || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        billingFrequency: initialData.billingFrequency || 'MONTHLY',
        billingInterval: initialData.billingInterval || 1,
        minimumQuantity: initialData.minimumQuantity || 1,
        availableFrom: initialData.availableFrom ? new Date(initialData.availableFrom).toISOString().split('T')[0] : '',
        availableUntil: initialData.availableUntil ? new Date(initialData.availableUntil).toISOString().split('T')[0] : '',
        allowRenewal: initialData.allowRenewal !== undefined ? initialData.allowRenewal : true,
        allowPause: initialData.allowPause !== undefined ? initialData.allowPause : false,
        allowEarlyCancellation: initialData.allowEarlyCancellation !== undefined ? initialData.allowEarlyCancellation : true,
        autoCloseOnExpiry: initialData.autoCloseOnExpiry !== undefined ? initialData.autoCloseOnExpiry : true,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        productId: products.length > 0 ? products[0].id : '',
        price: '',
        billingFrequency: 'MONTHLY',
        billingInterval: 1,
        minimumQuantity: 1,
        availableFrom: new Date().toISOString().split('T')[0],
        availableUntil: '',
        allowRenewal: true,
        allowPause: false,
        allowEarlyCancellation: true,
        autoCloseOnExpiry: true,
        isActive: true,
      });
    }
  }, [initialData, isOpen, products]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: Number(formData.price),
      billingInterval: Number(formData.billingInterval),
      minimumQuantity: Number(formData.minimumQuantity),
      availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : new Date().toISOString(),
      availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded shadow-xl border border-gray-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">
              {initialData ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Inventory Pro Monthly, Enterprise Annual"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Product <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.type}) — Base: ₹{Number(p.salesPrice).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recurring Plan Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="1000.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cadence</label>
              <select
                value={formData.billingFrequency}
                onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interval Multiplier</label>
              <input
                type="number"
                min="1"
                required
                placeholder="1"
                value={formData.billingInterval}
                onChange={(e) => setFormData({ ...formData, billingInterval: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Quantity</label>
              <input
                type="number"
                min="1"
                required
                placeholder="1"
                value={formData.minimumQuantity}
                onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
              <input
                type="date"
                required
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Until <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                value={formData.availableUntil}
                onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Description</label>
            <textarea
              rows="2"
              placeholder="Features, contract conditions, SLA, seat allocations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Policy Checklist */}
          <div className="p-3.5 bg-gray-50 rounded border border-gray-200 space-y-2 text-xs">
            <span className="font-semibold text-gray-700 block text-xs">Plan Lifecycle & Renewal Policies</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowRenewal}
                  onChange={(e) => setFormData({ ...formData, allowRenewal: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Allow auto-renewal</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowPause}
                  onChange={(e) => setFormData({ ...formData, allowPause: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Allow pause & resume</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowEarlyCancellation}
                  onChange={(e) => setFormData({ ...formData, allowEarlyCancellation: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Allow early cancellation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCloseOnExpiry}
                  onChange={(e) => setFormData({ ...formData, autoCloseOnExpiry: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Auto-close on expiry</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : initialData ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanForm;

