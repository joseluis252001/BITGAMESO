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

// ── Estado de sincronización ─────────────────────────────────
let _syncInterval  = null;
let _lastSyncedAt  = null;
let _userId        = null;
let _syncPending   = false;

// ── Obtener userId desde Supabase session ────────────────────
const getUserId = async () => {
    if (_userId) return _userId;
    // Primero intentar desde localStorage (guardado en inico.js)
    const stored = localStorage.getItem('bitgameso_user_id');
    if (stored) { _userId = stored; return _userId; }
    // Si no, consultar la sesión activa de Supabase
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
        _userId = data.session.user.id;
        localStorage.setItem('bitgameso_user_id', _userId);
    }
    return _userId;
};

// ============================================================
//  GUARDAR en Supabase
// ============================================================
window.syncSaveToCloud = async (saveData) => {
    try {
        const userId = await getUserId();
        if (!userId) return; // No hay sesión, solo guardar local

        const { error } = await supabase
            .from('game_saves')
            .upsert({
                user_id:    userId,
                save_data:  saveData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.warn('Error al sincronizar con Supabase:', error.message);
        } else {
            _lastSyncedAt = new Date();
            _syncPending  = false;
            actualizarIndicador('synced');
            console.log('Progreso guardado en la nube:', _lastSyncedAt.toLocaleTimeString());
        }
    } catch (e) {
        console.warn('syncSaveToCloud error:', e);
        actualizarIndicador('error');
    }
};

// ============================================================
//  CARGAR desde Supabase
//  Devuelve el save_data (string JSON) o null si no hay guardado
// ============================================================
window.syncLoadFromCloud = async () => {
    try {
        const userId = await getUserId();
        if (!userId) return null;

        const { data, error } = await supabase
            .from('game_saves')
            .select('save_data, updated_at')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.warn('Error al cargar desde Supabase:', error.message);
            return null;
        }

        if (!data) {
            console.log('Sin guardado en la nube, usando localStorage.');
            return null;
        }

        console.log('Progreso cargado desde la nube:', data.updated_at);
        return data.save_data; // string JSON
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
        // Solo sincronizar si hay cambios pendientes
        if (_syncPending) {
            const saveKey = localStorage.getItem('bitgameso_sesion_activa')
                ? `bitgameso_save_${localStorage.getItem('bitgameso_sesion_activa')}`
                : null;
            if (saveKey) {
                const raw = localStorage.getItem(saveKey);
                if (raw) window.syncSaveToCloud(raw);
            }
        }
    }, 30000); // cada 30 segundos

    console.log('Sincronización automática iniciada (cada 30s)');
};

// Marcar que hay cambios pendientes de sincronizar
window.markSyncPending = () => { _syncPending = true; };

// ============================================================
//  INDICADOR VISUAL de estado de sincronización
// ============================================================
const actualizarIndicador = (estado) => {
    const el = document.getElementById('sync-indicator');
    if (!el) return;
    const estados = {
        synced:  { text: 'Guardado', color: '#a8e6cf' },
        pending: { text: 'Sincronizando...', color: '#FFB6C1' },
        error:   { text: 'Sin conexión', color: '#f38ba8' },
        offline: { text: 'Modo offline', color: '#ccc' },
    };
    const cfg = estados[estado] || estados.offline;
    el.textContent        = cfg.text;
    el.style.background   = cfg.color;
    el.style.opacity      = '1';
    // Desvanecer después de 3s si es "synced"
    if (estado === 'synced') {
        setTimeout(() => { if (el) el.style.opacity = '0.5'; }, 3000);
    }
};

// Crear el indicador visual en el DOM
const crearIndicador = () => {
    if (document.getElementById('sync-indicator')) return;
    const el       = document.createElement('div');
    el.id          = 'sync-indicator';
    el.textContent = ' Conectado';
    el.style.cssText = `
        position: fixed;
        bottom: 12px;
        left: 12px;
        background: #a8e6cf;
        color: #2d6a4f;
        font-size: 11px;
        font-weight: 700;
        font-family: 'Poppins', sans-serif;
        padding: 5px 10px;
        border-radius: 20px;
        z-index: 8000;
        opacity: 0.7;
        transition: opacity 0.5s;
        pointer-events: none;
    `;
    document.body.appendChild(el);
};

// ============================================================
//  INIT — se llama desde game.js al cargar
// ============================================================
window.initCloudSync = async () => {
    crearIndicador();
    actualizarIndicador('pending');

    // Intentar cargar desde la nube
    const cloudSave = await window.syncLoadFromCloud();

    if (cloudSave) {
        // Comparar con localStorage: usar el más reciente
        const sesion  = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
        const saveKey = `bitgameso_save_${sesion}`;
        const localSave = localStorage.getItem(saveKey);

        if (localSave) {
            try {
                const cloud = JSON.parse(cloudSave);
                const local = JSON.parse(localSave);
                // Usar el que tenga más monedas como heurística de "más reciente"
                // (en un juego real usarías timestamp)
                if ((cloud.monedas || 0) >= (local.monedas || 0)) {
                    localStorage.setItem(saveKey, cloudSave);
                    console.log(' Save de la nube aplicado (más reciente)');
                } else {
                    console.log(' Save local mantenido (más reciente)');
                }
            } catch(e) {
                localStorage.setItem(saveKey, cloudSave);
            }
        } else {
            // No hay save local, usar el de la nube
            const sesion  = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
            localStorage.setItem(`bitgameso_save_${sesion}`, cloudSave);
            console.log(' Save de la nube cargado (no había local)');
        }
    }

    actualizarIndicador('synced');
    window.startCloudSync();
};

// ============================================================
//  Guardar al cerrar/salir de la página
// ============================================================
window.addEventListener('beforeunload', () => {
    const sesion  = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    const saveKey = `bitgameso_save_${sesion}`;
    const raw     = localStorage.getItem(saveKey);
    if (raw) {
        // Usar sendBeacon para garantizar que se envíe aunque la página cierre
        // Como Supabase no soporta sendBeacon directamente, usamos fetch con keepalive
        const userId = localStorage.getItem('bitgameso_user_id');
        if (userId) {
            fetch(`${SUPABASE_URL}/rest/v1/game_saves`, {
                method:  'POST',
                keepalive: true,
                headers: {
                    'Content-Type':  'application/json',
                    'apikey':        SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer':        'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    user_id:    userId,
                    save_data:  raw,
                    updated_at: new Date().toISOString()
                })
            });
        }
    }
});

console.log(' BITGAMESO Cloud Sync cargado ');