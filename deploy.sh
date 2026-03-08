#!/bin/bash

# Dừng lại nếu có bất kỳ lỗi nào xảy ra trong quá trình chạy
set -e

echo "🚀 Bắt đầu quá trình deploy..."

# 1. Pull code mới nhất từ nhánh main
echo "📥 Đang tải mã nguồn mới nhất từ Github..."
git pull origin main

# 2. Cài đặt các thư viện/packages mới (nếu có)
echo "📦 Đang cài đặt các dependencies..."
npm install

# 3. Build lại ứng dụng Next.js
echo "🏗️ Đang build ứng dụng Next.js..."
npm run build

# 4. Khởi động / Khởi động lại ứng dụng bằng PM2
# Bạn sẽ cần phải thay 'my-dashboard' thành tên App bạn khai báo trong PM2
echo "🔄 Đang khởi động lại ứng dụng qua PM2..."

# Kiểm tra xem app đã tồn tại trong PM2 chưa
if pm2 list | grep -q "my-dashboard"; then
  echo "App 'my-dashboard' đã tồn tại, đang restart..."
  pm2 restart my-dashboard
else
  echo "App 'my-dashboard' chưa tồn tại, đang khởi tạo..."
  pm2 start npm --name "my-dashboard" -- run start
fi

# Lưu lại cấu hình PM2 để tự chạy khi VPS khởi động lại
pm2 save

echo "✅ Deploy hoàn tất thành công!"
