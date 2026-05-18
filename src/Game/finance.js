// ============================================================
// BITGAMESO — finance.js
// 3 Mecánicas Financieras Realistas
// 1. Dualidad Económica (Balance Contable)
// 2. Índice de Diversificación (0-100)
// 3. Activos Propiedad vs Préstamo (Acciones vs Bonos)
// ============================================================

// ============================================================
// 1. DUALIDAD ECONÓMICA — Balance Contable
// Activo = Pasivo + Capital
// efectivo + activosFinancieros = capital
// ============================================================

// Calcula el valor actual de todos los activos en cartera
const calcActivosFinancieros = () => {
 let total = 0;
 if (!state || !state.portfolio || !state.market) return 0;
 state.portfolio.forEach((pos, sym) => {
 const cur = state.market.get(sym);
 const precio = cur ? cur.price : pos.buyPrice;
 total += precio;
 });
 return total;
};

// Devuelve el balance completo del jugador
window.getBalance = () => {
 const efectivo = state.monedas || 0;
 const activosFinancieros = calcActivosFinancieros();
 const capital = efectivo + activosFinancieros;
 return { efectivo, activosFinancieros, capital };
};

// Actualiza el panel de balance en la UI
window.renderBalance = () => {
 const { efectivo, activosFinancieros, capital } = window.getBalance();

 const elEfectivo = document.getElementById('balance-efectivo');
 const elActivos = document.getElementById('balance-activos');
 const elCapital = document.getElementById('balance-capital');
 const elDivScore = document.getElementById('balance-div-score');

 if (elEfectivo) elEfectivo.textContent = fmt(efectivo);
 if (elActivos) elActivos.textContent = fmt(activosFinancieros);
 if (elCapital) {
 elCapital.textContent = fmt(capital);
 // Color según crecimiento (más que monedas iniciales = verde)
 elCapital.style.color = capital > 1000 ? '#52b788' : '#e67e22';
 }

 // Índice de diversificación junto al capital
 if (elDivScore) {
 const score    = window.calculateDiversificationScore();
 const isShark  = typeof PET_DEFS !== 'undefined' && (PET_DEFS[state?.currentPet]?.passive === 'shark');
 elDivScore.textContent = `${score}/100`;

 if (isShark && score >= 80) {
     // Tiburón activo + diversificación alta → verde brillante con animación
     elDivScore.style.color      = '#52b788';
     elDivScore.style.fontWeight = '900';
     elDivScore.style.textShadow = '0 0 8px #52b788, 0 0 16px #B2F2BB';
     elDivScore.title = `Bono Tiburón: +${(score * 0.5).toFixed(0)}% en ventas`;
 } else if (isShark) {
     // Tiburón activo pero diversificación baja → naranja con aviso
     elDivScore.style.color      = '#e67e22';
     elDivScore.style.fontWeight = '700';
     elDivScore.style.textShadow = 'none';
     elDivScore.title = `Diversifica más para maximizar el bono del Tiburón`;
 } else {
     elDivScore.style.color      = score >= 80 ? '#52b788' : score >= 50 ? '#CBA6F7' : '#e67e22';
     elDivScore.style.fontWeight = '700';
     elDivScore.style.textShadow = 'none';
     elDivScore.title = '';
 }
 }
};

// ============================================================
// 2. ÍNDICE DE DIVERSIFICACIÓN (0 - 100)
// 1 sector → 20 pts
// 2 sectores → 40 pts
// 3 sectores → 60 pts
// 4 sectores → 80 pts
// 5+ sectores → 100 pts
// ============================================================
window.calculateDiversificationScore = () => {
 if (!state || !state.portfolio || state.portfolio.size === 0) return 0;

 // Contar sectores únicos en cartera
 const sectores = new Set();
 state.portfolio.forEach(pos => {
 if (pos.type) sectores.add(pos.type);
 });

 const numSectores = sectores.size;
 if (numSectores === 0) return 0;
 if (numSectores === 1) return 20;
 if (numSectores === 2) return 40;
 if (numSectores === 3) return 60;
 if (numSectores === 4) return 80;
 return 100; // 5 o más sectores
};

