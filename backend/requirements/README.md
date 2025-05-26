# Hướng dẫn cài đặt dự án

## Yêu cầu hệ thống
- Python 3.10 - 3.13
- PostgreSQL 13+ (hoặc SQLite cho môi trường phát triển)
- NodeJS 18+ (cho phần frontend)

## Cài đặt nhanh

### Bước 1: Tạo và kích hoạt môi trường ảo
```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### Bước 2: Nâng cấp pip
```bash
pip install --upgrade pip setuptools wheel
```

### Bước 3: Cài đặt các gói phụ thuộc
```bash
# Cài đặt các gói cơ bản
pip install -r requirements/base.txt

# Nếu bạn đang phát triển (development)
pip install -r requirements/dev.txt

# Nếu bạn đang triển khai (production)
pip install -r requirements/prod.txt
```

## Nếu gặp lỗi khi cài đặt

### 1. Lỗi `KeyError: '__version__'` trên Python 3.13

Nếu bạn gặp lỗi này, có thể thử các cách sau:

```bash
# Cách 1: Xóa cache pip và thử lại
pip cache purge
pip install -r requirements/base.txt

# Cách 2: Cài đặt với flag --no-build-isolation
pip install --no-build-isolation -r requirements/base.txt

# Cách 3: Nâng cấp setuptools trước
pip install --upgrade setuptools>=69.0.0
pip install -r requirements/base.txt
```

### 2. Lỗi với Pillow

Nếu gặp lỗi với Pillow, hãy thử:
```bash
pip install --upgrade Pillow
```

### 3. Lỗi với web3 hoặc blockchain packages

```bash
pip install --upgrade web3 py-solc-x
```

## Chạy ứng dụng

### Cấu hình cơ sở dữ liệu
```bash
# Tạo các bảng trong cơ sở dữ liệu
python manage.py migrate

# Tạo siêu người dùng
python manage.py createsuperuser
```

### Chạy ứng dụng
```bash
# Chạy server phát triển
python manage.py runserver
```

## Chú ý về Blockchain

Dự án này có tích hợp blockchain, nhưng đã được thiết kế để chạy được mà không cần blockchain trong môi trường phát triển. Để sử dụng đầy đủ tính năng blockchain:

1. Cài đặt Ganache hoặc thiết lập một mạng blockchain thử nghiệm
2. Cấu hình các biến môi trường blockchain trong file `.env`
3. Bỏ comment các phần blockchain trong code nếu cần thiết

## Ghi chú kỹ thuật

- Đã loại bỏ `django-rest-auth` vì đã deprecated, chỉ sử dụng `dj-rest-auth`
- Sử dụng phiên bản Pillow và web3 tương thích với Python 3.13
- Các phần blockchain đã được comment để tránh lỗi khi cài đặt 