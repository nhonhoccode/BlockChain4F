#!/bin/bash

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Đang tạo các migrations...${NC}"

# Tạo migrations cho từng app
echo -e "${GREEN}Tạo migrations cho accounts...${NC}"
python manage.py makemigrations accounts

echo -e "${GREEN}Tạo migrations cho blockchain...${NC}"
python manage.py makemigrations blockchain

echo -e "${GREEN}Tạo migrations cho administrative...${NC}"
python manage.py makemigrations administrative

echo -e "${GREEN}Tạo migrations cho officer_management...${NC}"
python manage.py makemigrations officer_management

echo -e "${GREEN}Tạo migrations cho feedback...${NC}"
python manage.py makemigrations feedback

echo -e "${GREEN}Tạo migrations cho notifications...${NC}"
python manage.py makemigrations notifications

# Tạo migrations cho tất cả các app còn lại
echo -e "${GREEN}Tạo migrations cho tất cả các app còn lại...${NC}"
python manage.py makemigrations

# Apply migrations
echo -e "${YELLOW}Áp dụng migrations...${NC}"
python manage.py migrate

# Kiểm tra kết quả
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Áp dụng migrations thành công!${NC}"
    
    # Tạo superuser nếu chưa có
    echo -e "${YELLOW}Bạn có muốn tạo superuser không? (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo -e "${GREEN}Tạo superuser...${NC}"
        python manage.py createsuperuser
    fi
else
    echo -e "${RED}Có lỗi xảy ra khi áp dụng migrations.${NC}"
fi

echo -e "${YELLOW}Hoàn thành quá trình migration.${NC}" 