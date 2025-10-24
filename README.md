# AKCity v2.0 - İnşaat Yönetim Sistemi

Modern, güvenli ve ölçeklenebilir inşaat proje yönetim sistemi. Clean Architecture prensipleriyle geliştirilmiştir.

## 🏗️ Proje Hakkında

AKCity v2.0, inşaat projelerinin tüm aşamalarını dijital ortamda yönetmeyi sağlayan kapsamlı bir yönetim sistemidir. Proje yöneticileri, mimarlar, mühendisler, işçiler ve müşteriler için özel olarak tasarlanmış modern bir platformdur.

## ✨ Özellikler

### 🔐 Güvenlik
- **JWT Authentication** - Güvenli kimlik doğrulama
- **Role-based Access Control** - Rol tabanlı erişim kontrolü
- **Rate Limiting** - DDoS koruması
- **Input Validation** - Veri doğrulama
- **SSL/TLS** - Şifreli iletişim
- **Password Hashing** - Güvenli şifre saklama

### 🚀 Performans
- **Database Indexing** - Optimize edilmiş veritabanı sorguları
- **Connection Pooling** - Veritabanı bağlantı yönetimi
- **Caching** - Redis ile hızlı erişim
- **Code Splitting** - Hızlı yükleme
- **Gzip Compression** - Sıkıştırılmış veri transferi

### 📱 Modern UI/UX
- **Responsive Design** - Mobil uyumlu tasarım
- **Dark/Light Mode** - Tema desteği
- **Accessibility** - Erişilebilirlik standartları
- **Smooth Animations** - Akıcı animasyonlar
- **Real-time Updates** - Anlık güncellemeler

### 🏢 İş Süreçleri
- **Proje Yönetimi** - Proje takibi ve yönetimi
- **Görev Yönetimi** - İş akışı yönetimi
- **Kullanıcı Yönetimi** - Ekip yönetimi
- **Raporlama** - Detaylı raporlar
- **Dosya Yönetimi** - Belge ve medya yönetimi

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** 18+ - JavaScript runtime
- **TypeScript** - Type safety
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Redis** - Caching
- **Docker** - Containerization

### Frontend
- **React** 18 - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Query** - Server state
- **React Hook Form** - Form handling
- **Framer Motion** - Animations

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **Prometheus** - Monitoring
- **Grafana** - Visualization
- **SSL/TLS** - Security

## 🚀 Hızlı Başlangıç

### Gereksinimler
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 18+ (development için)
- **Git** 2.0+

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/your-org/akcity-v2.git
cd akcity-v2
```

### 2. Environment Dosyasını Hazırlayın
```bash
# Production environment
cp env.production .env.production

# Environment değişkenlerini düzenleyin
nano .env.production
```

### 3. SSL Sertifikalarını Oluşturun
```bash
# Development için (self-signed)
sudo ./deployment/scripts/generate-ssl.sh self-signed

# Production için (Let's Encrypt)
sudo ./deployment/scripts/generate-ssl.sh letsencrypt
```

### 4. Uygulamayı Başlatın
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# Production environment
sudo ./deployment/scripts/deploy.sh
```

### 5. Uygulamaya Erişin
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database Admin**: http://localhost:8081
- **Monitoring**: http://localhost:9090 (Prometheus), http://localhost:3001 (Grafana)

## 📊 Varsayılan Kullanıcılar

Sistem ilk kurulumda aşağıdaki kullanıcıları oluşturur:

| Rol | Email | Şifre | Açıklama |
|-----|-------|-------|----------|
| Genel Müdür | admin@akcity.com | Admin123! | Sistem yöneticisi |
| Proje Müdürü | mehmet@akcity.com | Password123! | Proje yöneticisi |
| Mimar | ayse@akcity.com | Password123! | Mimari tasarım |
| Baş Mühendis | ali@akcity.com | Password123! | Teknik yönetim |
| İşçi | fatma@akcity.com | Password123! | Sahada çalışan |
| Şoför | mustafa@akcity.com | Password123! | Lojistik |
| Satın Alma | zeynep@akcity.com | Password123! | Malzeme yönetimi |
| Müşteri | emre@akcity.com | Password123! | Proje sahibi |

## 🏗️ Mimari

### Clean Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │────│   (Node.js)     │────│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Monitoring    │
                    │   (Prometheus)  │
                    └─────────────────┘
```

### Katman Yapısı
- **Core Layer** - İş mantığı ve domain modelleri
- **Infrastructure Layer** - Dış servisler ve veri erişimi
- **Application Layer** - Uygulama servisleri ve use case'ler
- **Presentation Layer** - API endpoints ve UI bileşenleri

## 🔧 Geliştirme

### Backend Geliştirme
```bash
cd backend
npm install
npm run dev
```

### Frontend Geliştirme
```bash
cd frontend
npm install
npm run dev
```

### Test Çalıştırma
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## 📈 Monitoring

### Health Checks
- **Backend API**: http://localhost:5000/health
- **Frontend**: http://localhost:3000/health
- **Nginx**: http://localhost/health

### Monitoring Tools
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **MongoDB Express**: http://localhost:8081

### Logs
```bash
# Application logs
tail -f backend/logs/app.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🚀 Deployment

