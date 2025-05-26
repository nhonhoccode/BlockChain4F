/**
 * Mock data for citizen feedback
 * Used for development and testing when API is not available
 */

export const mockCitizenFeedback = [
  {
    id: "FB-20240520-001",
    title: "Phản hồi về quy trình đăng ký kết hôn",
    content: "Quy trình đăng ký kết hôn quá phức tạp và mất nhiều thời gian. Cần cải thiện để đơn giản hóa thủ tục.",
    created_at: "2024-05-20T10:30:00Z",
    status: "pending",
    response: null
  },
  {
    id: "FB-20240510-002",
    title: "Đề xuất cải thiện giao diện ứng dụng",
    content: "Giao diện người dùng hiện tại khó hiểu đối với người cao tuổi. Đề xuất thêm hướng dẫn chi tiết và phông chữ lớn hơn.",
    created_at: "2024-05-10T14:45:00Z",
    status: "responded",
    response: "Cảm ơn phản hồi của bạn. Chúng tôi đang xem xét cải thiện giao diện để phù hợp với mọi đối tượng người dùng."
  },
  {
    id: "FB-20240428-003",
    title: "Cảm ơn về dịch vụ nhanh chóng",
    content: "Tôi rất hài lòng với tốc độ xử lý yêu cầu cấp giấy khai sinh. Chỉ mất 3 ngày để hoàn thành.",
    created_at: "2024-04-28T09:15:00Z",
    status: "responded",
    response: "Cảm ơn phản hồi tích cực của bạn. Chúng tôi luôn cố gắng cải thiện dịch vụ."
  },
  {
    id: "FB-20240405-004",
    title: "Vấn đề với xác thực trực tuyến",
    content: "Tôi không thể xác thực tài khoản qua email. Hệ thống báo lỗi liên tục.",
    created_at: "2024-04-05T16:20:00Z",
    status: "resolved",
    response: "Chúng tôi đã khắc phục sự cố với hệ thống xác thực email. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vẫn gặp vấn đề."
  },
  {
    id: "FB-20240315-005",
    title: "Đề xuất thêm phương thức thanh toán",
    content: "Hiện tại chỉ có thể thanh toán bằng chuyển khoản ngân hàng. Đề xuất thêm các phương thức như ví điện tử MoMo, ZaloPay.",
    created_at: "2024-03-15T11:30:00Z",
    status: "pending",
    response: null
  },
  {
    id: "FB-20240220-006",
    title: "Góp ý về thời gian làm việc",
    content: "Đề xuất mở rộng thời gian làm việc vào cuối tuần để người dân đi làm có thể đến làm thủ tục.",
    created_at: "2024-02-20T08:45:00Z",
    status: "responded",
    response: "Cảm ơn góp ý của bạn. Chúng tôi đang xem xét mở cửa vào sáng thứ bảy trong thời gian tới."
  }
];

export default mockCitizenFeedback; 