// ============================================================
//  BITGAMESO - game.js  v3
// ============================================================

const SAVE_KEY = 'bitgameso_save_v3';

const state = {
    monedas: 1000.00,
    saludMascota: 75,
    currentPet: 'Bunny-Pink-128',
    market: new Map(),
    portfolio: new Map(),
    inventory: [],
    activeEffects: {},
    marketInterval: null,
    marketSpeed: 3000,
    selectedInventoryItem: null
};

const refs = {};

// ============================================================
//  FOOD DATABASE
// ============================================================
const foodDatabase = [
    // BASIC
    { id:'Grass-128',           name:'Hierba',        price:5,   healthGain:2,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Turnip-128',          name:'Nabo',           price:7,   healthGain:3,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Carrot-128',          name:'Zanahoria',      price:8,   healthGain:4,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Potato-128',          name:'Papa',           price:8,   healthGain:3,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Lemon-128',           name:'Limón',          price:9,   healthGain:4,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Banana-128',          name:'Banana',         price:10,  healthGain:4,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Corn-128',            name:'Maíz',           price:10,  healthGain:5,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Apple-128',           name:'Manzana',        price:12,  healthGain:5,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Pumpkin-128',         name:'Calabaza',       price:14,  healthGain:6,  effect:null,           duration:0,  tier:'basic'   },
    { id:'Egg-128',             name:'Huevo',          price:15,  healthGain:6,  effect:null,           duration:0,  tier:'basic'   },
    // MID
    { id:'Tomato-128',          name:'Tomate',         price:25,  healthGain:7,  effect:null,           duration:0,  tier:'mid'     },
    { id:'Orange-128',          name:'Naranja',        price:28,  healthGain:8,  effect:null,           duration:0,  tier:'mid'     },
    { id:'Pear-128',            name:'Pera',           price:30,  healthGain:9,  effect:null,           duration:0,  tier:'mid'     },
    { id:'Blueberries-128',     name:'Arándanos',      price:35,  healthGain:10, effect:null,           duration:0,  tier:'mid'     },
    { id:'Strawberry-128',      name:'Fresa',          price:38,  healthGain:11, effect:null,           duration:0,  tier:'mid'     },
    { id:'Cherry-128',          name:'Cereza',         price:40,  healthGain:12, effect:null,           duration:0,  tier:'mid'     },
    { id:'Peach-128',           name:'Durazno',        price:42,  healthGain:12, effect:null,           duration:0,  tier:'mid'     },
    { id:'Bread-128',           name:'Pan',            price:45,  healthGain:13, effect:null,           duration:0,  tier:'mid'     },
    { id:'Watermelon-128',      name:'Sandía',         price:50,  healthGain:15, effect:null,           duration:0,  tier:'mid'     },
    { id:'Mushroom-128',        name:'Champiñón',      price:55,  healthGain:14, effect:'marketInsight',duration:30, tier:'mid'     },
    { id:'Fish-128',            name:'Pescado',        price:60,  healthGain:18, effect:'speedBoost',   duration:30, tier:'mid'     },
    { id:'Meat-128',            name:'Carne',          price:75,  healthGain:20, effect:'speedBoost',   duration:45, tier:'mid'     },
    // PREMIUM
    { id:'Candy-Pink-128',      name:'Dulce Rosa',     price:80,  healthGain:18, effect:'speedBoost',   duration:30, tier:'premium' },
    { id:'Bretzel-128',         name:'Bretzel',        price:90,  healthGain:22, effect:null,           duration:0,  tier:'premium' },
    { id:'Cookie-128',          name:'Galleta',        price:100, healthGain:20, effect:'speedBoost',   duration:60, tier:'premium' },
    { id:'Mushroom-Purple-128', name:'Hongo Místico',  price:120, healthGain:25, effect:'marketInsight',duration:60, tier:'premium' },
    { id:'Cupcake-128',         name:'Cupcake',        price:150, healthGain:30, effect:'speedBoost',   duration:60, tier:'premium' },
    { id:'Candy-Blue-128',      name:'Dulce Azul',     price:200, healthGain:15, effect:'marketInsight',duration:60, tier:'premium' },
];

const tierLabel = { basic:'⭐ Básico', mid:'⭐⭐ Medio', premium:'⭐⭐⭐ Premium' };
const tierColor = { basic:'#aaa', mid:'#94E2D5', premium:'#CBA6F7' };

