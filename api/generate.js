// api/generate.js
// Vercel Serverless Function - Proxy to Google Gemini API

export default async function handler(req, res) {
    // 1. Matikan pengecekan CORS (Izinkan request dari frontend Vercel sendiri)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ubah '*' ke domain Vercel-mu jika ingin lebih aman
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle Preflight Request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Ambil API Key dari Environment Variables Vercel (Paling Aman)
    // Jangan hardcode key di sini! Setel di dashboard Vercel.
    const API_KEY = process.env.GEMINI_API_KEY; 
    const MODEL_ID = "gemini-3.1-flash-image-preview";
    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

    if (!API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set.' });
    }

    try {
        // 3. Forward request body ke Google API (Server-to-Server communication)
        const response = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        
        // 4. Kembalikan respons dari Google langsung ke frontend
        res.status(200).json(data);
        
    } catch (error) {
        console.error("Vercel Proxy Error:", error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}