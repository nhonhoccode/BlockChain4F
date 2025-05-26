import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Layouts
import ChairmanLayout from '../layouts/ChairmanLayout';

// Direct imports instead of lazy loading
import ChairmanDashboardPage from '../pages/admin/chairman/Dashboard/ChairmanDashboardPage';

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

// Protected layout with auth guard
const ProtectedChairmanLayout = withAuthGuard(ChairmanLayout, { requiredRole: 'chairman' });

// Routes configuration for chairman pages
const chairmanRoutes: ChairmanRouteObject[] = [
  {
    path: 'admin/chairman',
    element: <ProtectedChairmanLayout />,
    requiresAuth: true,
    role: 'chairman',
    children: [
      { path: '', element: <Navigate to="admin/chairman/dashboard" replace /> },
      { path: 'dashboard', element: <ChairmanDashboardPage /> },
      { path: '*', element: <div>Trang đang phát triển</div> }
    ],
  },
];

export default chairmanRoutes; 