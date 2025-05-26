import React from 'react';
import { Navigate } from 'react-router-dom';
import withAuthGuard from './utils/withAuthGuard.js';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import CitizenLayout from './layouts/CitizenLayout';
import OfficerLayout from './layouts/OfficerLayout';
import ChairmanLayout from './layouts/ChairmanLayout';

// Public Pages
import HomePage from './pages/public/Home';
import DocumentVerifyPage from './pages/public/DocumentVerify';
import AboutPage from './pages/public/About';
import ContactPage from './pages/public/Contact';
import NotFoundPage from './pages/public/NotFound';
import { PublicProceduresPage, ProcedureDetailPage } from './pages/public/Procedures';

// Auth Pages
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import OfficerRegisterPage from './pages/auth/OfficerRegister';
import ResetPasswordPage from './pages/auth/ResetPassword';
import GoogleCallback from './pages/auth/GoogleCallback/GoogleCallback';

// Citizen Pages
import CitizenDashboard from './pages/citizen/Dashboard';

// Officer Pages
import OfficerDashboard from './pages/officer/Dashboard';
import PendingRequests from './pages/officer/RequestManagement/PendingRequests';
import ProcessRequest from './pages/officer/ProcessRequest';
import OfficerProfilePage from './pages/officer/Profile';
import StatisticsPage from './pages/officer/Statistics/StatisticsPage';
import CitizenList from './pages/officer/CitizenManagement/CitizenList';

// Chairman Pages
import ChairmanDashboard from './pages/admin/chairman/Dashboard';
import ImportantDocuments from './pages/admin/chairman/DocumentManagement/ImportantDocuments';
import DocumentDetail from './pages/admin/chairman/DocumentManagement/DocumentDetail';

// Apply withAuthGuard to components
const ProtectedCitizenDashboard = withAuthGuard(CitizenDashboard, { requiredRole: 'citizen' });
const ProtectedOfficerDashboard = withAuthGuard(OfficerDashboard, { requiredRole: 'officer' });
const ProtectedOfficerProfilePage = withAuthGuard(OfficerProfilePage, { requiredRole: 'officer' });
const ProtectedPendingRequests = withAuthGuard(PendingRequests, { requiredRole: 'officer' });
const ProtectedProcessRequest = withAuthGuard(ProcessRequest, { requiredRole: 'officer' });
const ProtectedStatisticsPage = withAuthGuard(StatisticsPage, { requiredRole: 'officer' });
const ProtectedCitizenList = withAuthGuard(CitizenList, { requiredRole: 'officer' });
const ProtectedChairmanDashboard = withAuthGuard(ChairmanDashboard, { requiredRole: 'chairman' });
const ProtectedImportantDocuments = withAuthGuard(ImportantDocuments, { requiredRole: 'chairman' });
const ProtectedDocumentDetail = withAuthGuard(DocumentDetail, { requiredRole: 'chairman' });

// Define routes
const routes = [
  // Public routes with MainLayout
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "document-verify", element: <DocumentVerifyPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "procedures", element: <PublicProceduresPage /> },
      { path: "procedures/:procedureId", element: <ProcedureDetailPage /> },
    ]
  },
  
  // Authentication routes
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "officer-register", element: <OfficerRegisterPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "google-callback", element: <GoogleCallback /> },
      { path: "google/callback", element: <GoogleCallback /> },
    ]
  },
  
  // Citizen routes - protected with auth guard
  {
    path: "citizen",
    element: <CitizenLayout />,
    children: [
      { path: "dashboard", element: <ProtectedCitizenDashboard /> },
      // { path: "*", element: <Navigate to="/citizen/dashboard" replace /> }
    ]
  },
  
  // Officer routes - protected with auth guard
  {
    path: "officer",
    element: <OfficerLayout />,
    children: [
      { path: "dashboard", element: <ProtectedOfficerDashboard /> },
      { path: "pending-requests", element: <ProtectedPendingRequests /> },
      { path: "process-request/:requestId", element: <ProtectedProcessRequest /> },
      { path: "profile", element: <ProtectedOfficerProfilePage /> },
      { path: "statistics", element: <ProtectedStatisticsPage /> },
      { path: "citizens", element: <ProtectedCitizenList /> },
      { path: "", element: <Navigate to="/officer/dashboard" replace /> },
      { path: "*", element: <Navigate to="/officer/dashboard" replace /> }
    ]
  },
  
  // Chairman routes - protected with auth guard
  {
    path: "chairman",
    element: <ChairmanLayout />,
    children: [
      { path: "dashboard", element: <ProtectedChairmanDashboard /> },
      { path: "important-documents", element: <ProtectedImportantDocuments /> },
      { path: "important-documents/:id", element: <ProtectedDocumentDetail /> },
      { path: "", element: <Navigate to="/chairman/dashboard" replace /> },
      { path: "*", element: <Navigate to="/chairman/dashboard" replace /> }
    ]
  },
  
  // Not found - catch-all route
  {
    path: "*",
    element: <MainLayout />,
    children: [
      { path: "*", element: <NotFoundPage /> }
    ]
  }
];

export default routes; 