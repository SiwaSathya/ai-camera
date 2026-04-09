// api/generate.js
export default async function handler(req, res) {
    // 1. CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-goog-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Ambil Key dari Environment Variable Vercel
    const API_KEY = process.env.GEMINI_API_KEY; 
    const MODEL_ID = "gemini-3.1-flash-image-preview";
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY belum di-set di environment variable Vercel.' });
    }

    try {
        // 3. Forward ke Google
        // Gunakan signal timeout jika perlu, karena generate gambar butuh waktu lebih lama (10-20 detik)
        const response = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        // 4. Kirim balik ke frontend
        res.status(200).json(data);
        
    } catch (error) {
        console.error("Vercel Proxy Error:", error);
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message 
        });
    }
}

// Tambahan: Konfigurasi Vercel untuk mengizinkan payload besar (Max 4.5MB untuk Hobby Tier)
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb',
        },
    },
};