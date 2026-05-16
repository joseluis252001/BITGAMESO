// ============================================================
//  BITGAMESO — game-sync.js
//  Sincroniza el progreso usando /api/game-save (clave segura en servidor)
//  Las claves de Supabase ya NO están aquí
// ============================================================

// ── Estado de sincronización ─────────────────────────────────
let _syncInterval  = null;
let _lastSyncedAt  = null;
let _userId        = null;
let _syncPending   = false;

const getUserId = async () => {
    if (_userId) return _userId;
    const stored = localStorage.getItem('bitgameso_user_id');
    if (stored) { _userId = stored; return _userId; }
    return null;
};

// ============================================================
//  GUARDAR — usa /api/game-save
// ============================================================
window.syncSaveToCloud = async (saveData) => {
    try {
        const userId = await getUserId();
        if (!userId) return;

        const res = await fetch('/api/game-save', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: userId, save_data: saveData }),
        });

        if (!res.ok) {
            console.warn('Error al sincronizar:', await res.text());
        } else {
            _lastSyncedAt = new Date();
            _syncPending  = false;
            actualizarIndicador('synced');
        }
    } catch (e) {
        console.warn('syncSaveToCloud error:', e);
        actualizarIndicador('error');
    }
};

// ============================================================
//  CARGAR — usa /api/game-save
// ============================================================
window.syncLoadFromCloud = async () => {
    try {
        const userId = await getUserId();
        if (!userId) return null;

        const res  = await fetch(`/api/game-save?user_id=${userId}`);
        const data = await res.json();

        if (!data) return null;
        return data.save_data;
    } catch (e) {
        console.warn('syncLoadFromCloud error:', e);
        return null;
    }
};

// ============================================================
//  SINCRONIZACIÓN AUTOMÁTICA cada 30 segundos
// ============================================================
window.startCloudSync = () => {
    if (_syncInterval) clearInterval(_syncInterval);
    _syncInterval = setInterval(() => {
        if (_syncPending) {
            const sesion  = localStorage.getItem('bitgameso_sesion_activa') || null;
            const saveKey = sesion ? `bitgameso_save_${sesion}` : null;
            if (saveKey) {
                const raw = localStorage.getItem(saveKey);
                if (raw) window.syncSaveToCloud(raw);
            }
        }
    }, 30000);
};

window.markSyncPending = () => { _syncPending = true; };

// ============================================================
//  INDICADOR VISUAL
// ============================================================
const actualizarIndicador = (estado) => {
    const el = document.getElementById('sync-indicator');
    if (!el) return;
    const estados = {
        synced:  { text: 'Guardado',        color: '#B2F2BB' },
        pending: { text: 'Sincronizando...', color: '#FFB6C1' },
        error:   { text: 'Sin conexion',     color: '#f38ba8' },
        offline: { text: 'Modo offline',     color: '#ccc'    },
    };
    const cfg = estados[estado] || estados.offline;
    el.textContent      = cfg.text;
    el.style.background = cfg.color;
    el.style.opacity    = '1';
    if (estado === 'synced') {
        setTimeout(() => { if (el) el.style.opacity = '0.5'; }, 3000);
    }
};

const crearIndicador = () => {
    if (document.getElementById('sync-indicator')) return;
    const el       = document.createElement('div');
    el.id          = 'sync-indicator';
    el.textContent = 'Conectado';
    el.style.cssText = `
        position:fixed; bottom:12px; left:12px;
        background:#B2F2BB; color:#2d6a4f;
        font-size:11px; font-weight:700;
        font-family:'Poppins',sans-serif;
        padding:5px 10px; border-radius:20px;
        z-index:8000; opacity:0.7;
        transition:opacity 0.5s; pointer-events:none;
    `;
    document.body.appendChild(el);
};

// ============================================================
//  INIT
// ============================================================
window.initCloudSync = async () => {
    crearIndicador();
    actualizarIndicador('pending');

    const cloudSave = await window.syncLoadFromCloud();
    const sesion    = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    const saveKey   = `bitgameso_save_${sesion}`;
    const localSave = localStorage.getItem(saveKey);

    if (cloudSave) {
        if (localSave) {
            try {
                const cloud = JSON.parse(cloudSave);
                const local = JSON.parse(localSave);

                // Comparar por timestamp — gana el más reciente
                const cloudTime = new Date(cloud.savedAt || cloud.timestamp || 0).getTime();
                const localTime = new Date(local.savedAt || local.timestamp || 0).getTime();

                if (cloudTime >= localTime) {
                    // La nube es más reciente — usar nube
                    localStorage.setItem(saveKey, cloudSave);
                    actualizarIndicador('synced');
                } else {
                    // Local es más reciente — subir local a la nube
                    await window.syncSaveToCloud(localSave);
                }
            } catch(e) {
                // Error parseando — usar nube por defecto
                localStorage.setItem(saveKey, cloudSave);
            }
        } else {
            // No hay local — usar nube
            localStorage.setItem(saveKey, cloudSave);
        }
    } else if (localSave) {
        // No hay nube pero sí local — subir local
        await window.syncSaveToCloud(localSave);
    }
    actualizarIndicador('synced');
    window.startCloudSync();
};

// ============================================================
//  Guardar al cerrar la página (sin claves expuestas)
// ============================================================
window.addEventListener('beforeunload', () => {
    const sesion  = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    const saveKey = `bitgameso_save_${sesion}`;
    const raw     = localStorage.getItem(saveKey);
    const userId  = localStorage.getItem('bitgameso_user_id');
    if (raw && userId) {
        // Usar sendBeacon a nuestra propia API segura
        navigator.sendBeacon('/api/game-save', new Blob(
            [JSON.stringify({ user_id: userId, save_data: raw })],
            { type: 'application/json' }
        ));
    }
});

console.log('BITGAMESO Cloud Sync (seguro) cargado');