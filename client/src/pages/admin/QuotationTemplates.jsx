import { useState, useEffect } from 'react';
import {
  getQuotationTemplates,
  createQuotationTemplate,
  updateQuotationTemplate,
  toggleQuotationTemplateStatus,
} from '../../services/quotationTemplateService';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Clock,
  FileText,
  Edit,
  Power,
  X,
  Search,
} from 'lucide-react';

const QuotationTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    validityDays: 15,
    termsAndConditions: '',
    notes: '',
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await getQuotationTemplates({ search });
      setTemplates(res?.data?.templates || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load quotation templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [search]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      validityDays: 15,
      termsAndConditions: '1. Quotation valid for specified days from issue date.\n2. Payment terms: Net 30 days.\n3. Brightloop Software SLA applies to all licensed instances.',
      notes: 'Thank you for choosing Brightloop Software!',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name || '',
      description: t.description || '',
      validityDays: t.validityDays || 15,
      termsAndConditions: t.termsAndConditions || '',
      notes: t.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Template name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingTemplate) {
        await updateQuotationTemplate(editingTemplate.id, formData);
        toast.success('Template updated successfully!');
      } else {
        await createQuotationTemplate(formData);
        toast.success('Template created successfully!');
      }
      setIsModalOpen(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await toggleQuotationTemplateStatus(id);
      toast.success(`Template ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
      fetchTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>Standardized Presets</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quotation Templates</h1>
          <p className="text-sm text-gray-500">
            Define reusable validity periods, default terms & conditions, and closing notes for sales quotations.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation Template</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-sm text-gray-500">
          Total Templates: <span className="font-semibold text-gray-800">{templates.length}</span>
        </div>
      </div>

      {/* Grid of Templates */}
      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No Templates Defined</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Create standard quotation templates to speed up quotation workflows for your sales team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-base">{t.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      t.isActive
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {t.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50/80 px-2.5 py-1.5 rounded-md font-medium w-fit">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Valid for {t.validityDays} days</span>
                </div>

                {t.termsAndConditions && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100">
                    <span className="font-semibold text-gray-700 block mb-0.5">Terms Preview:</span>
                    <p className="line-clamp-3 whitespace-pre-line text-gray-500">{t.termsAndConditions}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Used in {t._count?.quotations || 0} quotations
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(t.id, t.isActive)}
                    className={`p-1.5 rounded transition ${
                      t.isActive
                        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={t.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded shadow-xl border border-gray-200 w-full max-w-lg my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {editingTemplate ? 'Edit Quotation Template' : 'New Quotation Template'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Standard SaaS Monthly Agreement"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Validity Period (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value, 10) || 15 })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of what this template is used for"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Terms and Conditions
                </label>
                <textarea
                  rows="4"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="Standard terms and conditions pre-filled on new quotations..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Default Customer Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Thank you for your business!"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationTemplates;

