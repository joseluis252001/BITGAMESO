// ============================================================
//  BITGAMESO — bug-report.js  v2
//  - Descripción texto (obligatorio)
//  - Captura de pantalla adjunta (opcional)
//  - Guarda en Supabase tabla bug_reports
//  - Envía correo HTML por Resend (con imagen inline si hay)
// ============================================================

const BUG_REPORT_TO  = 'joseluis252001@hotmail.com';
const BUG_RESEND_KEY = 're_g4CkTcXo_Hf3x4ywQAwa7r2QTPQhVXtDM';
const BUG_FROM_EMAIL = 'noreply@bitgameso.com';
const SUPABASE_URL   = 'https://pvugnjnnfyvkfqhnecpz.supabase.co';
const SUPABASE_KEY   = 'sb_publishable_i8guONbRc21Ska2Jy6VA-A_pV19OyiM';

// ── Estado interno ────────────────────────────────────────────
let _screenshotBase64 = null;
let _screenshotMime   = 'image/png';

// ── Capturar errores de consola automáticamente ───────────────
window._bugReportErrors = [];
const _origConsoleError = console.error.bind(console);
console.error = (...args) => {
    window._bugReportErrors.push({
        time: new Date().toISOString(),
        msg:  args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
    });
    if (window._bugReportErrors.length > 50) window._bugReportErrors.shift();
    _origConsoleError(...args);
};
window.addEventListener('error', (e) => {
    window._bugReportErrors.push({
        time: new Date().toISOString(),
        msg:  `${e.message} (${e.filename}:${e.lineno})`,
    });
});

// ── Recolectar contexto del jugador ──────────────────────────
const getBugContext = () => {
    let playerInfo = {};
    try {
        playerInfo = {
            usuario:  localStorage.getItem('bitgameso_sesion_activa') || 'invitado',
            userId:   localStorage.getItem('bitgameso_user_id') || null,
            monedas:  typeof state !== 'undefined' ? state.monedas : '—',
            mascota:  typeof state !== 'undefined' ? state.currentPet : '—',
            salud:    typeof state !== 'undefined' ? state.saludMascota : '—',
            victoria: typeof state !== 'undefined' ? (state.victoryAchieved ? 'Si' : 'No') : '—',
        };
    } catch(e) {}
    return {
        navegador:      navigator.userAgent,
        pantalla:       `${window.innerWidth}x${window.innerHeight}`,
        url:            window.location.href,
        fecha:          new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
        fechaISO:       new Date().toISOString(),
        erroresConsola: (window._bugReportErrors || []).slice(-10),
        ...playerInfo,
    };
};

// ── Leer imagen seleccionada ──────────────────────────────────
const readScreenshot = (file) => new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    if (!file.type.startsWith('image/')) { reject(new Error('El archivo debe ser una imagen.')); return; }
    if (file.size > 5 * 1024 * 1024)    { reject(new Error('La imagen no puede pesar mas de 5 MB.')); return; }
    const reader = new FileReader();
    reader.onload  = (e) => {
        const dataUrl = e.target.result;
        resolve({ base64: dataUrl.split(',')[1], mime: file.type, dataUrl });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

// ── Guardar en Supabase ───────────────────────────────────────
const saveToSupabase = async (desc, ctx, hasScreenshot) => {
    const payload = {
        user_id:          ctx.userId  || null,
        usuario:          ctx.usuario,
        descripcion:      desc,
        mascota:          String(ctx.mascota),
        monedas:          typeof ctx.monedas === 'number' ? ctx.monedas : null,
        salud:            typeof ctx.salud   === 'number' ? ctx.salud   : null,
        victoria:         ctx.victoria,
        navegador:        ctx.navegador,
        pantalla:         ctx.pantalla,
        url:              ctx.url,
        errores_consola:  JSON.stringify(ctx.erroresConsola),
        tiene_screenshot: hasScreenshot,
        created_at:       ctx.fechaISO,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/bug_reports`, {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'apikey':        SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer':        'return=minimal',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Supabase ${res.status}: ${txt}`);
    }
};

