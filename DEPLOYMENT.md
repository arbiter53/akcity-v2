# AKCity v2.0 Deployment Guide

Comprehensive deployment guide for production-ready construction management system.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   Frontend      │    │   Backend API   │
│   (Port 80/443) │────│   (React)       │────│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)     │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Ubuntu 20.04+** (recommended)
- **4GB RAM** minimum
- **20GB disk space** minimum

### 1. Clone Repository

```bash
git clone https://github.com/your-org/akcity-v2.git
cd akcity-v2
```

### 2. Environment Setup

```bash
# Copy environment file
cp env.production .env.production

# Edit environment variables
nano .env.production
```

### 3. Generate SSL Certificates

```bash
# For development (self-signed)
sudo ./deployment/scripts/generate-ssl.sh self-signed

# For production (Let's Encrypt)
sudo ./deployment/scripts/generate-ssl.sh letsencrypt
```

### 4. Deploy Application

```bash
# Make deployment script executable
chmod +x deployment/scripts/deploy.sh

# Run deployment
sudo ./deployment/scripts/deploy.sh
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
MONGO_ROOT_USERNAME=akcity_admin
MONGO_ROOT_PASSWORD=AkCity2024!SecureDB
MONGO_DATABASE=akcity_v2

# Redis
REDIS_PASSWORD=AkCity2024!RedisSecure

# JWT Security
JWT_SECRET=AkCity2024!JWTSecretKey!Secure
JWT_REFRESH_SECRET=AkCity2024!JWTRefreshSecret!Secure

# API Configuration
API_BASE_URL=https://panel.akcity.net/api/v1
CORS_ORIGIN=https://panel.akcity.net

# Monitoring
GRAFANA_PASSWORD=AkCity2024!GrafanaSecure
```

### Optional Environment Variables

```bash
# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Email (if using notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🐳 Docker Services

### Development Environment

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production down
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

- **Backend API**: `http://localhost:5000/health`
- **Frontend**: `http://localhost:3000/health`
- **Nginx**: `http://localhost/health`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001`

### Automated Health Checks

```bash
# Run comprehensive health check
./deployment/scripts/health-check.sh

# Check specific services
docker-compose -f docker-compose.prod.yml ps
```

### Monitoring Setup

1. **Prometheus** - Metrics collection
2. **Grafana** - Visualization and dashboards
3. **Health Checks** - Automated monitoring
4. **Log Aggregation** - Centralized logging

## 🔒 Security Configuration

### SSL/TLS Setup

```bash
# Generate self-signed certificates (development)
sudo ./deployment/scripts/generate-ssl.sh self-signed

# Generate Let's Encrypt certificates (production)
sudo ./deployment/scripts/generate-ssl.sh letsencrypt
```

### Security Headers

- **HSTS** - HTTP Strict Transport Security
- **X-Frame-Options** - Clickjacking protection
- **X-Content-Type-Options** - MIME type sniffing protection
- **X-XSS-Protection** - Cross-site scripting protection
- **CSP** - Content Security Policy

### Rate Limiting

- **API Endpoints**: 10 requests/second
- **Authentication**: 5 requests/minute
- **General**: 1 request/second

## 📈 Performance Optimization

### Resource Limits

```yaml
# Docker Compose resource limits
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
    reservations:
      memory: 512M
      cpus: '0.5'
```

### Caching Strategy

- **Static Assets**: 1 year cache
- **HTML Files**: 1 hour cache
- **API Responses**: No cache
- **Database Queries**: Redis caching

### Database Optimization

- **Indexes**: Optimized for common queries
- **Connection Pooling**: MongoDB connection management
- **Query Optimization**: Efficient aggregation pipelines

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup
docker exec akcity-mongodb-prod mongodump --out /tmp/backup

# Restore backup
docker exec akcity-mongodb-prod mongorestore /tmp/backup
```

### Volume Backup

```bash
# Backup Docker volumes
sudo cp -r /var/lib/docker/volumes/akcity-v2_mongodb_data /backup/
```

### Automated Backups

```bash
# Add to crontab for daily backups
0 2 * * * /path/to/akcity-v2/deployment/scripts/backup.sh
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check container logs
docker logs akcity-backend-prod

# Check container status
docker ps -a

# Restart container
docker restart akcity-backend-prod
```

#### 2. Database Connection Issues

```bash
# Check MongoDB logs
docker logs akcity-mongodb-prod

# Test database connection
docker exec akcity-mongodb-prod mongosh --eval "db.adminCommand('ping')"
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Regenerate certificates
sudo ./deployment/scripts/generate-ssl.sh letsencrypt
```

#### 4. Memory Issues

```bash
# Check memory usage
free -h

# Clean up Docker
docker system prune -a

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Log Locations

- **Application Logs**: `./backend/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **Docker Logs**: `docker logs <container-name>`
- **System Logs**: `/var/log/syslog`

## 📋 Maintenance

### Regular Maintenance Tasks

1. **Daily**: Health checks, log monitoring
2. **Weekly**: Security updates, dependency updates
3. **Monthly**: Database optimization, backup verification
4. **Quarterly**: Security audit, performance review

### Update Procedures

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling

```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale with load balancer
# (Requires additional nginx configuration)
```

## 📞 Support

### Getting Help

1. **Documentation**: Check this guide first
2. **Logs**: Review application and system logs
3. **Health Checks**: Run automated health checks
4. **Community**: GitHub Issues and Discussions

### Emergency Procedures

1. **Service Down**: Check container status and logs
2. **Database Issues**: Verify MongoDB connectivity
3. **SSL Issues**: Regenerate certificates
4. **Security Breach**: Review access logs and update credentials

## 📄 License

MIT License - see LICENSE file for details.

---

**AKCity v2.0** - Modern, secure, and scalable construction management system.
