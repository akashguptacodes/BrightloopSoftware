import { useState, useEffect } from 'react';
import { X, BadgePercent, Check } from 'lucide-react';

const DiscountForm = ({
  isOpen,
  onClose,
  onSubmit,
  products = [],
  initialData = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumPurchaseAmount: '',
    minimumQuantity: '',
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    usageLimit: '',
    appliesToAllProducts: true,
    productIds: [],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        discountType: initialData.discountType || 'PERCENTAGE',
        discountValue: initialData.discountValue !== undefined ? String(initialData.discountValue) : '',
        minimumPurchaseAmount: initialData.minimumPurchaseAmount ? String(initialData.minimumPurchaseAmount) : '',
        minimumQuantity: initialData.minimumQuantity ? String(initialData.minimumQuantity) : '',
        startsAt: initialData.startsAt ? new Date(initialData.startsAt).toISOString().split('T')[0] : '',
        expiresAt: initialData.expiresAt ? new Date(initialData.expiresAt).toISOString().split('T')[0] : '',
        usageLimit: initialData.usageLimit ? String(initialData.usageLimit) : '',
        appliesToAllProducts: initialData.appliesToAllProducts !== undefined ? initialData.appliesToAllProducts : true,
        productIds: (initialData.products || []).map((p) => p.id),
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '10',
        minimumPurchaseAmount: '',
        minimumQuantity: '',
        startsAt: new Date().toISOString().split('T')[0],
        expiresAt: '',
        usageLimit: '',
        appliesToAllProducts: true,
        productIds: [],
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleProductToggle = (id) => {
    setFormData((prev) => {
      const exists = prev.productIds.includes(id);
      return {
        ...prev,
        productIds: exists ? prev.productIds.filter((pid) => pid !== id) : [...prev.productIds, id],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumPurchaseAmount: formData.minimumPurchaseAmount ? Number(formData.minimumPurchaseAmount) : null,
      minimumQuantity: formData.minimumQuantity ? Number(formData.minimumQuantity) : null,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : new Date().toISOString(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      productIds: formData.appliesToAllProducts ? [] : formData.productIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded shadow-xl border border-gray-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">
              {initialData ? 'Edit Discount Rule' : 'Create Discount Rule'}
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
              Discount Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Bulk Purchase Offer, Welcome Discount"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="PERCENTAGE">Percentage (% Off)</option>
                <option value="FIXED">Fixed Amount (₹ Off)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                step="0.01"
                required
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '200.00'}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Scope selection */}
          <div className="p-3.5 bg-gray-50 rounded border border-gray-200 space-y-3">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              Application Scope
            </span>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="scope"
                  checked={formData.appliesToAllProducts}
                  onChange={() => setFormData({ ...formData, appliesToAllProducts: true })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800">Apply to All Products</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="scope"
                  checked={!formData.appliesToAllProducts}
                  onChange={() => setFormData({ ...formData, appliesToAllProducts: false })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800">Specific Products Only</span>
              </label>
            </div>

            {!formData.appliesToAllProducts && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-600 block mb-2">
                  Select applicable products:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-white rounded border border-gray-200">
                  {products.length === 0 ? (
                    <p className="text-xs text-gray-400">No products found.</p>
                  ) : (
                    products.map((p) => {
                      const isSelected = formData.productIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 text-xs p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductToggle(p.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-gray-800">{p.name}</span>
                          <span className="text-gray-400 text-[10px]">({p.type})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. Purchase Amount (₹){' '}
                <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 2000"
                value={formData.minimumPurchaseAmount}
                onChange={(e) => setFormData({ ...formData, minimumPurchaseAmount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. Quantity <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={formData.minimumQuantity}
                onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Dates & Usage Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starts At</label>
              <input
                type="date"
                required
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At <span className="text-gray-400 text-xs font-normal">(Opt.)</span>
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit <span className="text-gray-400 text-xs font-normal">(Opt.)</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 100"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows="2"
              placeholder="Promotional campaign details, discount terms..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
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
              {loading ? 'Saving...' : initialData ? 'Update Discount' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountForm;