// ============================================================
//  150+ ACTIVOS
// ============================================================
const assetDatabase = [
    // CRYPTO (30)
    {symbol:'BTC',    name:'Bitcoin',              type:'Crypto',   basePrice:62000},
    {symbol:'ETH',    name:'Ethereum',             type:'Crypto',   basePrice:3400},
    {symbol:'SOL',    name:'Solana',               type:'Crypto',   basePrice:180},
    {symbol:'BNB',    name:'Binance Coin',         type:'Crypto',   basePrice:420},
    {symbol:'ADA',    name:'Cardano',              type:'Crypto',   basePrice:0.85},
    {symbol:'DOT',    name:'Polkadot',             type:'Crypto',   basePrice:12},
    {symbol:'AVAX',   name:'Avalanche',            type:'Crypto',   basePrice:55},
    {symbol:'MATIC',  name:'Polygon',              type:'Crypto',   basePrice:1.20},
    {symbol:'LINK',   name:'Chainlink',            type:'Crypto',   basePrice:22},
    {symbol:'XRP',    name:'Ripple',               type:'Crypto',   basePrice:0.75},
    {symbol:'LTC',    name:'Litecoin',             type:'Crypto',   basePrice:105},
    {symbol:'DOGE',   name:'Dogecoin',             type:'Crypto',   basePrice:0.18},
    {symbol:'UNI',    name:'Uniswap',              type:'Crypto',   basePrice:11},
    {symbol:'NEAR',   name:'NEAR Protocol',        type:'Crypto',   basePrice:8},
    {symbol:'ATOM',   name:'Cosmos',               type:'Crypto',   basePrice:14},
    {symbol:'ZETA',   name:'ZetaChain',            type:'Crypto',   basePrice:7.5},
    {symbol:'FLUX',   name:'FluxNet',              type:'Crypto',   basePrice:1.8},
    {symbol:'PRISM',  name:'PrismFi',              type:'Crypto',   basePrice:28},
    {symbol:'VOLT',   name:'VoltNode',             type:'Crypto',   basePrice:55},
    {symbol:'CYPH',   name:'CypherCoin',           type:'Crypto',   basePrice:4.2},
    {symbol:'MIST',   name:'MistDEX',              type:'Crypto',   basePrice:14},
    {symbol:'GRAIL',  name:'HolyGrailFi',          type:'Crypto',   basePrice:320},
    {symbol:'EDEN',   name:'EdenChain',            type:'Crypto',   basePrice:3.7},
    {symbol:'GHOST',  name:'GhostLayer',           type:'Crypto',   basePrice:0.22},
    {symbol:'NEBX',   name:'NebulaEx',             type:'Crypto',   basePrice:0.45},
    {symbol:'HBAR',   name:'Hedera',               type:'Crypto',   basePrice:0.12},
    {symbol:'ALGO',   name:'Algorand',             type:'Crypto',   basePrice:0.30},
    {symbol:'VET',    name:'VeChain',              type:'Crypto',   basePrice:0.05},
    {symbol:'SHIB',   name:'Shiba Inu',            type:'Crypto',   basePrice:0.00003},
    {symbol:'FTM',    name:'Fantom',               type:'Crypto',   basePrice:0.55},
    // IA (32)
    {symbol:'NVDA',   name:'NVIDIA Corp',          type:'IA',       basePrice:800},
    {symbol:'MSFT',   name:'Microsoft',            type:'IA',       basePrice:390},
    {symbol:'GOOG',   name:'Alphabet',             type:'IA',       basePrice:170},
    {symbol:'META',   name:'Meta Platforms',       type:'IA',       basePrice:490},
    {symbol:'AIGEN',  name:'AI Genesis',           type:'IA',       basePrice:45},
    {symbol:'SYNTH',  name:'SynthMind Corp',       type:'IA',       basePrice:230},
    {symbol:'NEXAI',  name:'NexAI Systems',        type:'IA',       basePrice:88},
    {symbol:'COGN',   name:'Cognify Labs',         type:'IA',       basePrice:155},
    {symbol:'QNTM',   name:'Quantum Neural',       type:'IA',       basePrice:310},
    {symbol:'ARIA',   name:'ARIA Intelligence',    type:'IA',       basePrice:67},
    {symbol:'DMND',   name:'DeepMind Digital',     type:'IA',       basePrice:920},
    {symbol:'ORION',  name:'Orion AI',             type:'IA',       basePrice:42},
    {symbol:'PULSE',  name:'PulseAI Inc',          type:'IA',       basePrice:198},
    {symbol:'SPARK',  name:'SparkLogic AI',        type:'IA',       basePrice:77},
    {symbol:'VORTX',  name:'Vortex AI',            type:'IA',       basePrice:540},
    {symbol:'HELIX',  name:'Helix Neural',         type:'IA',       basePrice:115},
    {symbol:'LUMIA',  name:'Lumia AI',             type:'IA',       basePrice:29},
    {symbol:'ECHO',   name:'EchoMind',             type:'IA',       basePrice:185},
    {symbol:'AXON',   name:'Axon Systems',         type:'IA',       basePrice:360},
    {symbol:'NOVA',   name:'Nova Intelligence',    type:'IA',       basePrice:93},
    {symbol:'XENON',  name:'Xenon Labs',           type:'IA',       basePrice:87},
    {symbol:'DRIFT',  name:'DriftAI',              type:'IA',       basePrice:210},
    {symbol:'PHASE',  name:'PhaseNet AI',          type:'IA',       basePrice:66},
    {symbol:'TRAX',   name:'TraxAI',               type:'IA',       basePrice:39},
    {symbol:'BLAZE',  name:'BlazeEngine',          type:'IA',       basePrice:178},
    {symbol:'FUSE',   name:'FuseMatrix',           type:'IA',       basePrice:95},
    {symbol:'IRIS',   name:'IRIS Networks',        type:'IA',       basePrice:430},
    {symbol:'OPTIC',  name:'OpticAI',              type:'IA',       basePrice:53},
    {symbol:'SURGE',  name:'SurgeAI',              type:'IA',       basePrice:145},
    {symbol:'ZYPHR',  name:'ZypherAI',             type:'IA',       basePrice:62},
    {symbol:'VELA',   name:'VelaMind',             type:'IA',       basePrice:297},
    {symbol:'KRON',   name:'KronAI',               type:'IA',       basePrice:411},
    // BLUECHIP (28)
    {symbol:'AAPL',   name:'Apple Inc',            type:'Bluechip', basePrice:185},
    {symbol:'AMZN',   name:'Amazon',               type:'Bluechip', basePrice:195},
    {symbol:'TSLA',   name:'Tesla',                type:'Bluechip', basePrice:220},
    {symbol:'JPM',    name:'JPMorgan Chase',       type:'Bluechip', basePrice:200},
    {symbol:'JNJ',    name:'Johnson & Johnson',    type:'Bluechip', basePrice:155},
    {symbol:'WMT',    name:'Walmart',              type:'Bluechip', basePrice:170},
    {symbol:'DIS',    name:'Disney',               type:'Bluechip', basePrice:115},
    {symbol:'KO',     name:'Coca-Cola',            type:'Bluechip', basePrice:62},
    {symbol:'PEP',    name:'PepsiCo',              type:'Bluechip', basePrice:175},
    {symbol:'MCD',    name:"McDonald's",           type:'Bluechip', basePrice:285},
    {symbol:'NKE',    name:'Nike',                 type:'Bluechip', basePrice:100},
    {symbol:'V',      name:'Visa Inc',             type:'Bluechip', basePrice:270},
    {symbol:'MA',     name:'Mastercard',           type:'Bluechip', basePrice:455},
    {symbol:'BAC',    name:'Bank of America',      type:'Bluechip', basePrice:38},
    {symbol:'GS',     name:'Goldman Sachs',        type:'Bluechip', basePrice:450},
    {symbol:'BRKB',   name:'Berkshire Hathaway',   type:'Bluechip', basePrice:380},
    {symbol:'ORBX',   name:'Orbex Industries',     type:'Bluechip', basePrice:95},
    {symbol:'CRVN',   name:'Corvana Corp',         type:'Bluechip', basePrice:142},
    {symbol:'HEXC',   name:'HexCorp Global',       type:'Bluechip', basePrice:310},
    {symbol:'TALM',   name:'Talmex Holdings',      type:'Bluechip', basePrice:75},
    {symbol:'DREX',   name:'DrexGroup',            type:'Bluechip', basePrice:220},
    {symbol:'VELOX',  name:'Velox Industries',     type:'Bluechip', basePrice:185},
    {symbol:'PAXN',   name:'Paxon Capital',        type:'Bluechip', basePrice:495},
    {symbol:'KOREX',  name:'Korex International',  type:'Bluechip', basePrice:130},
    {symbol:'LUNVX',  name:'LunVex Corp',          type:'Bluechip', basePrice:68},
    {symbol:'PRIMX',  name:'Primex Financial',     type:'Bluechip', basePrice:244},
    {symbol:'STRATX', name:'Stratex Holdings',     type:'Bluechip', basePrice:365},
    {symbol:'GENCO',  name:'Gencor Group',         type:'Bluechip', basePrice:112},
    // GAMING (20)
    {symbol:'SKIN',   name:'Epic Skins',           type:'Gaming',   basePrice:5},
    {symbol:'LOOT',   name:'LootBox Token',        type:'Gaming',   basePrice:2.5},
    {symbol:'RUNE',   name:'RuneMarket',           type:'Gaming',   basePrice:18},
    {symbol:'QUEST',  name:'QuestCoin',            type:'Gaming',   basePrice:0.80},
    {symbol:'PIXEL',  name:'PixelVerse',           type:'Gaming',   basePrice:35},
    {symbol:'GLD',    name:'GameGold',             type:'Gaming',   basePrice:7},
    {symbol:'ARENA',  name:'ArenaToken',           type:'Gaming',   basePrice:12},
    {symbol:'CRAFT',  name:'CraftDAO',             type:'Gaming',   basePrice:4.2},
    {symbol:'EPIC',   name:'EpicNFT',              type:'Gaming',   basePrice:65},
    {symbol:'GUILD',  name:'GuildMaster',          type:'Gaming',   basePrice:8.5},
    {symbol:'SPAWN',  name:'SpawnPoint',           type:'Gaming',   basePrice:22},
    {symbol:'BLADE',  name:'BladeFi',              type:'Gaming',   basePrice:15},
    {symbol:'FORGE',  name:'ForgeChain',           type:'Gaming',   basePrice:31},
    {symbol:'NEXUS',  name:'NexusPlay',            type:'Gaming',   basePrice:44},
    {symbol:'VALOR',  name:'ValorToken',           type:'Gaming',   basePrice:6},
    {symbol:'MYTH',   name:'MythWorld',            type:'Gaming',   basePrice:19},
    {symbol:'JOYST',  name:'JoystickDAO',          type:'Gaming',   basePrice:3.1},
    {symbol:'DUEL',   name:'DuelVerse',            type:'Gaming',   basePrice:27},
    {symbol:'ALPHA',  name:'AlphaGuild',           type:'Gaming',   basePrice:52},
    {symbol:'CRYPT',  name:'CryptDungeon',         type:'Gaming',   basePrice:9},
    // NFT (20)
    {symbol:'BAYC',   name:'Bored Ape Club',       type:'NFT',      basePrice:28000},
    {symbol:'PUNK',   name:'CryptoPunks',          type:'NFT',      basePrice:85000},
    {symbol:'AZUKI',  name:'Azuki NFT',            type:'NFT',      basePrice:9500},
    {symbol:'DOODLE', name:'Doodles NFT',          type:'NFT',      basePrice:5200},
    {symbol:'CLONE',  name:'CloneX',               type:'NFT',      basePrice:4100},
    {symbol:'BEAST',  name:'NFT Beasts',           type:'NFT',      basePrice:750},
    {symbol:'PIXL',   name:'PixelPunks',           type:'NFT',      basePrice:320},
    {symbol:'AURA',   name:'AuraPets NFT',         type:'NFT',      basePrice:95},
    {symbol:'NEON',   name:'NeonKids NFT',         type:'NFT',      basePrice:1200},
    {symbol:'FRACL',  name:'FractalArt NFT',       type:'NFT',      basePrice:660},
    {symbol:'ZOMB',   name:'ZombieDAO NFT',        type:'NFT',      basePrice:430},
    {symbol:'REALM',  name:'RealmKeys NFT',        type:'NFT',      basePrice:2400},
    {symbol:'VOXL',   name:'VoxelWorld NFT',       type:'NFT',      basePrice:875},
    {symbol:'DRIP',   name:'DripHouse NFT',        type:'NFT',      basePrice:1650},
    {symbol:'KART',   name:'KartNFT Race',         type:'NFT',      basePrice:340},
    {symbol:'RELIC',  name:'RelicDAO',             type:'NFT',      basePrice:510},
    {symbol:'CRTRX',  name:'CrtrxGenesis NFT',     type:'NFT',      basePrice:3800},
    {symbol:'MOCHI',  name:'MochiFrens NFT',       type:'NFT',      basePrice:120},
    {symbol:'BLNK',   name:'BlankCanvas NFT',      type:'NFT',      basePrice:290},
    {symbol:'GHOST2', name:'GhostNFT',             type:'NFT',      basePrice:180},
];