// Mensaje de mascota según diversificación
window.getDiversificationMsg = () => {
 const score = window.calculateDiversificationScore();
 if (score === 0) return '¡Invierte en algo para empezar tu portafolio!';
 if (score === 20) return 'Solo tienes un sector. ¡Diversifica para reducir riesgo!';
 if (score === 40) return 'Vas bien, pero podrías explorar más sectores.';
 if (score === 60) return 'Buen portafolio. ¡Sigue diversificando!';
 if (score === 80) return '¡Excelente diversificación! Riesgo muy controlado.';
 return '¡Portafolio maestro! Diversificación perfecta.';
};

// ============================================================
// 3. ACTIVOS PROPIEDAD vs PRÉSTAMO
// propiedad → Acciones/Cripto: volatilidad alta (lógica actual)
// prestamo → Bonos: crecimiento constante 0.5% por tick, riesgo bajo
// ============================================================

// Tabla de categoría por tipo de activo
const ASSET_CATEGORY_MAP = {
 'IA': 'propiedad',
 'Bluechip': 'propiedad',
 'Digital': 'propiedad',
 'Gaming': 'propiedad',
 'NFT': 'propiedad',
 'Metaverso': 'propiedad',
 'Meme': 'propiedad',
 'Fintech': 'prestamo', // ← Bonos: crecimiento estable
 'Energía': 'prestamo', // ← Bonos: crecimiento estable
 'Biotech': 'prestamo', // ← Bonos: crecimiento estable
 'Espacio': 'propiedad',
 'DeFi': 'propiedad',
};

// Devuelve la categoría de un activo
window.getAssetCategory = (type) => ASSET_CATEGORY_MAP[type] || 'propiedad';

// Aplica el tick de bonos (llamado desde el loop del mercado)
// Los bonos suben 0.5% garantizado por tick en vez de ser volátiles
window.applyBondTick = () => {
 if (!state || !state.market) return;
 state.market.forEach((asset, sym) => {
 const cat = window.getAssetCategory(asset.type || '');
 if (cat === 'prestamo') {
 const newPrice = asset.price * 1.005; // +0.5% garantizado
 state.market.set(sym, {
 ...asset,
 price: newPrice,
 changePercent: 0.5,
 });
 }
 });
};

// Etiqueta visual para el tipo de activo
window.getAssetCategoryLabel = (type) => {
 const cat = window.getAssetCategory(type);
 return cat === 'prestamo'
 ? '<span class="asset-cat-badge bond">Bono</span>'
 : '<span class="asset-cat-badge stock">Acción</span>';
};

// Ficha técnica de un activo (para el botón info)
window.getAssetFicha = (symbol) => {
 const asset = state.market.get(symbol);
 if (!asset) return null;
 const cat = window.getAssetCategory(asset.type || '');
 return {
 symbol,
 name: asset.name || symbol,
 type: asset.type || '—',
 category: cat,
 riesgo: cat === 'prestamo' ? 'Bajo' : 'Alto',
 horizonte: cat === 'prestamo' ? 'Largo plazo (estable)' : 'Corto/Mediano plazo',
 rendimiento: cat === 'prestamo' ? '+0.5% por tick garantizado' : 'Variable (mercado)',
 precio: asset.price,
 };
};

