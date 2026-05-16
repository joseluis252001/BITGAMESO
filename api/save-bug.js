// ============================================================
//  BITGAMESO — api/save-bug.js
//  Función serverless de Vercel para guardar bugs en Supabase
// ============================================================

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service key (privada)

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const payload = req.body;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/bug_reports`, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':        SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Prefer':        'return=minimal',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Supabase error:', err);
            return res.status(500).json({ error: 'Database save failed' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Handler error:', err);
        return res.status(500).json({ error: err.message });
    }
}