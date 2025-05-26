import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';

// Import chairman routes to include them directly
import chairmanRoutes from './chairmanRoutes';

// Interface for route objects
export interface AdminRouteObject extends RouteObject {
  children?: AdminRouteObject[];
}

// Admin routes configuration
// Include both the redirect and the chairman routes
const adminRoutes: AdminRouteObject[] = [
  // Redirect root admin to chairman dashboard
  {
    path: '/admin',
    element: <Navigate to="/admin/chairman/dashboard" replace />
  },
  // Include all chairman routes
  ...chairmanRoutes
];

export default adminRoutes; 