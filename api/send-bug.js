// ============================================================
//  BITGAMESO — api/send-bug.js
//  Función serverless de Vercel para enviar bug reports
//  Las claves están en variables de entorno, NUNCA en el código
// ============================================================

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Leer claves desde variables de entorno de Vercel (privadas)
    const RESEND_KEY  = process.env.RESEND_API_KEY;
    const FROM_EMAIL  = process.env.FROM_EMAIL || 'noreply@bitgameso.com';
    const TO_EMAIL    = process.env.TO_EMAIL   || 'joseluis252001@hotmail.com';

    if (!RESEND_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const { subject, html } = req.body;

    if (!subject || !html) {
        return res.status(400).json({ error: 'Missing subject or html' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method:  'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_KEY}`,
                'Content-Type':  'application/json',
            },
            body: JSON.stringify({
                from:    `BITGAMESO Bugs <${FROM_EMAIL}>`,
                to:      [TO_EMAIL],
                subject,
                html,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Resend error:', err);
            return res.status(500).json({ error: 'Email sending failed' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Handler error:', err);
        return res.status(500).json({ error: err.message });
    }
}