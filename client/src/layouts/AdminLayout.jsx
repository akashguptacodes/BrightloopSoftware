import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import {
  LayoutDashboard,
  Users,
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
  BarChart3,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/admin/customers', label: 'Customers', icon: UserCheck },
  { to: '/admin/quotations', label: 'Quotations', icon: FileSpreadsheet },
  { to: '/admin/quotation-templates', label: 'Templates', icon: Layers },
  { to: '/admin/subscriptions', label: 'Subscriptions', icon: Repeat },
  { to: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/billing', label: 'Billing Schedule', icon: CalendarClock },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/plans', label: 'Plans', icon: FileText },
  { to: '/admin/taxes', label: 'Taxes', icon: Percent },
  { to: '/admin/discounts', label: 'Discounts', icon: BadgePercent },
  { to: '/admin/staff', label: 'Staff Management', icon: Users },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f7f4] overflow-hidden">
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

export default AdminLayout;
