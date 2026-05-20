import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { ServiceDetailPage } from '@/pages/public/ServiceDetailPage';
import { WorkerDetailPage } from '@/pages/public/WorkerDetailPage';
import { SearchPage } from '@/pages/public/SearchPage';
import { LoginPage } from '@/pages/public/LoginPage';
import { RegisterPage } from '@/pages/public/RegisterPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { FAQPage } from '@/pages/public/FAQPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { ResetPasswordPage } from '@/pages/public/ResetPasswordPage';
import { ServiceSectorPage } from '@/pages/public/ServiceSectorPage';
import { NotificationListener } from '@/components/NotificationListener';
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import { CustomerProfilePage } from '@/pages/customer/CustomerProfilePage';
import { CustomerBookingsPage } from '@/pages/customer/CustomerBookingsPage';
import { CustomerOrdersPage } from '@/pages/customer/CustomerOrdersPage';
import { CustomerWishlistPage } from '@/pages/customer/CustomerWishlistPage';
import { CustomerNotificationsPage } from '@/pages/customer/CustomerNotificationsPage';
import { CustomerPaymentsPage } from '@/pages/customer/CustomerPaymentsPage';
import { CustomerReviewsPage } from '@/pages/customer/CustomerReviewsPage';
import { CustomerCartPage } from '@/pages/customer/CustomerCartPage';
import { CustomerCheckoutPage } from '@/pages/customer/CustomerCheckoutPage';
import { CustomerPayBookingPage } from '@/pages/customer/CustomerPayBookingPage';
import { CustomerComplaintsPage } from '@/pages/customer/CustomerComplaintsPage';
import { WorkerDashboardPage } from '@/pages/worker/WorkerDashboardPage';
import { WorkerProfilePage } from '@/pages/worker/WorkerProfilePage';
import { WorkerDocumentsPage } from '@/pages/worker/WorkerDocumentsPage';
import { WorkerAvailabilityPage } from '@/pages/worker/WorkerAvailabilityPage';
import { WorkerServicesPage } from '@/pages/worker/WorkerServicesPage';
import { WorkerOrdersPage } from '@/pages/worker/WorkerOrdersPage';
import { WorkerEarningsPage } from '@/pages/worker/WorkerEarningsPage';
import { WorkerReviewsPage } from '@/pages/worker/WorkerReviewsPage';
import { WorkerNotificationsPage } from '@/pages/worker/WorkerNotificationsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import {
  AdminUsersPage,
  AdminWorkersPage,
  AdminVerifyPage,
  AdminServicesPage,
  AdminOrdersPage,
  AdminPaymentsPage,
  AdminReviewsPage,
  AdminAnalyticsPage,
  AdminComplaintsPage,
} from '@/pages/admin/AdminTablePage';
import { BookingChatPage } from '@/pages/shared/BookingChatPage';

export default function App() {
  return (
    <>
      <NotificationListener />
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceSectorPage />} />
        <Route path="/offer/:id" element={<ServiceDetailPage />} />
        <Route path="/categories" element={<Navigate to="/services" replace />} />
        <Route path="/categories/:slug" element={<Navigate to="/services/:slug" replace />} />
        <Route path="/workers/:id" element={<WorkerDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['customer', 'worker', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route path="/bookings/:id/chat" element={<BookingChatPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['customer', 'admin']} />}>
        <Route element={<MainLayout />}>
          <Route element={<DashboardLayout variant="customer" />}>
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
            <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
            <Route path="/customer/orders" element={<CustomerOrdersPage />} />
            <Route path="/customer/wishlist" element={<CustomerWishlistPage />} />
            <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />
            <Route path="/customer/payments" element={<CustomerPaymentsPage />} />
            <Route path="/customer/reviews" element={<CustomerReviewsPage />} />
            <Route path="/customer/cart" element={<CustomerCartPage />} />
            <Route path="/customer/checkout" element={<CustomerCheckoutPage />} />
            <Route path="/customer/pay/:bookingId" element={<CustomerPayBookingPage />} />
            <Route path="/customer/complaints" element={<CustomerComplaintsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['worker']} />}>
        <Route element={<MainLayout />}>
          <Route element={<DashboardLayout variant="worker" />}>
            <Route path="/worker/dashboard" element={<WorkerDashboardPage />} />
            <Route path="/worker/profile" element={<WorkerProfilePage />} />
            <Route path="/worker/documents" element={<WorkerDocumentsPage />} />
            <Route path="/worker/availability" element={<WorkerAvailabilityPage />} />
            <Route path="/worker/services" element={<WorkerServicesPage />} />
            <Route path="/worker/orders" element={<WorkerOrdersPage />} />
            <Route path="/worker/earnings" element={<WorkerEarningsPage />} />
            <Route path="/worker/reviews" element={<WorkerReviewsPage />} />
            <Route path="/worker/notifications" element={<WorkerNotificationsPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route element={<DashboardLayout variant="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/workers" element={<AdminWorkersPage />} />
            <Route path="/admin/verify" element={<AdminVerifyPage />} />
            <Route path="/admin/services" element={<AdminServicesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/404" element={<MainLayout />}>
        <Route index element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </>
  );
}