const petList = [
    {id:'Bear-100',             label:'Oso'},
    {id:'Bird-128',             label:'Pájaro'},
    {id:'Bunny-Pink-128',       label:'Conejito'},
    {id:'Cat-Beige-128',        label:'Gato Beige'},
    {id:'Cat-Blue-128',         label:'Gato Azul'},
    {id:'Cat-Pink-128',         label:'Gato Rosa'},
    {id:'Cat-Tiger-128',        label:'Gato Tigre'},
    {id:'Cat-Tiger-Beige-128',  label:'Tigre Beige'},
    {id:'Cat-Tiger-Rose-128',   label:'Tigre Rosa'},
    {id:'Cat-White-128',        label:'Gato Blanco'},
    {id:'Chicken-White-128',    label:'Pollito'},
    {id:'Chicken-Yellow-128',   label:'Pollito Amarillo'},
    {id:'Cow-128',              label:'Vaca'},
    {id:'Frog-128',             label:'Rana'},
    {id:'Penguin-128',          label:'Pingüino'},
    {id:'Penguin-Pink-128',     label:'Pingüino Rosa'},
    {id:'Shark-128',            label:'Tiburón'},
    {id:'Sheep-128',            label:'Oveja'},
];

// ============================================================
//  UTILIDADES
// ============================================================
const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(val);

