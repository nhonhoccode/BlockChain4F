/**
 * Mock data for citizen requests
 * Used for development and testing when API is not available
 */

export const mockCitizenRequests = [
  {
    id: "KS-20240512-001",
    title: "Đăng ký giấy khai sinh cho con",
    type: "birth_certificate",
    status: "pending",
    requestDate: "2024-05-12T08:30:00Z",
    updatedAt: "2024-05-12T08:30:00Z",
    description: "Đăng ký giấy khai sinh cho con trai sinh ngày 02/05/2024"
  },
  {
    id: "KH-20240428-002",
    title: "Đăng ký kết hôn",
    type: "marriage_certificate",
    status: "processing",
    requestDate: "2024-04-28T10:15:00Z",
    updatedAt: "2024-05-02T14:22:00Z",
    description: "Đăng ký kết hôn với Nguyễn Thị Bình"
  },
  {
    id: "TT-20240410-003",
    title: "Xác nhận thường trú",
    type: "residence_certificate",
    status: "approved",
    requestDate: "2024-04-10T09:45:00Z",
    updatedAt: "2024-04-20T11:30:00Z",
    description: "Xin xác nhận thường trú tại địa chỉ mới"
  },
  {
    id: "CT-20240315-004",
    title: "Đăng ký khai tử",
    type: "death_certificate",
    status: "completed",
    requestDate: "2024-03-15T14:20:00Z",
    updatedAt: "2024-03-22T10:45:00Z",
    description: "Đăng ký khai tử cho ông Nguyễn Văn An (mất ngày 12/03/2024)"
  },
  {
    id: "CMND-20240228-005",
    title: "Cấp lại CMND/CCCD",
    type: "id_card",
    status: "rejected",
    requestDate: "2024-02-28T08:15:00Z",
    updatedAt: "2024-03-05T09:30:00Z",
    description: "Xin cấp lại CMND do bị mất"
  },
  {
    id: "YC-20240120-006",
    title: "Xác nhận tình trạng hôn nhân",
    type: "marital_status",
    status: "cancelled",
    requestDate: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-25T16:20:00Z",
    description: "Xin xác nhận tình trạng hôn nhân để làm thủ tục xuất khẩu lao động"
  }
];

export default mockCitizenRequests; 