import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPlanById } from '../../services/planService';
import { ArrowLeft, Repeat, Package, CheckCircle2, XCircle, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PlanDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await getPlanById(id);
      setPlan(res.data?.plan || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPlan();
  }, [id]);

  const backUrl = isAdmin ? '/admin/plans' : '/staff/plans';

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 max-w-7xl mx-auto">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
        <p className="text-sm">Loading plan details...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-12 text-center max-w-7xl mx-auto bg-white rounded-xl border border-gray-200">
        <Repeat className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900">Plan Not Found</h3>
        <Link
          to={backUrl}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </Link>
      </div>
    );
  }

  const policies = [
    { label: 'Auto Renewal', enabled: plan.allowRenewal, desc: 'Renews automatically on next cycle' },
    { label: 'Pause & Resume', enabled: plan.allowPause, desc: 'Customer can temporarily pause seats' },
    { label: 'Early Cancellation', enabled: plan.allowEarlyCancellation, desc: 'Can be closed before expiry' },
    { label: 'Auto Close on Expiry', enabled: plan.autoCloseOnExpiry, desc: 'Closes on end date if not renewed' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plans</span>
        </Link>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            plan.isActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {plan.isActive ? 'Active Plan' : 'Inactive Plan'}
        </span>
      </div>

      {/* Main Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Repeat className="w-4 h-4" />
              <span>Subscription Plan Specification</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {plan.description || 'No description entered for this subscription plan.'}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 min-w-[200px] text-right">
            <span className="text-xs text-blue-600 font-semibold block uppercase tracking-wider">
              Recurring Price
            </span>
            <span className="text-2xl font-black text-gray-900 block mt-0.5">
              ₹{Number(plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-blue-800 font-medium block mt-1">
              Billed every {plan.billingInterval > 1 ? `${plan.billingInterval} ` : ''}
              {plan.billingFrequency.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Cadence and Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block font-medium">Billing Interval</span>
            <span className="text-gray-900 font-bold text-sm">
              Every {plan.billingInterval} {plan.billingFrequency.toLowerCase()}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Minimum Quantity</span>
            <span className="text-gray-900 font-bold text-sm">{plan.minimumQuantity} seat(s)</span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Available From</span>
            <span className="text-gray-900 font-medium">
              {plan.availableFrom ? new Date(plan.availableFrom).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block font-medium">Available Until</span>
            <span className="text-gray-900 font-medium">
              {plan.availableUntil ? new Date(plan.availableUntil).toLocaleDateString() : 'Indefinite / Ongoing'}
            </span>
          </div>
        </div>
      </div>

      {/* Associated Product Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-blue-600" />
          <span>Product Core & Base Specification</span>
        </h3>

        {plan.product ? (
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-gray-900">{plan.product.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  {plan.product.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-lg">
                {plan.product.description || 'Base product linked to this recurring plan.'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Base Product Unit Price</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{Number(plan.product.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">No linked product information available.</p>
        )}
      </div>

      {/* Lifecycle Policies */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Subscription Lifecycle Policies</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {policies.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start gap-3">
              {p.enabled ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm text-gray-900">{p.label}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                <span
                  className={`inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                    p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {p.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDetails;

