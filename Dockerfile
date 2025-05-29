# 使用 Node.js 16 LTS 版本，这个版本与 SQLite3 兼容性最好
FROM node:16

# 设置工作目录
WORKDIR /app

# 安装编译 SQLite3 所需的依赖
RUN apt-get update && apt-get install -y \
    python \
    make \
    g++ \
    libsqlite3-dev

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 专门重建 sqlite3
RUN npm rebuild sqlite3 --build-from-source

# 清理不必要的包以减小镜像大小
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Create a non-root user and switch to it
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "src/app.js"]
