import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Layouts
import ChairmanLayout from '../layouts/ChairmanLayout';

// Direct imports instead of lazy loading
import ChairmanDashboard from '../pages/admin/chairman/Dashboard/ChairmanDashboard';
import OfficersList from '../pages/admin/chairman/OfficerManagement/OfficersList';
import OfficerApprovalList from '../pages/admin/chairman/OfficerManagement/OfficerApprovalList';
import ImportantDocuments from '../pages/admin/chairman/DocumentManagement/ImportantDocuments';
import ChairmanReports from '../pages/admin/chairman/Reports/ReportsPage';
import OfficerDetail from '../pages/admin/chairman/OfficerManagement/OfficerDetail';
import OfficerApprovalDetail from '../pages/admin/chairman/OfficerManagement/OfficerApprovalDetail';
import DocumentApproval from '../pages/admin/chairman/DocumentManagement/DocumentApproval';

// Auth guard HOC
import { withAuthGuard } from '../utils/withAuthGuard';

// Interface for route objects
export interface ChairmanRouteObject extends RouteObject {
  requiresAuth?: boolean;
  role?: string;
  children?: ChairmanRouteObject[];
}

// Loading fallback component
const LoadingFallback = (): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ProtectedChairman = withAuthGuard(ChairmanLayout, { requiredRole: 'chairman' });

// Routes configuration for chairman pages
const chairmanRoutes: ChairmanRouteObject[] = [
  {
    path: '/admin/chairman',
    element: <ProtectedChairman />,
    requiresAuth: true,
    role: 'chairman',
    children: [
      { path: '', element: <Navigate to="/admin/chairman/dashboard" replace /> },
      { path: 'dashboard', element: <ChairmanDashboard /> },
      { path: 'officers', element: <OfficersList /> },
      { path: 'officers/:id', element: <OfficerDetail /> },
      { path: 'officer-approvals', element: <OfficerApprovalList /> },
      { path: 'officer-approvals/:id', element: <OfficerApprovalDetail /> },
      { path: 'important-documents', element: <ImportantDocuments /> },
      { path: 'important-documents/:id', element: <DocumentApproval /> },
      { path: 'reports', element: <ChairmanReports /> },
    ],
  },
  // Thêm route không có tiền tố /admin
  {
    path: '/chairman',
    element: <ProtectedChairman />,
    requiresAuth: true,
    role: 'chairman',
    children: [
      { path: '', element: <Navigate to="/chairman/dashboard" replace /> },
      { path: 'dashboard', element: <ChairmanDashboard /> },
      { path: 'officers', element: <OfficersList /> },
      { path: 'officers/:id', element: <OfficerDetail /> },
      { path: 'officer-approvals', element: <OfficerApprovalList /> },
      { path: 'officer-approvals/:id', element: <OfficerApprovalDetail /> },
      { path: 'important-documents', element: <ImportantDocuments /> },
      { path: 'important-documents/:id', element: <DocumentApproval /> },
      { path: 'reports', element: <ChairmanReports /> },
    ],
  },
  // Direct access route for testing without authentication
  {
    path: '/test/chairman/dashboard',
    element: <ChairmanDashboard />
  }
];

// Add console log for the routes
console.log('Chairman Routes:', chairmanRoutes);

export default chairmanRoutes; 