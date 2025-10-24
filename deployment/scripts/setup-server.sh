#!/bin/bash

# AkCity v2 - Sunucu Kurulum Scripti
# Güncel ve Stabil Versiyon

set -e  # Hata durumunda scripti durdur

# Renkli çıktı için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonu
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Sistem güncellemesi
log "Sistem güncelleniyor..."
apt update && apt upgrade -y

# Gerekli paketlerin kurulumu
log "Gerekli paketler kuruluyor..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    nginx \
    ufw \
    fail2ban \
    htop \
    nano \
    vim \
    tree \
    jq

# Docker kurulumu
log "Docker kuruluyor..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker $USER
    systemctl enable docker
    systemctl start docker
    log "Docker kuruldu"
else
    log "Docker zaten kurulu"
fi

# Docker Compose kurulumu
log "Docker Compose kuruluyor..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    log "Docker Compose kuruldu"
else
    log "Docker Compose zaten kurulu"
fi

# Node.js kurulumu (LTS)
log "Node.js kuruluyor..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt install -y nodejs
    log "Node.js kuruldu"
else
    log "Node.js zaten kurulu"
fi

# Git yapılandırması
log "Git yapılandırılıyor..."
git config --global init.defaultBranch main
git config --global pull.rebase false

# GitHub repository güncelleme
log "GitHub repository güncelleniyor..."
if [ -d "akcity-v2" ]; then
    cd akcity-v2
    git pull origin main
    log "✅ Repository güncellendi"
    cd ..
else
    log "Repository klonlanıyor..."
    git clone https://github.com/arbiter53/akcity-v2.git
    log "✅ Repository klonlandı"
fi

# Firewall yapılandırması
log "Firewall yapılandırılıyor..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000:3002/tcp  # Frontend, Grafana, Webhook
ufw allow 5000/tcp       # Backend
ufw allow 9090/tcp       # Prometheus
ufw --force enable

# Fail2ban yapılandırması
log "Fail2ban yapılandırılıyor..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Nginx yapılandırması
log "Nginx yapılandırılıyor..."
systemctl enable nginx
systemctl start nginx

# Proje dizini oluşturma
log "Proje dizini hazırlanıyor..."
mkdir -p /opt/akcity
cd /opt/akcity

# Git repository klonlama (eğer yoksa)
if [ ! -d "akcity-v2" ]; then
    log "Repository klonlanıyor..."
    git clone https://github.com/arbiter53/akcity-v2.git
    cd akcity-v2
else
    log "Repository zaten mevcut, güncelleniyor..."
    cd akcity-v2
    git pull origin main
fi

# Environment dosyası oluşturma
log "Environment dosyası oluşturuluyor..."
if [ ! -f ".env" ]; then
    cat > .env << EOF
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
MONGO_DATABASE=akcity

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)

# API
API_PREFIX=/api
API_VERSION=v1

# CORS
CORS_ORIGIN=*
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW=900000
AUTH_RATE_LIMIT_MAX=5

# Bcrypt
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info

# Webhook
WEBHOOK_SECRET=$(openssl rand -base64 32)

# Grafana
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)
EOF
    log "Environment dosyası oluşturuldu"
else
    log "Environment dosyası zaten mevcut"
fi

# Docker servislerini başlatma
log "Docker servisleri başlatılıyor..."
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Servis durumunu kontrol etme
log "Servis durumu kontrol ediliyor..."
sleep 30

# Health check
info "Health check yapılıyor..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    log "✅ Ana site çalışıyor"
else
    warning "⚠️ Ana site henüz hazır değil"
fi

if curl -f http://localhost:3001 > /dev/null 2>&1; then
    log "✅ Grafana çalışıyor"
else
    warning "⚠️ Grafana henüz hazır değil"
fi

if curl -f http://localhost:9090 > /dev/null 2>&1; then
    log "✅ Prometheus çalışıyor"
else
    warning "⚠️ Prometheus henüz hazır değil"
fi

# Domain yapılandırması
log "Domain yapılandırılıyor..."
if [ ! -f "/etc/nginx/sites-available/panel.akcity.net" ]; then
    cat > /etc/nginx/sites-available/panel.akcity.net << EOF
server {
    listen 80;
    server_name panel.akcity.net;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /webhook {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/panel.akcity.net /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    log "Domain yapılandırması tamamlandı"
fi

# Sistem bilgileri
log "Kurulum tamamlandı!"
info "=== SİSTEM BİLGİLERİ ==="
info "Ana Site: http://panel.akcity.net"
info "Grafana: http://panel.akcity.net:3001"
info "Prometheus: http://panel.akcity.net:9090"
info "Proje Dizini: /opt/akcity/akcity-v2"
info "Environment: /opt/akcity/akcity-v2/.env"
info "========================="

# Kullanışlı komutlar
info "=== KULLANIŞLI KOMUTLAR ==="
info "Servisleri başlat: cd /opt/akcity/akcity-v2 && docker-compose -f docker-compose.prod.yml up -d"
info "Servisleri durdur: cd /opt/akcity/akcity-v2 && docker-compose -f docker-compose.prod.yml down"
info "Logları görüntüle: cd /opt/akcity/akcity-v2 && docker-compose -f docker-compose.prod.yml logs -f"
info "Servis durumu: cd /opt/akcity/akcity-v2 && docker-compose -f docker-compose.prod.yml ps"
info "=========================="

log "🎉 Kurulum başarıyla tamamlandı!"
