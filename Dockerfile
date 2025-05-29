# 使用完整版本的 Node.js 镜像，而不是 Alpine 版本
FROM node:20

# 设置工作目录
WORKDIR /app

# 安装编译 SQLite3 所需的依赖
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libsqlite3-dev \
    sqlite3

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# 复制 package.json 和 lock 文件
COPY package.json pnpm-lock.yaml* ./

# 安装依赖并重建 SQLite3
RUN pnpm install --frozen-lockfile && \
    pnpm rebuild sqlite3

# 清理不必要的包以减小镜像大小
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "src/app.js"]
