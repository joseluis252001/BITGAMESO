// ============================================================
//  BITGAMESO - game.js  (versión mejorada)
// ============================================================

// --- ESTADO GLOBAL ---
const state = {
    monedas: 1000.00,
    saludMascota: 75,          // 0-100
    currentPet: 'Bunny-Pink-128',
    market: new Map(),
    portfolio: new Map()       // symbol → { symbol, name, buyPrice }
};

// --- REFERENCIAS DOM (se asignan en DOMContentLoaded) ---
const refs = {};

// --- BASE DE DATOS DE ACTIVOS ---
const assetDatabase = [
    { symbol: 'AIGEN', name: 'AI Genesis',    type: 'IA',       basePrice: 45   },
    { symbol: 'NVDA',  name: 'NVIDIA Corp',   type: 'IA',       basePrice: 800  },
    { symbol: 'MSFT',  name: 'Microsoft',     type: 'Bluechip', basePrice: 390  },
    { symbol: 'SKIN',  name: 'Epic Skins',    type: 'Gaming',   basePrice: 5    },
    { symbol: 'ETH',   name: 'Ethereum',      type: 'Digital',  basePrice: 3400 }
];

// --- LISTA DE MASCOTAS ---
const petList = [
    { id: 'Bear-100',          label: 'Oso'          },
    { id: 'Bird-128',          label: 'Pájaro'       },
    { id: 'Bunny-Pink-128',    label: 'Conejito'     },
    { id: 'Cat-Beige-128',     label: 'Gato Beige'   },
    { id: 'Cat-Blue-128',      label: 'Gato Azul'    },
    { id: 'Cat-Pink-128',      label: 'Gato Rosa'    },
    { id: 'Cat-Tiger-128',     label: 'Gato Tigre'   },
    { id: 'Cat-Tiger-Beige-128', label: 'Tigre Beige'},
    { id: 'Cat-Tiger-Rose-128',  label: 'Tigre Rosa' },
    { id: 'Cat-White-128',     label: 'Gato Blanco'  },
    { id: 'Chicken-White-128', label: 'Pollito'      },
    { id: 'Chicken-Yellow-128',label: 'Pollito Amarillo'},
    { id: 'Cow-128',           label: 'Vaca'         },
    { id: 'Frog-128',          label: 'Rana'         },
    { id: 'Penguin-128',       label: 'Pingüino'     },
    { id: 'Penguin-Pink-128',  label: 'Pingüino Rosa'},
    { id: 'Shark-128',         label: 'Tiburón'      },
    { id: 'Sheep-128',         label: 'Oveja'        }
];

// --- UTILIDADES ---
const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ============================================================
//  MERCADO
// ============================================================
const fetchMarket = () => {
    assetDatabase.forEach((a) => {
        const oldPrice  = state.market.get(a.symbol)?.price || a.basePrice;
        const volatility = 0.02;
        const newPrice  = oldPrice * (1 + (Math.random() * volatility * 2 - volatility));
        state.market.set(a.symbol, {
            ...a,
            price: newPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice) * 100
        });
    });

    const now = new Date();
    if (refs.marketUpdated)
        refs.marketUpdated.textContent = `Actualizado: ${now.toLocaleTimeString()}`;

    renderMarket();
    renderPortfolio(); // actualiza precios actuales en cartera
};

const renderMarket = () => {
    if (!refs.marketList) return;

    refs.marketList.innerHTML = Array.from(state.market.values()).map(a => {
        const isUp = a.changePercent >= 0;
        const owned = state.portfolio.has(a.symbol);
        return `
        <div class="asset-row">
            <div class="asset-info">
                <strong class="asset-symbol">${a.symbol}</strong>
                <small class="asset-name">${a.name}</small>
            </div>
            <div class="asset-type">${a.type}</div>
            <div class="asset-price">${formatCurrency(a.price)}</div>
            <div class="asset-change ${isUp ? 'up' : 'down'}">
                ${isUp ? '▲' : '▼'} ${Math.abs(a.changePercent).toFixed(2)}%
            </div>
            <div class="market-btns">
                <button class="btn-action btn-buy ${owned ? 'btn-disabled' : ''}"
                        onclick="buy('${a.symbol}')"
                        ${owned ? 'disabled title="Ya tienes este activo"' : ''}>
                    Comprar
                </button>
            </div>
        </div>`;
    }).join('');
};

