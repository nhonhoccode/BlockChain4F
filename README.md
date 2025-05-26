# Hệ Thống Quản Lý Hành Chính Dựa Trên Blockchain

## Mô Tả Đề Tài

Hệ thống quản lý hành chính dựa trên công nghệ Blockchain nhằm số hóa và minh bạch hóa các thủ tục hành chính công. Dự án tập trung vào việc xây dựng một nền tảng an toàn, bảo mật và có thể truy xuất nguồn gốc cho việc quản lý các giấy tờ và thủ tục hành chính của công dân.

### Mục Tiêu Chính

- **Số hóa thủ tục hành chính**: Chuyển đổi các quy trình giấy tờ truyền thống sang môi trường số
- **Tăng tính minh bạch**: Sử dụng blockchain để đảm bảo tính minh bạch trong quá trình xử lý
- **Bảo mật thông tin**: Áp dụng mã hóa và blockchain để bảo vệ dữ liệu công dân
- **Truy xuất nguồn gốc**: Theo dõi toàn bộ quá trình xử lý từ khi nộp đến khi hoàn thành
- **Giảm thời gian xử lý**: Tự động hóa các quy trình để rút ngắn thời gian chờ đợi

### Công Nghệ Sử Dụng

#### Frontend
- **React.js** - Thư viện JavaScript cho giao diện người dùng
- **Material-UI** - Framework UI components
- **Redux Toolkit** - Quản lý state ứng dụng
- **Axios** - HTTP client cho API calls
- **React Router** - Điều hướng trong ứng dụng

#### Backend
- **Django** - Framework web Python
- **Django REST Framework** - API development
- **PostgreSQL** - Cơ sở dữ liệu chính
- **Redis** - Cache và session storage
- **JWT** - Authentication và authorization

#### Blockchain
- **Hyperledger Fabric** - Blockchain framework chính
- **Ethereum/Quorum** - Blockchain phụ trợ
- **Smart Contracts** - Chaincode cho business logic
- **IPFS** - Lưu trữ file phân tán

#### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server và reverse proxy
- **Kubernetes** - Container orchestration (production)

## Thông Tin Nhóm

| STT | Họ và Tên | MSSV | Vai Trò | Email |
|-----|-----------|------|---------|-------|
| 1 | Võ Trọng Nhơn | 22658441 | Team Leader, Backend Developer, Blockchain Developer, Frontend Developer | trongnhon29032004@gmail.com |
| 2 | [Tên thành viên 2] | [MSSV] | Frontend Developer, UI/UX | [email] |
| 3 | [Tên thành viên 3] | [MSSV] | Blockchain Developer | [email] |


**Giảng viên hướng dẫn**: TS. Bùi Thanh Hùng

**Môn học**: Phát triển ứng dụng

**Năm học** 2024-2025

## Video Demo

