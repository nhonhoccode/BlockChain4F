import React from 'react';
import { RouteObject } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import CitizenLayout from '../layouts/CitizenLayout';
import OfficerLayout from '../layouts/OfficerLayout';
import ChairmanLayout from '../layouts/ChairmanLayout';
import PrintLayout from '../layouts/PrintLayout';

// Trang công khai
import HomePage from '../pages/public/Home/HomePage';
import AboutPage from '../pages/public/About/AboutPage';
import ContactPage from '../pages/public/Contact/ContactPage';
import DocumentVerifyPage from '../pages/public/DocumentVerify/DocumentVerifyPage';

// Trang xác thực
import LoginPage from '../pages/auth/Login/LoginPage';
import RegisterPage from '../pages/auth/Register/RegisterPage';
import OfficerRegisterPage from '../pages/auth/OfficerRegister/OfficerRegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPassword/ResetPasswordPage';
import GoogleCallbackPage from '../pages/auth/GoogleCallback/GoogleCallback.jsx';

// Trang công dân
import CitizenDashboardPage from '../pages/citizen/Dashboard/CitizenDashboard';
import CitizenProfilePage from '../pages/citizen/Profile/CitizenProfile';
import NewRequestPage from '../pages/citizen/Requests/NewRequest';
import RequestsListPage from '../pages/citizen/Requests/RequestsList';
import RequestDetailPage from '../pages/citizen/Requests/RequestDetail';
import DocumentsPage from '../pages/citizen/Documents/Documents';
import DocumentDetailPage from '../pages/citizen/Documents/DocumentDetail';
import FeedbackPage from '../pages/citizen/Feedback/Feedback';

// Trang cán bộ xã
import OfficerDashboardPage from '../pages/officer/Dashboard/OfficerDashboard';
import OfficerProfilePage from '../pages/officer/Profile/OfficerProfilePage';
import RequestsQueuePage from '../pages/officer/ProcessRequest/RequestsQueuePage';
import ProcessRequestPage from '../pages/officer/ProcessRequest/ProcessRequestPage';
import DocumentGenerationPage from '../pages/officer/ProcessRequest/DocumentGenerationPage';
import CitizenListPage from '../pages/officer/CitizenManagement/CitizenListPage';
import CitizenDetailPage from '../pages/officer/CitizenManagement/CitizenDetailPage';
import ApprovalStatusPage from '../pages/officer/ApprovalStatus/ApprovalStatusPage';
import StatisticsPage from '../pages/officer/Statistics/StatisticsPage';

// Trang chủ tịch xã
import ChairmanDashboardPage from '../pages/admin/chairman/Dashboard/ChairmanDashboard';
import OfficerApprovalListPage from '../pages/admin/chairman/OfficerApproval/OfficerApprovalListPage';
import OfficerApprovalDetailPage from '../pages/admin/chairman/OfficerApproval/OfficerApprovalDetailPage';
import ApprovedOfficersPage from '../pages/admin/chairman/OfficerApproval/ApprovedOfficersPage';
import OfficersPage from '../pages/admin/chairman/OfficerManagement/OfficersPage';
import OfficerDetailPage from '../pages/admin/chairman/OfficerManagement/OfficerDetailPage';
import AssignTasksPage from '../pages/admin/chairman/OfficerManagement/AssignTasksPage';
import PendingDocumentsPage from '../pages/admin/chairman/ImportantDocuments/PendingDocumentsPage';
import DocumentApprovalPage from '../pages/admin/chairman/ImportantDocuments/DocumentApprovalPage';
import OverviewReportPage from '../pages/admin/chairman/Reports/OverviewReportPage';
import PerformanceReportPage from '../pages/admin/chairman/Reports/PerformanceReportPage';
import ActivityReportPage from '../pages/admin/chairman/Reports/ActivityReportPage';

// Route guards
import withAuthGuard from '../utils/withAuthGuard';

