// Note: This file is currently not being used in the main routing
// The main routing is handled in AppRoutes.js

// Interface for custom route properties
export interface OfficerRouteObject {
  path?: string;
  element?: React.ReactElement;
  requiresAuth?: boolean;
  role?: string;
  children?: OfficerRouteObject[];
}

// Routes configuration for officer pages (currently unused)
const officerRoutes: OfficerRouteObject[] = [];

export default officerRoutes; 