// ============================================================
//  SAVE / LOAD
// ============================================================
const saveGame = () => {
    const data = {
        monedas:      state.monedas,
        saludMascota: state.saludMascota,
        currentPet:   state.currentPet,
        portfolio:    Array.from(state.portfolio.entries()),
        inventory:    state.inventory,
        activeEffects:state.activeEffects,
        marketSpeed:  state.marketSpeed,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};

const loadGame = () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
        const data = JSON.parse(raw);
        state.monedas      = data.monedas      ?? 1000;
        state.saludMascota = data.saludMascota ?? 75;
        state.currentPet   = data.currentPet   ?? 'Bunny-Pink-128';
        state.inventory    = data.inventory    ?? [];
        state.marketSpeed  = data.marketSpeed  ?? 3000;
        const now = Date.now();
        state.activeEffects = {};
        if (data.activeEffects) {
            Object.entries(data.activeEffects).forEach(([k, v]) => {
                if (v > now) state.activeEffects[k] = v;
            });
        }
        state.portfolio.clear();
        (data.portfolio || []).forEach(([sym, pos]) => state.portfolio.set(sym, pos));
    } catch(e) { console.warn('Error cargando save', e); }
};

// ============================================================
//  EFECTOS
// ============================================================
const isEffectActive = (effect) =>
    state.activeEffects[effect] && state.activeEffects[effect] > Date.now();

