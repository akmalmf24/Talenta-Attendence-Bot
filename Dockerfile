# Dockerfile
FROM node:22-alpine
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose port (optional, Railway handle otomatis)
EXPOSE 3000

# Start app
CMD ["node", "server.js"]
