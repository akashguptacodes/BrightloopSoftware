import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Calendar, ShieldCheck, FileText, Receipt, CreditCard, Sparkles 
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Customer Self-Service Portal
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || 'Customer'}!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your Brightloop software subscriptions, view billing statements, and check payment history.
          </p>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Customer Name</p>
              <p className="text-sm font-semibold text-gray-900">{user?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Registered Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={user?.email}>
                {user?.email || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Account Status</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-700">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">My Subscriptions</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
            No active subscriptions yet. Once Brightloop services are activated for your account, your plans will appear here.
          </p>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full mt-auto">
            Coming in Sprint 2
          </span>
        </div>

        {/* My Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Billing & Invoices</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
            Your recurring invoices and downloadable PDF receipts will be listed here with payment due dates.
          </p>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full mt-auto">
            Coming in Sprint 3
          </span>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">Payment History</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed">
            Payment records, receipts, and payment method details will be accessible here once payments are made.
          </p>
          <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full mt-auto">
            Coming in Sprint 3
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

