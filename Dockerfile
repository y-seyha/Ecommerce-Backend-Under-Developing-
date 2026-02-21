# Use Node 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies (including dev for ts-node)
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose backend port
EXPOSE 3000

# Default command for development: run TS directly with tsx
CMD ["npx", "tsx", "watch", "src/server.ts"]