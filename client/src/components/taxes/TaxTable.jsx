import { Edit3, Trash2, Power, Percent } from 'lucide-react';

const TaxTable = ({
  taxes = [],
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
        <p className="text-sm">Loading tax rules...</p>
      </div>
    );
  }

  if (taxes.length === 0) {
    return (
      <div className="p-12 text-center">
        <Percent className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">No tax rules configured</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'Add simple percentage tax rates like GST 5%, GST 12%, or GST 18%.'
            : 'No tax rules are currently configured.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-3.5">Tax Name</th>
            <th className="px-6 py-3.5">Rate (%)</th>
            <th className="px-6 py-3.5">Description</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5">Created Date</th>
            {isAdmin && <th className="px-6 py-3.5 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {taxes.map((tax) => (
            <tr key={tax.id} className="hover:bg-gray-50/75 transition">
              <td className="px-6 py-4 font-semibold text-gray-900">{tax.name}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {Number(tax.rate)}%
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs">{tax.description || '—'}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    tax.isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {tax.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs">
                {tax.createdAt ? new Date(tax.createdAt).toLocaleDateString() : 'N/A'}
              </td>
              {isAdmin && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(tax)}
                      className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      title="Edit Tax Rule"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(tax)}
                      className={`p-1.5 rounded-lg transition ${
                        tax.isActive
                          ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={tax.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tax)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Tax Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaxTable;

