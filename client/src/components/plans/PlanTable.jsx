import { Link } from 'react-router-dom';
import { Eye, Edit3, Trash2, Power, Calendar, Repeat } from 'lucide-react';

const freqBadges = {
  DAILY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  WEEKLY: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  MONTHLY: 'bg-blue-50 text-blue-700 border-blue-200',
  YEARLY: 'bg-purple-50 text-purple-700 border-purple-200',
};

const PlanTable = ({
  plans = [],
  loading = false,
  onEdit,
  onToggleStatus,
  onDelete,
  isAdmin = false,
  baseDetailUrl = '/admin/plans',
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading subscription plans...</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-12 text-center">
        <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">No subscription plans found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
          {isAdmin
            ? 'Define recurring plans with cadences (Daily, Weekly, Monthly, Yearly) for your products.'
            : 'No subscription plans have been configured.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
          <tr>
            <th className="px-6 py-3.5">Plan Name</th>
            <th className="px-6 py-3.5">Product</th>
            <th className="px-6 py-3.5">Cadence / Interval</th>
            <th className="px-6 py-3.5">Base Price</th>
            <th className="px-6 py-3.5">Min Qty</th>
            <th className="px-6 py-3.5">Availability</th>
            <th className="px-6 py-3.5">Status</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {plans.map((plan) => {
            const fromStr = plan.availableFrom ? new Date(plan.availableFrom).toLocaleDateString() : 'Immediate';
            const untilStr = plan.availableUntil ? new Date(plan.availableUntil).toLocaleDateString() : 'Indefinite';

            return (
              <tr key={plan.id} className="hover:bg-gray-50/75 transition">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{plan.name}</div>
                  {plan.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">{plan.description}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-800">{plan.product?.name || 'N/A'}</span>
                  {plan.product?.type && (
                    <span className="text-[10px] text-gray-400 block">{plan.product.type}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                      freqBadges[plan.billingFrequency] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Every {plan.billingInterval > 1 ? `${plan.billingInterval} ` : ''}
                    {plan.billingFrequency.toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  ₹{Number(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">{plan.minimumQuantity}</td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  <span className="block font-medium text-gray-700">From: {fromStr}</span>
                  <span className="block text-gray-400">Until: {untilStr}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                      plan.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`${baseDetailUrl}/${plan.id}`}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="View Plan Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(plan)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                          title="Edit Plan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToggleStatus(plan)}
                          className={`p-1.5 rounded transition ${
                            plan.isActive
                              ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={plan.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(plan)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete Plan"
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

export default PlanTable;

