# 🌐 Hướng dẫn cấu hình favicon cho ứng dụng Web

## ❓ Vấn đề  
Biểu tượng favicon (hiển thị trên tab trình duyệt) không xuất hiện hoặc hiển thị sai.

## ✅ Giải pháp  

### 🟢 Cách 1: Sử dụng `favicon.png` (Khuyên dùng)
1. Đặt file `favicon.png` vào thư mục `public`.
2. Trong file `index.html`, đảm bảo phần `<head>` chứa dòng sau:

   ```html
   <link rel="icon" type="image/png" href="%PUBLIC_URL%/favicon.png" />