// ============================================================
// PANEL DE BALANCE — inyectar en el DOM
// Se inserta justo debajo de las monedas en el nav
// ============================================================
window.injectBalancePanel = () => {
 if (document.getElementById('balance-panel')) return; // ya existe

 const isMobile = window.innerWidth <= 600;

 const panel = document.createElement('div');
 panel.id = 'balance-panel';

 if (isMobile) {
     panel.style.cssText = `
     display: flex;
     gap: 5px;
     align-items: center;
     flex-wrap: nowrap;
     padding: 2px 4px;
     font-size: 8px;
     font-family: 'Poppins', sans-serif;
     overflow-x: auto;
     width: 100%;
     `;
 } else {
     panel.style.cssText = `
     display: inline-flex;
     gap: 10px;
     align-items: center;
     flex-wrap: wrap;
     padding: 4px 12px;
     background: rgba(255,255,255,0.85);
     border-radius: 12px;
     font-size: 11px;
     font-family: 'Poppins', sans-serif;
     border: 1px solid #e8e8e8;
     box-shadow: 0 2px 8px rgba(0,0,0,0.06);
     margin-left: 12px;
     vertical-align: middle;
     `;
 }

 panel.innerHTML = `
 <div class="balance-item">
 <span class="balance-label">Efectivo</span>
 <span id="balance-efectivo" class="balance-value">$0</span>
 </div>
 <div class="balance-divider">+</div>
 <div class="balance-item">
 <span class="balance-label">En Activos</span>
 <span id="balance-activos" class="balance-value">$0</span>
 </div>
 <div class="balance-divider">=</div>
 <div class="balance-item">
 <span class="balance-label">Capital Total</span>
 <span id="balance-capital" class="balance-value" style="font-weight:700;">$0</span>
 </div>
 <div class="balance-divider">|</div>
 <div class="balance-item">
 <span class="balance-label">Diversificación</span>
 <span id="balance-div-score" class="balance-value" style="font-weight:700;">0/100</span>
 </div>
 `;

 // En móvil insertar en el nav directamente (segunda línea)
 // En PC insertar dentro del score-container
 if (isMobile) {
     const nav = document.querySelector('.game-nav');
     if (nav) nav.appendChild(panel);
 } else {
     const scoreContainer = document.querySelector('.score-container');
     if (scoreContainer) scoreContainer.appendChild(panel);
 }
};


// ============================================================
// MODAL DE FICHA TÉCNICA
// ============================================================
window.showAssetFicha = (symbol) => {
 const ficha = window.getAssetFicha(symbol);
 if (!ficha) return;

 let modal = document.getElementById('modal-ficha-activo');
 if (!modal) {
 modal = document.createElement('div');
 modal.id = 'modal-ficha-activo';
 modal.style.cssText = `
 position: fixed; inset: 0;
 background: rgba(0,0,0,0.5);
 z-index: 9000;
 display: flex; align-items: center; justify-content: center;
 `;
 document.body.appendChild(modal);
 }

 const catColor = ficha.category === 'prestamo' ? '#a8e6cf' : '#FFB6C1';
 modal.innerHTML = `
 <div style="
 background: white;
 border-radius: 20px;
 padding: 28px;
 max-width: 340px;
 width: 90%;
 border: 3px solid #CBA6F7;
 box-shadow: 0 8px 32px rgba(203,166,247,0.4);
 font-family: 'Poppins', sans-serif;
 ">
 <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
 <h3 style="margin:0; color:#CBA6F7; font-size:1.2rem;">${ficha.symbol}</h3>
 <button onclick="document.getElementById('modal-ficha-activo').style.display='none'"
 style="background:#f0e7ff;border:none;font-size:1.2rem;cursor:pointer;color:#CBA6F7;width:32px;height:32px;border-radius:50%;font-weight:700;line-height:1;">X</button>
 </div>
 <p style="margin:0 0 16px; color:#CBA6F7; font-size:0.85rem;">${ficha.name} · ${ficha.type}</p>
 <div style="
 background: ${catColor};
 border-radius: 10px;
 padding: 10px 14px;
 margin-bottom: 12px;
 font-weight: 700;
 font-size: 0.9rem;
 ">
 ${ficha.category === 'prestamo' ? ' Bono (Instrumento de Préstamo)' : ' Acción / Criptoactivo'}
 </div>
 <table style="width:100%; font-size:0.82rem; border-collapse:collapse;">
 <tr style="border-bottom:1px solid #eee;">
 <td style="padding:8px 0; color:#CBA6F7; opacity:0.7;">Riesgo</td>
 <td style="padding:8px 0; font-weight:700; color:#CBA6F7;">${ficha.riesgo}</td>
 </tr>
 <tr style="border-bottom:1px solid #f0e7ff;">
 <td style="padding:8px 0; color:#CBA6F7; opacity:0.7;">Rendimiento</td>
 <td style="padding:8px 0; font-weight:700; color:#CBA6F7;">${ficha.rendimiento}</td>
 </tr>
 <tr style="border-bottom:1px solid #f0e7ff;">
 <td style="padding:8px 0; color:#CBA6F7; opacity:0.7;">Horizonte</td>
 <td style="padding:8px 0; font-weight:700; color:#CBA6F7;">${ficha.horizonte}</td>
 </tr>
 <tr>
 <td style="padding:8px 0; color:#CBA6F7; opacity:0.7;">Precio actual</td>
 <td style="padding:8px 0; font-weight:700; color:#CBA6F7;">${fmt(ficha.precio)}</td>
 </tr>
 </table>
 <p style="margin:14px 0 0; font-size:0.75rem; color:#CBA6F7; opacity:0.6; text-align:center;">
 Los bonos tienen crecimiento estable del 0.5% por tick.<br>
 Las acciones tienen mayor volatilidad y potencial.
 </p>
 </div>
 `;
 modal.style.display = 'flex';
};

