#!/bin/bash

# GitHub Webhook Deployment Script
# Bu script webhook tarafından çağrılır

set -e

echo "🚀 Deployment başlatılıyor..."

# Git repository'yi güncelle
echo "📥 Git pull yapılıyor..."
git pull origin main

# Eski containers'ları durdur
echo "🛑 Eski containers durduruluyor..."
docker-compose -f docker-compose.prod.yml down

# Yeni containers'ları build et ve başlat
echo "🔨 Yeni containers build ediliyor..."
docker-compose -f docker-compose.prod.yml up -d --build

# Health check
echo "🏥 Health check yapılıyor..."
sleep 10

# Container durumlarını kontrol et
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment tamamlandı!"
