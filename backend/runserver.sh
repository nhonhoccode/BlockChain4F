#!/bin/bash

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kiểm tra môi trường ảo
if [ -d "venv" ] || [ -d "env" ] || [ -d ".venv" ] || [ -d ".env" ]; then
    # Nếu đã có môi trường ảo, kích hoạt nó
    if [ -f "venv/bin/activate" ]; then
        echo -e "${GREEN}Kích hoạt môi trường ảo venv...${NC}"
        source venv/bin/activate
    elif [ -f "env/bin/activate" ]; then
        echo -e "${GREEN}Kích hoạt môi trường ảo env...${NC}"
        source env/bin/activate
    elif [ -f ".venv/bin/activate" ]; then
        echo -e "${GREEN}Kích hoạt môi trường ảo .venv...${NC}"
        source .venv/bin/activate
    elif [ -f ".env/bin/activate" ]; then
        echo -e "${GREEN}Kích hoạt môi trường ảo .env...${NC}"
        source .env/bin/activate
    fi
else
    # Nếu chưa có môi trường ảo, hỏi người dùng có muốn tạo không
    echo -e "${YELLOW}Không tìm thấy môi trường ảo. Bạn có muốn tạo môi trường ảo mới không? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo -e "${GREEN}Tạo môi trường ảo venv...${NC}"
        python -m venv venv
        echo -e "${GREEN}Kích hoạt môi trường ảo...${NC}"
        source venv/bin/activate
        echo -e "${GREEN}Cài đặt các gói phụ thuộc...${NC}"
        pip install -r requirements/base.txt
        pip install -r requirements/dev.txt
    else
        echo -e "${YELLOW}Sử dụng môi trường Python hệ thống.${NC}"
    fi
fi

# Kiểm tra xem đã chạy migrations chưa
echo -e "${YELLOW}Kiểm tra migrations...${NC}"
python manage.py showmigrations | grep -q "\[ \]"
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Phát hiện migrations chưa được áp dụng. Bạn có muốn áp dụng ngay không? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo -e "${GREEN}Áp dụng migrations...${NC}"
        python manage.py migrate
    else
        echo -e "${YELLOW}Bỏ qua migrations. Lưu ý rằng điều này có thể gây ra lỗi.${NC}"
    fi
else
    echo -e "${GREEN}Tất cả migrations đã được áp dụng.${NC}"
fi

# Thiết lập biến môi trường
export DJANGO_SETTINGS_MODULE=core.settings.dev

# Bắt đầu development server
echo -e "${GREEN}Khởi động development server...${NC}"
python manage.py runserver 0.0.0.0:8000 