### Production Deployment
```bash
# Deploy script
sudo ./deployment/scripts/deploy.sh

# Health check
./deployment/scripts/health-check.sh

# Rollback (if needed)
sudo ./deployment/scripts/deploy.sh rollback
```

### Environment Variables
```bash
# Database
MONGO_ROOT_USERNAME=akcity_admin
MONGO_ROOT_PASSWORD=AkCity2024!SecureDB

# Security
JWT_SECRET=AkCity2024!JWTSecretKey!Secure
JWT_REFRESH_SECRET=AkCity2024!JWTRefreshSecret!Secure

# API
API_BASE_URL=https://panel.akcity.net/api/v1
CORS_ORIGIN=https://panel.akcity.net
```

## 🔒 Güvenlik

### Güvenlik Özellikleri
- **JWT Authentication** - Token tabanlı kimlik doğrulama
- **Role-based Access Control** - Rol tabanlı erişim kontrolü
- **Rate Limiting** - API rate limiting
- **Input Validation** - Veri doğrulama
- **XSS Protection** - Cross-site scripting koruması
- **CSRF Protection** - Cross-site request forgery koruması
- **SSL/TLS** - Şifreli iletişim
- **Security Headers** - Güvenlik başlıkları

### Güvenlik Kontrolleri
```bash
# SSL certificate check
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Security headers test
curl -I https://panel.akcity.net

# Rate limiting test
for i in {1..10}; do curl https://panel.akcity.net/api/health; done
```

## 📊 Performans

### Optimizasyonlar
- **Database Indexing** - Veritabanı indeksleri
- **Connection Pooling** - Bağlantı havuzu
- **Redis Caching** - Önbellekleme
- **Code Splitting** - Kod bölme
- **Lazy Loading** - Gecikmeli yükleme
- **Gzip Compression** - Sıkıştırma

### Performance Monitoring
- **Prometheus Metrics** - Sistem metrikleri
- **Grafana Dashboards** - Görselleştirme
- **Health Checks** - Sağlık kontrolleri
- **Log Aggregation** - Log toplama

## 🛠️ Bakım

### Günlük Bakım
```bash
# Health check
./deployment/scripts/health-check.sh

# Log monitoring
docker-compose logs -f

# Backup
./deployment/scripts/backup.sh
```

### Haftalık Bakım
```bash
# Security updates
docker-compose pull
docker-compose up -d

# Database optimization
docker exec akcity-mongodb-prod mongosh --eval "db.runCommand({compact: 'users'})"
```

### Aylık Bakım
```bash
# Full backup
./deployment/scripts/backup.sh --full

# Security audit
./deployment/scripts/security-audit.sh

# Performance review
./deployment/scripts/performance-review.sh
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### 1. Container Başlamıyor
```bash
# Container loglarını kontrol edin
docker logs akcity-backend-prod

# Container durumunu kontrol edin
docker ps -a

# Container'ı yeniden başlatın
docker restart akcity-backend-prod
```

#### 2. Veritabanı Bağlantı Sorunu
```bash
# MongoDB loglarını kontrol edin
docker logs akcity-mongodb-prod

# Veritabanı bağlantısını test edin
docker exec akcity-mongodb-prod mongosh --eval "db.adminCommand('ping')"
```

#### 3. SSL Sertifika Sorunu
```bash
# Sertifika geçerliliğini kontrol edin
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Sertifikaları yeniden oluşturun
sudo ./deployment/scripts/generate-ssl.sh letsencrypt
```

#### 4. Bellek Sorunu
```bash
# Bellek kullanımını kontrol edin
free -h

# Docker'ı temizleyin
docker system prune -a

# Servisleri yeniden başlatın
docker-compose restart
```

## 📞 Destek

### Yardım Alma
1. **Dokümantasyon** - Bu README'yi kontrol edin
2. **Loglar** - Uygulama ve sistem loglarını inceleyin
3. **Health Checks** - Otomatik sağlık kontrollerini çalıştırın
4. **GitHub Issues** - Sorun bildirimi için GitHub Issues kullanın

### Acil Durum Prosedürleri
1. **Servis Çöktü** - Container durumunu ve logları kontrol edin
2. **Veritabanı Sorunu** - MongoDB bağlantısını doğrulayın
3. **SSL Sorunu** - Sertifikaları yeniden oluşturun
4. **Güvenlik İhlali** - Erişim loglarını inceleyin ve kimlik bilgilerini güncelleyin

## 📄 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📧 İletişim

- **Proje Sahibi**: AKCity Team
- **Email**: admin@akcity.com
- **GitHub**: https://github.com/your-org/akcity-v2
- **Website**: https://panel.akcity.net

---

**AKCity v2.0** - Modern, güvenli ve ölçeklenebilir inşaat yönetim sistemi. 🏗️
