/**
 * Utility functions for debugging authentication issues
 */

interface AuthState {
  hasToken: boolean;
  hasAuthUser: boolean;
  tokenValue: string | null;
  authUser: Record<string, any> | null;
  parseError: string | null;
  timestamp: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

interface FixResult {
  fixed: boolean;
  actions: string[];
  errors: string[];
}

/**
 * Checks the current authentication state and returns detailed information
 * @returns {AuthState} Authentication state details
 */
export const checkAuthState = (): AuthState => {
  const token = localStorage.getItem('token');
  const authUserStr = localStorage.getItem('authUser');
  
  let authUser: Record<string, any> | null = null;
  let parseError: string | null = null;
  
  try {
    if (authUserStr) {
      authUser = JSON.parse(authUserStr);
    }
  } catch (error) {
    if (error instanceof Error) {
      parseError = error.message;
    } else {
      parseError = 'Unknown parse error';
    }
  }
  
  return {
    hasToken: !!token,
    hasAuthUser: !!authUserStr,
    tokenValue: token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : null,
    authUser,
    parseError,
    timestamp: new Date().toISOString()
  };
};

/**
 * Sets up a valid citizen user in localStorage for testing
 * @returns {AuthUser} The created user object
 */
export const setupTestCitizenUser = (): AuthUser => {
  const testUser: AuthUser = {
    id: 'test-citizen-id',
    name: 'Test Citizen',
    email: 'test.citizen@example.com',
    role: 'citizen',
    token: 'test-token-' + Math.random().toString(36).substring(2, 15)
  };
  
  localStorage.setItem('authUser', JSON.stringify(testUser));
  localStorage.setItem('token', testUser.token);
  
  return testUser;
};

/**
 * Fixes common authentication issues
 * @returns {FixResult} Result of the fix attempt
 */
export const fixAuthIssues = (): FixResult => {
  const result: FixResult = {
    fixed: false,
    actions: [],
    errors: []
  };
  
  try {
    // Check if token exists but user doesn't
    const token = localStorage.getItem('token');
    const authUserStr = localStorage.getItem('authUser');
    
    if (token && !authUserStr) {
      // Create a basic user object
      const basicUser: AuthUser = {
        id: 'recovered-user',
        name: 'Recovered User',
        email: 'user@example.com',
        role: 'citizen',
        token: token
      };
      
      localStorage.setItem('authUser', JSON.stringify(basicUser));
      result.actions.push('Created basic user object with existing token');
      result.fixed = true;
    }
    
    // Check if user exists but has no role
    if (authUserStr) {
      try {
        const authUser = JSON.parse(authUserStr) as Partial<AuthUser>;
        if (!authUser.role) {
          authUser.role = 'citizen';
          localStorage.setItem('authUser', JSON.stringify(authUser));
          result.actions.push('Added missing role to user object');
          result.fixed = true;
        }
      } catch (error) {
        // Invalid JSON in authUser
        localStorage.removeItem('authUser');
        result.actions.push('Removed invalid authUser data');
        if (error instanceof Error) {
          result.errors.push('Could not parse authUser: ' + error.message);
        } else {
          result.errors.push('Could not parse authUser: Unknown error');
        }
      }
    }
    
    // Check if both token and user are missing
    if (!token && !authUserStr) {
      result.actions.push('No authentication data found');
      result.errors.push('User needs to log in');
    }
  } catch (error) {
    if (error instanceof Error) {
      result.errors.push('Error fixing auth issues: ' + error.message);
    } else {
      result.errors.push('Error fixing auth issues: Unknown error');
    }
  }
  
  return result;
};

export default {
  checkAuthState,
  setupTestCitizenUser,
  fixAuthIssues
}; 