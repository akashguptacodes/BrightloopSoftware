import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { LayoutDashboard, FileSpreadsheet, Repeat, Receipt, CreditCard, User } from 'lucide-react';

const sidebarLinks = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/profile', label: 'My Profile', icon: User },
  { to: '/customer/quotations', label: 'My Quotations', icon: FileSpreadsheet },
  { to: '/customer/subscriptions', label: 'My Subscriptions', icon: Repeat },
  { to: '/customer/invoices', label: 'My Invoices', icon: Receipt },
  { to: '/customer/payments', label: 'Payment History', icon: CreditCard },
];

const CustomerLayout = () => {
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

export default CustomerLayout;
