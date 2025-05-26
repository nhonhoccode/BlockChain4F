/**
 * Các hàm tiện ích liên quan đến phân quyền
 */
import { UserRole } from './constants';

/**
 * Chuyển đổi vai trò người dùng từ chuỗi thành enum
 * @param role Vai trò dưới dạng chuỗi
 * @returns Vai trò dưới dạng enum
 */
export const parseUserRole = (role: string): UserRole => {
  switch (role.toLowerCase()) {
    case 'citizen':
      return UserRole.CITIZEN;
    case 'officer':
      return UserRole.OFFICER;
    case 'chairman':
      return UserRole.CHAIRMAN;
    default:
      return UserRole.CITIZEN; // Mặc định là công dân
  }
};

/**
 * Kiểm tra người dùng có vai trò chủ tịch xã không
 * @param user Đối tượng người dùng
 * @returns true nếu là chủ tịch xã, false nếu không
 */
export const isChairman = (user: any): boolean => {
  if (!user) return false;
  return user.role === UserRole.CHAIRMAN || user.role === 'chairman';
};

/**
 * Kiểm tra người dùng có vai trò cán bộ xã không
 * @param user Đối tượng người dùng
 * @returns true nếu là cán bộ xã, false nếu không
 */
export const isOfficer = (user: any): boolean => {
  if (!user) return false;
  return user.role === UserRole.OFFICER || user.role === 'officer';
};

/**
 * Kiểm tra người dùng có vai trò công dân không
 * @param user Đối tượng người dùng
 * @returns true nếu là công dân, false nếu không
 */
export const isCitizen = (user: any): boolean => {
  if (!user) return false;
  return user.role === UserRole.CITIZEN || user.role === 'citizen';
};

/**
 * Kiểm tra người dùng có quyền xem trang dành cho cán bộ xã không
 * @param user Đối tượng người dùng
 * @returns true nếu có quyền, false nếu không
 */
export const canAccessOfficerPages = (user: any): boolean => {
  if (!user) return false;
  return isOfficer(user) || isChairman(user);
};

/**
 * Kiểm tra người dùng có quyền xem trang dành cho chủ tịch xã không
 * @param user Đối tượng người dùng
 * @returns true nếu có quyền, false nếu không
 */
export const canAccessChairmanPages = (user: any): boolean => {
  if (!user) return false;
  return isChairman(user);
};

/**
 * Lấy vai trò của người dùng để hiển thị
 * @param role Vai trò người dùng
 * @returns Chuỗi hiển thị vai trò
 */
export const getRoleDisplayText = (role: string | UserRole): string => {
  switch (role) {
    case UserRole.CHAIRMAN:
    case 'chairman':
      return 'Chủ tịch xã';
    case UserRole.OFFICER:
    case 'officer':
      return 'Cán bộ xã';
    case UserRole.CITIZEN:
    case 'citizen':
      return 'Người dân';
    default:
      return 'Không xác định';
  }
};

/**
 * Lấy đường dẫn dashboard mặc định dựa vào vai trò người dùng
 * @param role Vai trò người dùng
 * @returns Đường dẫn mặc định
 */
export const getDefaultDashboardPath = (role: string | UserRole): string => {
  switch (role) {
    case UserRole.CHAIRMAN:
    case 'chairman':
      return '/chairman/dashboard';
    case UserRole.OFFICER:
    case 'officer':
      return '/officer/dashboard';
    case UserRole.CITIZEN:
    case 'citizen':
      return '/citizen/dashboard';
    default:
      return '/';
  }
};

/**
 * Lấy danh sách quyền dựa trên vai trò
 * @param role Vai trò người dùng
 * @returns Danh sách quyền
 */
export const getRolePermissions = (role: string | UserRole): string[] => {
  switch (role) {
    case UserRole.CHAIRMAN:
    case 'chairman':
      return [
        'view_officer_list',
        'manage_officers',
        'approve_officers',
        'view_reports',
        'approve_important_documents',
        'view_all_citizens',
        'view_all_documents',
        'view_all_requests'
      ];
    case UserRole.OFFICER:
    case 'officer':
      return [
        'process_requests',
        'create_documents',
        'view_citizens',
        'view_requests',
        'view_statistics'
      ];
    case UserRole.CITIZEN:
    case 'citizen':
      return [
        'create_requests',
        'view_own_documents',
        'view_own_requests',
        'submit_feedback'
      ];
    default:
      return [];
  }
};

/**
 * Kiểm tra người dùng có quyền cụ thể không
 * @param user Đối tượng người dùng
 * @param permission Quyền cần kiểm tra
 * @returns true nếu có quyền, false nếu không
 */
export const hasPermission = (user: any, permission: string): boolean => {
  if (!user || !user.role) return false;
  
  const permissions = getRolePermissions(user.role);
  return permissions.includes(permission);
};

export default {
  parseUserRole,
  isChairman,
  isOfficer,
  isCitizen,
  canAccessOfficerPages,
  canAccessChairmanPages,
  getRoleDisplayText,
  getDefaultDashboardPath,
  getRolePermissions,
  hasPermission
}; 