# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# 安装编译 SQLite3 所需的依赖
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    sqlite-dev

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# 重建 SQLite3
RUN pnpm rebuild sqlite3

# 删除编译依赖以减小镜像大小
RUN apk del .build-deps && apk add --no-cache sqlite

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
