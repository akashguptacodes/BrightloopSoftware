import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { createQuotation } from '../../services/quotationService';
import { getCustomers } from '../../services/customerService';
import { getProducts } from '../../services/productService';
import { getTaxes } from '../../services/taxService';
import { getDiscounts } from '../../services/discountService';
import { getQuotationTemplates } from '../../services/quotationTemplateService';
import { getPlans } from '../../services/planService';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  ArrowLeft,
  Plus,
  Trash2,
  Calculator,
  User,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';

const CreateQuotation = ({ basePath = '/admin' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerIdParam = searchParams.get('customerId') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reference data
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Form state
  const [customerId, setCustomerId] = useState(customerIdParam);
  const [templateId, setTemplateId] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [customerNotes, setCustomerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  // Line items state
  const [items, setItems] = useState([
    {
      productId: '',
      variantId: '',
      planId: '',
      discountId: '',
      taxId: '',
      quantity: 1,
      description: '',
    },
  ]);

  // Load initial dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cRes, pRes, tRes, dRes, tmplRes, plRes] = await Promise.all([
          getCustomers({ limit: 100, status: 'true' }),
          getProducts({ limit: 100, status: 'true' }),
          getTaxes({ status: 'true' }),
          getDiscounts({ status: 'true' }),
          getQuotationTemplates({ status: 'true' }),
          getPlans({ limit: 100, status: 'true' }),
        ]);

        setCustomers(cRes?.data?.customers || []);
        setProducts(pRes?.data?.products || []);
        setPlans(plRes?.data?.plans || []);
        setTaxes(tRes?.data?.taxes || []);
        setDiscounts(dRes?.data?.discounts || []);
        setTemplates(tmplRes?.data?.templates || []);
      } catch (err) {
        toast.error('Failed to load initial form data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // When template is selected, auto-fill validity date and terms
  const handleTemplateChange = (tmplId) => {
    setTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      if (tmpl.validityDays) {
        const d = new Date();
        d.setDate(d.getDate() + tmpl.validityDays);
        setValidUntil(d.toISOString().split('T')[0]);
      }
      if (tmpl.termsAndConditions) {
        setTermsAndConditions(tmpl.termsAndConditions);
      }
      if (tmpl.notes) {
        setCustomerNotes(tmpl.notes);
      }
    }
  };

  // Add line item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        variantId: '',
        planId: '',
        discountId: '',
        taxId: '',
        quantity: 1,
        description: '',
      },
    ]);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      toast.error('At least one line item is required.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // Reset variant and plan if product changed
      if (field === 'productId') {
        next[index].variantId = '';
        next[index].planId = '';
      }

      return next;
    });
  };

  // Client-side preview calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      if (!item.productId) return;
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      let unitPrice = Number(product.salesPrice) || 0;

      // Plan overrides price if selected
      if (item.planId) {
        const plan = (product?.plans || []).find((pl) => pl.id === item.planId) || plans.find((pl) => pl.id === item.planId);
        if (plan) unitPrice = Number(plan.price) || 0;
      }

      // Variant additional price
      if (item.variantId && product.variants) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) unitPrice += Number(variant.additionalPrice) || 0;
      }

      const lineSubtotal = unitPrice * qty;
      let lineDiscount = 0;

      if (item.discountId) {
        const disc = discounts.find((d) => d.id === item.discountId);
        if (disc) {
          if (disc.discountType === 'PERCENTAGE') {
            lineDiscount = (lineSubtotal * Number(disc.discountValue)) / 100;
          } else {
            lineDiscount = Math.min(lineSubtotal, Number(disc.discountValue));
          }
        }
      }

      const taxable = Math.max(0, lineSubtotal - lineDiscount);
      let lineTax = 0;

      if (item.taxId) {
        const tax = taxes.find((t) => t.id === item.taxId);
        if (tax) {
          lineTax = (taxable * Number(tax.rate)) / 100;
        }
      }

      subtotal += lineSubtotal;
      discountTotal += lineDiscount;
      taxTotal += lineTax;
    });

    const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);
    return { subtotal, discountTotal, taxTotal, grandTotal };
  };

  const totals = calculateTotals();

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      toast.error('Please select a customer.');
      return;
    }

    const validItems = items.filter((it) => it.productId);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid product line.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId,
        templateId: templateId || undefined,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        customerNotes,
        internalNotes,
        termsAndConditions,
        items: validItems.map((it) => ({
          productId: it.productId,
          variantId: it.variantId || undefined,
          planId: it.planId || undefined,
          discountId: it.discountId || undefined,
          taxId: it.taxId || undefined,
          quantity: parseInt(it.quantity, 10) || 1,
          description: it.description || undefined,
        })),
      };

      const res = await createQuotation(payload);
      toast.success('Quotation draft created successfully!');
      const newQuoteId = res?.data?.quotation?.id;
      if (newQuoteId) {
        navigate(`${basePath}/quotations/${newQuoteId}`);
      } else {
        navigate(`${basePath}/quotations`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading quotation builder...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`${basePath}/quotations`)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Sales Quotation</h1>
            <p className="text-sm text-gray-500">
              Compose a new quotation draft with itemized price snapshots, taxes, and discounts.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Details Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
            Quotation Setup
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Customer select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Customer *
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contactPerson} {c.companyName ? `(${c.companyName})` : ''} — {c.customerCode}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-400">
                Or{' '}
                <Link to={`${basePath}/customers`} className="text-blue-600 hover:underline">
                  create new customer
                </Link>
              </div>
            </div>

            {/* Template select */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Template Preset (Optional)
              </label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Custom Quotation (No Template)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.validityDays} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry / Valid until */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">Line Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="p-6 space-y-4">
            {items.map((item, idx) => {
              const selectedProduct = products.find((p) => p.id === item.productId);
              const availableVariants = selectedProduct?.variants || [];
              const availablePlans = (selectedProduct?.plans && selectedProduct.plans.length > 0)
                ? selectedProduct.plans
                : plans.filter((pl) => pl.productId === item.productId);

              return (
                <div
                  key={idx}
                  className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Item #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-gray-400 hover:text-red-600 transition p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Product */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product *
                      </label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} [{p.type}] — Base ₹{Number(p.salesPrice).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    {/* Tax */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tax Rule
                      </label>
                      <select
                        value={item.taxId}
                        onChange={(e) => handleItemChange(idx, 'taxId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">No Tax (0%)</option>
                        {taxes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({Number(t.rate)}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Secondary row: Variant, Subscription Plan, Discount */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Variant (if any) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product Variant
                      </label>
                      <select
                        value={item.variantId}
                        disabled={availableVariants.length === 0}
                        onChange={(e) => handleItemChange(idx, 'variantId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                      >
                        <option value="">
                          {availableVariants.length > 0 ? 'Standard (No Variant)' : 'No variants available'}
                        </option>
                        {availableVariants.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name || v.attributeName ? `${v.name || v.attributeName}: ` : ''}{v.value} (+₹{Number(v.additionalPrice).toFixed(2)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Plan (if any) */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Subscription Plan
                      </label>
                      <select
                        value={item.planId}
                        disabled={availablePlans.length === 0}
                        onChange={(e) => handleItemChange(idx, 'planId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                      >
                        <option value="">
                          {availablePlans.length > 0 ? 'One-time / Base Pricing' : 'No subscription plans'}
                        </option>
                        {availablePlans.map((pl) => (
                          <option key={pl.id} value={pl.id}>
                            {pl.name} ({pl.billingFrequency}) — ₹{Number(pl.price).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Discount Offer
                      </label>
                      <select
                        value={item.discountId}
                        onChange={(e) => handleItemChange(idx, 'discountId', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">No Discount</option>
                        {discounts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.discountType === 'PERCENTAGE' ? `${Number(d.discountValue)}%` : `₹${Number(d.discountValue)}`})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Optional custom line description or notes..."
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes, Terms & Summary Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
                Notes & Conditions
              </h3>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Customer Notes (Visible on Quotation)
                </label>
                <textarea
                  rows="2"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Notes or welcome message for the customer..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Terms and Conditions
                </label>
                <textarea
                  rows="4"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="Payment terms, cancellation terms, SLA provisions..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Internal Staff Notes (Private)
                </label>
                <textarea
                  rows="2"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Notes for internal Brightloop sales/finance staff only..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 sticky top-6">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-gray-400">
                Estimated Totals
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Line Subtotal:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-600">
                  <span>Discounts:</span>
                  <span className="font-semibold">
                    -₹{totals.discountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Taxes:</span>
                  <span className="font-semibold text-gray-900">
                    +₹{totals.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900">Grand Total:</span>
                  <span className="text-2xl font-black text-blue-600">
                    ₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating Draft...' : 'Save Quotation Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/quotations`)}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotation;