// ============================================================
// CSS EXTRA para badges y balance
// ============================================================
const injectFinanceStyles = () => {
 if (document.getElementById('finance-styles')) return;
 const style = document.createElement('style');
 style.id = 'finance-styles';
 style.textContent = `
 .balance-item {
 display: flex;
 flex-direction: column;
 align-items: center;
 gap: 2px;
 }
 .balance-label {
 font-size: 10px;
 color: #CBA6F7;
 opacity: 0.75;
 white-space: nowrap;
 }
 .balance-value {
 font-size: 12px;
 color: #CBA6F7;
 font-weight: 600;
 }
 .balance-divider {
 font-size: 14px;
 color: #CBA6F7;
 font-weight: 700;
 }
 .asset-cat-badge {
 font-size: 10px;
 padding: 2px 6px;
 border-radius: 6px;
 font-weight: 700;
 white-space: nowrap;
 }
 .asset-cat-badge.bond {
 background: #B2F2BB;
 color: #2d6a4f;
 }
 .asset-cat-badge.stock {
 background: #FFB6C1;
 color: #7d1c2e;
 }
 .btn-asset-info {
 background: none;
 border: 1px solid #CBA6F7;
 border-radius: 6px;
 color: #CBA6F7;
 font-size: 11px;
 padding: 2px 6px;
 cursor: pointer;
 font-family: 'Poppins', sans-serif;
 transition: 0.2s;
 }
 .btn-asset-info:hover {
 background: #CBA6F7;
 color: white;
 }
 #balance-panel {
 margin: 4px 2rem;
 }
 @media (max-width: 768px) {
 #balance-panel { margin: 4px 8px; gap: 8px; }
 .balance-value { font-size: 11px; }
 }
 `;
 document.head.appendChild(style);
};

// ============================================================
// INIT — llamado desde game.js al cargar
// ============================================================
window.initFinanceMechanics = () => {
 injectFinanceStyles();
 window.injectBalancePanel();
 window.renderBalance();
 console.log('BITGAMESO Finance Mechanics cargado');
};

// Actualizar balance cuando cambia el mercado
window.updateFinanceUI = () => {
 window.renderBalance();
 // Mostrar mensaje de diversificación en la mascota si está en cartera
 if (state.portfolio.size > 0) {
 const msg = window.getDiversificationMsg();
 const msgEl = document.getElementById('pet-message');
 // Solo actualizar cada 10 ventas/compras para no ser repetitivo
 if (msgEl && Math.random() < 0.15) {
 msgEl.textContent = msg;
 }
 }
};