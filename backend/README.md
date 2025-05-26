# Blockchain Administrative Management - Backend

Backend cho hệ thống quản lý hành chính sử dụng blockchain.

## Cài đặt nhanh

### Yêu cầu
- Python 3.10 - 3.13
- PostgreSQL 13+ (hoặc SQLite cho môi trường phát triển)

### Bước 1: Clone và setup môi trường
```bash
# Clone dự án (nếu chưa có)
git clone <repository-url>
cd blockchain-administrative-management/backend

# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### Bước 2: Cài đặt dependencies
```bash
# Nâng cấp pip
pip install --upgrade pip setuptools wheel

# Cài đặt các gói cần thiết
pip install -r requirements/base.txt

# Cho môi trường phát triển (tùy chọn)
pip install -r requirements/dev.txt
```

### Bước 3: Cấu hình và chạy
```bash
# Tạo file cấu hình (tùy chọn)
# Tạo file .env và thêm cấu hình nếu cần

# Chạy migration
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Chạy server
python manage.py runserver
```

Truy cập ứng dụng tại: http://127.0.0.1:8000/

## Xử lý lỗi cài đặt

Nếu gặp lỗi `KeyError: '__version__'` hoặc lỗi khác khi cài đặt trên Python 3.13:

```bash
# Xóa cache pip và thử lại
pip cache purge
pip install -r requirements/base.txt

# HOẶC cài đặt với flag đặc biệt
pip install --no-build-isolation -r requirements/base.txt

# HOẶC nâng cấp setuptools trước
pip install --upgrade setuptools>=69.0.0
pip install -r requirements/base.txt
```

Chi tiết hơn về xử lý lỗi, xem file `requirements/README.md`.

## Cấu trúc dự án

```
backend/
├── api/                # API endpoints
├── apps/               # Django apps
│   ├── accounts/       # User management
│   ├── administrative/ # Administrative features
│   ├── blockchain/     # Blockchain integration
│   ├── feedback/       # User feedback
│   └── notifications/  # Notifications
├── core/               # Core settings
├── requirements/       # Dependencies
└── utils/              # Utilities
```

## Kiểm thử

```bash
# Chạy tests
python manage.py test

# Với pytest
pytest
```

## Ghi chú

- Dự án đã được tối ưu để chạy mượt mà trên Python 3.13
- Các tính năng blockchain đã được thiết kế để không bắt buộc trong môi trường phát triển
- Chi tiết về blockchain integration xem trong `requirements/README.md` 