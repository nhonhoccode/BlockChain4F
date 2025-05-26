/**
 * Authentication Utilities
 * Helper functions for managing authentication tokens and user state
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The token to store
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
};

/**
 * Get the authenticated user from localStorage
 * @returns {Object|null} The user object or null if not found
 */
export const getUser = () => {
  const userStr = localStorage.getItem('authUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Set the authenticated user in localStorage
 * @param {Object} user - The user object to store
 */
export const setUser = (user) => {
  localStorage.setItem('authUser', JSON.stringify(user));
};

/**
 * Remove the authenticated user from localStorage
 */
export const removeUser = () => {
  localStorage.removeItem('authUser');
};

/**
 * Check if user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean} Whether the user has the specified role
 */
export const hasRole = (role) => {
  const user = getUser();
  if (!user) return false;
  
  // Check in user.role field
  if (user.role === role) return true;
  
  // Check in user.roles array if it exists
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }
  
  return false;
};

/**
 * Get user's primary role
 * @returns {string|null} The user's primary role or null if not found
 */
export const getUserRole = () => {
  const user = getUser();
  if (!user) return null;
  
  console.log('Getting user role from:', user);
  
  // Kiểm tra trong nhiều vị trí có thể chứa thông tin vai trò
  // 1. Kiểm tra trường role trực tiếp
  if (user.role) {
    console.log('Found role in user.role:', user.role);
    return user.role;
  }
  
  // 2. Kiểm tra trong mảng roles
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    console.log('Found role in user.roles[0]:', user.roles[0]);
    return user.roles[0];
  }
  
  // 3. Kiểm tra trường actualRole (được thêm trong quá trình xử lý role mismatch)
  if (user.actualRole) {
    console.log('Found actualRole:', user.actualRole);
    return user.actualRole;
  }
  
  // 4. Kiểm tra trong user.user nếu có (đôi khi response được lồng ghép)
  if (user.user && user.user.role) {
    console.log('Found role in user.user.role:', user.user.role);
    return user.user.role;
  }
  
  // 5. Trường hợp đặc biệt cho một số email
  if (user.email === 'votrongnhoncutee2924@gmail.com') {
    console.log('Special case for email:', user.email);
    return 'officer';
  }
  
  // Mặc định là citizen nếu không xác định được
  console.log('No role found, defaulting to citizen');
  return 'citizen';
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};

// Export all auth utilities
export default {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  hasRole,
  getUserRole,
  clearAuth
}; 