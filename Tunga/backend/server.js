const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

const app = express();
const port = process.env.PORT || 3000;

// CSV dosyasının yolu
const csvFilePath = path.join(__dirname, '..', 'data', 'mesajlar.csv');

// Klasörü oluştur (eğer yoksa)
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// CSV dosyasını oluştur (eğer yoksa)
if (!fs.existsSync(csvFilePath)) {
    fs.writeFileSync(csvFilePath, 'İsim,Soyisim,E-posta,Mesaj,Tarih\n');
}

// CORS ve JSON parsing middleware'leri
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:5500'],
    methods: ['POST'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// İletişim formu endpoint'i
app.post('/api/contact', async (req, res) => {
    console.log('Form verisi alındı:', req.body);
    
    try {
        if (!req.body) {
            throw new Error('Form verisi boş');
        }
        
        const { firstName, lastName, email, message } = req.body;
        
        // Veri doğrulama
        if (!firstName || !lastName || !email || !message) {
            throw new Error('Tüm alanlar zorunludur');
        }

        // CSV formatında yeni satır oluştur
        const yeniVeri = {
            İsim: firstName,
            Soyisim: lastName,
            'E-posta': email,
            Mesaj: message.replace(/"/g, '""'), // CSV için " karakterini escape et
            Tarih: new Date().toLocaleString('tr-TR')
        };

        // CSV dosyasına yaz
        stringify([yeniVeri], { 
            header: false,
            columns: ['İsim', 'Soyisim', 'E-posta', 'Mesaj', 'Tarih']
        }, (err, output) => {
            if (err) {
                throw err;
            }
            fs.appendFileSync(csvFilePath, output);
            res.json({
                status: 'success',
                message: 'Mesajınız başarıyla kaydedildi.'
            });
        });
    } catch (error) {
        console.error('Veri kaydetme hatası:', error);
        res.status(500).json({
            status: 'error',
            message: 'Mesaj kaydedilirken bir hata oluştu.'
        });
    }
});

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});