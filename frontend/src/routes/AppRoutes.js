import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout/MainLayout';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import OfficerLayout from '../layouts/OfficerLayout/OfficerLayout';
import ChairmanLayout from '../layouts/ChairmanLayout/ChairmanLayout';
import CitizenLayout from '../layouts/CitizenLayout/CitizenLayout';
import LoadingScreen from '../components/common/Loaders/LoadingScreen';
import APITestPage from '../pages/dev/APITestPage'; // Import the test page

// Lazy loaded components
const HomePage = lazy(() => import('../pages/public/Home/HomePage'));
const AboutPage = lazy(() => import('../pages/public/About/AboutPage'));
const ContactPage = lazy(() => import('../pages/public/Contact/ContactPage'));
const DocumentVerifyPage = lazy(() => import('../pages/public/DocumentVerify/DocumentVerifyPage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFound/NotFoundPage'));
const PublicProceduresPage = lazy(() => import('../pages/public/Procedures/PublicProceduresPage'));
const ProcedureDetailPage = lazy(() => import('../pages/public/Procedures/ProcedureDetailPage'));

// Auth pages
const LoginPage = lazy(() => import('../pages/auth/Login/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/Register/RegisterPage'));
const OfficerRegisterPage = lazy(() => import('../pages/auth/OfficerRegister/OfficerRegisterPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPassword/ResetPasswordPage'));
const GoogleCallback = lazy(() => import('../pages/auth/GoogleCallback/GoogleCallback'));

// Citizen pages
const CitizenDashboard = lazy(() => import('../pages/citizen/Dashboard/CitizenDashboard'));
const CitizenProfile = lazy(() => import('../pages/citizen/Profile/CitizenProfile'));
const CitizenRequests = lazy(() => import('../pages/citizen/Requests/RequestsList'));
const CitizenNewRequest = lazy(() => import('../pages/citizen/Requests/NewRequest'));
const CitizenRequestDetail = lazy(() => import('../pages/citizen/Requests/RequestDetail'));
const CitizenDocuments = lazy(() => import('../pages/citizen/Documents/DocumentsList'));
const CitizenDocumentDetail = lazy(() => import('../pages/citizen/Documents/DocumentDetailPage'));
const CitizenFeedback = lazy(() => import('../pages/citizen/Feedback/FeedbackPage'));
const CitizenSupport = lazy(() => import('../pages/citizen/Support/SupportPage'));

// Officer pages
const OfficerDashboard = lazy(() => import('../pages/officer/Dashboard/OfficerDashboard'));
const OfficerProfile = lazy(() => import('../pages/officer/Profile/OfficerProfilePage'));
const OfficerPendingRequests = lazy(() => import('../pages/officer/RequestManagement/PendingRequests'));
const OfficerProcessRequest = lazy(() => import('../pages/officer/RequestManagement/ProcessRequest'));
const OfficerCitizens = lazy(() => import('../pages/officer/CitizenManagement/CitizenList'));
const OfficerCitizenEdit = lazy(() => import('../pages/officer/CitizenManagement/CitizenEdit'));
const OfficerStatistics = lazy(() => import('../pages/officer/Statistics/StatisticsPage'));


// Chairman pages
const ChairmanDashboard = lazy(() => import('../pages/admin/chairman/Dashboard/ChairmanDashboard'));
const OfficerApprovalList = lazy(() => import('../pages/admin/chairman/OfficerApproval/OfficerApprovalListPage'));
const OfficerApprovalDetail = lazy(() => import('../pages/admin/chairman/OfficerManagement/OfficerApprovalDetail'));
const OfficersList = lazy(() => import('../pages/admin/chairman/OfficerManagement/OfficersList'));
const OfficerDetail = lazy(() => import('../pages/admin/chairman/OfficerManagement/OfficerDetail'));
const ImportantDocuments = lazy(() => import('../pages/admin/chairman/DocumentManagement/ImportantDocuments'));
const DocumentApproval = lazy(() => import('../pages/admin/chairman/DocumentManagement/DocumentApproval'));
const ChairmanReports = lazy(() => import('../pages/admin/chairman/Reports/ReportsPage'));

