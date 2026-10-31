import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  Package,
  Repeat,
  Percent,
  BadgePercent,
  FileText,
  Receipt,
  UserCheck,
  FileSpreadsheet,
  Layers,
  CreditCard,
  CalendarClock,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/staff/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/staff/customers', label: 'Customers', icon: UserCheck },
  { to: '/staff/quotations', label: 'Quotations', icon: FileSpreadsheet },
  { to: '/staff/quotation-templates', label: 'Templates', icon: Layers },
  { to: '/staff/subscriptions', label: 'Subscriptions', icon: Repeat },
  { to: '/staff/invoices', label: 'Invoices', icon: Receipt },
  { to: '/staff/payments', label: 'Payments', icon: CreditCard },
  { to: '/staff/billing', label: 'Billing Schedule', icon: CalendarClock },
  { to: '/staff/products', label: 'Products', icon: Package },
  { to: '/staff/plans', label: 'Plans', icon: FileText },
  { to: '/staff/taxes', label: 'Tax Rules', icon: Percent },
  { to: '/staff/discounts', label: 'Discounts', icon: BadgePercent },
];

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        links={sidebarLinks}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
