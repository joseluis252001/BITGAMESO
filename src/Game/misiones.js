// ============================================================
//  BITGAMESO — misiones.js
//  Sistema completo de misiones con 4 categorías
//  Normal | Rara | Épica | Legendaria
// ============================================================

// ── Colores por categoría ────────────────────────────────────
const MISION_COLORES = {
    normal:     { bg: '#B2F2BB', border: '#52b788', text: '#2d6a4f', label: 'Normal' },
    rara:       { bg: '#A0E7E5', border: '#38b2ac', text: '#234e52', label: 'Rara' },
    epica:      { bg: '#FFB6C1', border: '#e05c8a', text: '#7d1c2e', label: 'Épica' },
    legendaria: { bg: '#FFF5BA', border: '#d4af37', text: '#7d6608', label: 'Legendaria' },
};

// ── Pool de misiones por categoría ───────────────────────────
const MISIONES_POOL = {
    normal: [
        { id: 'n_comprar_accion',   desc: 'Compra una acción del mercado',           tipo: 'comprar_accion',   meta: 1 },
        { id: 'n_vender_accion',    desc: 'Vende una acción del mercado',             tipo: 'vender_accion',    meta: 1 },
        { id: 'n_comprar_bono',     desc: 'Compra un bono (Fintech, Energía o Biotech)', tipo: 'comprar_bono', meta: 1 },
        { id: 'n_vender_bono',      desc: 'Vende un bono',                            tipo: 'vender_bono',      meta: 1 },
        { id: 'n_alimentar',        desc: 'Dale de comer a tu mascota',               tipo: 'alimentar',        meta: 1 },
        { id: 'n_monedas',          desc: 'Adquiere 1,000 monedas',                   tipo: 'ganar_monedas',    meta: 1000 },
    ],
    rara: [
        { id: 'r_mascota_100',      desc: 'Sube una mascota al 100% de vida',         tipo: 'salud_100',        meta: 100 },
        { id: 'r_4_categorias',     desc: 'Compra 4 acciones de diferentes categorías', tipo: 'diversificar',  meta: 4 },
        { id: 'r_vender_4_cat',     desc: 'Vende 4 acciones de diferentes categorías', tipo: 'vender_diverso', meta: 4 },
        { id: 'r_monedas',          desc: 'Adquiere 10,000 monedas',                  tipo: 'ganar_monedas',    meta: 10000 },
        { id: 'r_sin_perder_vida',  desc: 'No pierdas vida de tu mascota por 1 minuto', tipo: 'sobrevivir',    meta: 60 },
    ],
    epica: [
        { id: 'e_monedas',          desc: 'Consigue más de 100,000 monedas de capital total', tipo: 'capital_total', meta: 100000 },
        { id: 'e_rescate',          desc: 'Baja tu mascota a menos del 40% de vida y luego súbela al 100% en menos de 1 minuto', tipo: 'rescate_mascota', meta: 1 },
        { id: 'e_combinar',         desc: 'Combina 3 o más comidas',                  tipo: 'combinar_comida',  meta: 3 },
        { id: 'e_doblar_accion',    desc: 'Compra una acción cayendo y véndela ganando más del doble', tipo: 'doblar_accion', meta: 1 },
    ],
    legendaria: [
        { id: 'l_recuperar',        desc: 'Pierde más de 100,000 en activos y recupera el doble', tipo: 'recuperar_perdida', meta: 1 },
        { id: 'l_vender_todo',      desc: 'Vende todas tus acciones en menos de 30 segundos sin alimentar a tu mascota', tipo: 'vender_todo_rapido', meta: 1 },
        { id: 'l_doblar_grande',    desc: 'Gana el doble o más de una acción comprada',  tipo: 'doblar_accion',    meta: 1 },
        { id: 'l_millonario',       desc: 'Consigue más de 1,000,000,000 de monedas',    tipo: 'capital_total',    meta: 1000000000 },
    ],
};

