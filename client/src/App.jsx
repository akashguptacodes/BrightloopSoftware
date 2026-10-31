import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getDashboardPath, ROLES } from './utils/roleHelpers';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import CustomerLayout from './layouts/CustomerLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRoute from './components/common/RoleRoute';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Admin & Staff Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import StaffDashboard from './pages/staff/StaffDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import Reports from './pages/admin/Reports';

// Sprint 2 Management Pages
import Products from './pages/admin/Products';
import ProductDetails from './pages/admin/ProductDetails';
import Plans from './pages/admin/Plans';
import PlanDetails from './pages/admin/PlanDetails';
import Taxes from './pages/admin/Taxes';
import Discounts from './pages/admin/Discounts';

// Sprint 3 Management Pages
import Customers from './pages/admin/Customers';
import CustomerDetails from './pages/admin/CustomerDetails';
import QuotationTemplates from './pages/admin/QuotationTemplates';
import Quotations from './pages/admin/Quotations';
import CreateQuotation from './pages/admin/CreateQuotation';
import QuotationDetails from './pages/admin/QuotationDetails';
import Subscriptions from './pages/admin/Subscriptions';
import SubscriptionDetails from './pages/admin/SubscriptionDetails';

// Sprint 4 Billing & Payments Pages
import Invoices from './pages/admin/Invoices';
import CreateInvoice from './pages/admin/CreateInvoice';
import InvoiceDetails from './pages/admin/InvoiceDetails';
import Payments from './pages/admin/Payments';
import PaymentDetails from './pages/admin/PaymentDetails';
import BillingOverview from './pages/admin/BillingOverview';

// Customer Portal Pages
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerQuotations from './pages/customer/CustomerQuotations';
import CustomerQuotationDetails from './pages/customer/CustomerQuotationDetails';
import CustomerSubscriptions from './pages/customer/CustomerSubscriptions';
import CustomerSubscriptionDetails from './pages/customer/CustomerSubscriptionDetails';
import CustomerInvoices from './pages/customer/CustomerInvoices';
import CustomerInvoiceDetails from './pages/customer/CustomerInvoiceDetails';
import CustomerPayments from './pages/customer/CustomerPayments';

// 404
import NotFound from './pages/NotFound';

// Redirect if already authenticated (for auth pages)
const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Root Path — Classical Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <Register />
            </PublicOnly>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnly>
              <ForgotPassword />
            </PublicOnly>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnly>
              <ResetPassword />
            </PublicOnly>
          }
        />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<Customers basePath="/admin" />} />
            <Route path="customers/:id" element={<CustomerDetails basePath="/admin" />} />
            <Route path="quotation-templates" element={<QuotationTemplates />} />
            <Route path="quotations" element={<Quotations basePath="/admin" />} />
            <Route path="quotations/create" element={<CreateQuotation basePath="/admin" />} />
            <Route path="quotations/:id" element={<QuotationDetails basePath="/admin" />} />
            <Route path="subscriptions" element={<Subscriptions basePath="/admin" />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetails basePath="/admin" />} />
            <Route path="invoices" element={<Invoices basePath="/admin" />} />
            <Route path="invoices/create" element={<CreateInvoice basePath="/admin" />} />
            <Route path="invoices/:id" element={<InvoiceDetails basePath="/admin" />} />
            <Route path="payments" element={<Payments basePath="/admin" />} />
            <Route path="payments/:id" element={<PaymentDetails basePath="/admin" />} />
            <Route path="billing" element={<BillingOverview basePath="/admin" />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="plans" element={<Plans />} />
            <Route path="plans/:id" element={<PlanDetails />} />
            <Route path="taxes" element={<Taxes />} />
            <Route path="discounts" element={<Discounts />} />
            <Route path="staff" element={<StaffManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Protected Staff Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]} />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<Customers basePath="/staff" />} />
            <Route path="customers/:id" element={<CustomerDetails basePath="/staff" />} />
            <Route path="quotation-templates" element={<QuotationTemplates />} />
            <Route path="quotations" element={<Quotations basePath="/staff" />} />
            <Route path="quotations/create" element={<CreateQuotation basePath="/staff" />} />
            <Route path="quotations/:id" element={<QuotationDetails basePath="/staff" />} />
            <Route path="subscriptions" element={<Subscriptions basePath="/staff" />} />
            <Route path="subscriptions/:id" element={<SubscriptionDetails basePath="/staff" />} />
            <Route path="invoices" element={<Invoices basePath="/staff" />} />
            <Route path="invoices/create" element={<CreateInvoice basePath="/staff" />} />
            <Route path="invoices/:id" element={<InvoiceDetails basePath="/staff" />} />
            <Route path="payments" element={<Payments basePath="/staff" />} />
            <Route path="payments/:id" element={<PaymentDetails basePath="/staff" />} />
            <Route path="billing" element={<BillingOverview basePath="/staff" />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="plans" element={<Plans />} />
            <Route path="plans/:id" element={<PlanDetails />} />
            <Route path="taxes" element={<Taxes />} />
            <Route path="discounts" element={<Discounts />} />
          </Route>
        </Route>
      </Route>

      {/* Protected Customer Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowedRoles={[ROLES.CUSTOMER]} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="/customer/dashboard" replace />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="quotations" element={<CustomerQuotations />} />
            <Route path="quotations/:id" element={<CustomerQuotationDetails />} />
            <Route path="subscriptions" element={<CustomerSubscriptions />} />
            <Route path="subscriptions/:id" element={<CustomerSubscriptionDetails />} />
            <Route path="invoices" element={<CustomerInvoices />} />
            <Route path="invoices/:id" element={<CustomerInvoiceDetails />} />
            <Route path="payments" element={<CustomerPayments />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
