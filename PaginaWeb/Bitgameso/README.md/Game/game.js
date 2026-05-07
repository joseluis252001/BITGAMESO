/**
 * BITGAMESO - Motor de Juego Unificado
 */

// 1. ESTADO GLOBAL
const state = {
    monedas: 1000.00,
    saludConejo: 75,
    market: new Map(),
    portfolio: new Map()
};

// Referencias a elementos del DOM (se llenan al cargar)
const refs = {};

// 2. BASE DE DATOS DE ACTIVOS
const assetDatabase = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Bluechip', basePrice: 175 },
    { symbol: 'MSFT', name: 'Microsoft', type: 'Bluechip', basePrice: 400 },
    { symbol: 'STARK', name: 'Stark Ind.', type: 'Bluechip', basePrice: 850 },
    { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'IA', basePrice: 800 },
    { symbol: 'AIGEN', name: 'AI Genesis', type: 'IA', basePrice: 45 },
    { symbol: 'OPENA', name: 'Neural-Sync', type: 'IA', basePrice: 210 },
    { symbol: 'BTC', name: 'Bitcoin', type: 'Digital', basePrice: 65000 },
    { symbol: 'ETH', name: 'Ethereum', type: 'Digital', basePrice: 3500 },
    { symbol: 'BITG', name: 'BitGameCoin', type: 'Digital', basePrice: 12 },
    { symbol: 'MOON', name: 'Moon-Token', type: 'Digital', basePrice: 0.5 },
    { symbol: 'GME', name: 'GameStop', type: 'Gaming', basePrice: 15 },
    { symbol: 'SAND', name: 'The Sandbox', type: 'Gaming', basePrice: 0.6 },
    { symbol: 'PIXL', name: 'Pixel-World', type: 'Gaming', basePrice: 120 },
    { symbol: 'SKIN', name: 'Epic-Skins', type: 'Gaming', basePrice: 5 }
];

// 3. UTILIDADES
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// 4. LÓGICA DE MERCADO
const fetchMarket = () => {
    const shuffled = [...assetDatabase].sort(() => 0.5 - Math.random()).slice(0, 12);

    shuffled.forEach((a) => {
        const oldPrice = state.market.get(a.symbol)?.price || a.basePrice;
        const volatility = 0.04; 
        const newPrice = oldPrice * (1 + (Math.random() * volatility * 2 - volatility));
        
        state.market.set(a.symbol, {
            ...a,
            price: newPrice,
            changePercent: ((newPrice - oldPrice) / oldPrice) * 100
        });
    });

    renderMarket();
    if (refs.marketUpdated) refs.marketUpdated.textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
};

const renderMarket = () => {
    if (!refs.marketList) return;
    
    refs.marketList.innerHTML = Array.from(state.market.values()).map(a => {
        const isUp = a.changePercent >= 0;
        const arrow = isUp ? '../assets/arrows/Arrow-Up-Green-128.png' : '../assets/arrows/Arrow-Down-Red-128.png';
        
        return `
            <article class="asset-item">
                <div class="asset-info"><strong>${a.symbol}</strong><small>${a.name}</small></div>
                <span class="pill type-${a.type.toLowerCase()}">${a.type}</span>
                <strong>${formatCurrency(a.price)}</strong>
                <span class="${isUp ? 'up' : 'down'}">
                    <img src="${arrow}" class="market-arrow"> ${a.changePercent.toFixed(2)}%
                </span>
                <div class="market-btns">
                    <button class="btn-buy" onclick="buy('${a.symbol}')">C</button>
                    <button class="btn-sell" onclick="sell('${a.symbol}')">V</button>
                </div>
            </article>`;
    }).join('');
};

// 5. FUNCIONES DE COMPRA Y VENTA
window.buy = (symbol) => {
    const asset = state.market.get(symbol);
    if (!asset) return;

    if (state.monedas >= asset.price) {
        state.monedas -= asset.price;
        state.portfolio.set(symbol, {
            symbol: asset.symbol,
            buyPrice: asset.price,
            name: asset.name
        });
        updateUI();
    } else {
        alert("Monedas insuficientes");
    }
};

window.sell = (symbol) => {
    const position = state.portfolio.get(symbol);
    const currentAsset = state.market.get(symbol);

    if (!position) {
        alert("No tienes este activo");
        return;
    }

    const profit = currentAsset.price - position.buyPrice;
    state.monedas += currentAsset.price;

    // Afectar mascota
    state.saludConejo = profit > 0 
        ? Math.min(100, state.saludConejo + 10) 
        : Math.max(0, state.saludConejo - 15);

    state.portfolio.delete(symbol);
    updateUI();
};

// 6. ACTUALIZACIÓN DE INTERFAZ
const updateUI = () => {
    if (refs.monedasCount) refs.monedasCount.textContent = state.monedas.toFixed(2);
    if (refs.petHealthFill) refs.petHealthFill.style.width = `${state.saludConejo}%`;
    renderPortfolio();
};

const renderPortfolio = () => {
    // Buscamos la lista dentro del aside de cartera
    const container = document.querySelector('.portfolio-aside .portfolio-list');
    if (!container) return;

    if (state.portfolio.size === 0) {
        container.innerHTML = "<li>Aún no tienes posiciones abiertas.</li>";
        return;
    }

    let html = "";
    state.portfolio.forEach((pos, symbol) => {
        const current = state.market.get(symbol);
        const profit = current ? current.price - pos.buyPrice : 0;
        html += `
            <div class="portfolio-item">
                <div><strong>${symbol}</strong><br><small>Compra: ${formatCurrency(pos.buyPrice)}</small></div>
                <div class="${profit >= 0 ? 'up' : 'down'}">
                    <strong>${current ? formatCurrency(current.price) : '---'}</strong><br>
                    <small>${profit >= 0 ? '+' : ''}${formatCurrency(profit)}</small>
                </div>
            </div>`;
    });
    container.innerHTML = html;
};

// 7. HEADER Y PERFIL
window.toggleSettingsMenu = (event) => {
    event.stopPropagation();
    document.getElementById('settings-dropdown-menu').classList.toggle('show-menu');
};

window.handleAvatarChange = (path) => {
    const headerAvatar = document.getElementById('current-avatar-header');
    if (headerAvatar) headerAvatar.src = path;
    localStorage.setItem('bitgameso_avatar', path);
};

window.handleLogout = () => {
    if(confirm("¿Cerrar sesión?")) window.location.href = '../index.html';
};

// 8. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    // Mapeo de referencias
    refs.monedasCount = document.getElementById('monedas-count');
    refs.marketList = document.getElementById('lista-activos');
    refs.petHealthFill = document.getElementById('pet-health-fill');
    refs.marketUpdated = document.getElementById('market-updated');
    
    // Cargar avatar guardado
    const saved = localStorage.getItem('bitgameso_avatar');
    if (saved) {
        const headerAvatar = document.getElementById('current-avatar-header');
        if (headerAvatar) headerAvatar.src = saved;
    }

    // Scroll del mercado
    const up = document.getElementById('scroll-up');
    const down = document.getElementById('scroll-down');
    if (up) up.onclick = () => refs.marketList.scrollBy({ top: -100, behavior: 'smooth' });
    if (down) down.onclick = () => refs.marketList.scrollBy({ top: 100, behavior: 'smooth' });

    // Iniciar
    fetchMarket();
    setInterval(() => {
        fetchMarket();
        updateUI();
    }, 4000);
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', () => {
    const d = document.getElementById('settings-dropdown-menu');
    if(d) d.classList.remove('show-menu');
});