// ── Estado global de misiones ────────────────────────────────
window._misiones = {
    activas:       [],   // hasta 5 misiones activas
    completadas:   [],   // IDs de misiones ya completadas (historial)
    descarteCooldown: {},// { tipo: timestamp } cooldown 2hrs por tipo
    _sobrevivirTimer: null,
    _rescateData:  null,
    _venderTodoTimer: null,
    _monedasGanadas: 0,  // acumulador de monedas ganadas en sesión (sin contar EXP)
    _vendidosDiversos: new Set(),
};

// ── Recompensas por categoría ────────────────────────────────
const generarRecompensa = (cat) => {
    if (cat === 'normal') {
        const tipo = ['monedas','verdura','comida_random'][Math.floor(Math.random()*3)];
        return {
            tipo,
            monedas: tipo === 'monedas' ? Math.floor(Math.random()*401)+100 : 0,
        };
    }
    if (cat === 'rara') {
        const tipo = ['monedas','comida_elegir','codigo'][Math.floor(Math.random()*3)];
        return {
            tipo,
            monedas: tipo === 'monedas' ? Math.floor(Math.random()*4001)+1000 : 0,
        };
    }
    if (cat === 'epica') {
        const tipo = ['monedas','comida_elegir_3','mascota_vida'][Math.floor(Math.random()*3)];
        return {
            tipo,
            monedas: tipo === 'monedas' ? Math.floor(Math.random()*40001)+10000 : 0,
        };
    }
    if (cat === 'legendaria') {
        const tipo = ['monedas','mascota_desbloquear'][Math.floor(Math.random()*2)];
        return {
            tipo,
            monedas: tipo === 'monedas' ? Math.floor(Math.random()*400001)+100000 : 0,
        };
    }
};

// ── Generar una misión aleatoria ─────────────────────────────
const generarMision = (catForzada = null) => {
    const cats = ['normal','normal','normal','rara','rara','epica','legendaria'];
    const cat  = catForzada || cats[Math.floor(Math.random()*cats.length)];
    const pool = MISIONES_POOL[cat];
    const tmpl = pool[Math.floor(Math.random()*pool.length)];
    return {
        uid:       `${tmpl.id}_${Date.now()}`,
        id:        tmpl.id,
        cat,
        desc:      tmpl.desc,
        tipo:      tmpl.tipo,
        meta:      tmpl.meta,
        progreso:  0,
        completada: false,
        recompensa: generarRecompensa(cat),
        // datos internos para tracking
        _startHealth: null,
        _startMonedas: null,
        _activos_vendidos: [],
    };
};

// ── Inicializar sistema de misiones ──────────────────────────
window.initMisionesSystem = () => {
    const m = window._misiones;
    // Cargar desde localStorage
    const saved = localStorage.getItem('bitgameso_misiones');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            m.activas           = data.activas       || [];
            m.completadas       = data.completadas    || [];
            m.descarteCooldown  = data.descarteCooldown || {};
        } catch(e) {}
    }
    // Rellenar hasta 5 misiones
    while (m.activas.length < 5) {
        m.activas.push(generarMision());
    }
    // Iniciar timers de tracking
    iniciarTrackingMisiones();
    guardarMisiones();
    console.log('BITGAMESO Misiones cargado ✅');
};

// ── Guardar misiones en localStorage ────────────────────────
const guardarMisiones = () => {
    const m = window._misiones;
    localStorage.setItem('bitgameso_misiones', JSON.stringify({
        activas:          m.activas,
        completadas:      m.completadas,
        descarteCooldown: m.descarteCooldown,
    }));
};