🔗 **Link video demo**: [https://www.youtube.com/watch?v=ERHAgHecZsE]

Video demo bao gồm:
- Giới thiệu tổng quan hệ thống
- Demo các chức năng chính
- Workflow từ công dân đến cán bộ và chủ tịch xã
- Tính năng blockchain và xác thực giấy tờ

## ⚡ Quick Start

### 🚀 Khởi Động Nhanh (1 phút)

**Linux/macOS:**
```bash
git clone [repository-url]
cd blockchain-administrative-management
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Windows:**
```powershell
git clone [repository-url]
cd blockchain-administrative-management
.\scripts\deploy.ps1
```

**Windows (Local Development):**
```batch
git clone [repository-url]
cd blockchain-administrative-management
.\scripts\start.bat
```

Sau khi chạy script, truy cập:
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000/api
- 👨‍💼 **Admin Panel**: http://localhost:8000/admin

### 🔑 Tài Khoản Demo

Sau khi chạy script, bạn có thể tạo tài khoản demo:

```bash
# Tạo superuser
docker-compose exec backend python manage.py createsuperuser

# Hoặc tạo mock data
docker-compose exec backend python manage.py create_mock_documents --user-email=demo@example.com
```

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

### 📋 Yêu Cầu Hệ Thống

- **Node.js** >= 16.0.0
- **Python** >= 3.9
- **Docker** >= 20.10.0
- **Docker Compose** >= 2.0.0
- **Git**

### 🐳 Cách 1: Cài Đặt Bằng Docker (Khuyến Nghị)

#### 1. Clone Repository
```bash
git clone [repository-url]
cd blockchain-administrative-management
```

#### 2. Sử Dụng Script Tự Động (Khuyến Nghị)

**🚀 Triển Khai Tự Động - Linux/macOS:**
```bash
# Chạy script deploy tự động
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**🚀 Triển Khai Tự Động - Windows PowerShell:**
```powershell
# Chạy script deploy tự động
.\scripts\deploy.ps1
```

**🚀 Khởi Động Nhanh - Windows:**
```batch
# Chạy script start.bat để khởi động local development
.\scripts\start.bat
```

Script tự động sẽ:
- ✅ Tạo file `.env` từ template
- ✅ Build Docker images
- ✅ Khởi động tất cả services
- ✅ Chờ database sẵn sàng
- ✅ Chạy migrations
- ✅ Collect static files
- ✅ Hiển thị status và URLs

#### 3. Cấu Hình Thủ Công (Nếu Cần)

**Cấu Hình Environment Variables:**
```bash
# Copy file environment mẫu
cp .env.example .env

# Chỉnh sửa các biến môi trường cần thiết
nano .env
```

**Development Environment:**
```bash
# Khởi động tất cả services
docker-compose -f docker-compose.dev.yml up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f

# Dừng services
docker-compose -f docker-compose.dev.yml down
```

**Production Environment:**
```bash
# Khởi động production
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

#### 4. Truy Cập Ứng Dụng

| Service | URL | Mô Tả |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Giao diện người dùng |
| Backend API | http://localhost:8000 | Django REST API |
| Admin Panel | http://localhost:8000/admin | Django Admin |
| Database | localhost:5432 | PostgreSQL |
| Redis | localhost:6379 | Redis Cache |

### 💻 Cách 2: Cài Đặt Local Development

#### 1. Cài Đặt Backend (Django)

```bash
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements/local.txt

# Cấu hình database (SQLite cho development)
python manage.py migrate

# Tạo superuser
python manage.py createsuperuser

# Tạo mock data (optional)
python manage.py create_mock_documents --user-email=your-email@example.com

# Khởi động server
python manage.py runserver
```

#### 2. Cài Đặt Frontend (React)

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm start
```

#### 3. Cài Đặt Blockchain (Optional)

```bash
# Di chuyển vào thư mục blockchain
cd blockchain

# Khởi động Hyperledger Fabric network
./scripts/start-network.sh

# Deploy smart contracts
./scripts/deploy-contracts.sh
```

## 📖 Hướng Dẫn Sử Dụng

### 🏠 Trang Chủ Công Khai
- Xem thông tin giới thiệu hệ thống
- Tra cứu thủ tục hành chính
- Xác thực giấy tờ công khai
- Liên hệ và hỗ trợ

### 👤 Dành Cho Công Dân

1. **Đăng Ký/Đăng Nhập**
   - Tạo tài khoản mới hoặc đăng nhập
   - Xác thực email và thông tin cá nhân

2. **Quản Lý Hồ Sơ**
   - Cập nhật thông tin cá nhân
   - Quản lý thông tin liên hệ

3. **Nộp Đơn Yêu Cầu**
   - Chọn loại thủ tục cần thực hiện
   - Điền thông tin và upload tài liệu
   - Theo dõi tiến độ xử lý

4. **Quản Lý Giấy Tờ**
   - Xem danh sách giấy tờ đã cấp
   - Tải xuống bản điện tử
   - Xác thực tính hợp lệ

### 👨‍💼 Dành Cho Cán Bộ

1. **Dashboard Quản Lý**
   - Xem thống kê công việc
   - Theo dõi yêu cầu đang xử lý

2. **Xử Lý Yêu Cầu**
   - Tiếp nhận và phân loại đơn
   - Xem xét hồ sơ và tài liệu
   - Phê duyệt hoặc yêu cầu bổ sung

3. **Quản Lý Công Dân**
   - Xem thông tin công dân
   - Lịch sử giao dịch

### 🏛️ Dành Cho Chủ Tịch Xã

1. **Dashboard Tổng Quan**
   - Thống kê toàn bộ hoạt động
   - Báo cáo hiệu suất

2. **Quản Lý Cán Bộ**
   - Phê duyệt tài khoản cán bộ mới
   - Phân quyền và quản lý

3. **Phê Duyệt Cuối**
   - Xét duyệt các yêu cầu quan trọng
   - Ký số và xác thực

## 📱 Screenshots

### 🏠 Trang Chủ và Giới Thiệu

<div align="center">

**Trang Chủ**
![Trang Chủ 1](screenshot/trangchu_1.png)
![Trang Chủ 2](screenshot/trangchu_2.png)

**Thông Tin Giới Thiệu**
![Giới Thiệu](screenshot/thongtingioithieu.png)

**Công Nghệ Sử Dụng**
![Công Nghệ](screenshot/congnghesudung.png)

**Thông Tin Liên Hệ**
![Liên Hệ](screenshot/thongtinlienhe.png)

</div>

### 🔐 Đăng Nhập và Đăng Ký

<div align="center">

**Trang Đăng Nhập**
![Đăng Nhập](screenshot/trangdangnhap.png)

**Trang Đăng Ký**
![Đăng Ký](screenshot/trangdangky.png)

</div>

### 📋 Thủ Tục Hành Chính

<div align="center">

**Danh Sách Thủ Tục**
![Thủ Tục 1](screenshot/thutuchanhchinh_1.png)
![Thủ Tục 2](screenshot/thutuchanhchinh_2.png)

**Xác Thực Giấy Tờ**
![Xác Thực](screenshot/xacthucgiayto.png)

</div>

### 👤 Giao Diện Công Dân

<div align="center">

**Dashboard Công Dân**
![Công Dân 1](screenshot/trangcongdan_1.png)

**Quản Lý Yêu Cầu**
![Công Dân 2](screenshot/trangcongdan_2.png)

**Nộp Đơn Mới**
![Công Dân 3](screenshot/trangcongdan_3.png)

**Quản Lý Giấy Tờ**
![Công Dân 4](screenshot/trangcongdan_4.png)

**Hồ Sơ Cá Nhân**
![Công Dân 5](screenshot/trangcongdan_5.png)

**Phản Hồi và Hỗ Trợ**
![Công Dân 6](screenshot/trangcongdan_6.png)

</div>

### 👨‍💼 Giao Diện Cán Bộ

<div align="center">

**Dashboard Cán Bộ**
![Cán Bộ 1](screenshot/trangcanbo_1.png)

**Quản Lý Yêu Cầu**
![Cán Bộ 2](screenshot/trangcanbo_2.png)

**Xử Lý Đơn**
![Cán Bộ 3](screenshot/trangcanbo_3.png)

**Quản Lý Công Dân**
![Cán Bộ 4](screenshot/trangcanbo_4.png)

**Thống Kê Báo Cáo**
![Cán Bộ 5](screenshot/trangcanbo_5.png)

</div>

### 🏛️ Giao Diện Chủ Tịch Xã

<div align="center">

**Dashboard Chủ Tịch**
![Chủ Tịch 1](screenshot/trangchutichxa_1.png)

**Quản Lý Cán Bộ**
![Chủ Tịch 2](screenshot/trangchutichxa_2.png)

**Phê Duyệt Cán Bộ**
![Chủ Tịch 3](screenshot/trangchutichxa_3.png)

**Thống Kê Tổng Quan**
![Chủ Tịch 4](screenshot/trangchutichxa_4.png)

**Báo Cáo Hệ Thống**
![Chủ Tịch 5](screenshot/trangchutichxa_5.png)

</div>

## 🛠️ Scripts và Utilities

### 📜 Scripts Có Sẵn

Dự án cung cấp các script tiện ích để dễ dàng triển khai và quản lý:

#### Deployment Scripts

| Script | Platform | Mô Tả |
|--------|----------|-------|
| `scripts/deploy.sh` | Linux/macOS | Script triển khai tự động với Docker |
| `scripts/deploy.ps1` | Windows PowerShell | Script triển khai tự động cho Windows |
| `scripts/start.bat` | Windows | Khởi động nhanh local development |

#### Management Commands

```bash
# Tạo mock data cho testing
python manage.py create_mock_documents --user-email=test@example.com --count=10

# Tạo superuser
python manage.py createsuperuser

# Reset database (cẩn thận!)
python manage.py flush

# Backup database
python manage.py dumpdata > backup.json

# Restore database
python manage.py loaddata backup.json
```

#### Docker Management

```bash
# Xem logs của tất cả services
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart service cụ thể
docker-compose restart backend

# Rebuild và restart
docker-compose up -d --build backend

# Dọn dẹp containers và volumes
docker-compose down -v
docker system prune -a
```

#### Database Management

```bash
# Kết nối vào PostgreSQL container
docker-compose exec db psql -U postgres -d blockchain_admin

# Backup database
docker-compose exec db pg_dump -U postgres blockchain_admin > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres blockchain_admin < backup.sql

# Xem database size
docker-compose exec db psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('blockchain_admin'));"
```

### 🔧 Troubleshooting Scripts

#### Kiểm Tra Health Status
```bash
# Kiểm tra tất cả services
curl http://localhost:8000/api/health/
curl http://localhost:3000/health

# Kiểm tra database connection
docker-compose exec backend python manage.py dbshell
```

#### Reset Environment
```bash
# Reset hoàn toàn (xóa tất cả data)
docker-compose down -v
docker system prune -a
./scripts/deploy.sh
```

## 🔧 Cấu Hình Nâng Cao

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blockchain_admin
DB_USER=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Django Settings
SECRET_KEY=your_secret_key
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1

# Blockchain Configuration
BLOCKCHAIN_NETWORK=development
HYPERLEDGER_PEER_URL=peer0.org1.example.com:7051
ETHEREUM_RPC_URL=http://localhost:8545

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### Cấu Hình Nginx (Production)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /app/static/;
    }

    location /media/ {
        alias /app/media/;
    }
}
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Sử dụng pytest cho API testing
cd backend
pytest api/tests/
```

## 📊 Monitoring và Logging

### Logs Location
- **Django**: `backend/logs/`
- **Nginx**: `/var/log/nginx/`
- **Docker**: `docker-compose logs`

### Health Checks
- Backend: `http://localhost:8000/api/health/`
- Frontend: `http://localhost:3000/health`
- Database: `docker-compose exec db pg_isready`

