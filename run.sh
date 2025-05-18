#!/bin/bash

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Hiển thị menu
echo -e "${YELLOW}=== Blockchain Administrative Management System ===${NC}"
echo "1. Khởi động Backend (Django)"
echo "2. Khởi động Frontend (React)"
echo "3. Khởi động cả hai (Backend & Frontend)"
echo "4. Tạo migration và áp dụng (Backend)"
echo "5. Cài đặt dependencies (Backend)"
echo "6. Cài đặt dependencies (Frontend)"
echo "7. Thoát"
echo -e "${YELLOW}=================================================${NC}"
echo -n "Nhập lựa chọn của bạn (1-7): "
read -r choice

case $choice in
    1)
        echo -e "${GREEN}Khởi động Backend (Django)...${NC}"
        cd backend
        chmod +x runserver.sh
        ./runserver.sh
        ;;
    2)
        echo -e "${GREEN}Khởi động Frontend (React)...${NC}"
        cd frontend
        npm start
        ;;
    3)
        echo -e "${GREEN}Khởi động cả Backend & Frontend...${NC}"
        
        # Khởi động backend trong background
        echo -e "${GREEN}Khởi động Backend (Django)...${NC}"
        cd backend
        chmod +x runserver.sh
        ./runserver.sh &
        BACKEND_PID=$!
        
        # Quay lại thư mục gốc
        cd ..
        
        # Đợi backend khởi động
        echo -e "${YELLOW}Đợi backend khởi động (5 giây)...${NC}"
        sleep 5
        
        # Khởi động frontend
        echo -e "${GREEN}Khởi động Frontend (React)...${NC}"
        cd frontend
        npm start
        
        # Khi frontend đóng, cũng đóng backend
        kill $BACKEND_PID
        ;;
    4)
        echo -e "${GREEN}Tạo migration và áp dụng (Backend)...${NC}"
        cd backend
        chmod +x migrate.sh
        ./migrate.sh
        ;;
    5)
        echo -e "${GREEN}Cài đặt dependencies (Backend)...${NC}"
        cd backend
        pip install -r requirements/base.txt
        if [ -f "requirements/dev.txt" ]; then
            pip install -r requirements/dev.txt
        fi
        echo -e "${GREEN}Đã cài đặt dependencies cho Backend.${NC}"
        ;;
    6)
        echo -e "${GREEN}Cài đặt dependencies (Frontend)...${NC}"
        cd frontend
        npm install
        echo -e "${GREEN}Đã cài đặt dependencies cho Frontend.${NC}"
        ;;
    7)
        echo -e "${GREEN}Thoát...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Lựa chọn không hợp lệ.${NC}"
        exit 1
        ;;
esac 