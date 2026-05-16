// ============================================================
//  BITGAMESO — api/game-save.js
//  Función serverless para guardar y cargar el progreso
//  Protege la clave de Supabase del frontend
// ============================================================

export default async function handler(req, res) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const headers = {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
    };

    // GET — cargar guardado
    if (req.method === 'GET') {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/game_saves?user_id=eq.${user_id}&select=save_data,updated_at`,
                { headers }
            );
            const data = await response.json();
            return res.status(200).json(data[0] || null);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // POST — guardar progreso
    if (req.method === 'POST') {
        const { user_id, save_data } = req.body;
        if (!user_id || !save_data) {
            return res.status(400).json({ error: 'Missing user_id or save_data' });
        }

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/game_saves`, {
                method: 'POST',
                headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify({
                    user_id,
                    save_data,
                    updated_at: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                return res.status(500).json({ error: err });
            }
            return res.status(200).json({ ok: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}