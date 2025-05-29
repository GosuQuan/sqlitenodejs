#!/bin/bash
set -e

# 创建日志目录
mkdir -p /app/logs

# 确保数据库目录存在并有正确权限
touch /app/database.sqlite
chown -R appuser:appgroup /app /app/database.sqlite /app/logs
chmod 755 /app
chmod 644 /app/database.sqlite

# 显示文件权限和所有权信息以便调试
echo "Database file permissions:"
ls -la /app/database.sqlite

# 确保环境变量文件存在
if [ -f /app/.env ]; then
  echo "Using provided .env file"
else
  echo "Creating default .env file"
  cat > /app/.env << EOF
# 生产环境配置
NODE_ENV=production
PORT=8080
DB_PATH=/app/database.sqlite
EOF
fi

# 切换到appuser用户运行应用
exec gosu appuser "$@"
