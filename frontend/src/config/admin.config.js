/**
 * Cấu hình tài khoản mặc định cho admin (chủ tịch xã)
 * LƯU Ý: Đây chỉ là tài khoản mặc định cho môi trường phát triển
 * Trong môi trường thực tế, nên sử dụng tài khoản được tạo qua quy trình chính thức
 */

export const ADMIN_DEFAULT_CREDENTIALS = {
  // Thông tin đăng nhập
  email: 'admin@blockchain-system.gov.vn',
  password: 'Admin@123456',
  
  // Thông tin cá nhân
  first_name: 'Nhon',
  last_name: 'Vo',
  phone_number: '0987654321',
  
  // Chức vụ
  position: 'Chủ tịch xã',
  department: 'UBND xã',
  
  // Địa chỉ
  province: 'Hà Nội',
  district: 'Thanh Xuân',
  ward: 'Thanh Xuân Bắc',
  address: 'Số 15, Đường Nguyễn Trãi'
};

/**
 * Quyền hạn của tài khoản admin (chủ tịch xã)
 */
export const ADMIN_PERMISSIONS = [
  'admin:all',                  // Toàn quyền quản trị
  'officer:approve',            // Phê duyệt cán bộ
  'officer:assign',             // Phân công nhiệm vụ cho cán bộ
  'document:approve_important', // Phê duyệt giấy tờ quan trọng
  'stats:view_all',             // Xem tất cả báo cáo thống kê
  'system:settings'             // Thay đổi cài đặt hệ thống
];

export default {
  ADMIN_DEFAULT_CREDENTIALS,
  ADMIN_PERMISSIONS
}; 