// ── Tracking automático de misiones ──────────────────────────
const iniciarTrackingMisiones = () => {
    const m = window._misiones;
    // Timer de sobrevivir sin perder vida (1 tick/seg)
    setInterval(() => {
        if (window._isPaused) return;
        m.activas.forEach(mis => {
            if (mis.completada || mis.tipo !== 'sobrevivir') return;
            if (mis._startHealth === null) {
                mis._startHealth   = state?.saludMascota || 100;
                mis._timerSobrevivir = 0;
            }
            if (state?.saludMascota >= mis._startHealth) {
                mis._timerSobrevivir = (mis._timerSobrevivir || 0) + 1;
                mis.progreso = mis._timerSobrevivir;
                if (mis._timerSobrevivir >= mis.meta) completarMision(mis);
            } else {
                // Perdió vida — reiniciar
                mis._startHealth      = state?.saludMascota;
                mis._timerSobrevivir  = 0;
                mis.progreso          = 0;
            }
        });
        // Capital total
        m.activas.forEach(mis => {
            if (mis.completada || mis.tipo !== 'capital_total') return;
            const capital = typeof window.getBalance === 'function'
                ? window.getBalance().capital : (state?.monedas || 0);
            mis.progreso = capital;
            if (capital >= mis.meta) completarMision(mis);
        });
    }, 1000);
};

// ── Evento: acción comprada ───────────────────────────────────
window.misionOnComprar = (symbol, tipo) => {
    const m = window._misiones;
    const esBono = typeof window.getAssetCategory === 'function'
        ? window.getAssetCategory(tipo) === 'prestamo' : false;
    m.activas.forEach(mis => {
        if (mis.completada) return;
        if (mis.tipo === 'comprar_accion' && !esBono) avanzarMision(mis, 1);
        if (mis.tipo === 'comprar_bono'   &&  esBono) avanzarMision(mis, 1);
        if (mis.tipo === 'diversificar') {
            const sectores = new Set(Array.from(state.portfolio.values()).map(p=>p.type));
            mis.progreso = sectores.size;
            if (sectores.size >= mis.meta) completarMision(mis);
        }
        // Tracking de acción cayendo para doblar
        if (mis.tipo === 'doblar_accion') {
            const asset = state?.market?.get(symbol);
            if (asset && asset.changePercent < 0) {
                mis._accionCayendo = { symbol, buyPrice: asset.price };
            }
        }
    });
    renderMisiones();
};

// ── Evento: acción vendida ────────────────────────────────────
window.misionOnVender = (symbol, tipo, realProfit, buyPrice) => {
    const m = window._misiones;
    const esBono = typeof window.getAssetCategory === 'function'
        ? window.getAssetCategory(tipo) === 'prestamo' : false;
    m.activas.forEach(mis => {
        if (mis.completada) return;
        if (mis.tipo === 'vender_accion' && !esBono) avanzarMision(mis, 1);
        if (mis.tipo === 'vender_bono'   &&  esBono) avanzarMision(mis, 1);
        // Vender diverso
        if (mis.tipo === 'vender_diverso') {
            mis._vendidosDiversos = mis._vendidosDiversos || new Set();
            mis._vendidosDiversos.add(tipo);
            mis.progreso = mis._vendidosDiversos.size;
            if (mis._vendidosDiversos.size >= mis.meta) completarMision(mis);
        }
        // Doblar acción
        if (mis.tipo === 'doblar_accion' && mis._accionCayendo?.symbol === symbol) {
            if (realProfit >= buyPrice) completarMision(mis);
        }
        // Vender todo rápido (legendaria)
        if (mis.tipo === 'vender_todo_rapido') {
            if (!mis._venderTodoStart) mis._venderTodoStart = Date.now();
            mis._vendidosCount = (mis._vendidosCount || 0) + 1;
            const elapsed = (Date.now() - mis._venderTodoStart) / 1000;
            if (state?.portfolio?.size === 0 && elapsed <= 30) completarMision(mis);
        }
        // Recuperar pérdida (legendaria)
        if (mis.tipo === 'recuperar_perdida') {
            if (realProfit < 0 && Math.abs(realProfit) >= 100000) {
                mis._perdida = Math.abs(realProfit);
                mis._capitalBase = (state?.monedas || 0) + (realProfit < 0 ? 0 : realProfit);
            }
            if (mis._perdida && realProfit > 0 && realProfit >= mis._perdida * 2) {
                completarMision(mis);
            }
        }
    });
    renderMisiones();
};

