# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Package files'ları kopyala
COPY package*.json ./

# Tüm dependencies'leri yükle (build için)
RUN npm install

# Source code'u kopyala
COPY . .

# TypeScript'i build et
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Package files'ları kopyala
COPY package*.json ./

# Sadece production dependencies'leri yükle
RUN npm install --omit=dev

# Build edilmiş kodu kopyala
COPY --from=builder /app/dist ./dist

# Port'u expose et
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Uygulamayı başlat
CMD ["npm", "start"]
