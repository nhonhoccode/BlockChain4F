# Docker Development Guide

Hướng dẫn chi tiết để chạy hệ thống Blockchain Administrative Management bằng Docker.

## 📋 Yêu cầu hệ thống

- **Docker Desktop**: Version 4.0 hoặc mới hơn
- **Docker Compose**: Version 2.0 hoặc mới hơn  
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB)
- **Ổ cứng**: Tối thiểu 5GB dung lượng trống

### Kiểm tra Docker

```bash
# Kiểm tra Docker version
docker --version
docker-compose --version

# Kiểm tra Docker đang chạy
docker info
```

## 🚀 Khởi chạy nhanh

### Trên Windows (PowerShell)

```powershell
# Di chuyển vào thư mục dự án
cd blockchain-administrative-management

# Khởi chạy development environment
.\start-dev.ps1

# Hoặc sử dụng các lệnh khác:
.\start-dev.ps1 stop      # Dừng services
.\start-dev.ps1 logs      # Xem logs
.\start-dev.ps1 status    # Kiểm tra trạng thái
```

### Trên Linux/macOS (Bash)

```bash
# Di chuyển vào thư mục dự án
cd blockchain-administrative-management

# Cấp quyền thực thi cho script
chmod +x start-dev.sh

# Khởi chạy development environment
./start-dev.sh

# Hoặc sử dụng các lệnh khác:
./start-dev.sh stop       # Dừng services  
./start-dev.sh logs       # Xem logs
./start-dev.sh status     # Kiểm tra trạng thái
```

### Sử dụng Docker Compose trực tiếp

```bash
# Khởi chạy tất cả services
docker-compose -f docker-compose.dev.yml up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f

# Dừng services
docker-compose -f docker-compose.dev.yml down
```

## 📊 Services và Ports

Sau khi khởi chạy thành công, các services sẽ chạy trên:

| Service    | URL                    | Mô tả                    |
|------------|------------------------|--------------------------|
| Frontend   | http://localhost:3000  | React Application        |
| Backend    | http://localhost:8000  | Django REST API          |
| Database   | localhost:5432         | PostgreSQL Database      |
| Redis      | localhost:6379         | Redis Cache              |

## 🔧 Cấu hình Environment

### Development Environment

File `docker-compose.dev.yml` sử dụng các biến môi trường sau:

```yaml
# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=blockchain_admin
DB_USER=postgres
DB_PASSWORD=admin123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# Django
DEBUG=true
SECRET_KEY=dev_secret_key_12345
ALLOWED_HOSTS=localhost,127.0.0.1,backend,frontend,0.0.0.0
```

### Tùy chỉnh cấu hình

Tạo file `.env.local` để override các biến môi trường:

```bash
# .env.local
DB_PASSWORD=your_custom_password
REDIS_PASSWORD=your_redis_password
SECRET_KEY=your_custom_secret_key
```

## 🛠️ Các lệnh hữu ích

### Kiểm tra trạng thái containers

```bash
# Xem tất cả containers
docker-compose -f docker-compose.dev.yml ps

# Xem logs của service cụ thể
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend
docker-compose -f docker-compose.dev.yml logs db
```

### Truy cập vào containers

```bash
# Truy cập backend container
docker-compose -f docker-compose.dev.yml exec backend bash

# Truy cập database
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d blockchain_admin

# Chạy Django commands
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### Rebuild containers

```bash
# Rebuild tất cả
docker-compose -f docker-compose.dev.yml build --no-cache

# Rebuild service cụ thể
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml build frontend
```

## 🗄️ Quản lý Database

### Tạo migration mới

```bash
docker-compose -f docker-compose.dev.yml exec backend python manage.py makemigrations
docker-compose -f docker-compose.dev.yml exec backend python manage.py migrate
```

### Tạo superuser

```bash
docker-compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### Backup và restore database

```bash
# Backup
docker-compose -f docker-compose.dev.yml exec db pg_dump -U postgres blockchain_admin > backup.sql

# Restore
docker-compose -f docker-compose.dev.yml exec -T db psql -U postgres blockchain_admin < backup.sql
```

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. Port đã được sử dụng

```bash
Error: bind: address already in use
```

**Giải pháp:**
```bash
# Tìm process đang sử dụng port
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill process
sudo kill -9 <PID>
```

#### 2. Database connection failed

```bash
django.db.utils.OperationalError: could not connect to server
```

**Giải pháp:**
```bash
# Kiểm tra database container
docker-compose -f docker-compose.dev.yml logs db

# Restart database
docker-compose -f docker-compose.dev.yml restart db
```

#### 3. Frontend build failed

```bash
npm ERR! Build failed
```

**Giải pháp:**
```bash
# Clear node_modules và rebuild
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build frontend --no-cache
docker-compose -f docker-compose.dev.yml up frontend
```

#### 4. Permission denied

```bash
Permission denied
```

**Giải pháp:**
```bash
# Linux/macOS
sudo chown -R $USER:$USER .
chmod +x start-dev.sh

# Windows (chạy PowerShell as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Clean up hoàn toàn

```bash
# Dừng tất cả containers
docker-compose -f docker-compose.dev.yml down -v

# Xóa tất cả images, containers, volumes
docker system prune -a --volumes

# Xóa chỉ volumes của project
docker volume ls | grep blockchain | awk '{print $2}' | xargs docker volume rm
```

## 📝 Development Workflow

### 1. Khởi động môi trường development

```bash
.\start-dev.ps1          # Windows
./start-dev.sh           # Linux/macOS
```

### 2. Phát triển code

- **Backend code**: Tự động reload khi có thay đổi
- **Frontend code**: Hot reload với React development server
- **Database**: Persistent data trong Docker volumes

### 3. Testing

```bash
# Run backend tests
docker-compose -f docker-compose.dev.yml exec backend python manage.py test

# Run frontend tests  
docker-compose -f docker-compose.dev.yml exec frontend npm test
```

### 4. Debugging

```bash
# Xem logs real-time
docker-compose -f docker-compose.dev.yml logs -f

# Debug specific service
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 🚢 Production Deployment

Để deploy production, sử dụng file `docker-compose.yml`:

```bash
# Production build
docker-compose up -d --build

# Với các biến môi trường production
docker-compose --env-file .env.production up -d
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs: `docker-compose -f docker-compose.dev.yml logs`
2. Restart services: `docker-compose -f docker-compose.dev.yml restart`
3. Clean rebuild: `docker-compose -f docker-compose.dev.yml build --no-cache`
4. Tạo issue trên GitHub repository 