// ── Evento: alimentó mascota ──────────────────────────────────
window.misionOnAlimentar = () => {
    window._misiones.activas.forEach(mis => {
        if (!mis.completada && mis.tipo === 'alimentar') avanzarMision(mis, 1);
    });
    renderMisiones();
};

// ── Evento: mascota llegó al 100% ────────────────────────────
window.misionOnSalud100 = () => {
    window._misiones.activas.forEach(mis => {
        if (!mis.completada && mis.tipo === 'salud_100') completarMision(mis);
        // Rescate: sube al 100% en menos de 1 min
        if (!mis.completada && mis.tipo === 'rescate_mascota' && mis._rescateStart) {
            const elapsed = (Date.now() - mis._rescateStart) / 1000;
            if (elapsed <= 60) completarMision(mis);
        }
    });
    renderMisiones();
};

// ── Evento: mascota bajó de 40% ──────────────────────────────
window.misionOnSaludBaja = (salud) => {
    window._misiones.activas.forEach(mis => {
        if (!mis.completada && mis.tipo === 'rescate_mascota' && salud < 40 && !mis._rescateStart) {
            mis._rescateStart = Date.now();
        }
    });
};

// ── Evento: ganó monedas (solo del mercado, no misiones) ──────
window.misionOnGanarMonedas = (cantidad) => {
    window._misiones.activas.forEach(mis => {
        if (!mis.completada && mis.tipo === 'ganar_monedas') {
            mis.progreso = (mis.progreso || 0) + cantidad;
            if (mis.progreso >= mis.meta) completarMision(mis);
        }
    });
    renderMisiones();
};

// ── Avanzar progreso ─────────────────────────────────────────
const avanzarMision = (mis, cantidad) => {
    mis.progreso = (mis.progreso || 0) + cantidad;
    if (mis.progreso >= mis.meta) completarMision(mis);
};

// ── Completar misión y dar recompensa ────────────────────────
const completarMision = (mis) => {
    if (mis.completada) return;
    mis.completada = true;
    mis.progreso   = mis.meta;
    window._misiones.completadas.push(mis.uid);

    // Mostrar popup de recompensa aunque el modal esté cerrado
    setTimeout(() => mostrarPopupRecompensa(mis), 300);

    // Reemplazar con nueva misión después de 2 segundos
    setTimeout(() => {
        const idx = window._misiones.activas.indexOf(mis);
        if (idx !== -1) {
            window._misiones.activas[idx] = generarMision();
            guardarMisiones();
            renderMisiones();
        }
    }, 2000);

    guardarMisiones();
    renderMisiones();
};