// ── Construir HTML del correo ─────────────────────────────────
const buildEmailHTML = (desc, ctx, screenshotDataUrl) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;background:#FFF5BA;margin:0;padding:20px;color:#333}
  .card{background:#fff;border-radius:16px;border:3px solid #CBA6F7;box-shadow:6px 6px 0 #CBA6F7;max-width:620px;margin:0 auto;overflow:hidden}
  .hdr{background:linear-gradient(135deg,#CBA6F7,#FFB6C1);padding:22px 28px}
  .hdr h1{margin:0;color:#fff;font-size:1.4rem}
  .hdr p{margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:0.82rem}
  .body{padding:22px 28px}
  .sec{margin-bottom:20px}
  .sec h3{margin:0 0 8px;font-size:0.92rem;color:#CBA6F7;border-bottom:2px solid #f0e7ff;padding-bottom:4px}
  .desc-box{background:#f9f0ff;border-left:4px solid #CBA6F7;padding:14px 16px;border-radius:0 10px 10px 0;font-size:0.93rem;line-height:1.6;white-space:pre-wrap}
  table{width:100%;border-collapse:collapse;font-size:0.83rem}
  td{padding:6px 8px;border-bottom:1px solid #f0e7ff}
  td:first-child{color:#999;width:40%}
  td:last-child{font-weight:600;color:#333;word-break:break-all}
  .err-list{background:#fff5f5;border-radius:8px;padding:10px 14px;font-size:0.73rem;font-family:monospace}
  .err-item{border-bottom:1px solid #fde;padding:3px 0;color:#c0392b}
  .no-err{color:#27ae60;font-size:0.8rem;margin:0}
  .ss-wrap{text-align:center;margin-top:8px}
  .ss-wrap img{max-width:100%;border-radius:10px;border:2px solid #CBA6F7}
  .no-ss{color:#bbb;font-size:0.8rem;font-style:italic;margin:4px 0}
  .footer{background:#f9f0ff;padding:12px 28px;text-align:center;font-size:0.72rem;color:#aaa}
</style></head>
<body>
<div class="card">
  <div class="hdr">
    <h1> Reporte de Bug — BITGAMESO</h1>
    <p>${ctx.fecha} &nbsp;·&nbsp; Usuario: <b>${ctx.usuario}</b></p>
  </div>
  <div class="body">
    <div class="sec">
      <h3> Descripcion</h3>
      <div class="desc-box">${desc.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    </div>
    <div class="sec">
      <h3> Captura de pantalla</h3>
      ${screenshotDataUrl
        ? `<div class="ss-wrap"><img src="${screenshotDataUrl}" alt="Captura del bug"></div>`
        : `<p class="no-ss">El usuario no adjunto captura.</p>`}
    </div>
    <div class="sec">
      <h3> Estado del jugador</h3>
      <table>
        <tr><td>Usuario</td><td>${ctx.usuario}</td></tr>
        <tr><td>Monedas</td><td>${typeof ctx.monedas === 'number' ? ctx.monedas.toLocaleString('es-MX',{maximumFractionDigits:2}) : ctx.monedas}</td></tr>
        <tr><td>Mascota activa</td><td>${ctx.mascota}</td></tr>
        <tr><td>Salud mascota</td><td>${ctx.salud}%</td></tr>
        <tr><td>Victoria</td><td>${ctx.victoria}</td></tr>
      </table>
    </div>
    <div class="sec">
      <h3> Info tecnica</h3>
      <table>
        <tr><td>Pantalla</td><td>${ctx.pantalla}</td></tr>
        <tr><td>URL</td><td>${ctx.url}</td></tr>
        <tr><td>Navegador</td><td>${ctx.navegador}</td></tr>
      </table>
    </div>
    <div class="sec">
      <h3>⚠️ Errores de consola</h3>
      ${ctx.erroresConsola.length > 0
        ? `<div class="err-list">${ctx.erroresConsola.map(e =>
            `<div class="err-item"><span style="color:#999">${e.time.slice(11,19)}</span> — ${e.msg.slice(0,220)}</div>`
          ).join('')}</div>`
        : '<p class="no-err"> Sin errores registrados en esta sesion</p>'}
    </div>
  </div>
  <div class="footer">Enviado automaticamente desde BITGAMESO · bitgameso.com</div>
</div>
</body></html>`;

// ── Enviar por Resend ─────────────────────────────────────────
const sendViaResend = async (desc, ctx, screenshotDataUrl) => {
    const res = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${BUG_RESEND_KEY}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({
            from:    `BITGAMESO Bugs <${BUG_FROM_EMAIL}>`,
            to:      [BUG_REPORT_TO],
            subject: ` Bug de ${ctx.usuario} — ${ctx.fecha}`,
            html:    buildEmailHTML(desc, ctx, screenshotDataUrl),
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend ${res.status}: ${err}`);
    }
};

// ── Estilos del modal ─────────────────────────────────────────
const injectBugStyles = () => {
    if (document.getElementById('bug-report-styles')) return;
    const s = document.createElement('style');
    s.id = 'bug-report-styles';
    s.textContent = `
    .btn-bug-report {
        display:flex;align-items:center;gap:8px;width:100%;padding:9px 14px;
        background:none;border:none;border-top:1px solid #f0e7ff;
        color:#e74c3c;font-family:'Poppins',sans-serif;font-size:0.82rem;font-weight:700;
        cursor:pointer;text-align:left;border-radius:0 0 12px 12px;transition:background 0.2s;margin:0;
    }
    .btn-bug-report:hover{background:#fff5f5;transform:none;}
    .btn-bug-report img{width:16px;height:16px;object-fit:contain;}
    #modal-bug-report{
        position:fixed;inset:0;background:rgba(0,0,0,0.48);z-index:10000;
        display:flex;align-items:center;justify-content:center;padding:16px;
    }
    .bug-modal-box{
        background:#fff;border-radius:20px;border:3px solid #CBA6F7;
        box-shadow:8px 8px 0 #CBA6F7;width:100%;max-width:500px;
        font-family:'Poppins',sans-serif;overflow:hidden;
        max-height:92vh;display:flex;flex-direction:column;
    }
    .bug-modal-header{
        background:linear-gradient(135deg,#CBA6F7,#FFB6C1);
        padding:18px 22px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;
    }
    .bug-modal-header h3{margin:0;color:#fff;font-family:'Fredoka',sans-serif;font-size:1.25rem;}
    .bug-modal-close{
        background:rgba(255,255,255,0.3);border:none;color:#fff;
        width:30px;height:30px;border-radius:50%;font-size:1rem;font-weight:700;cursor:pointer;
        display:flex;align-items:center;justify-content:center;padding:0;line-height:1;transition:background 0.2s;
    }
    .bug-modal-close:hover{background:rgba(255,255,255,0.5);transform:none;}
    .bug-modal-body{padding:18px 22px;overflow-y:auto;flex:1;}
    .bug-modal-body > p{font-size:0.82rem;color:#777;margin:0 0 12px;}
    .bug-field-label{display:block;font-size:0.78rem;font-weight:700;color:#555;margin-bottom:5px;margin-top:12px;}
    #bug-description{
        width:100%;min-height:100px;padding:12px;border:2px solid #CBA6F7;border-radius:12px;
        font-family:'Poppins',sans-serif;font-size:0.86rem;resize:vertical;outline:none;
        box-sizing:border-box;color:#333;transition:border-color 0.2s;
    }
    #bug-description:focus{border-color:#FFB6C1;}
    .bug-screenshot-area{
        margin-top:6px;border:2px dashed #CBA6F7;border-radius:12px;
        padding:14px;text-align:center;cursor:pointer;
        transition:background 0.2s,border-color 0.2s;position:relative;
    }
    .bug-screenshot-area:hover{background:#f9f0ff;border-color:#FFB6C1;}
    .bug-screenshot-area input[type="file"]{
        position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
    }
    .bug-ss-placeholder{font-size:0.8rem;color:#aaa;pointer-events:none;}
    .bug-ss-placeholder span{font-size:1.4rem;display:block;margin-bottom:4px;}
    .bug-ss-preview{display:none;position:relative;}
    .bug-ss-preview img{max-width:100%;max-height:140px;border-radius:8px;border:2px solid #CBA6F7;object-fit:contain;}
    .bug-ss-remove{
        position:absolute;top:-8px;right:-8px;background:#e74c3c;color:#fff;border:none;
        width:22px;height:22px;border-radius:50%;font-size:0.75rem;font-weight:700;cursor:pointer;
        display:flex;align-items:center;justify-content:center;z-index:2;padding:0;line-height:1;
    }
    .bug-ss-remove:hover{background:#c0392b;transform:none;}
    .bug-ss-name{font-size:0.72rem;color:#888;margin-top:4px;}
    .bug-auto-info{
        margin-top:12px;background:#f9f0ff;border-radius:10px;
        padding:9px 13px;font-size:0.73rem;color:#888;line-height:1.8;
    }
    .bug-auto-info b{color:#CBA6F7;}
    .bug-status{font-size:0.82rem;min-height:16px;margin-top:10px;text-align:center;font-weight:700;}
    .bug-status.ok{color:#27ae60;}
    .bug-status.error{color:#e74c3c;}
    .bug-status.loading{color:#CBA6F7;}
    .bug-modal-footer{
        padding:12px 22px 18px;display:flex;gap:10px;justify-content:flex-end;
        flex-shrink:0;border-top:1px solid #f0e7ff;
    }
    #btn-send-bug{
        background:linear-gradient(135deg,#CBA6F7,#FFB6C1);color:#fff;border:none;
        padding:11px 22px;border-radius:12px;font-family:'Poppins',sans-serif;
        font-weight:700;font-size:0.88rem;cursor:pointer;transition:opacity 0.2s,transform 0.2s;
    }
    #btn-send-bug:hover{opacity:0.9;transform:translateY(-2px);}
    #btn-send-bug:disabled{opacity:0.55;cursor:not-allowed;transform:none;}
    #btn-cancel-bug{
        background:#f0e7ff;color:#CBA6F7;border:none;padding:11px 16px;border-radius:12px;
        font-family:'Poppins',sans-serif;font-weight:700;font-size:0.88rem;cursor:pointer;transition:background 0.2s;
    }
    #btn-cancel-bug:hover{background:#e0d0ff;transform:none;}
    @media(max-width:480px){
        .bug-modal-box{border-radius:16px;max-height:96vh;}
        .bug-modal-header,.bug-modal-body,.bug-modal-footer{padding-left:14px;padding-right:14px;}
    }`;
    document.head.appendChild(s);
};

// ── Abrir modal ───────────────────────────────────────────────
window.openBugReport = () => {
    const dropdown = document.getElementById('settings-dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';

    const existing = document.getElementById('modal-bug-report');
    if (existing) {
        existing.style.display = 'flex';
        const ta = document.getElementById('bug-description');
        if (ta) ta.value = '';
        const st = document.getElementById('bug-status');
        if (st) { st.textContent = ''; st.className = 'bug-status'; }
        resetScreenshot();
        return;
    }

    const ctx   = getBugContext();
    const modal = document.createElement('div');
    modal.id    = 'modal-bug-report';
    modal.innerHTML = `
        <div class="bug-modal-box">
            <div class="bug-modal-header">
                <h3> Reportar Bug</h3>
                <button class="bug-modal-close" onclick="closeBugReport()">✕</button>
            </div>
            <div class="bug-modal-body">
                <p>¿Encontraste algo raro? Cuentanos que paso y adjunta una captura si puedes.</p>

                <label class="bug-field-label" for="bug-description">
                    ¿Que paso? <span style="color:#e74c3c">*</span>
                </label>
                <textarea id="bug-description"
                    placeholder="Ej: Presione Enviar y la manzana desaparecio pero mi mascota no gano salud..."></textarea>

                <label class="bug-field-label">
                     Captura de pantalla
                    <span style="color:#aaa;font-weight:400">(opcional)</span>
                </label>
                <div class="bug-screenshot-area" id="bug-ss-area">
                    <input type="file" id="bug-ss-input" accept="image/*">
                    <div class="bug-ss-placeholder" id="bug-ss-placeholder">
                        <span></span>
                        Haz clic aqui o arrastra una imagen<br>
                        <small style="color:#ccc">PNG, JPG, WEBP · max 5 MB</small>
                    </div>
                    <div class="bug-ss-preview" id="bug-ss-preview">
                        <button class="bug-ss-remove" id="bug-ss-remove" onclick="removeScreenshot(event)">✕</button>
                        <img id="bug-ss-thumb" src="" alt="Captura">
                        <div class="bug-ss-name" id="bug-ss-name"></div>
                    </div>
                </div>

                <div class="bug-status" id="bug-status"></div>

                <div class="bug-auto-info">
                    📎 Se adjunta automaticamente:
                    <b>${ctx.usuario}</b> · pantalla <b>${ctx.pantalla}</b> ·
                    mascota <b>${ctx.mascota}</b> ·
                    monedas <b>${typeof ctx.monedas === 'number'
                        ? ctx.monedas.toLocaleString('es-MX',{maximumFractionDigits:0})
                        : ctx.monedas}</b> ·
                    errores capturados: <b>${ctx.erroresConsola.length}</b>
                </div>
            </div>
            <div class="bug-modal-footer">
                <button id="btn-cancel-bug" onclick="closeBugReport()">Cancelar</button>
                <button id="btn-send-bug"   onclick="submitBugReport()"> Enviar reporte</button>
            </div>
        </div>`;
    document.body.appendChild(modal);

    document.getElementById('bug-ss-input').addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) processScreenshotFile(file);
    });

    const area = document.getElementById('bug-ss-area');
    area.addEventListener('dragover',  (e) => { e.preventDefault(); area.style.background = '#f0e7ff'; });
    area.addEventListener('dragleave', ()  => { area.style.background = ''; });
    area.addEventListener('drop', (e) => {
        e.preventDefault(); area.style.background = '';
        const file = e.dataTransfer?.files?.[0];
        if (file) processScreenshotFile(file);
    });

    modal.addEventListener('click', (e) => { if (e.target === modal) closeBugReport(); });
    setTimeout(() => document.getElementById('bug-description')?.focus(), 100);
};

// ── Procesar imagen ───────────────────────────────────────────
const processScreenshotFile = async (file) => {
    const status = document.getElementById('bug-status');
    try {
        const result      = await readScreenshot(file);
        _screenshotBase64 = result.base64;
        _screenshotMime   = result.mime;
        document.getElementById('bug-ss-placeholder').style.display = 'none';
        const preview = document.getElementById('bug-ss-preview');
        preview.style.display = 'block';
        document.getElementById('bug-ss-thumb').src = result.dataUrl;
        document.getElementById('bug-ss-name').textContent =
            `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        if (status) { status.textContent = ''; status.className = 'bug-status'; }
    } catch (err) {
        if (status) {
            status.textContent = ` ${err.message}`;
            status.className   = 'bug-status error';
        }
    }
};

window.removeScreenshot = (e) => { e?.stopPropagation(); resetScreenshot(); };

const resetScreenshot = () => {
    _screenshotBase64 = null;
    _screenshotMime   = 'image/png';
    const input = document.getElementById('bug-ss-input');
    if (input) input.value = '';
    const ph = document.getElementById('bug-ss-placeholder');
    const pv = document.getElementById('bug-ss-preview');
    const th = document.getElementById('bug-ss-thumb');
    if (ph) ph.style.display = '';
    if (pv) pv.style.display = 'none';
    if (th) th.src = '';
};

// ── Cerrar modal ──────────────────────────────────────────────
window.closeBugReport = () => {
    const modal = document.getElementById('modal-bug-report');
    if (modal) modal.style.display = 'none';
};

// ── Enviar reporte ────────────────────────────────────────────
window.submitBugReport = async () => {
    const desc   = (document.getElementById('bug-description')?.value || '').trim();
    const status = document.getElementById('bug-status');
    const btn    = document.getElementById('btn-send-bug');

    if (!desc) {
        status.textContent = ' Por favor describe el bug antes de enviar.';
        status.className   = 'bug-status error';
        return;
    }

    btn.disabled       = true;
    status.textContent = ' Guardando y enviando...';
    status.className   = 'bug-status loading';

    const ctx              = getBugContext();
    const screenshotDataUrl = _screenshotBase64
        ? `data:${_screenshotMime};base64,${_screenshotBase64}`
        : null;

    let supabaseOk = false;
    let resendOk   = false;

    // 1 — Supabase
    try {
        await saveToSupabase(desc, ctx, !!_screenshotBase64);
        supabaseOk = true;
    } catch (e) {
        console.warn('Supabase bug_reports error:', e.message);
    }

    // 2 — Resend
    try {
        await sendViaResend(desc, ctx, screenshotDataUrl);
        resendOk = true;
    } catch (e) {
        console.warn('Resend bug report error:', e.message);
    }

    if (resendOk || supabaseOk) {
        status.textContent = resendOk
            ? ' Reporte enviado. Gracias por ayudarnos a mejorar BITGAMESO.'
            : ' Reporte guardado (correo temporalmente no disponible).';
        status.className = 'bug-status ok';
        const ta = document.getElementById('bug-description');
        if (ta) ta.value = '';
        resetScreenshot();
        setTimeout(() => closeBugReport(), 3000);
    } else {
        status.textContent = ' No se pudo enviar. Intenta en un momento.';
        status.className   = 'bug-status error';
        btn.disabled = false;
    }
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    injectBugStyles();

    const dropdown = document.getElementById('settings-dropdown-menu');
    if (dropdown) {
        const btn     = document.createElement('button');
        btn.className = 'btn-bug-report';
        btn.onclick   = () => window.openBugReport();
        btn.innerHTML = `<img src="../assets/arrows/X-Error-128.png" alt="Bug"> Reportar un bug`;
        dropdown.appendChild(btn);
    }

    console.log('BITGAMESO Bug Report v2 listo ');
});