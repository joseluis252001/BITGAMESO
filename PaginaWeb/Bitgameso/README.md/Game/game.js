document.addEventListener('DOMContentLoaded', () => {
    const state = {
        monedas: 1000,
        saludConejo: 75,
        market: new Map(),
        portfolio: new Map()
    };

    // --- CONFIGURACIÓN DE MASCOTAS ---
    const listaMascotas = ['Bunny-Pink-128', 'Bear-100', 'Cat-Beige-128'];
    let indiceMascotaActual = 0;

    // --- BASE DE DATOS DE 50 ACTIVOS (Categorías solicitadas) ---
    const assetDatabase = [
        // BLUECHIPS
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Bluechip', basePrice: 175 },
        { symbol: 'MSFT', name: 'Microsoft', type: 'Bluechip', basePrice: 400 },
        { symbol: 'AMZN', name: 'Amazon', type: 'Bluechip', basePrice: 180 },
        { symbol: 'GOOGL', name: 'Alphabet', type: 'Bluechip', basePrice: 150 },
        { symbol: 'META', name: 'Meta Platforms', type: 'Bluechip', basePrice: 480 },
        { symbol: 'VIRT', name: 'Virtu-Nexus', type: 'Bluechip', basePrice: 320 },
        { symbol: 'STARK', name: 'Stark Ind.', type: 'Bluechip', basePrice: 850 },
        { symbol: 'GLD', name: 'Gold Trust', type: 'Metal', basePrice: 2100 },
        
        // INTELIGENCIA ARTIFICIAL (IA)
        { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'IA', basePrice: 800 },
        { symbol: 'SYNT', name: 'Syntha-Mind', type: 'IA', basePrice: 120 },
        { symbol: 'AIGEN', name: 'AI Genesis', type: 'IA', basePrice: 45 },
        { symbol: 'OPENA', name: 'Neural-Sync', type: 'IA', basePrice: 210 },
        { symbol: 'CORE', name: 'Core-AI', type: 'IA', basePrice: 95 },
        { symbol: 'DATA', name: 'Data-Pulse', type: 'IA', basePrice: 65 },
        { symbol: 'ROBT', name: 'Robo-Dynamics', type: 'IA', basePrice: 140 },
        { symbol: 'HAL', name: 'HAL-9000 Systems', type: 'IA', basePrice: 900 },

        // MONEDAS DIGITALES (DIGITAL)
        { symbol: 'BTC', name: 'Bitcoin', type: 'Digital', basePrice: 65000 },
        { symbol: 'ETH', name: 'Ethereum', type: 'Digital', basePrice: 3500 },
        { symbol: 'SOL', name: 'Solana', type: 'Digital', basePrice: 140 },
        { symbol: 'BNB', name: 'Binance Coin', type: 'Digital', basePrice: 580 },
        { symbol: 'BITG', name: 'BitGameCoin', type: 'Digital', basePrice: 12 },
        { symbol: 'MOON', name: 'Moon-Token', type: 'Digital', basePrice: 0.5 },
        { symbol: 'BUNY', name: 'Bunny-Coin', type: 'Digital', basePrice: 2.5 },
        { symbol: 'NEON', name: 'Neon-Crypto', type: 'Digital', basePrice: 85 },
        { symbol: 'DOGE', name: 'Doge-Meme', type: 'Digital', basePrice: 0.15 },

        // GAMING & NFTS
        { symbol: 'GME', name: 'GameStop', type: 'Gaming', basePrice: 15 },
        { symbol: 'SAND', name: 'The Sandbox', type: 'NFT', basePrice: 0.6 },
        { symbol: 'MANA', name: 'Decentraland', type: 'NFT', basePrice: 0.7 },
        { symbol: 'AXS', name: 'Axie Infinity', type: 'Gaming', basePrice: 10 },
        { symbol: 'ULTI', name: 'Ultimate-Play', type: 'Gaming', basePrice: 35 },
        { symbol: 'PIXL', name: 'Pixel-World', type: 'NFT', basePrice: 120 },
        { symbol: 'SKIN', name: 'Epic-Skins', type: 'Gaming', basePrice: 5 },
        { symbol: 'QUEST', name: 'VR-Quest', type: 'Gaming', basePrice: 90 },
        { symbol: 'BAYC', name: 'Ape-Vault', type: 'NFT', basePrice: 45000 },
        { symbol: 'KRAK', name: 'Kraken-Games', type: 'Gaming', basePrice: 22 },
        { symbol: 'LOOT', name: 'Loot-Box Ind.', type: 'Gaming', basePrice: 8 },
        { symbol: 'VOX', name: 'Vox-Assets', type: 'NFT', basePrice: 45 }
    ];

    const refs = {
        monedasCount: document.getElementById('monedas-count'),
        marketList: document.getElementById('lista-activos'),
        petHealthFill: document.getElementById('pet-health-fill'),
        petCharacter: document.getElementById('pet-character'),
        btnCambiarPet: document.getElementById('btn-cambiar-pet'),
        marketUpdated: document.getElementById('market-updated')
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    // --- LÓGICA DE MERCADO ---
    const fetchMarket = () => {
        // Seleccionamos 12 activos al azar de la base de datos para mostrar
        const shuffled = [...assetDatabase].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 12);

        selected.forEach((a) => {
            const oldPrice = state.market.get(a.symbol)?.price || a.basePrice;
            const volatility = 0.04; // 4% de movimiento
            const newPrice = oldPrice * (1 + (Math.random() * volatility * 2 - volatility));
            
            state.market.set(a.symbol, {
                ...a,
                price: newPrice,
                changePercent: ((newPrice - oldPrice) / oldPrice) * 100
            });
        });

        renderMarket();
        refs.marketUpdated.textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
    };

    const renderMarket = () => {
        if (!refs.marketList) return;
        
        refs.marketList.innerHTML = Array.from(state.market.values()).map(a => {
            const isUp = a.changePercent >= 0;
            const arrow = isUp ? '../assets/arrows/Arrow-Up-Green-128.png' : '../assets/arrows/Arrow-Down-Red-128.png';
            
            return `
                <article class="asset-item">
                    <div class="asset-info">
                        <strong>${a.symbol}</strong>
                        <small>${a.name}</small>
                    </div>
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

    // --- NAVEGACIÓN Y MASCOTA ---
    document.getElementById('scroll-up').onclick = () => refs.marketList.scrollBy({ top: -100, behavior: 'smooth' });
    document.getElementById('scroll-down').onclick = () => refs.marketList.scrollBy({ top: 100, behavior: 'smooth' });

    const updatePet = () => {
        if (refs.petHealthFill) refs.petHealthFill.style.width = `${state.saludConejo}%`;
        if (refs.btnCambiarPet) refs.btnCambiarPet.disabled = state.saludConejo < 100;
    };

    // Inicialización
    setInterval(fetchMarket, 4000); 
    fetchMarket();
    updatePet();
});

// Funciones globales para los botones de la lista
window.buy = (symbol) => alert("Solicitud de compra para: " + symbol);
window.sell = (symbol) => alert("Solicitud de venta para: " + symbol);

// --- FUNCIONES GLOBALES PARA EL HEADER (Perfil, Avatar, Logout) ---

// 1. Alternar la visibilidad del menú desplegable
function toggleSettingsMenu(event) {
    // Evita que el clic se propague al documento (para cerrarlo al hacer clic fuera)
    event.stopPropagation();
    const dropdown = document.getElementById('settings-dropdown-menu');
    dropdown.classList.toggle('show-menu');
}

// 2. Manejar el cambio de Avatar y guardarlo
function handleAvatarChange(avatarPath) {
    // Actualizar la imagen en el header
    const currentAvatarHeader = document.getElementById('current-avatar-header');
    if (currentAvatarHeader) {
        currentAvatarHeader.src = avatarPath;
    }
    
    // Guardar la ruta en localStorage para que persista
    localStorage.setItem('bitgameso_avatar', avatarPath);
    
    // Opcional: Cerrar el menú después de elegir
    const dropdown = document.getElementById('settings-dropdown-menu');
    dropdown.classList.remove('show-menu');
}

// 3. Manejar el Cierre de Sesión
function handleLogout() {
    if(confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        // Aquí podrías limpiar datos de sesión si usas cookies/tokens
        // Por ahora, redirigimos a la página de inicio (ajusta la ruta según tu proyecto)
        window.location.href = '../index.html'; 
    }
}

// --- CERRAR EL MENÚ AL HACER CLIC FUERA ---
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('settings-dropdown-menu');
    const profileTrigger = document.querySelector('.profile-trigger');
    
    // Si el menú está abierto y el clic no fue dentro del menú ni en el disparador del perfil
    if (dropdown && dropdown.classList.contains('show-menu') && 
        !dropdown.contains(event.target) && !profileTrigger.contains(event.target)) {
        dropdown.classList.remove('show-menu');
    }
});


// --- LÓGICA PRINCIPAL DEL JUEGO (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // ... (Mantenemos tu estado de monedas, salud, etc.) ...
    const state = {
        monedas: 1000,
        saludConejo: 75,
        market: new Map(),
        portfolio: new Map()
    };

    // ... (Mantenemos referencias y otras lógicas existentes) ...
    const refs = {
        monedasCount: document.getElementById('monedas-count'),
        // ... otras referencias ...
    };

    // --- CARGAR AVATAR GUARDADO AL INICIAR ---
    const savedAvatar = localStorage.getItem('bitgameso_avatar');
    const currentAvatarHeader = document.getElementById('current-avatar-header');
    if (savedAvatar && currentAvatarHeader) {
        currentAvatarHeader.src = savedAvatar;
    }

    // ... (Mantenemos tu lógica de mercado vivo, mascota, navegación, etc.) ...
    // ... (fetchMarket, renderMarket, updatePet, etc.) ...
    
});