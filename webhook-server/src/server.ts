import express from 'express';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key';

app.use(express.json());

// GitHub webhook signature doğrulama
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Deployment scripti
async function deploy() {
  try {
    console.log('🚀 Deployment başlatılıyor...');
    
    // Git pull
    await execAsync('git pull origin main');
    console.log('✅ Git pull tamamlandı');
    
    // Docker containers'ları yeniden başlat
    await execAsync('docker-compose -f docker-compose.prod.yml down');
    console.log('✅ Eski containers durduruldu');
    
    await execAsync('docker-compose -f docker-compose.prod.yml up -d --build');
    console.log('✅ Yeni containers başlatıldı');
    
    // Health check
    await new Promise(resolve => setTimeout(resolve, 5000));
    const { stdout } = await execAsync('docker-compose -f docker-compose.prod.yml ps');
    console.log('📊 Container durumları:', stdout);
    
    console.log('🎉 Deployment başarıyla tamamlandı!');
  } catch (error) {
    console.error('❌ Deployment hatası:', error);
    throw error;
  }
}

// GitHub webhook endpoint
app.post('/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const payload = JSON.stringify(req.body);
  
  // Signature doğrulama
  if (!signature || !verifySignature(payload, signature, WEBHOOK_SECRET)) {
    console.log('❌ Geçersiz webhook signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const event = req.headers['x-github-event'];
  
  // Sadece push eventlerini işle
  if (event === 'push') {
    const { ref, repository } = req.body;
    
    // Sadece main branch'deki değişiklikleri işle
    if (ref === 'refs/heads/main') {
      console.log(`📦 Yeni push alındı: ${repository.full_name} - ${ref}`);
      
      try {
        await deploy();
        res.status(200).json({ message: 'Deployment başarılı' });
      } catch (error) {
        console.error('Deployment hatası:', error);
        res.status(500).json({ error: 'Deployment başarısız' });
      }
    } else {
      console.log(`⏭️  Branch ${ref} atlandı (sadece main branch işleniyor)`);
      res.status(200).json({ message: 'Branch atlandı' });
    }
  } else {
    console.log(`⏭️  Event ${event} atlandı`);
    res.status(200).json({ message: 'Event atlandı' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🎣 Webhook server ${PORT} portunda çalışıyor`);
  console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET.substring(0, 8)}...`);
});
