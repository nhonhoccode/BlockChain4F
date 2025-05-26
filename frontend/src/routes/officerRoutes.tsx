import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Layouts
import OfficerLayout from '../layouts/OfficerLayout';

// Direct imports instead of lazy loading
import OfficerDashboard from '../pages/officer/Dashboard/OfficerDashboard';
import OfficerProfile from '../pages/officer/Profile/OfficerProfilePage';

// Import với đường dẫn đúng hoặc tạm thời import component placeholder
// Đối với các component không tồn tại, tạo component tạm thời
const ProcessRequest = () => <div>Process Request Page</div>;
const RequestsQueue = () => <div>Requests Queue Page</div>;
const CitizenManagement = () => <div>Citizen Management Page</div>;
const Statistics = () => <div>Statistics Page</div>;

// Auth guard HOC
import { withAuthGuard } from '../utils/withAuthGuard';

// Interface for route objects
export interface OfficerRouteObject extends Omit<RouteObject, 'children'> {
  requiresAuth?: boolean;
  role?: string;
  children?: OfficerRouteObject[];
}

// Loading fallback component
const LoadingFallback = (): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ProtectedOfficer = withAuthGuard(OfficerLayout, { requiredRole: 'officer' });

// Routes configuration for officer pages
const officerRoutes: OfficerRouteObject[] = [
  {
    path: '/officer',
    element: <ProtectedOfficer />,
    requiresAuth: true,
    role: 'officer',
    children: [
      { path: '', element: <OfficerDashboard /> },
      { path: 'dashboard', element: <OfficerDashboard /> },
      { path: 'profile', element: <OfficerProfile /> },
      { path: 'process-request', element: <ProcessRequest /> },
      { path: 'requests', element: <RequestsQueue /> },
      { path: 'citizens', element: <CitizenManagement /> },
      { path: 'statistics', element: <Statistics /> },
    ],
  },
  // Direct access route for testing without authentication
  {
    path: '/test/officer/dashboard',
    element: <OfficerDashboard />
  }
];

// Add console log for the routes
console.log('Officer Routes:', officerRoutes);

export default officerRoutes; 