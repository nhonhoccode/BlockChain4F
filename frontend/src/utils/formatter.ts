/**
 * Các hàm tiện ích để định dạng dữ liệu
 */

/**
 * Định dạng số tiền thành chuỗi có ký tự tiền tệ
 * @param amount Số tiền cần định dạng
 * @param currency Ký hiệu tiền tệ (mặc định: VND)
 * @returns Chuỗi đã định dạng (ví dụ: 1,000,000 VND)
 */
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
};

/**
 * Định dạng ngày tháng thành chuỗi theo định dạng Việt Nam
 * @param date Ngày cần định dạng (Date object hoặc chuỗi ISO)
 * @param includeTime Có hiển thị giờ không
 * @returns Chuỗi đã định dạng (ví dụ: 01/01/2023 hoặc 01/01/2023 14:30)
 */
export const formatDate = (date: Date | string, includeTime = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
};

/**
 * Định dạng tên người dùng thành dạng viết tắt
 * @param fullName Tên đầy đủ
 * @returns Tên viết tắt (ví dụ: Nguyễn Văn A -> NVA)
 */
export const formatNameInitials = (fullName: string): string => {
  if (!fullName) return '';
  
  return fullName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Định dạng số CMND/CCCD có dấu gạch ngang
 * @param idNumber Số CMND/CCCD
 * @returns Chuỗi đã định dạng (ví dụ: 123456789 -> 123-456-789)
 */
export const formatIdNumber = (idNumber: string): string => {
  if (!idNumber) return '';
  
  if (idNumber.length === 9) {
    // CMND cũ (9 số)
    return idNumber.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
  } else if (idNumber.length === 12) {
    // CCCD mới (12 số)
    return idNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1-$2-$3-$4');
  }
  
  return idNumber;
};

/**
 * Định dạng số điện thoại có dấu gạch ngang
 * @param phoneNumber Số điện thoại
 * @returns Chuỗi đã định dạng (ví dụ: 0912345678 -> 091-234-5678)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Loại bỏ +84 và thay bằng 0
  const normalizedPhone = phoneNumber.replace(/^\+84/, '0');
  
  if (normalizedPhone.length === 10) {
    // Số điện thoại 10 số
    return normalizedPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (normalizedPhone.length === 11) {
    // Số điện thoại 11 số
    return normalizedPhone.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phoneNumber;
};

/**
 * Cắt ngắn văn bản nếu quá dài
 * @param text Văn bản cần cắt ngắn
 * @param maxLength Độ dài tối đa
 * @returns Văn bản đã cắt ngắn với dấu ... ở cuối nếu cần
 */
export const truncateText = (text: string, maxLength = 100): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Định dạng kích thước file thành đơn vị đọc được
 * @param bytes Kích thước file tính bằng bytes
 * @returns Chuỗi đã định dạng (ví dụ: 1024 -> 1 KB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + units[i];
};

export default {
  formatCurrency,
  formatDate,
  formatNameInitials,
  formatIdNumber,
  formatPhoneNumber,
  truncateText,
  formatFileSize
}; 