// ============================================================
//  COMPRAR
// ============================================================
window.buy = (symbol) => {
    if (state.portfolio.has(symbol)) {
        showToast('⚠️ Ya tienes este activo en tu cartera.');
        return;
    }
    const asset = state.market.get(symbol);
    if (!asset) return;

    if (state.monedas >= asset.price) {
        state.monedas -= asset.price;
        state.portfolio.set(symbol, {
            symbol:   asset.symbol,
            name:     asset.name,
            buyPrice: asset.price
        });
        showToast(`✅ Compraste ${asset.symbol} por ${formatCurrency(asset.price)}`);
        updateUI();
    } else {
        showToast('❌ ¡No tienes suficientes monedas!');
    }
};

// ============================================================
//  VENDER (desde la Cartera)
// ============================================================
window.sellFromPortfolio = (symbol) => {
    const pos     = state.portfolio.get(symbol);
    const current = state.market.get(symbol);
    if (!pos || !current) return;

    const profit = current.price - pos.buyPrice;
    state.monedas += current.price;
    state.portfolio.delete(symbol);

    // Afectar salud de la mascota
    if (profit > 0) {
        const gain = Math.min(Math.round((profit / pos.buyPrice) * 20), 20);
        changePetHealth(gain);
        showToast(`🎉 ¡Vendiste ${symbol} con ganancia de ${formatCurrency(profit)}! Mascota +${gain}❤️`);
    } else if (profit < 0) {
        const loss = Math.min(Math.round((Math.abs(profit) / pos.buyPrice) * 20), 20);
        changePetHealth(-loss);
        showToast(`📉 Vendiste ${symbol} con pérdida de ${formatCurrency(Math.abs(profit))}. Mascota -${loss}❤️`);
    } else {
        showToast(`➡️ Vendiste ${symbol} sin ganancia ni pérdida.`);
    }

    updateUI();
    checkGameOver();
};

// ============================================================
//  SALUD DE LA MASCOTA
// ============================================================
const changePetHealth = (delta) => {
    state.saludMascota = Math.max(0, Math.min(100, state.saludMascota + delta));
    renderPetHealth();
};

const renderPetHealth = () => {
    if (!refs.petHealthFill) return;
    refs.petHealthFill.style.width = state.saludMascota + '%';

    // Color dinámico de la barra
    if (state.saludMascota > 60)       refs.petHealthFill.style.background = '#a8e6cf';
    else if (state.saludMascota > 30)  refs.petHealthFill.style.background = '#ffd3b6';
    else                               refs.petHealthFill.style.background = '#ff8b94';

    if (refs.petHealthValue) refs.petHealthValue.textContent = state.saludMascota;

    // Mensaje de mascota
    const msg = refs.petMessage;
    if (msg) {
        if (state.saludMascota === 100) msg.textContent = '¡Estoy súper feliz! 🎉';
        else if (state.saludMascota > 60) msg.textContent = '¡Todo bajo control! 😊';
        else if (state.saludMascota > 30) msg.textContent = 'Me siento un poco mal... 😟';
        else if (state.saludMascota > 0)  msg.textContent = '¡Tengo mucha hambre! 😢';
        else msg.textContent = '...';
    }

    // Mostrar botón cambiar mascota solo si está al 100%
    const btnCambiar = document.getElementById('btn-cambiar-mascota');
    if (btnCambiar) {
        btnCambiar.style.display = state.saludMascota === 100 ? 'block' : 'none';
    }
};

// ============================================================
//  SELECTOR DE MASCOTA
// ============================================================
window.openPetSelector = () => {
    const grid = document.getElementById('pet-grid');
    if (!grid) return;
    grid.innerHTML = petList.map(p => `
        <div class="pet-option ${p.id === state.currentPet ? 'pet-selected' : ''}"
             onclick="selectPet('${p.id}', '${p.label}')">
            <div class="pet-preview pet-sprite-sm" style="background-image: url('../assets/pets/${p.id}.png')"></div>
            <span>${p.label}</span>
        </div>
    `).join('');
    document.getElementById('modal-mascota').style.display = 'flex';
};

window.closePetSelector = () => {
    document.getElementById('modal-mascota').style.display = 'none';
};

window.selectPet = (petId, petLabel) => {
    state.currentPet = petId;
    renderPet();
    closePetSelector();
    showToast(`🐾 ¡Ahora tienes un ${petLabel}!`);
};

const renderPet = () => {
    const sprite = document.getElementById('pet-character');
    if (sprite) {
        sprite.style.backgroundImage = `url('../assets/pets/${state.currentPet}.png')`;
    }
};

