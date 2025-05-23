import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteObject } from 'react-router-dom';

// Layouts
import ChairmanLayout from '../layouts/ChairmanLayout'; // Reusing the chairman layout for admin

// Pages - Officer Approval
import PendingOfficerApprovalPage from '../pages/admin/chairman/OfficerApproval/PendingOfficerApprovalPage';
import OfficerApprovalDetailPage from '../pages/admin/chairman/OfficerApproval/OfficerApprovalDetailPage';
import ApprovedOfficersPage from '../pages/admin/chairman/OfficerApproval/ApprovedOfficersPage';

// Import RegisterChairmanPage if available
import RegisterChairmanPage from '../pages/admin/chairman/RegisterChairmanPage';
// Import dashboard page
import ChairmanDashboardPage from '../pages/admin/chairman/Dashboard/ChairmanDashboard';

// Auth guard HOC
import { withAuthGuard } from '../utils/withAuthGuard';

// Interface for route objects
export interface AdminRouteObject extends RouteObject {
  children?: AdminRouteObject[];
}

// Redirect all /admin/* routes to /chairman/*
const adminRoutes: AdminRouteObject[] = [
  {
    path: '/admin/*',
    element: <Navigate to="/chairman/dashboard" replace />
  }
];

export default adminRoutes; 