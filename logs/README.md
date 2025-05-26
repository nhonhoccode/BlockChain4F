# Quản lý Logs

## Cấu trúc Thư mục
```
logs/
├── application/         # Logs ứng dụng
├── access/             # Logs truy cập web server
├── error/              # Logs lỗi
├── security/           # Logs audit bảo mật
├── blockchain/         # Logs giao dịch blockchain
├── performance/        # Logs giám sát hiệu suất
└── archived/           # Logs lịch sử đã lưu trữ
```

## Chính sách Xoay vòng Log
- Xoay vòng hàng ngày cho logs đang hoạt động
- Nén logs cũ hơn 7 ngày
- Lưu trữ logs cũ hơn 30 ngày
- Xóa archives cũ hơn 1 năm

## Mức độ Log
- DEBUG: Thông tin phát triển chi tiết
- INFO: Thông báo hoạt động chung
- WARNING: Điều kiện cảnh báo
- ERROR: Điều kiện lỗi
- CRITICAL: Điều kiện lỗi nghiêm trọng

## Tích hợp Giám sát
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Streaming logs thời gian thực
- Thông báo cảnh báo cho lỗi nghiêm trọng
- Trích xuất metrics hiệu suất 