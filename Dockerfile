# 使用特定版本的 Node.js 镜像，这个版本与 SQLite3 兼容性更好
FROM node:18-bullseye

# 设置工作目录
WORKDIR /app

# 安装编译 SQLite3 所需的所有依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    sqlite3 \
    build-essential \
    python3-dev

# 安装 node-gyp
RUN npm install -g node-gyp

# 安装 pnpm
RUN npm install -g pnpm@10.11.0

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖并强制重建 SQLite3
RUN pnpm install && \
    npm rebuild sqlite3 --build-from-source && \
    pnpm rebuild sqlite3 --build-from-source

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