// Trang 404
const NotFoundPage: React.FC = () => (
  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
    <h1>404 - Trang không tồn tại</h1>
    <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
  </div>
);

// Trang đang phát triển
const UnderDevelopmentPage: React.FC = () => (
  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
    <h1>Tính năng đang phát triển</h1>
    <p>Tính năng này đang được phát triển và sẽ sớm ra mắt.</p>
  </div>
);

// Định nghĩa các routes
export interface AppRoute extends RouteObject {
  requiresAuth?: boolean;
  role?: string;
  children?: AppRoute[];
}

// Các routes công khai
export const publicRoutes: AppRoute[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "verify-document", element: <DocumentVerifyPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

// Các routes xác thực
export const authRoutes: AppRoute[] = [
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "officer-register", element: <OfficerRegisterPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "google/callback", element: <GoogleCallbackPage /> }
    ]
  }
];

// Các routes dành cho công dân
export const citizenRoutes: AppRoute[] = [
  {
    path: "/citizen",
    element: withAuthGuard(<CitizenLayout />, 'citizen'),
    requiresAuth: true,
    role: 'citizen',
    children: [
      { path: "dashboard", element: <CitizenDashboardPage /> },
      { path: "profile", element: <CitizenProfilePage /> },
      { path: "requests", element: <RequestsListPage /> },
      { path: "requests/new", element: <NewRequestPage /> },
      { path: "requests/:requestId", element: <RequestDetailPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "documents/:documentId", element: <DocumentDetailPage /> },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

// Các routes dành cho cán bộ xã
export const officerRoutes: AppRoute[] = [
  {
    path: "/officer",
    element: withAuthGuard(<OfficerLayout />, 'officer'),
    requiresAuth: true,
    role: 'officer',
    children: [
      { path: "dashboard", element: <OfficerDashboardPage /> },
      { path: "profile", element: <OfficerProfilePage /> },
      { path: "requests", element: <RequestsQueuePage /> },
      { path: "requests/process/:requestId", element: <ProcessRequestPage /> },
      { path: "requests/document/:requestId", element: <DocumentGenerationPage /> },
      { path: "citizen-management", element: <CitizenListPage /> },
      { path: "citizen-management/:citizenId", element: <CitizenDetailPage /> },
      { path: "approval-status", element: <ApprovalStatusPage /> },
      { path: "statistics", element: <StatisticsPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

// Các routes dành cho chủ tịch xã
export const chairmanRoutes: AppRoute[] = [
  {
    path: "/chairman",
    element: withAuthGuard(<ChairmanLayout />, 'chairman'),
    requiresAuth: true,
    role: 'chairman',
    children: [
      { path: "dashboard", element: <ChairmanDashboardPage /> },
      { path: "officer-approval", element: <OfficerApprovalListPage /> },
      { path: "officer-approval/:officerId", element: <OfficerApprovalDetailPage /> },
      { path: "approved-officers", element: <ApprovedOfficersPage /> },
      { path: "officer-management", element: <OfficersPage /> },
      { path: "officer-management/:officerId", element: <OfficerDetailPage /> },
      { path: "assign-tasks", element: <AssignTasksPage /> },
      { path: "important-documents", element: <PendingDocumentsPage /> },
      { path: "important-documents/:documentId", element: <DocumentApprovalPage /> },
      { path: "reports/overview", element: <OverviewReportPage /> },
      { path: "reports/performance", element: <PerformanceReportPage /> },
      { path: "reports/activity", element: <ActivityReportPage /> },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

// Route in ấn
export const printRoutes: AppRoute[] = [
  {
    path: "/print",
    element: <PrintLayout />,
    children: [
      { path: "document/:documentId", element: <UnderDevelopmentPage /> }
    ]
  }
];

// Tất cả các routes
const routes: AppRoute[] = [
  ...publicRoutes,
  ...authRoutes,
  ...citizenRoutes,
  ...officerRoutes,
  ...chairmanRoutes,
  ...printRoutes
];

export default routes; 