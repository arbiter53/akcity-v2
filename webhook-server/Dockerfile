FROM node:18-alpine

WORKDIR /app

# Package files'ları kopyala
COPY package*.json ./

# Dependencies'leri yükle
RUN npm install --omit=dev

# Source code'u kopyala
COPY . .

# TypeScript'i build et
RUN npm run build

# Port'u expose et
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Uygulamayı başlat
CMD ["npm", "start"]
