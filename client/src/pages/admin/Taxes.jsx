import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getTaxes,
  createTax,
  updateTax,
  updateTaxStatus,
  deleteTax,
} from '../../services/taxService';
import TaxTable from '../../components/taxes/TaxTable';
import TaxForm from '../../components/taxes/TaxForm';
import { Plus, Percent, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Taxes = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const params = {
        status: selectedStatus || undefined,
      };
      const res = await getTaxes(params);
      setTaxes(res.data?.taxes || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch tax rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [selectedStatus]);

  const handleOpenAdd = () => {
    setEditingTax(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (editingTax) {
        await updateTax(editingTax.id, formData);
        toast.success('Tax rule updated successfully.');
      } else {
        await createTax(formData);
        toast.success('Tax rule created successfully.');
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save tax rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tax) => {
    try {
      const nextStatus = !tax.isActive;
      await updateTaxStatus(tax.id, nextStatus);
      toast.success(`Tax rule ${nextStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchTaxes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tax status');
    }
  };

  const handleDelete = async (tax) => {
    if (!window.confirm(`Are you sure you want to delete tax rule "${tax.name}"?`)) {
      return;
    }

    try {
      await deleteTax(tax.id);
      toast.success('Tax rule deleted successfully.');
      fetchTaxes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tax rule');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Percent className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Tax Configuration</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Configure percentage tax rules applied automatically during invoice calculation.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Rule</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          <button
            onClick={fetchTaxes}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <TaxTable
          taxes={taxes}
          loading={loading}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      </div>

      {/* Form Modal */}
      {isAdmin && (
        <TaxForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTax}
          loading={submitting}
        />
      )}
    </div>
  );
};

export default Taxes;

