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
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/plans', label: 'Subscription Plans', icon: Repeat },
  { to: '/admin/taxes', label: 'Taxes', icon: Percent },
  { to: '/admin/discounts', label: 'Discounts', icon: BadgePercent },
  { to: '/admin/staff', label: 'Staff Management', icon: Users },
  { to: '#', label: 'Subscriptions', icon: FileText, badge: 'Sprint 3' },
  { to: '#', label: 'Invoices', icon: Receipt, badge: 'Sprint 3' },
];

const AdminLayout = () => {
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

export default AdminLayout;