// ── Popup de recompensa ───────────────────────────────────────
const mostrarPopupRecompensa = (mis) => {
    // Crear o reusar popup
    let popup = document.getElementById('mision-recompensa-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'mision-recompensa-popup';
        popup.style.cssText = `
            position:fixed; bottom:80px; right:16px; z-index:99998;
            background:white; border-radius:20px; padding:20px;
            max-width:320px; width:90%; font-family:'Poppins',sans-serif;
            box-shadow:0 8px 32px rgba(203,166,247,0.4);
            transform:translateX(120%); transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
            border:3px solid #CBA6F7;
        `;
        document.body.appendChild(popup);
    }

    const col = MISION_COLORES[mis.cat];
    const r   = mis.recompensa;

    let recompensaHtml = '';
    let recompensaTexto = '';

    if (r.tipo === 'monedas') {
        // No suma a EXP — solo monedas directas
        state.monedas += r.monedas;
        if (typeof updateUI === 'function') updateUI();
        recompensaTexto = `+${r.monedas.toLocaleString()} monedas`;
        recompensaHtml  = `<div style="font-size:1.4rem;font-weight:900;color:#CBA6F7;">+${r.monedas.toLocaleString()}</div><div style="font-size:0.75rem;color:#CBA6F7;opacity:.7;">monedas</div>`;
    } else if (r.tipo === 'verdura') {
        abrirSelectorComida('verdura', 1, mis);
        recompensaTexto = '1 verdura a elegir';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">Elige tu verdura</div>`;
    } else if (r.tipo === 'comida_random') {
        darComidaRandom();
        recompensaTexto = 'comida sorpresa';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">Comida sorpresa</div>`;
    } else if (r.tipo === 'comida_elegir') {
        abrirSelectorComida('cualquiera', 1, mis);
        recompensaTexto = '1 comida a elegir';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">Elige tu comida</div>`;
    } else if (r.tipo === 'comida_elegir_3') {
        abrirSelectorComida('cualquiera', 3, mis);
        recompensaTexto = '3 comidas a elegir';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">Elige 3 comidas</div>`;
    } else if (r.tipo === 'mascota_vida') {
        abrirSelectorMascotaVida(mis);
        recompensaTexto = '+50% vida a una mascota';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">+50% vida a una mascota</div>`;
    } else if (r.tipo === 'mascota_desbloquear') {
        abrirSelectorMascotaDesbloquear(mis);
        recompensaTexto = 'Desbloquea una mascota';
        recompensaHtml  = `<div style="font-size:1rem;color:#CBA6F7;font-weight:700;">Desbloquea una mascota</div>`;
    }

    popup.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:11px;font-weight:700;background:${col.bg};color:${col.text};padding:3px 10px;border-radius:20px;">${col.label}</span>
            <button onclick="cerrarPopupRecompensa()" style="background:#f0e7ff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;color:#CBA6F7;font-weight:700;font-size:1rem;">x</button>
        </div>
        <p style="font-size:0.78rem;color:#CBA6F7;margin:0 0 12px;line-height:1.4;">${mis.desc}</p>
        <div style="background:#fdf6ff;border-radius:14px;padding:14px;text-align:center;margin-bottom:14px;border:2px solid ${col.bg};">
            <div style="font-size:0.7rem;color:#CBA6F7;opacity:.7;margin-bottom:4px;">Recompensa</div>
            ${recompensaHtml}
        </div>
        <button onclick="cerrarPopupRecompensa()" style="width:100%;background:#CBA6F7;color:white;border:none;border-radius:12px;padding:10px;font-family:'Poppins',sans-serif;font-weight:700;font-size:0.9rem;cursor:pointer;">
            Reclamar
        </button>
    `;

    // Mostrar con animación
    setTimeout(() => { popup.style.transform = 'translateX(0)'; }, 50);

    // Auto-cerrar después de 8 segundos
    clearTimeout(popup._timer);
    popup._timer = setTimeout(() => cerrarPopupRecompensa(), 8000);
};

window.cerrarPopupRecompensa = () => {
    const popup = document.getElementById('mision-recompensa-popup');
    if (popup) popup.style.transform = 'translateX(120%)';
};

// ── Selector de comida ────────────────────────────────────────
const abrirSelectorComida = (filtro, cantidad, mis) => {
    let modal = document.getElementById('mision-selector-comida');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mision-selector-comida';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    let alimentos = foodDatabase || [];
    if (filtro === 'verdura') alimentos = alimentos.filter(f => f.cat === 'verdura');

    modal.innerHTML = `
    <div class="modal-box" style="max-width:400px;border:3px solid #CBA6F7;">
        <h3 style="color:#CBA6F7;font-family:'Fredoka',sans-serif;margin-bottom:8px;">Elige tu recompensa</h3>
        <p style="color:#CBA6F7;opacity:.7;font-size:0.82rem;margin-bottom:16px;">Selecciona ${cantidad} comida${cantidad>1?'s':''}</p>
        <div id="mision-comida-seleccion" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            ${alimentos.map(f => `
            <button onclick="misionSeleccionarComida('${f.id}', ${cantidad})"
                data-food-id="${f.id}"
                style="background:#fdf6ff;border:2px solid #f0e7ff;border-radius:12px;padding:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:64px;transition:0.2s;">
                <img src="../assets/food/${f.id}.png" style="width:32px;height:32px;object-fit:contain;">
                <span style="font-size:8px;color:#CBA6F7;font-weight:700;">${f.name}</span>
            </button>`).join('')}
        </div>
        <p style="font-size:9px;color:#CBA6F7;opacity:.6;text-align:center;">Si el inventario está lleno de esa comida, recibirás monedas en su lugar.</p>
    </div>`;
    modal.style.display = 'flex';
    modal._cantidadPendiente = cantidad;
};

window.misionSeleccionarComida = (foodId, cantidad) => {
    const food = foodDatabase?.find(f => f.id === foodId);
    if (!food) return;

    const MAX = food.cat === 'misc' ? 5 : 99;
    const existing = state.inventory.get(foodId);
    const actual   = existing?.qty || 0;
    const puedeDar = Math.min(cantidad, MAX - actual);

    if (puedeDar > 0) {
        state.inventory.set(foodId, { ...food, price: 0, qty: actual + puedeDar });
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof showToast === 'function') showToast(`+${puedeDar} ${food.name} de misión`);
    }
    // Lo que no cabe → monedas al precio de venta
    const sinEspacio = cantidad - puedeDar;
    if (sinEspacio > 0) {
        const precio = Math.round((food.price || 10) * 0.5 * sinEspacio);
        state.monedas += precio;
        if (typeof showToast === 'function') showToast(`+${precio} monedas (inventario lleno)`);
    }

    const modal = document.getElementById('mision-selector-comida');
    if (modal) modal.style.display = 'none';
    if (typeof saveGame === 'function') saveGame();
};

// ── Comida random ─────────────────────────────────────────────
const darComidaRandom = () => {
    const alimentos = foodDatabase || [];
    if (!alimentos.length) return;
    const food    = alimentos[Math.floor(Math.random()*alimentos.length)];
    const MAX     = food.cat === 'misc' ? 5 : 99;
    const existing = state.inventory.get(food.id);
    const actual   = existing?.qty || 0;
    if (actual < MAX) {
        state.inventory.set(food.id, { ...food, price: 0, qty: actual + 1 });
        if (typeof renderInventory === 'function') renderInventory();
        if (typeof showToast === 'function') showToast(`+1 ${food.name} (comida sorpresa)`);
    } else {
        state.monedas += 200;
        if (typeof showToast === 'function') showToast(`+200 monedas (inventario lleno)`);
    }
};

// ── Selector de mascota para vida (épica) ─────────────────────
const abrirSelectorMascotaVida = (mis) => {
    let modal = document.getElementById('mision-selector-mascota');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mision-selector-mascota';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }
    const pool = typeof PET_ORDER !== 'undefined' ? PET_ORDER : [];
    const desbloqueadas = pool.filter(id => state.petData?.get(id)?.unlocked);

    modal.innerHTML = `
    <div class="modal-box" style="max-width:360px;border:3px solid #FFB6C1;">
        <h3 style="color:#CBA6F7;font-family:'Fredoka',sans-serif;margin-bottom:8px;">Elige tu mascota</h3>
        <p style="color:#CBA6F7;opacity:.7;font-size:0.82rem;margin-bottom:16px;">La mascota elegida recibirá +50% de vida</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            ${desbloqueadas.map(id => {
                const def = PET_DEFS?.[id];
                return `<button onclick="misionDarVida('${id}')"
                    style="background:#fdf6ff;border:2px solid #FFB6C1;border-radius:12px;padding:8px;cursor:pointer;font-family:'Poppins',sans-serif;font-size:0.8rem;color:#CBA6F7;font-weight:700;">
                    ${def?.label || id}
                </button>`;
            }).join('')}
        </div>
    </div>`;
    modal.style.display = 'flex';
};

window.misionDarVida = (petId) => {
    const data = state.petData?.get(petId);
    if (!data) return;
    const salud = data.health || 0;
    if (salud <= 50) {
        data.health = Math.min(100, salud + 50);
        state.petData.set(petId, data);
        if (typeof showToast === 'function') showToast(`+50% de vida a tu mascota`);
    } else {
        // Más del 50% → dar monedas por cada 1% extra
        const extra  = salud - 50;
        const monedas = extra * 500;
        state.monedas += monedas;
        if (typeof showToast === 'function') showToast(`+${monedas.toLocaleString()} monedas (mascota ya tenía más del 50%)`);
    }
    const modal = document.getElementById('mision-selector-mascota');
    if (modal) modal.style.display = 'none';
    if (typeof saveGame === 'function') saveGame();
};

// ── Selector de mascota para desbloquear (legendaria) ─────────
const abrirSelectorMascotaDesbloquear = (mis) => {
    let modal = document.getElementById('mision-selector-mascota-desbloquear');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mision-selector-mascota-desbloquear';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Determinar qué pool usar según progreso del jugador
    const isDiamond = state.diamondVictoryAchieved;
    const isGolden  = state.victoryAchieved;
    const pool      = isDiamond ? (typeof PET_ORDER_DIAMOND !== 'undefined' ? PET_ORDER_DIAMOND : [])
                    : isGolden  ? (typeof PET_ORDER_GOLDEN  !== 'undefined' ? PET_ORDER_GOLDEN  : [])
                    :             (typeof PET_ORDER          !== 'undefined' ? PET_ORDER          : []);

    // Solo mascotas bloqueadas que el jugador pueda comprar (siguiente en la fila)
    const bloqueadas = pool.filter(id => !state.petData?.get(id)?.unlocked);
    // Solo la siguiente mascota disponible
    const siguiente  = bloqueadas.length > 0 ? [bloqueadas[0]] : [];

    if (!siguiente.length) {
        // Ya tiene todas — dar monedas
        state.monedas += 1000000;
        if (typeof showToast === 'function') showToast('+1,000,000 monedas (ya tienes todas las mascotas)');
        if (typeof saveGame === 'function') saveGame();
        return;
    }

    modal.innerHTML = `
    <div class="modal-box" style="max-width:360px;border:3px solid #FFF5BA;">
        <h3 style="color:#CBA6F7;font-family:'Fredoka',sans-serif;margin-bottom:8px;">Desbloquea tu mascota</h3>
        <p style="color:#CBA6F7;opacity:.7;font-size:0.82rem;margin-bottom:16px;">Recibirás la siguiente mascota disponible</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
            ${siguiente.map(id => {
                const def = PET_DEFS?.[id];
                return `<button onclick="misionDesbloquearMascota('${id}')"
                    style="background:#FFF5BA;border:2px solid #d4af37;border-radius:12px;padding:12px 20px;cursor:pointer;font-family:'Poppins',sans-serif;font-size:0.9rem;color:#7d6608;font-weight:700;">
                    ${def?.label || id}
                </button>`;
            }).join('')}
        </div>
    </div>`;
    modal.style.display = 'flex';
};

window.misionDesbloquearMascota = (petId) => {
    const data = state.petData?.get(petId) || { health: 50, unlocked: false };
    data.unlocked = true;
    data.health   = data.health || 50;
    state.petData?.set(petId, data);
    const def = PET_DEFS?.[petId];
    if (typeof showToast === 'function') showToast(`Desbloqueaste ${def?.label || petId}`);
    const modal = document.getElementById('mision-selector-mascota-desbloquear');
    if (modal) modal.style.display = 'none';
    if (typeof saveGame === 'function') saveGame();
};

// ── Descartar misión ──────────────────────────────────────────
window.descartarMision = (uid) => {
    const m   = window._misiones;
    const idx = m.activas.findIndex(mis => mis.uid === uid);
    if (idx === -1) return;
    const mis = m.activas[idx];

    // Verificar cooldown por tipo de categoría
    const ahora = Date.now();
    const cd    = m.descarteCooldown[mis.cat];
    if (cd && (ahora - cd) < 2 * 60 * 60 * 1000) {
        const restante = Math.ceil((2*60*60*1000 - (ahora - cd)) / 60000);
        if (typeof showToast === 'function') showToast(`Cooldown activo. Puedes descartar misiones ${mis.cat} en ${restante} min`);
        return;
    }

    // Aplicar cooldown
    m.descarteCooldown[mis.cat] = ahora;
    // Reemplazar con nueva misión aleatoria
    m.activas[idx] = generarMision();
    guardarMisiones();
    renderMisiones();
    if (typeof showToast === 'function') showToast('Misión descartada. Nueva misión asignada.');
};

// ── Renderizar modal de misiones ──────────────────────────────
window.renderMisiones = () => {
    const el = document.getElementById('missions-list');
    if (!el) return;

    const m = window._misiones;
    const ahora = Date.now();

    el.innerHTML = m.activas.map(mis => {
        const col = MISION_COLORES[mis.cat];
        const pct = mis.meta > 0 ? Math.min(100, (mis.progreso / mis.meta) * 100) : 0;
        const cd  = m.descarteCooldown[mis.cat];
        const enCooldown = cd && (ahora - cd) < 2*60*60*1000;
        const minRestante = enCooldown ? Math.ceil((2*60*60*1000 - (ahora-cd))/60000) : 0;

        // Texto de recompensa
        const r = mis.recompensa;
        let rewText = '';
        if (r.tipo === 'monedas')          rewText = `+${r.monedas.toLocaleString()} monedas`;
        else if (r.tipo === 'verdura')     rewText = '1 verdura a elegir';
        else if (r.tipo === 'comida_random') rewText = 'Comida sorpresa';
        else if (r.tipo === 'comida_elegir') rewText = '1 comida a elegir';
        else if (r.tipo === 'comida_elegir_3') rewText = '3 comidas a elegir';
        else if (r.tipo === 'mascota_vida')  rewText = '+50% vida a una mascota';
        else if (r.tipo === 'mascota_desbloquear') rewText = 'Desbloquea una mascota';

        return `
        <div style="background:#FFFFFF;border-radius:14px;padding:12px 14px;border:2px solid ${col.border};${mis.completada ? 'opacity:0.6;' : ''}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span style="font-size:10px;font-weight:700;background:${col.bg};color:${col.text};padding:2px 10px;border-radius:20px;">${col.label}</span>
                ${!mis.completada ? `
                <button onclick="descartarMision('${mis.uid}')"
                    title="${enCooldown ? `Cooldown: ${minRestante} min` : 'Descartar misión'}"
                    style="background:none;border:1px solid #f0e7ff;border-radius:8px;padding:2px 8px;cursor:${enCooldown?'not-allowed':'pointer'};font-size:9px;color:${enCooldown?'#ccc':'#CBA6F7'};font-family:'Poppins',sans-serif;">
                    ${enCooldown ? `${minRestante}m` : 'Descartar'}
                </button>` : `<span style="font-size:9px;color:#52b788;font-weight:700;">Completada</span>`}
            </div>
            <p style="font-size:10px;color:#CBA6F7;margin:0 0 8px;font-family:'Poppins',sans-serif;line-height:1.4;">${mis.desc}</p>
            <div style="background:#f0e7ff;border-radius:8px;height:7px;overflow:hidden;margin-bottom:5px;">
                <div style="width:${pct.toFixed(0)}%;height:100%;background:${col.border};border-radius:8px;transition:width 0.4s;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:9px;color:#CBA6F7;opacity:.7;font-family:'Poppins',sans-serif;">${mis.progreso}/${mis.meta}</span>
                <span style="font-size:9px;font-weight:700;color:${col.text};background:${col.bg};padding:1px 8px;border-radius:10px;">${rewText}</span>
            </div>
        </div>`;
    }).join('');
};

// ── Abrir modal de misiones ───────────────────────────────────
window.openMisiones = () => {
    if (!window._misiones.activas.length) window.initMisionesSystem();
    renderMisiones();
    const modal = document.getElementById('modal-misiones');
    if (modal) modal.style.display = 'flex';
};

// ── Init automático ───────────────────────────────────────────
window.initMissions = () => window.initMisionesSystem();