// ============================================================
//  GAME OVER
// ============================================================
const checkGameOver = () => {
    // 1. Mascota muerta
    if (state.saludMascota <= 0) {
        triggerGameOver('😿 Tu mascota murió de hambre...');
        return;
    }

    // 2. Sin monedas Y sin acciones que alcancen para recuperarse
    if (state.monedas <= 0) {
        // calcular valor total de cartera
        let valorCartera = 0;
        state.portfolio.forEach((pos, symbol) => {
            const current = state.market.get(symbol);
            if (current) valorCartera += current.price;
        });

        if (valorCartera === 0 || (state.monedas + valorCartera) <= 0) {
            triggerGameOver('💸 Te quedaste sin monedas y sin activos para recuperarte...');
        }
    }
};

const triggerGameOver = (reason) => {
    const modal = document.getElementById('modal-gameover');
    const reasonEl = document.getElementById('gameover-reason');
    if (modal) {
        if (reasonEl) reasonEl.textContent = reason;
        modal.style.display = 'flex';
    }
};

window.resetGame = () => {
    state.monedas       = 1000.00;
    state.saludMascota  = 75;
    state.currentPet    = 'Bunny-Pink-128';
    state.portfolio.clear();
    document.getElementById('modal-gameover').style.display = 'none';
    renderPet();
    renderPetHealth();
    updateUI();
    showToast('🔄 ¡Juego reiniciado!');
};

// ============================================================
//  UI GENERAL
// ============================================================
const updateUI = () => {
    if (refs.monedasCount) refs.monedasCount.textContent = state.monedas.toFixed(2);
    renderMarket();
    renderPortfolio();
    renderPetHealth();
};

const renderPortfolio = () => {
    const container = document.getElementById('portfolio-list');
    const summary   = document.getElementById('portfolio-summary');
    const totalEl   = document.getElementById('portfolio-total');
    if (!container) return;

    if (state.portfolio.size === 0) {
        container.innerHTML = `<p class="empty-msg">Aún no tienes posiciones.</p>`;
        if (summary) summary.style.display = 'none';
        return;
    }

    let totalInvested = 0;
    let html = '';

    state.portfolio.forEach((pos, symbol) => {
        const current = state.market.get(symbol);
        const currentPrice = current ? current.price : pos.buyPrice;
        const profit = currentPrice - pos.buyPrice;
        const pct    = ((profit / pos.buyPrice) * 100).toFixed(2);
        totalInvested += currentPrice;

        html += `
        <div class="portfolio-item">
            <div class="pi-header">
                <strong>${pos.symbol}</strong>
                <span class="pi-name">${pos.name}</span>
            </div>
            <div class="pi-prices">
                <span class="pi-label">Compra:</span>
                <span>${formatCurrency(pos.buyPrice)}</span>
                <span class="pi-label">Actual:</span>
                <span>${formatCurrency(currentPrice)}</span>
            </div>
            <div class="pi-profit ${profit >= 0 ? 'up' : 'down'}">
                ${profit >= 0 ? '▲' : '▼'} ${formatCurrency(Math.abs(profit))} (${Math.abs(pct)}%)
            </div>
            <button class="btn-action btn-sell" onclick="sellFromPortfolio('${symbol}')">
                Vender
            </button>
        </div>`;
    });

    container.innerHTML = html;
    if (summary) {
        summary.style.display = 'flex';
        if (totalEl) totalEl.textContent = formatCurrency(totalInvested);
    }
};

// ============================================================
//  MENÚ AVATAR / LOGOUT
// ============================================================
window.toggleSettingsMenu = (e) => {
    if (e) e.stopPropagation();
    const menu = document.getElementById('settings-dropdown-menu');
    if (menu) {
        const isHidden = menu.style.display === 'none';
        menu.style.display = isHidden ? 'block' : 'none';
    }
};

window.handleAvatarChange = (src) => {
    const img = document.getElementById('current-avatar-header');
    if (img) img.src = src;
    toggleSettingsMenu(null);
    showToast('✅ Avatar actualizado');
};

window.handleLogout = () => {
    // Redirige a la página de menú principal
    window.location.href = '../index.html';
};

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    const menu = document.getElementById('settings-dropdown-menu');
    const trigger = document.querySelector('.profile-trigger');
    if (menu && trigger && !trigger.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// ============================================================
//  TOAST (notificaciones)
// ============================================================
const showToast = (msg) => {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('toast-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('toast-show'), 3000);
};

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    refs.monedasCount   = document.getElementById('monedas-count');
    refs.marketList     = document.getElementById('lista-activos');
    refs.marketUpdated  = document.getElementById('market-updated');
    refs.petHealthFill  = document.getElementById('pet-health-fill');
    refs.petHealthValue = document.getElementById('pet-health-value');
    refs.petMessage     = document.getElementById('pet-message');

    renderPet();
    renderPetHealth();
    fetchMarket();
    setInterval(fetchMarket, 3000);
});

console.log('BITGAMESO: Motor cargado correctamente. 🎮');
