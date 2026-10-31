import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createInvoice } from '../../services/invoiceService';
import { getCustomers } from '../../services/customerService';
import { getProducts } from '../../services/productService';
import { getPlans } from '../../services/planService';
import { getTaxes } from '../../services/taxService';
import { getDiscounts } from '../../services/discountService';
import toast from 'react-hot-toast';
import {
  Receipt,
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  Calendar,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

const CreateInvoice = ({ basePath = '/admin' }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment is due within 15 days of invoice date. Thank you for your business.');

  const [items, setItems] = useState([
    {
      productId: '',
      variantId: '',
      planId: '',
      taxId: '',
      discountId: '',
      quantity: 1,
      unitPrice: 0,
      description: '',
    },
  ]);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        const [custRes, prodRes, planRes, taxRes, discRes] = await Promise.all([
          getCustomers({ limit: 100, isActive: true }),
          getProducts({ limit: 100, isActive: true }),
          getPlans({ limit: 100, isActive: true }),
          getTaxes({ limit: 100, isActive: true }),
          getDiscounts({ limit: 100, isActive: true }),
        ]);

        setCustomers(custRes?.data?.customers || custRes?.data || []);
        setProducts(prodRes?.data?.products || prodRes?.data || []);
        setPlans(planRes?.data?.plans || planRes?.data || []);
        setTaxes(taxRes?.data?.taxes || taxRes?.data || []);
        setDiscounts(discRes?.data?.discounts || discRes?.data || []);
      } catch (err) {
        console.error('Failed to load dependencies:', err);
        toast.error('Failed to load customers or product catalogs');
      }
    };

    loadDependencies();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        variantId: '',
        planId: '',
        taxId: '',
        discountId: '',
        quantity: 1,
        unitPrice: 0,
        description: '',
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error('Invoice must contain at least one line item');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    if (field === 'productId') {
      const selectedProduct = products.find((p) => p.id === value);
      item.variantId = '';
      item.planId = '';
      if (selectedProduct) {
        item.unitPrice = Number(selectedProduct.salesPrice) || 0;
        // Auto select first variant if available
        if (selectedProduct.variants && selectedProduct.variants.length > 0) {
          const firstVar = selectedProduct.variants[0];
          item.variantId = firstVar.id;
          item.unitPrice = Number(selectedProduct.salesPrice) + Number(firstVar.additionalPrice || 0);
        }
      } else {
        item.unitPrice = 0;
      }
    }

    if (field === 'variantId') {
      const selectedProduct = products.find((p) => p.id === item.productId);
      if (selectedProduct) {
        const selectedVariant = selectedProduct.variants?.find((v) => v.id === value);
        const basePrice = Number(selectedProduct.salesPrice) || 0;
        const addPrice = Number(selectedVariant?.additionalPrice) || 0;
        item.unitPrice = basePrice + addPrice;
      }
    }

    if (field === 'planId' && value) {
      const selectedPlan = plans.find((p) => p.id === value);
      if (selectedPlan) {
        item.unitPrice = Number(selectedPlan.price) || 0;
      }
    }

    updated[index] = item;
    setItems(updated);
  };

  // Live calculation preview
  const calculations = items.reduce(
    (acc, it) => {
      const qty = Number(it.quantity) || 1;
      const price = Number(it.unitPrice) || 0;
      const lineSubtotal = qty * price;

      let lineDiscount = 0;
      if (it.discountId) {
        const disc = discounts.find((d) => d.id === it.discountId);
        if (disc) {
          if (disc.type === 'PERCENTAGE') {
            lineDiscount = (lineSubtotal * Number(disc.value)) / 100;
          } else {
            lineDiscount = Number(disc.value);
          }
        }
      }
      lineDiscount = Math.min(lineDiscount, lineSubtotal);
      const afterDiscount = lineSubtotal - lineDiscount;

      let lineTax = 0;
      if (it.taxId) {
        const tax = taxes.find((t) => t.id === it.taxId);
        if (tax) {
          lineTax = (afterDiscount * Number(tax.rate)) / 100;
        }
      }

      acc.subtotal += lineSubtotal;
      acc.discountTotal += lineDiscount;
      acc.taxTotal += lineTax;
      acc.grandTotal += afterDiscount + lineTax;
      return acc;
    },
    { subtotal: 0, discountTotal: 0, taxTotal: 0, grandTotal: 0 }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].productId) {
        toast.error(`Please select a product for Item #${i + 1}`);
        return;
      }
      if (Number(items[i].quantity) <= 0) {
        toast.error(`Item #${i + 1} quantity must be at least 1`);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await createInvoice({
        customerId,
        dueDate,
        notes,
        terms,
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || undefined,
          planId: it.planId || undefined,
          taxId: it.taxId || undefined,
          discountId: it.discountId || undefined,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          description: it.description || undefined,
        })),
      });

      toast.success(res?.message || 'Invoice created successfully');
      navigate(`${basePath}/invoices/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to={`${basePath}/invoices`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Invoices
      </Link>

      <div className="bg-white rounded border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
            <Receipt className="w-4 h-4" />
            <span>New Manual Invoice</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice Draft</h1>
          <p className="text-sm text-gray-500">
            Compose a manual invoice draft with itemized pricing, taxes, and customer terms.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 p-5 rounded border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.contactPerson || c.name})` : (c.contactPerson || c.name)} — {c.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* Line Items Repeater */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            {items.map((item, idx) => {
              const selectedProd = products.find((p) => p.id === item.productId);
              const availableVariants = selectedProd?.variants || [];
              const availablePlans = plans.filter((p) => p.productId === item.productId);

              return (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded border border-gray-200 space-y-4 relative"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-500 border-b border-gray-200 pb-2">
                    <span>Line Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Product */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Product *</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.type}] — Base ₹{Number(p.salesPrice).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Variant */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Variant (Optional)</label>
                      <select
                        value={item.variantId}
                        onChange={(e) => handleItemChange(idx, 'variantId', e.target.value)}
                        disabled={!item.productId || availableVariants.length === 0}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50"
                      >
                        <option value="">No Variant / Base</option>
                        {availableVariants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}: {v.value} (+₹{Number(v.additionalPrice).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Plan (Optional)</label>
                      <select
                        value={item.planId}
                        onChange={(e) => handleItemChange(idx, 'planId', e.target.value)}
                        disabled={!item.productId || availablePlans.length === 0}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white disabled:opacity-50"
                      >
                        <option value="">One-off / None</option>
                        {availablePlans.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name} ({pl.billingFrequency}) — ₹{Number(pl.price).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Unit Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                      />
                    </div>

                    {/* Tax */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rule</label>
                      <select
                        value={item.taxId}
                        onChange={(e) => handleItemChange(idx, 'taxId', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">No Tax</option>
                        {taxes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({Number(t.rate)}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Discount Offer</label>
                      <select
                        value={item.discountId}
                        onChange={(e) => handleItemChange(idx, 'discountId', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">No Discount</option>
                        {discounts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Optional line description or notes..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md bg-white placeholder-gray-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals Summary Card */}
          <div className="bg-gray-50 rounded p-5 border border-gray-200 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 w-full md:w-1/2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Internal Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes for internal tracking or delivery remarks..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Terms & Conditions</label>
                <textarea
                  rows="2"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Terms and conditions printed on invoice..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md bg-white"
                />
              </div>
            </div>

            <div className="w-full md:w-72 bg-white p-4 rounded border border-gray-200 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-₹{calculations.discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>+₹{calculations.taxTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Grand Total:</span>
                <span className="text-indigo-600">₹{calculations.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Link
              to={`${basePath}/invoices`}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Creating Draft...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Create Invoice Draft</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;