const activateEffect = (effect, durationSecs) => {
    state.activeEffects[effect] = Date.now() + durationSecs * 1000;
    updateEffectBadges();
    saveGame();
    if (effect === 'speedBoost') {
        state.marketSpeed = 1000;
        clearInterval(state.marketInterval);
        state.marketInterval = setInterval(fetchMarket, state.marketSpeed);
    }
    setTimeout(() => {
        if (effect === 'speedBoost') {
            state.marketSpeed = 3000;
            clearInterval(state.marketInterval);
            state.marketInterval = setInterval(fetchMarket, state.marketSpeed);
            showToast('⚡ Velocidad de mercado normalizada');
        }
        if (effect === 'marketInsight') {
            showToast('🔍 Visión del mercado terminó');
            renderMarket();
        }
        delete state.activeEffects[effect];
        updateEffectBadges();
        saveGame();
    }, durationSecs * 1000);
};

const updateEffectBadges = () => {
    const c = document.getElementById('effect-badges');
    if (!c) return;
    const now = Date.now();
    let html = '';
    if (state.activeEffects.speedBoost > now) {
        const s = Math.ceil((state.activeEffects.speedBoost - now) / 1000);
        html += `<span class="effect-badge speed">⚡ x2 Velocidad <em>${s}s</em></span>`;
    }
    if (state.activeEffects.marketInsight > now) {
        const s = Math.ceil((state.activeEffects.marketInsight - now) / 1000);
        html += `<span class="effect-badge insight">🔍 Mejores ofertas <em>${s}s</em></span>`;
    }
    c.innerHTML = html;
};
setInterval(updateEffectBadges, 1000);

// ============================================================
//  MERCADO
// ============================================================
const fetchMarket = () => {
    assetDatabase.forEach(a => {
        const old = state.market.get(a.symbol)?.price || a.basePrice;
        const v = 0.025;
        const newPrice = Math.max(0.00001, old * (1 + (Math.random() * v * 2 - v)));
        state.market.set(a.symbol, { ...a, price:newPrice, changePercent:((newPrice-old)/old)*100 });
    });
    const now = new Date();
    if (refs.marketUpdated) refs.marketUpdated.textContent = `Actualizado: ${now.toLocaleTimeString()}`;
    renderMarket();
    renderPortfolio();
};

const typeColor = (type) => ({
    Crypto:'#F9E2AF', IA:'#CBA6F7', Bluechip:'#94E2D5', Gaming:'#A6E3A1', NFT:'#F38BA8'
}[type] || '#aaa');

const renderMarket = () => {
    if (!refs.marketList) return;
    const insight = isEffectActive('marketInsight');
    let assets = Array.from(state.market.values());
    if (insight) assets = [...assets].sort((a, b) => b.changePercent - a.changePercent);

    const filterEl = document.getElementById('market-filter');
    const filter = filterEl ? filterEl.value : 'Todos';
    if (filter && filter !== 'Todos') assets = assets.filter(a => a.type === filter);

    refs.marketList.innerHTML = assets.map(a => {
        const isUp  = a.changePercent >= 0;
        const owned = state.portfolio.has(a.symbol);
        const isHot = insight && a.changePercent > 1;
        return `
        <div class="asset-row ${isHot ? 'asset-hot' : ''}">
            <div class="asset-info">
                <strong class="asset-symbol">${a.symbol}${isHot ? ' 🔥' : ''}</strong>
                <small class="asset-name">${a.name}</small>
            </div>
            <div class="asset-type" style="color:${typeColor(a.type)}">${a.type}</div>
            <div class="asset-price">${formatCurrency(a.price)}</div>
            <div class="asset-change ${isUp ? 'up' : 'down'}">
                ${isUp ? '▲' : '▼'} ${Math.abs(a.changePercent).toFixed(2)}%
            </div>
            <div class="market-btns">
                <button class="btn-action btn-buy ${owned ? 'btn-disabled' : ''}"
                        onclick="buy('${a.symbol}')" ${owned ? 'disabled' : ''}>
                    Comprar
                </button>
            </div>
        </div>`;
    }).join('');
};

