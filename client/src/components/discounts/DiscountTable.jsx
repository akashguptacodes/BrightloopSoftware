import { Edit3, Trash2, Power, BadgePercent, Calendar, CheckCircle, Tag } from 'lucide-react';

const DiscountTable = ({
  discounts = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
  isAdmin = false,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading discount rules...</p>
      </div>
    );
  }

  if (discounts.length === 0) {
    return (
      <div className="p-12 text-center">
        <BadgePercent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">No discount rules configured</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'Set up fixed or percentage discounts with minimum purchase limits and product restrictions.'
            : 'No discount rules are currently available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-3.5">Discount Name</th>
            <th className="px-6 py-3.5">Type & Value</th>
            <th className="px-6 py-3.5">Scope</th>
            <th className="px-6 py-3.5">Thresholds</th>
            <th className="px-6 py-3.5">Validity Period</th>
            <th className="px-6 py-3.5">Usage</th>
            <th className="px-6 py-3.5">Status</th>
            {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {discounts.map((discount) => {
            const isPercent = discount.discountType === 'PERCENTAGE';
            const startStr = discount.startsAt ? new Date(discount.startsAt).toLocaleDateString() : 'N/A';
            const expStr = discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString() : 'Never';

            return (
              <tr key={discount.id} className="hover:bg-gray-50/75 transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{discount.name}</div>
                  {discount.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">{discount.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${
                      isPercent
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isPercent ? `${Number(discount.discountValue)}% OFF` : `₹${Number(discount.discountValue)} OFF`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {discount.appliesToAllProducts ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      All Products
                    </span>
                  ) : (
                    <div className="text-xs text-gray-700">
                      <span className="font-semibold text-blue-700">{discount.products?.length || 0}</span> selected product(s)
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {discount.minimumQuantity && (
                    <span className="block">Min Qty: <strong>{discount.minimumQuantity}</strong></span>
                  )}
                  {discount.minimumPurchaseAmount && (
                    <span className="block">Min Spend: <strong>₹{Number(discount.minimumPurchaseAmount).toFixed(2)}</strong></span>
                  )}
                  {!discount.minimumQuantity && !discount.minimumPurchaseAmount && (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  <span className="block font-medium text-gray-700">From: {startStr}</span>
                  <span className="block text-gray-400">Until: {expStr}</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-700">
                  <span className="font-bold">{discount.usedCount || 0}</span>
                  <span className="text-gray-400">
                    {discount.usageLimit ? ` / ${discount.usageLimit} max` : ' (Unlimited)'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                      discount.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {discount.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(discount)}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        title="Edit Discount Rule"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onToggleStatus(discount)}
                        className={`p-1.5 rounded transition ${
                          discount.isActive
                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={discount.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(discount)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Discount Rule"
                      >
                        <Trash2 className="w-4 h-4" />
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
  );
};

export default DiscountTable;

