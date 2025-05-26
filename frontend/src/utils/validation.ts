/**
 * Các hàm tiện ích để xác thực form và dữ liệu
 */

/**
 * Kiểm tra email có đúng định dạng không
 * @param email Email cần kiểm tra
 * @returns true nếu email hợp lệ, false nếu không
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Kiểm tra số điện thoại có đúng định dạng không (VN)
 * @param phone Số điện thoại cần kiểm tra
 * @returns true nếu số điện thoại hợp lệ, false nếu không
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  return phoneRegex.test(phone);
};

/**
 * Kiểm tra mật khẩu có đủ mạnh không
 * @param password Mật khẩu cần kiểm tra
 * @returns Object chứa kết quả kiểm tra và lý do
 */
export const isStrongPassword = (password: string): { isValid: boolean; reason?: string } => {
  if (password.length < 8) {
    return { isValid: false, reason: 'Mật khẩu phải có ít nhất 8 ký tự' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, reason: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, reason: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, reason: 'Mật khẩu phải có ít nhất 1 chữ số' };
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, reason: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
  }
  
  return { isValid: true };
};

/**
 * Kiểm tra CMND/CCCD có đúng định dạng không
 * @param idNumber Số CMND/CCCD cần kiểm tra
 * @returns true nếu số CMND/CCCD hợp lệ, false nếu không
 */
export const isValidIdNumber = (idNumber: string): boolean => {
  // CMND cũ (9 số) hoặc CCCD mới (12 số)
  const idRegex = /^(\d{9}|\d{12})$/;
  return idRegex.test(idNumber);
};

/**
 * Kiểm tra mã xã có đúng định dạng không
 * @param communeCode Mã xã cần kiểm tra
 * @returns true nếu mã xã hợp lệ, false nếu không
 */
export const isValidCommuneCode = (communeCode: string): boolean => {
  // Mã xã theo chuẩn Việt Nam (8 số)
  const communeRegex = /^\d{8}$/;
  return communeRegex.test(communeCode);
};

/**
 * Kiểm tra form có hợp lệ không
 * @param formData Dữ liệu form cần kiểm tra
 * @param validationRules Quy tắc kiểm tra cho từng trường
 * @returns Object chứa kết quả kiểm tra cho từng trường
 */
export const validateForm = (
  formData: Record<string, any>,
  validationRules: Record<string, (value: any) => { isValid: boolean; reason?: string }>
): Record<string, string | null> => {
  const errors: Record<string, string | null> = {};
  
  for (const field in validationRules) {
    if (Object.prototype.hasOwnProperty.call(validationRules, field)) {
      const value = formData[field];
      const validation = validationRules[field](value);
      
      errors[field] = validation.isValid ? null : (validation.reason || 'Giá trị không hợp lệ');
    }
  }
  
  return errors;
};

/**
 * Kiểm tra form có lỗi không
 * @param errors Object chứa lỗi từ validateForm
 * @returns true nếu form không có lỗi, false nếu có lỗi
 */
export const isFormValid = (errors: Record<string, string | null>): boolean => {
  return Object.values(errors).every(error => error === null);
};

export default {
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isValidIdNumber,
  isValidCommuneCode,
  validateForm,
  isFormValid
}; 