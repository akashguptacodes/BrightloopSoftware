import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Power, Layers } from 'lucide-react';

const typeColors = {
  SOFTWARE: 'bg-blue-50 text-blue-700 border-blue-200',
  SERVICE: 'bg-purple-50 text-purple-700 border-purple-200',
  PHYSICAL: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ProductTable = ({
  products = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
  isAdmin = false,
  baseDetailUrl = '/admin/products',
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 text-center">
        <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">No products found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'Get started by creating your first software, service, or physical product.'
            : 'No products are currently available in the catalog.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-3.5">Product Name</th>
            <th className="px-6 py-3.5">Type</th>
            <th className="px-6 py-3.5">Sales Price</th>
            <th className="px-6 py-3.5">Cost Price</th>
            <th className="px-6 py-3.5">Variants</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5">Created Date</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => {
            const variantCount = product._count?.variants ?? product.variants?.length ?? 0;
            return (
              <tr key={product.id} className="hover:bg-gray-50/75 transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{product.name}</div>
                  {product.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      typeColors[product.type] || 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {product.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ₹{Number(product.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  ₹{Number(product.costPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    {variantCount} variant{variantCount === 1 ? '' : 's'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`${baseDetailUrl}/${product.id}`}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details & Variants"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(product)}
                          className={`p-1.5 rounded-lg transition ${
                            product.isActive
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(product)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;

