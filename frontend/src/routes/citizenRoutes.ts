import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Layouts
import CitizenLayout from '../layouts/CitizenLayout';

// Direct imports instead of lazy loading
import CitizenDashboard from '../pages/citizen/Dashboard/CitizenDashboard';
import CitizenProfile from '../pages/citizen/Profile/CitizenProfile';
import DocumentsList from '../pages/citizen/Documents/DocumentsList';
import DocumentDetail from '../pages/citizen/Documents/DocumentDetailPage';
import RequestsList from '../pages/citizen/Requests/RequestsList';
import RequestDetail from '../pages/citizen/Requests/RequestDetail';
import NewRequest from '../pages/citizen/Requests/NewRequest';
import FeedbackPage from '../pages/citizen/Feedback/FeedbackPage';
import SupportPage from '../pages/citizen/Support';

// Auth guard HOC
import { withAuthGuard } from '../utils/withAuthGuard';

// Interface for route objects
export interface CitizenRouteObject extends RouteObject {
  requiresAuth?: boolean;
  role?: string;
  children?: CitizenRouteObject[];
}

// Loading fallback component
const LoadingFallback = (): JSX.Element => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

const ProtectedCitizen = withAuthGuard(CitizenLayout, { requiredRole: 'citizen' });

// Routes configuration for citizen pages
const citizenRoutes: CitizenRouteObject[] = [
  {
    path: '/citizen',
    element: ProtectedCitizen,
    requiresAuth: true,
    role: 'citizen',
    children: [
      { path: '', element: <Navigate to="/citizen/dashboard" replace /> },
      { path: 'dashboard', element: <CitizenDashboard /> },
      { path: 'profile', element: <CitizenProfile /> },
      { path: 'documents', element: <DocumentsList /> },
      { path: 'documents/:id', element: <DocumentDetail /> },
      { path: 'requests', element: <Navigate to="/citizen/requests/list" replace /> },
      { path: 'requests/:id', element: <RequestDetail /> },
      { path: 'feedback', element: <FeedbackPage /> },
      { path: 'support', element: <SupportPage /> },
    ],
  },
  // Direct access route for testing without authentication
  {
    path: '/test/citizen/dashboard',
    element: <CitizenDashboard />
  }
];

export default citizenRoutes; 