## ❓ FAQ và Xử Lý Lỗi

### 🔧 Lỗi Thường Gặp

#### 1. Lỗi Port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Dừng process đang sử dụng port
sudo kill -9 $(lsof -ti:3000)
sudo kill -9 $(lsof -ti:8000)
```

#### 2. Lỗi Docker không khởi động được
```bash
# Kiểm tra Docker service
sudo systemctl status docker

# Khởi động Docker service
sudo systemctl start docker

# Kiểm tra Docker Compose version
docker-compose --version
```

#### 3. Lỗi Database Connection
```bash
# Kiểm tra PostgreSQL container
docker-compose ps db

# Restart database
docker-compose restart db

# Xem logs database
docker-compose logs db
```

#### 4. Lỗi Frontend không build được
```bash
# Clear npm cache
npm cache clean --force

# Xóa node_modules và reinstall
rm -rf frontend/node_modules
cd frontend && npm install

# Hoặc sử dụng yarn
cd frontend && yarn install
```

#### 5. Lỗi Permission Denied (Linux/macOS)
```bash
# Cấp quyền execute cho scripts
chmod +x scripts/*.sh

# Cấp quyền cho Docker socket
sudo chmod 666 /var/run/docker.sock
```

### 🆘 Khắc Phục Nhanh

#### Reset Hoàn Toàn
```bash
# Dừng tất cả containers
docker-compose down -v

# Xóa tất cả images và containers
docker system prune -a

# Chạy lại deployment
./scripts/deploy.sh
```

#### Kiểm Tra Logs Chi Tiết
```bash
# Backend logs
docker-compose logs -f --tail=100 backend

# Frontend logs  
docker-compose logs -f --tail=100 frontend

# Database logs
docker-compose logs -f --tail=100 db
```

#### Backup Trước Khi Reset
```bash
# Backup database
docker-compose exec db pg_dump -U postgres blockchain_admin > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup media files
cp -r backend/media/ backup_media_$(date +%Y%m%d_%H%M%S)/
```

### 💡 Tips và Tricks

#### Development Tips
```bash
# Hot reload cho backend (development)
docker-compose -f docker-compose.dev.yml up

# Chạy tests
docker-compose exec backend python manage.py test

# Tạo migration mới
docker-compose exec backend python manage.py makemigrations

# Shell vào container
docker-compose exec backend bash
docker-compose exec frontend sh
```

#### Performance Tips
```bash
# Optimize Docker images
docker image prune

# Monitor resource usage
docker stats

# Limit container resources
docker-compose up --scale frontend=2
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phát hành dưới giấy phép [MIT License](LICENSE).


<div align="center">

**🎓 Khoa Khoa Học Dữ Liệu**  


   Made with ❤️ by Võ Trọng Nhơn

</div>
