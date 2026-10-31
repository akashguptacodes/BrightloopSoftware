import { useState } from 'react';
import { Plus, Edit3, Trash2, Power, Tag, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createVariant, updateVariant, updateVariantStatus, deleteVariant } from '../../services/productService';

const VariantManager = ({ productId, baseSalesPrice = 0, variants = [], onVariantsUpdated, isAdmin = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Brand',
    value: '',
    additionalPrice: '0',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingVariant(null);
    setFormData({ name: 'Brand', value: '', additionalPrice: '0', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (variant) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name || '',
      value: variant.value || '',
      additionalPrice: String(variant.additionalPrice ?? '0'),
      isActive: variant.isActive !== undefined ? variant.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (variant) => {
    try {
      const nextStatus = !variant.isActive;
      await updateVariantStatus(variant.id, nextStatus);
      toast.success(`Variant ${nextStatus ? 'activated' : 'deactivated'} successfully.`);
      onVariantsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update variant status');
    }
  };

  const handleDelete = async (variant) => {
    if (!window.confirm(`Are you sure you want to delete variant "${variant.name}: ${variant.value}"?`)) {
      return;
    }
    try {
      await deleteVariant(variant.id);
      toast.success('Variant deleted successfully.');
      onVariantsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete variant');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.value.trim()) {
      toast.error('Attribute name and value are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        value: formData.value.trim(),
        additionalPrice: Number(formData.additionalPrice || 0),
        isActive: formData.isActive,
      };

      if (editingVariant) {
        await updateVariant(editingVariant.id, payload);
        toast.success('Variant updated successfully.');
      } else {
        await createVariant(productId, payload);
        toast.success('Variant added successfully.');
      }

      setIsModalOpen(false);
      onVariantsUpdated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save variant');
    } finally {
      setSubmitting(false);
    }
  };

  const basePriceNum = Number(baseSalesPrice || 0);

  return (
    <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <span>Product Variants & Price Modifiers</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Variants adjust the unit price (e.g. Standard: +₹0, Odoo: +₹560, Enterprise: +₹1,000).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Variant</span>
          </button>
        )}
      </div>

      {variants.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded border border-dashed border-gray-200">
          <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">No variants configured</p>
          <p className="text-xs text-gray-400 mt-0.5">
            This product currently sells at its base unit price of ₹
            {basePriceNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3">Attribute</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Additional Price</th>
                <th className="px-4 py-3">Final Unit Price</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((variant) => {
                const addPrice = Number(variant.additionalPrice || 0);
                const finalPrice = basePriceNum + addPrice;
                return (
                  <tr key={variant.id} className="hover:bg-gray-50/75 transition">
                    <td className="px-4 py-3 font-medium text-gray-600">{variant.name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{variant.value}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-600">
                        {addPrice > 0 ? `+₹${addPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        ₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          variant.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(variant)}
                            className="p-1 text-gray-400 hover:text-amber-600 rounded"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(variant)}
                            className={`p-1 rounded ${
                              variant.isActive ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-emerald-600'
                            }`}
                            title={variant.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(variant)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Variant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl border border-gray-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50">
              <h4 className="font-bold text-gray-900 text-sm">
                {editingVariant ? 'Edit Variant' : 'Add Product Variant'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Attribute Name (e.g. Brand, Edition, Tier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Brand"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Variant Value (e.g. Odoo, Enterprise, Standard)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Odoo"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Additional Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  placeholder="560.00"
                  value={formData.additionalPrice}
                  onChange={(e) => setFormData({ ...formData, additionalPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Resulting unit price: ₹
                  {(basePriceNum + Number(formData.additionalPrice || 0)).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-700">Active Variant</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVariant ? 'Update' : 'Add Variant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantManager;