// ============================================================
//  COMPRAR ACTIVO
// ============================================================
window.buy = (symbol) => {
    if (state.portfolio.has(symbol)) { showToast('⚠️ Ya tienes este activo.'); return; }
    const asset = state.market.get(symbol);
    if (!asset) return;
    if (state.monedas >= asset.price) {
        state.monedas -= asset.price;
        state.portfolio.set(symbol, { symbol:asset.symbol, name:asset.name, buyPrice:asset.price });
        showToast(`✅ Compraste ${asset.symbol} por ${formatCurrency(asset.price)}`);
        updateUI(); saveGame();
    } else {
        showToast('❌ ¡No tienes suficientes monedas!');
    }
};

// ============================================================
//  VENDER ACTIVO (Cartera)
// ============================================================
window.sellFromPortfolio = (symbol) => {
    const pos = state.portfolio.get(symbol);
    const cur = state.market.get(symbol);
    if (!pos || !cur) return;
    const profit = cur.price - pos.buyPrice;
    state.monedas += cur.price;
    state.portfolio.delete(symbol);
    if (profit > 0) {
        const gain = Math.min(Math.round((profit / pos.buyPrice) * 20), 20);
        changePetHealth(gain);
        showToast(`🎉 +${formatCurrency(profit)} de ganancia. Mascota +${gain}❤️`);
    } else if (profit < 0) {
        const loss = Math.min(Math.round((Math.abs(profit) / pos.buyPrice) * 20), 20);
        changePetHealth(-loss);
        showToast(`📉 -${formatCurrency(Math.abs(profit))} de pérdida. Mascota -${loss}❤️`);
    } else {
        showToast(`➡️ Vendiste ${symbol} sin ganancia.`);
    }
    updateUI(); saveGame(); checkGameOver();
};

// ============================================================
//  TIENDA DE COMIDA
// ============================================================
window.openFoodShop = () => {
    document.getElementById('modal-tienda').style.display = 'flex';
    renderFoodShop();
};
window.closeFoodShop = () => { document.getElementById('modal-tienda').style.display = 'none'; };

const renderFoodShop = () => {
    const grid = document.getElementById('food-shop-grid');
    if (!grid) return;
    let html = '';
    ['basic','mid','premium'].forEach(tier => {
        const items = foodDatabase.filter(f => f.tier === tier);
        html += `<div class="food-tier-label" style="color:${tierColor[tier]}">${tierLabel[tier]}</div>`;
        html += `<div class="food-tier-row">`;
        items.forEach(food => {
            const canAfford = state.monedas >= food.price;
            const efx = food.effect
                ? `<span class="food-effect">${food.effect === 'speedBoost' ? `⚡${food.duration}s` : `🔍${food.duration}s`}</span>`
                : '';
            html += `
            <div class="food-card ${!canAfford ? 'food-cant-afford' : ''}" onclick="${canAfford ? `buyFood('${food.id}')` : ''}">
                <div class="food-img" style="background-image:url('../assets/food/${food.id}.png')"></div>
                <div class="food-name">${food.name}</div>
                <div class="food-stats">+${food.healthGain}❤️${efx}</div>
                <div class="food-price ${!canAfford ? 'price-red' : ''}">${food.price}🪙</div>
            </div>`;
        });
        html += `</div>`;
    });
    grid.innerHTML = html;
};

window.buyFood = (foodId) => {
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food || state.monedas < food.price) { showToast('❌ No tienes monedas suficientes.'); return; }
    state.monedas -= food.price;
    state.inventory.push({ ...food, uid: Date.now() + Math.random() });
    showToast(`🛒 Compraste ${food.name}!`);
    renderFoodShop();
    updateUI(); saveGame();
};

// ============================================================
//  INVENTARIO (barra bajo monedas)
// ============================================================
const renderInventory = () => {
    const bar = document.getElementById('inventory-bar');
    if (!bar) return;
    if (state.inventory.length === 0) {
        bar.innerHTML = `<span class="inv-empty">Sin comida en inventario. Usa el botón <b>Comprar</b> 🛒</span>`;
    } else {
        bar.innerHTML = state.inventory.map((item, idx) => `
            <div class="inv-item ${state.selectedInventoryItem === idx ? 'inv-selected' : ''}"
                 onclick="selectInventoryItem(${idx})" title="${item.name}">
                <div class="inv-img" style="background-image:url('../assets/food/${item.id}.png')"></div>
                <span class="inv-name">${item.name}</span>
            </div>
        `).join('');
    }
    const panel = document.getElementById('inv-action-panel');
    if (!panel) return;
    if (state.selectedInventoryItem !== null && state.inventory[state.selectedInventoryItem]) {
        const sel = state.inventory[state.selectedInventoryItem];
        panel.style.display = 'flex';
        panel.innerHTML = `
            <span class="inv-sel-name">✔️ ${sel.name}</span>
            <button class="btn-inv-action btn-inv-send" onclick="feedPet()">🎁 Dar a mascota</button>
            <button class="btn-inv-action btn-inv-sell" onclick="sellFood()">💰 Vender (${Math.floor(sel.price/2)}🪙)</button>
        `;
    } else {
        panel.style.display = 'none';
    }
};

