import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from '../../services/productService';
import ProductTable from '../../components/products/ProductTable';
import ProductForm from '../../components/products/ProductForm';
import { Plus, Search, Filter, RefreshCw, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        type: selectedType || undefined,
        status: selectedStatus || undefined,
      };

      const res = await getProducts(params);
      const list = res.data?.products || [];
      setProducts(list);
      if (res.data?.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedType, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Product updated successfully.');
      } else {
        await createProduct(formData);
        toast.success('Product created successfully.');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const nextStatus = !product.isActive;
      await updateProductStatus(product.id, nextStatus);
      toast.success(`Product ${nextStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product status');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      return;
    }

    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const detailBaseUrl = isAdmin ? '/admin/products' : '/staff/products';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Manage software solutions, add-ons, physical items, and their variant pricing modifiers.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="SOFTWARE">Software</option>
            <option value="SERVICE">Service</option>
            <option value="PHYSICAL">Physical</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        <ProductTable
          products={products}
          loading={loading}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          baseDetailUrl={detailBaseUrl}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 bg-gray-50">
            <span>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
              {pagination.total} total)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isAdmin && (
        <ProductForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingProduct}
          loading={submitting}
        />
      )}
    </div>
  );
};

export default Products;

