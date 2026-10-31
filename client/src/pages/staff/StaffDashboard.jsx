import { useAuth } from '../../context/AuthContext';
import { 
  FileText, Receipt, CreditCard, Clock, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();

  const comingSoonModules = [
    {
      title: 'Quotation Pipeline',
      description: 'Prepare, customize, and convert customer quotation templates into live subscriptions.',
      icon: FileText,
      sprint: 'Sprint 2',
      color: 'blue',
    },
    {
      title: 'Subscription Tracking',
      description: 'Monitor active customer subscriptions, variant additions, renewals, and pauses.',
      icon: CheckCircle2,
      sprint: 'Sprint 2',
      color: 'emerald',
    },
    {
      title: 'Billing & Invoicing',
      description: 'Batch generate recurring invoices, verify tax and discount rules, and dispatch receipts.',
      icon: Receipt,
      sprint: 'Sprint 3',
      color: 'purple',
    },
    {
      title: 'Payment Processing',
      description: 'Record incoming customer payments, log transaction notes, and track overdue receivables.',
      icon: CreditCard,
      sprint: 'Sprint 3',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
          Internal Staff Portal
        </span>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Staff Member'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your day-to-day operations hub for Brightloop Software subscription workflows.
        </p>
      </div>

      {/* Operational Overview Cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Operations Hub Roadmap</h2>
          <span className="text-xs text-gray-400">Sprint 1 Foundation Active</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Authentication and staff role permissions are fully established. The operational modules below will come online in upcoming sprints:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {comingSoonModules.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-blue-600 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                      <Clock className="w-3 h-3 text-blue-600" />
                      {item.sprint}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-400">
                  <span>Status: Scheduled for next release</span>
                  <span className="font-semibold text-gray-500">Coming Soon</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

