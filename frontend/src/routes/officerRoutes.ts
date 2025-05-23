import React from 'react';
import { Navigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { RouteObject } from 'react-router-dom';

// Layouts
import OfficerLayout from '../layouts/OfficerLayout';

// Direct imports instead of lazy loading
import OfficerDashboardPage from '../pages/officer/Dashboard/OfficerDashboardPage';
import OfficerProfilePage from '../pages/officer/Profile/OfficerProfilePage';
import RequestsQueuePage from '../pages/officer/ProcessRequest/RequestsQueuePage';
import ProcessRequestPage from '../pages/officer/ProcessRequest/ProcessRequestPage';
import DocumentGenerationPage from '../pages/officer/ProcessRequest/DocumentGenerationPage';
import CitizenManagement from '../pages/officer/CitizenManagement/CitizenManagement';
import CitizenDetail from '../pages/officer/CitizenManagement/CitizenDetail';
import CitizenEdit from '../pages/officer/CitizenManagement/CitizenEdit';
import CitizenDocuments from '../pages/officer/CitizenManagement/CitizenDocuments';
import DocumentDetail from '../pages/officer/CitizenManagement/DocumentDetail';
import ApprovalStatusPage from '../pages/officer/ApprovalStatus/ApprovalStatusPage';
import StatisticsPage from '../pages/officer/Statistics/StatisticsPage';

// Auth guard HOC
import { withAuthGuard } from '../utils/withAuthGuard';

// Loading fallback component
const LoadingFallback = (): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

// Protected layout with auth guard
const ProtectedOfficerLayout = withAuthGuard(OfficerLayout, { requiredRole: 'officer' });

// Interface for custom route properties
export interface OfficerRouteObject extends RouteObject {
  requiresAuth?: boolean;
  role?: string;
  children?: OfficerRouteObject[];
}

// Routes configuration for officer pages
const officerRoutes: OfficerRouteObject[] = [
  {
    path: '/officer',
    // element: <ProtectedOfficerLayout />,
    children: [
      { path: '', element: <Navigate to="/officer/dashboard" replace /> },
      { path: 'dashboard', element: <OfficerDashboardPage /> },
      { path: 'profile', element: <OfficerProfilePage /> },
      { path: 'process-request', element: <Navigate to="/officer/process-request/queue" replace /> },
      { path: 'process-request/queue', element: <RequestsQueuePage /> },
      { path: 'process-request/:id', element: <ProcessRequestPage /> },
      { path: 'process-request/document-generation', element: <DocumentGenerationPage /> },
      { path: 'citizens', element: <CitizenManagement /> },
      { path: 'citizens/:id/edit', element: <CitizenEdit /> },
      { path: 'approval-status', element: <ApprovalStatusPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
    ],
  },
];

export default officerRoutes; 