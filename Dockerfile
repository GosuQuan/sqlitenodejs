# Use Node.js LTS version as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app
 
# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

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