const AppRoutes = () => {
  const { isAuthenticated, userLoading, currentUser } = useAuth();
  
  if (userLoading) {
    return <LoadingScreen />;
  }
  
  const userRole = currentUser?.role || 'visitor';
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="document-verify" element={<DocumentVerifyPage />} />
          <Route path="procedures" element={<PublicProceduresPage />} />
          <Route path="procedures/:procedureId" element={<ProcedureDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        
        {/* Authentication Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={isAuthenticated ? <Navigate to={`/${userRole}`} /> : <LoginPage />} />
          <Route path="register" element={isAuthenticated ? <Navigate to={`/${userRole}`} /> : <RegisterPage />} />
          <Route path="officer-register" element={isAuthenticated ? <Navigate to={`/${userRole}`} /> : <OfficerRegisterPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="google/callback" element={<GoogleCallback />} />
        </Route>
        
        {/* Citizen Routes */}
        <Route path="/citizen" element={<CitizenLayout />}>
          <Route index element={isAuthenticated && userRole === 'citizen' ? <CitizenDashboard /> : <Navigate to="/auth/login" />} />
          <Route path="profile" element={isAuthenticated && userRole === 'citizen' ? <CitizenProfile /> : <Navigate to="/auth/login" />} />
          <Route path="requests" element={isAuthenticated && userRole === 'citizen' ? <CitizenRequests /> : <Navigate to="/auth/login" />} />
          <Route path="requests/new" element={isAuthenticated && userRole === 'citizen' ? <CitizenNewRequest /> : <Navigate to="/auth/login" />} />
          <Route path="requests/:id" element={isAuthenticated && userRole === 'citizen' ? <CitizenRequestDetail /> : <Navigate to="/auth/login" />} />
          <Route path="documents" element={isAuthenticated && userRole === 'citizen' ? <CitizenDocuments /> : <Navigate to="/auth/login" />} />
          <Route path="documents/:id" element={isAuthenticated && userRole === 'citizen' ? <CitizenDocumentDetail /> : <Navigate to="/auth/login" />} />
          <Route path="feedback" element={isAuthenticated && userRole === 'citizen' ? <CitizenFeedback /> : <Navigate to="/auth/login" />} />
          <Route path="support" element={isAuthenticated && userRole === 'citizen' ? <CitizenSupport /> : <Navigate to="/auth/login" />} />
        </Route>
        
        {/* Officer Routes */}
        <Route path="/officer" element={<OfficerLayout />}>
          <Route index element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerDashboard /> : <Navigate to="/auth/login" />} />
          <Route path="profile" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerProfile /> : <Navigate to="/auth/login" />} />
          <Route path="requests/pending" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerPendingRequests /> : <Navigate to="/auth/login" />} />
          <Route path="process-request/:id" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerProcessRequest /> : <Navigate to="/auth/login" />} />
          <Route path="citizens" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerCitizens /> : <Navigate to="/auth/login" />} />
          <Route path="citizens/:citizenId/edit" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerCitizenEdit /> : <Navigate to="/auth/login" />} />
          <Route path="statistics" element={isAuthenticated && (userRole === 'officer' || userRole === 'chairman') ? <OfficerStatistics /> : <Navigate to="/auth/login" />} />

        </Route>
        
        {/* Chairman Routes */}
        <Route path="/admin/chairman" element={<ChairmanLayout />}>
          <Route index element={isAuthenticated && userRole === 'chairman' ? <ChairmanDashboard /> : <Navigate to="/auth/login" />} />
          <Route path="officer-approvals" element={isAuthenticated && userRole === 'chairman' ? <OfficerApprovalList /> : <Navigate to="/auth/login" />} />
          <Route path="officer-approvals/:id" element={isAuthenticated && userRole === 'chairman' ? <OfficerApprovalDetail /> : <Navigate to="/auth/login" />} />
          <Route path="officers" element={isAuthenticated && userRole === 'chairman' ? <OfficersList /> : <Navigate to="/auth/login" />} />
          <Route path="officers/:id" element={isAuthenticated && userRole === 'chairman' ? <OfficerDetail /> : <Navigate to="/auth/login" />} />
          <Route path="important-documents" element={isAuthenticated && userRole === 'chairman' ? <ImportantDocuments /> : <Navigate to="/auth/login" />} />
          <Route path="important-documents/:id" element={isAuthenticated && userRole === 'chairman' ? <DocumentApproval /> : <Navigate to="/auth/login" />} />
          <Route path="reports" element={isAuthenticated && userRole === 'chairman' ? <ChairmanReports /> : <Navigate to="/auth/login" />} />
        </Route>
        
        {/* Chairman Routes - Alternative Path */}
        <Route path="/chairman" element={<ChairmanLayout />}>
          <Route index element={isAuthenticated && userRole === 'chairman' ? <ChairmanDashboard /> : <Navigate to="/auth/login" />} />
          <Route path="officer-approvals" element={isAuthenticated && userRole === 'chairman' ? <OfficerApprovalList /> : <Navigate to="/auth/login" />} />
          <Route path="officer-approvals/:id" element={isAuthenticated && userRole === 'chairman' ? <OfficerApprovalDetail /> : <Navigate to="/auth/login" />} />
          <Route path="officers" element={isAuthenticated && userRole === 'chairman' ? <OfficersList /> : <Navigate to="/auth/login" />} />
          <Route path="officers/:id" element={isAuthenticated && userRole === 'chairman' ? <OfficerDetail /> : <Navigate to="/auth/login" />} />
          <Route path="important-documents" element={isAuthenticated && userRole === 'chairman' ? <ImportantDocuments /> : <Navigate to="/auth/login" />} />
          <Route path="important-documents/:id" element={isAuthenticated && userRole === 'chairman' ? <DocumentApproval /> : <Navigate to="/auth/login" />} />
          <Route path="reports" element={isAuthenticated && userRole === 'chairman' ? <ChairmanReports /> : <Navigate to="/auth/login" />} />
        </Route>
        
        {/* Dev/Test Routes */}
        <Route path="/dev">
          <Route path="api-test" element={<APITestPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 