window.selectInventoryItem = (idx) => {
    state.selectedInventoryItem = state.selectedInventoryItem === idx ? null : idx;
    renderInventory();
};

window.sellFood = () => {
    const idx = state.selectedInventoryItem;
    if (idx === null || !state.inventory[idx]) return;
    const item = state.inventory[idx];
    state.monedas += Math.floor(item.price / 2);
    state.inventory.splice(idx, 1);
    state.selectedInventoryItem = null;
    showToast(`💰 Vendiste ${item.name} por ${Math.floor(item.price/2)} monedas`);
    updateUI(); saveGame();
};

window.feedPet = () => {
    const idx = state.selectedInventoryItem;
    if (idx === null || !state.inventory[idx]) return;
    const item = state.inventory[idx];
    changePetHealth(item.healthGain);
    showToast(`🍽️ Le diste ${item.name} a tu mascota! +${item.healthGain}❤️`);
    if (item.effect && item.duration > 0) {
        activateEffect(item.effect, item.duration);
        showToast(item.effect === 'speedBoost'
            ? `⚡ ¡Mercado a x2 velocidad por ${item.duration}s!`
            : `🔍 ¡Ves las mejores ofertas por ${item.duration}s!`);
    }
    state.inventory.splice(idx, 1);
    state.selectedInventoryItem = null;
    updateUI(); saveGame(); checkGameOver();
};

// ============================================================
//  DEPOSITAR
// ============================================================
window.openDepositar = () => { document.getElementById('modal-depositar').style.display = 'flex'; };
window.closeDepositar = () => { document.getElementById('modal-depositar').style.display = 'none'; };
window.depositar = (cantidad) => {
    state.monedas += cantidad;
    showToast(`💰 ¡Depositaste ${cantidad} monedas!`);
    closeDepositar();
    updateUI(); saveGame();
};

// ============================================================
//  SALUD MASCOTA
// ============================================================
const changePetHealth = (delta) => {
    state.saludMascota = Math.max(0, Math.min(100, state.saludMascota + delta));
    renderPetHealth();
};

const renderPetHealth = () => {
    if (!refs.petHealthFill) return;
    refs.petHealthFill.style.width = state.saludMascota + '%';
    refs.petHealthFill.style.background =
        state.saludMascota > 60 ? '#a8e6cf' :
        state.saludMascota > 30 ? '#ffd3b6' : '#ff8b94';
    if (refs.petHealthValue) refs.petHealthValue.textContent = state.saludMascota;
    if (refs.petMessage) {
        refs.petMessage.textContent =
            state.saludMascota === 100 ? '¡Estoy súper feliz! 🎉' :
            state.saludMascota > 60   ? '¡Todo bajo control! 😊' :
            state.saludMascota > 30   ? 'Me siento mal... 😟' :
            state.saludMascota > 0    ? '¡Tengo mucha hambre! 😢' : '...';
    }
    const btn = document.getElementById('btn-cambiar-mascota');
    if (btn) btn.style.display = state.saludMascota === 100 ? 'block' : 'none';
};

// ============================================================
//  MASCOTAS
// ============================================================
window.openPetSelector = () => {
    const grid = document.getElementById('pet-grid');
    if (!grid) return;
    grid.innerHTML = petList.map(p => `
        <div class="pet-option ${p.id === state.currentPet ? 'pet-selected' : ''}"
             onclick="selectPet('${p.id}', '${p.label}')">
            <div class="pet-preview" style="background-image:url('../assets/pets/${p.id}.png')"></div>
            <span>${p.label}</span>
        </div>`).join('');
    document.getElementById('modal-mascota').style.display = 'flex';
};
window.closePetSelector = () => { document.getElementById('modal-mascota').style.display = 'none'; };
window.selectPet = (petId, petLabel) => {
    state.currentPet = petId;
    renderPet();
    closePetSelector();
    showToast(`🐾 ¡Ahora tienes un ${petLabel}!`);
    saveGame();
};
const renderPet = () => {
    const s = document.getElementById('pet-character');
    if (s) s.style.backgroundImage = `url('../assets/pets/${state.currentPet}.png')`;
};

