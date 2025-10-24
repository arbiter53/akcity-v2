# GitHub Webhook Server

Bu servis GitHub webhook'larını dinler ve otomatik deployment yapar.

## Özellikler

- ✅ GitHub webhook signature doğrulama
- ✅ Sadece main branch'deki değişiklikleri işler
- ✅ Otomatik Docker container rebuild
- ✅ Health check endpoint
- ✅ Güvenli webhook handling

## Kurulum

1. Environment variables'ları ayarla:
```bash
export WEBHOOK_SECRET="your-github-webhook-secret"
```

2. Docker container'ı başlat:
```bash
docker-compose -f docker-compose.prod.yml up -d webhook
```

## GitHub Webhook Ayarları

1. GitHub repository'de Settings > Webhooks'a git
2. "Add webhook" butonuna tıkla
3. Payload URL: `https://yourdomain.com/webhook`
4. Content type: `application/json`
5. Secret: Environment'ta belirlediğin secret
6. Events: "Just the push event" seç
7. Active: ✅ işaretle

## Endpoints

- `POST /webhook` - GitHub webhook endpoint
- `GET /health` - Health check

## Güvenlik

- Webhook signature doğrulama
- Rate limiting
- Sadece push eventleri işlenir
- Sadece main branch'deki değişiklikler deploy edilir
