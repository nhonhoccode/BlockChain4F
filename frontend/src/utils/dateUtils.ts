/**
 * Các hàm tiện ích xử lý ngày tháng
 */

/**
 * Format ngày thành chuỗi theo định dạng dd/mm/yyyy
 * @param date Đối tượng Date hoặc chuỗi ISO
 * @returns Chuỗi ngày theo định dạng dd/mm/yyyy
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format ngày và giờ thành chuỗi theo định dạng dd/mm/yyyy HH:MM
 * @param date Đối tượng Date hoặc chuỗi ISO
 * @returns Chuỗi ngày và giờ theo định dạng dd/mm/yyyy HH:MM
 */
export const formatDateTime = (date: Date | string): string => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Chuyển đổi chuỗi ngày từ định dạng dd/mm/yyyy sang Date object
 * @param dateStr Chuỗi ngày theo định dạng dd/mm/yyyy
 * @returns Đối tượng Date
 */
export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(date.getTime())) return null;
  
  return date;
};

/**
 * Chuyển đổi chuỗi ngày từ định dạng dd/mm/yyyy sang chuỗi ISO
 * @param dateStr Chuỗi ngày theo định dạng dd/mm/yyyy
 * @returns Chuỗi ngày theo định dạng ISO (yyyy-mm-dd)
 */
export const toISODate = (dateStr: string): string => {
  const date = parseDate(dateStr);
  if (!date) return '';
  
  return date.toISOString().split('T')[0];
};

/**
 * Tính số ngày giữa hai ngày
 * @param date1 Ngày thứ nhất
 * @param date2 Ngày thứ hai
 * @returns Số ngày giữa hai ngày
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
  
  // Tính số mili giây trong một ngày
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Loại bỏ thời gian, chỉ giữ ngày
  const utcD1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utcD2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  // Tính số ngày
  return Math.floor(Math.abs((utcD2 - utcD1) / oneDay));
};

/**
 * Kiểm tra xem một ngày có phải là ngày trong quá khứ không
 * @param date Ngày cần kiểm tra
 * @returns true nếu là ngày trong quá khứ, false nếu không
 */
export const isPastDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return false;
  
  const today = new Date();
  
  // Đặt giờ, phút, giây, mili giây về 0 để so sánh chỉ ngày
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(d);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
};

/**
 * Cộng thêm số ngày vào một ngày
 * @param date Ngày ban đầu
 * @param days Số ngày cần cộng thêm
 * @returns Ngày mới sau khi cộng thêm
 */
export const addDays = (date: Date | string, days: number): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Lấy ngày đầu tiên của tháng
 * @param date Ngày bất kỳ trong tháng
 * @returns Ngày đầu tiên của tháng
 */
export const getFirstDayOfMonth = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Lấy ngày cuối cùng của tháng
 * @param date Ngày bất kỳ trong tháng
 * @returns Ngày cuối cùng của tháng
 */
export const getLastDayOfMonth = (date: Date | string): Date => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

/**
 * Lấy tuổi dựa trên ngày sinh
 * @param birthDate Ngày sinh
 * @returns Tuổi
 */
export const getAge = (birthDate: Date | string): number => {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  
  // Kiểm tra ngày hợp lệ
  if (isNaN(d.getTime())) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
    age--;
  }
  
  return age;
};

export default {
  formatDate,
  formatDateTime,
  parseDate,
  toISODate,
  daysBetween,
  isPastDate,
  addDays,
  getFirstDayOfMonth,
  getLastDayOfMonth,
  getAge
}; 