// ============================================================
//  GAME OVER
// ============================================================
const checkGameOver = () => {
    if (state.saludMascota <= 0) { triggerGameOver('😿 Tu mascota murió de hambre...'); return; }
    if (state.monedas <= 0) {
        let val = 0;
        state.portfolio.forEach((pos, sym) => { const c = state.market.get(sym); if (c) val += c.price; });
        if (val === 0 || (state.monedas + val) <= 0)
            triggerGameOver('💸 Sin monedas ni activos para recuperarte...');
    }
};
const triggerGameOver = (reason) => {
    const modal = document.getElementById('modal-gameover');
    const el    = document.getElementById('gameover-reason');
    if (modal) { if (el) el.textContent = reason; modal.style.display = 'flex'; }
    localStorage.removeItem(SAVE_KEY);
};
window.resetGame = () => {
    state.monedas = 1000; state.saludMascota = 75;
    state.currentPet = 'Bunny-Pink-128';
    state.portfolio.clear(); state.inventory = [];
    state.selectedInventoryItem = null; state.activeEffects = {};
    clearInterval(state.marketInterval);
    state.marketSpeed = 3000;
    state.marketInterval = setInterval(fetchMarket, state.marketSpeed);
    document.getElementById('modal-gameover').style.display = 'none';
    renderPet(); renderPetHealth(); renderInventory(); updateEffectBadges(); updateUI(); saveGame();
    showToast('🔄 ¡Juego reiniciado!');
};

// ============================================================
//  UI GENERAL
// ============================================================
const updateUI = () => {
    if (refs.monedasCount) refs.monedasCount.textContent = state.monedas.toFixed(2);
    renderMarket(); renderPortfolio(); renderPetHealth(); renderInventory();
};

const renderPortfolio = () => {
    const container = document.getElementById('portfolio-list');
    const summary   = document.getElementById('portfolio-summary');
    const totalEl   = document.getElementById('portfolio-total');
    if (!container) return;
    if (state.portfolio.size === 0) {
        container.innerHTML = `<p class="empty-msg">Aún no tienes posiciones.</p>`;
        if (summary) summary.style.display = 'none'; return;
    }
    let total = 0, html = '';
    state.portfolio.forEach((pos, symbol) => {
        const cur  = state.market.get(symbol);
        const cp   = cur ? cur.price : pos.buyPrice;
        const prof = cp - pos.buyPrice;
        const pct  = ((prof / pos.buyPrice) * 100).toFixed(2);
        total += cp;
        html += `
        <div class="portfolio-item">
            <div class="pi-header"><strong>${pos.symbol}</strong><span class="pi-name">${pos.name}</span></div>
            <div class="pi-prices">
                <span class="pi-label">Compra:</span><span>${formatCurrency(pos.buyPrice)}</span>
                <span class="pi-label">Actual:</span><span>${formatCurrency(cp)}</span>
            </div>
            <div class="pi-profit ${prof >= 0 ? 'up' : 'down'}">
                ${prof >= 0 ? '▲' : '▼'} ${formatCurrency(Math.abs(prof))} (${Math.abs(pct)}%)
            </div>
            <button class="btn-action btn-sell" onclick="sellFromPortfolio('${symbol}')">Vender</button>
        </div>`;
    });
    container.innerHTML = html;
    if (summary) { summary.style.display = 'flex'; if (totalEl) totalEl.textContent = formatCurrency(total); }
};

// ============================================================
//  HEADER
// ============================================================
window.toggleSettingsMenu = (e) => {
    if (e) e.stopPropagation();
    const menu = document.getElementById('settings-dropdown-menu');
    if (menu) { const h = menu.style.display === 'none'; menu.style.display = h ? 'block' : 'none'; }
};
window.handleAvatarChange = (src) => {
    const img = document.getElementById('current-avatar-header');
    if (img) img.src = src;
    toggleSettingsMenu(null);
    showToast('✅ Avatar actualizado'); saveGame();
};
window.handleLogout = () => { saveGame(); window.location.href = '../index.html'; };
document.addEventListener('click', (e) => {
    const menu    = document.getElementById('settings-dropdown-menu');
    const trigger = document.querySelector('.profile-trigger');
    if (menu && trigger && !trigger.contains(e.target)) menu.style.display = 'none';
});

// ============================================================
//  TOAST
// ============================================================
const showToast = (msg) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('toast-show');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('toast-show'), 3200);
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

    document.getElementById('btn-comprar')?.addEventListener('click', openFoodShop);
    document.getElementById('btn-depositar')?.addEventListener('click', openDepositar);

    // Filtro de mercado
    document.getElementById('market-filter')?.addEventListener('change', renderMarket);

    loadGame();
    renderPet(); renderPetHealth(); renderInventory(); updateEffectBadges();
    fetchMarket();
    state.marketInterval = setInterval(fetchMarket, state.marketSpeed);
});

console.log('BITGAMESO v3 🎮');