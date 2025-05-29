#!/bin/bash
set -e

# 创建必要的目录
mkdir -p /app/logs
mkdir -p /app/data

# 检查并清理错误的database.sqlite目录
if [ -d "/app/database.sqlite" ]; then
  echo "Found database.sqlite directory instead of file, removing it..."
  rm -rf /app/database.sqlite
fi

# 确保数据库文件存在并有正确权限
echo "Creating or verifying database file..."
touch /app/data/database.sqlite

# 设置正确的权限
echo "Setting correct permissions..."
chmod -R 755 /app
chmod -R 777 /app/data
chmod 666 /app/data/database.sqlite
chown -R appuser:appgroup /app /app/logs /app/data
chown appuser:appgroup /app/data/database.sqlite

# 显示文件权限和所有权信息以便调试
echo "Database directory and file permissions:"
ls -la /app/
ls -la /app/data/
ls -la /app/data/database.sqlite

# 确保环境变量文件存在
if [ -f /app/.env ]; then
  echo "Using provided .env file"
else
  echo "Creating default .env file"
  cat > /app/.env << EOF
# 生产环境配置
NODE_ENV=production
PORT=8080
DB_PATH=/app/data/database.sqlite
EOF
fi

# 切换到appuser用户运行应用
exec gosu appuser "$@"
