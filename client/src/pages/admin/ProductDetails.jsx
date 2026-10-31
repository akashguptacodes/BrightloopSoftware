import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProductById } from '../../services/productService';
import VariantManager from '../../components/products/VariantManager';
import { ArrowLeft, Package, DollarSign, Calendar, Layers, Repeat, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await getProductById(id);
      setProduct(res.data?.product || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const backUrl = isAdmin ? '/admin/products' : '/staff/products';

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 max-w-7xl mx-auto">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 text-center max-w-7xl mx-auto bg-white rounded border border-gray-200">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">Product Not Found</h3>
        <Link
          to={backUrl}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            product.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {product.isActive ? 'Active in Catalog' : 'Deactivated'}
        </span>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" />
              <span>{product.type} Product</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {product.description || 'No public description entered for this product.'}
            </p>
          </div>

          {/* Pricing Highlight */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200 min-w-[200px] text-right">
            <span className="text-xs text-gray-400 font-medium block">Base Sales Price</span>
            <span className="text-2xl font-black text-gray-900 block mt-0.5">
              ₹{Number(product.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              Cost: ₹{Number(product.costPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block font-medium">Product ID</span>
            <span className="font-mono text-gray-800 break-all">{product.id}</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Created On</span>
            <span className="text-gray-800 font-medium">
              {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Internal Notes</span>
            <span className="text-gray-800 font-medium italic">{product.notes || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Product Variants Section */}
      <VariantManager
        productId={product.id}
        baseSalesPrice={product.salesPrice}
        variants={product.variants || []}
        onVariantsUpdated={fetchProduct}
        isAdmin={isAdmin}
      />

      {/* Associated Subscription Plans */}
      <div className="bg-white rounded border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Repeat className="w-5 h-5 text-blue-600" />
          <span>Associated Subscription Plans ({product.plans?.length || 0})</span>
        </h3>

        {(!product.plans || product.plans.length === 0) ? (
          <p className="text-xs text-gray-400">
            No recurring subscription plans are currently tied to this product.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.plans.map((plan) => (
              <div key={plan.id} className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-gray-900">{plan.name}</h4>
                  <span className="text-xs font-bold text-blue-600">
                    ₹{Number(plan.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Every {plan.billingInterval > 1 ? `${plan.billingInterval} ` : ''}
                  {plan.billingFrequency.toLowerCase()}
                </p>
                <span
                  className={`mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

