// ============================================================
//  BITGAMESO — game.js  v5
//  Inflación de comida x2 | Bonificaciones por sector
//  50 mensajes de mascota | Efectos acumulativos con countdown
// ============================================================

// ============================================================
//  ESTADO GLOBAL
// ============================================================
const state = {
    monedas:      1000.00,
    saludMascota: 75,
    currentPet:   'Bunny-Pink-128',
    market:       new Map(),
    portfolio:    new Map(),
    inventory:    new Map(),
    foodInflation: new Map(),   // foodId → cantidad comprada (precio x2 por compra)
    sectorBonus:   new Map(),   // type → bonusApplied (bool) cuando llega a 3 acciones
    effectsTime: {
        marketFast:   0,
        doubleProfit: 0,
        futureVision: 0,
    },
    selectedFood: null,
    petData: null,              // Map<petId, {health, unlocked}> — gestionado por pets.js
    marketSpeedEnabled: true,   // false = fuerza velocidad normal aunque la mascota tenga pasivo de velocidad
    victoryAchieved:   false,   // true cuando todas las mascotas normales llegan a 100 de salud
    diamondVictoryAchieved: false, // true cuando todas las doradas llegan a 100 de salud
};

const refs = {};
const MAX_FOOD_QTY   = 99;  // Límite máximo para comida normal
const MAX_FOOD_MISC  = 5;   // Límite para categoría "otros"
const MISC_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 horas en ms

const getMiscCooldownKey = (foodId) => {
    const u = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_misc_cd_${foodId}_${u}`;
};

const getMiscCooldownRemaining = (foodId) => {
    const lastBuy = parseInt(localStorage.getItem(getMiscCooldownKey(foodId)) || '0');
    return Math.max(0, MISC_COOLDOWN_MS - (Date.now() - lastBuy));
};

const formatCooldown = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

// ============================================================
//  150+ ACTIVOS
// ============================================================
const assetDatabase = [
    // IA
    { symbol:'AIGEN',  name:'AI Genesis',         type:'IA',        basePrice:45    },
    { symbol:'NVDA',   name:'NVIDIA Corp',         type:'IA',        basePrice:800   },
    { symbol:'NRLN',   name:'Neuralink AI',        type:'IA',        basePrice:320   },
    { symbol:'OPNX',   name:'OpenMind X',          type:'IA',        basePrice:210   },
    { symbol:'DPLY',   name:'DeepLayer',           type:'IA',        basePrice:95    },
    { symbol:'SYNT',   name:'Synthos AI',          type:'IA',        basePrice:145   },
    { symbol:'COGN',   name:'Cognify Systems',     type:'IA',        basePrice:88    },
    { symbol:'VXAI',   name:'VexAI Corp',          type:'IA',        basePrice:420   },
    { symbol:'MLNX',   name:'MindLinx',            type:'IA',        basePrice:63    },
    { symbol:'PLSX',   name:'PulseAI',             type:'IA',        basePrice:175   },
    { symbol:'QTAI',   name:'Quantum AI Labs',     type:'IA',        basePrice:510   },
    { symbol:'NXGN',   name:'NexGen Mind',         type:'IA',        basePrice:290   },
    { symbol:'ZETA',   name:'Zeta Intelligence',   type:'IA',        basePrice:380   },
    { symbol:'LMNAI',  name:'LumaAI',              type:'IA',        basePrice:55    },
    { symbol:'DFNT',   name:'Defiant AI',          type:'IA',        basePrice:130   },
    // BLUECHIP
    { symbol:'MSFT',   name:'Microsoft',           type:'Bluechip',  basePrice:390   },
    { symbol:'APLX',   name:'Apex Tech',           type:'Bluechip',  basePrice:580   },
    { symbol:'GOOGX',  name:'Googlex Corp',        type:'Bluechip',  basePrice:175   },
    { symbol:'AMZN',   name:'Amazora Inc',         type:'Bluechip',  basePrice:190   },
    { symbol:'META',   name:'MetaSphere',          type:'Bluechip',  basePrice:520   },
    { symbol:'TSLA',   name:'Teslovex',            type:'Bluechip',  basePrice:260   },
    { symbol:'SMSN',   name:'Samsuno Corp',        type:'Bluechip',  basePrice:74    },
    { symbol:'SONY',   name:'SonyTech',            type:'Bluechip',  basePrice:98    },
    { symbol:'INTLX',  name:'Intelyx',             type:'Bluechip',  basePrice:43    },
    { symbol:'ORAC',   name:'Oracle Systems',      type:'Bluechip',  basePrice:122   },
    { symbol:'SAPS',   name:'SapSoft',             type:'Bluechip',  basePrice:183   },
    { symbol:'IBMX',   name:'IBM Nexus',           type:'Bluechip',  basePrice:165   },
    { symbol:'CSCO',   name:'Ciscova',             type:'Bluechip',  basePrice:55    },
    { symbol:'HPEX',   name:'HP Extended',         type:'Bluechip',  basePrice:37    },
    { symbol:'DLLX',   name:'Dellux Tech',         type:'Bluechip',  basePrice:128   },
    // DIGITAL
    { symbol:'ETH',    name:'Ethereum',            type:'Digital',   basePrice:3400  },
    { symbol:'BTCX',   name:'BitcoinX',            type:'Digital',   basePrice:68000 },
    { symbol:'SLNA',   name:'Solana Nova',         type:'Digital',   basePrice:180   },
    { symbol:'AVAX',   name:'AvalancheCoin',       type:'Digital',   basePrice:38    },
    { symbol:'BNBX',   name:'BNB Xtreme',          type:'Digital',   basePrice:605   },
    { symbol:'DOGE2',  name:'DogeTwo',             type:'Digital',   basePrice:0.35  },
    { symbol:'POLYX',  name:'PolygonX',            type:'Digital',   basePrice:1.1   },
    { symbol:'LNKX',   name:'ChainLinkX',          type:'Digital',   basePrice:18    },
    { symbol:'ADAX',   name:'CardanoX',            type:'Digital',   basePrice:0.55  },
    { symbol:'DOTX',   name:'Polkadot Nova',       type:'Digital',   basePrice:9     },
    { symbol:'UNSX',   name:'UniswapX',            type:'Digital',   basePrice:12    },
    { symbol:'LTCX',   name:'LitecoinX',           type:'Digital',   basePrice:95    },
    { symbol:'XLMX',   name:'StellarX',            type:'Digital',   basePrice:0.14  },
    { symbol:'ICPX',   name:'InternetCoinX',       type:'Digital',   basePrice:14    },
    { symbol:'FLRX',   name:'FlareNet',            type:'Digital',   basePrice:0.02  },
    { symbol:'ARBX',   name:'ArbitrumX',           type:'Digital',   basePrice:1.2   },
    { symbol:'OPEX',   name:'OptimismX',           type:'Digital',   basePrice:2.8   },
    { symbol:'INJX',   name:'InjectiveX',          type:'Digital',   basePrice:28    },
    { symbol:'SEIX',   name:'SeiNetwork',          type:'Digital',   basePrice:0.6   },
    { symbol:'TIAO',   name:'TiaComet',            type:'Digital',   basePrice:11    },
    // GAMING
    { symbol:'SKIN',   name:'Epic Skins',          type:'Gaming',    basePrice:5     },
    { symbol:'AXSX',   name:'AxieX Shards',        type:'Gaming',    basePrice:0.08  },
    { symbol:'SNDX',   name:'SandboxX',            type:'Gaming',    basePrice:0.65  },
    { symbol:'DECX',   name:'DecentralandX',       type:'Gaming',    basePrice:0.5   },
    { symbol:'GALA',   name:'GalaGames',           type:'Gaming',    basePrice:0.04  },
    { symbol:'ILVI',   name:'Illuvium',            type:'Gaming',    basePrice:85    },
    { symbol:'RBLX',   name:'RobloxCoin',          type:'Gaming',    basePrice:45    },
    { symbol:'VXGM',   name:'VexelGame',           type:'Gaming',    basePrice:12    },
    { symbol:'PXLX',   name:'PixelRealm',          type:'Gaming',    basePrice:3     },
    { symbol:'QGLD',   name:'QuestGold',           type:'Gaming',    basePrice:22    },
    { symbol:'MTRX',   name:'MetrixGame',          type:'Gaming',    basePrice:7     },
    { symbol:'DRAX',   name:'DragonX Tokens',      type:'Gaming',    basePrice:0.15  },
    { symbol:'NXPX',   name:'NexPlay',             type:'Gaming',    basePrice:18    },
    { symbol:'ARCX',   name:'ArcadeX',             type:'Gaming',    basePrice:4     },
    { symbol:'LEVL',   name:'LevelCoin',           type:'Gaming',    basePrice:0.9   },
    // NFT
    { symbol:'BAYC',   name:'Bored Ape Club',      type:'NFT',       basePrice:30000 },
    { symbol:'PNKS',   name:'Crypto Punks',        type:'NFT',       basePrice:75000 },
    { symbol:'AZKI',   name:'Azuki Floor',         type:'NFT',       basePrice:8500  },
    { symbol:'DOOD',   name:'Doodles NFT',         type:'NFT',       basePrice:3200  },
    { symbol:'CLNX',   name:'CloneX Floor',        type:'NFT',       basePrice:4100  },
    { symbol:'MOONB',  name:'MoonBirds',           type:'NFT',       basePrice:2800  },
    { symbol:'WRLD',   name:'Worldwide Webb NFT',  type:'NFT',       basePrice:1500  },
    { symbol:'MFER',   name:'mfers Collection',    type:'NFT',       basePrice:900   },
    { symbol:'GOBLN',  name:'Goblin Town',         type:'NFT',       basePrice:450   },
    { symbol:'NFTX',   name:'NFTX Index',          type:'NFT',       basePrice:23    },
    { symbol:'PXNFT',  name:'PixelNFT',            type:'NFT',       basePrice:120   },
    { symbol:'VXNFT',  name:'VoxelNFT',            type:'NFT',       basePrice:380   },
    { symbol:'GLDNFT', name:'GoldenApe',           type:'NFT',       basePrice:6200  },
    { symbol:'ROBO',   name:'RoboApe',             type:'NFT',       basePrice:1100  },
    { symbol:'SKUL',   name:'SkullKidz',           type:'NFT',       basePrice:250   },
    // METAVERSO
    { symbol:'MTVX',   name:'MetaVerse X',         type:'Metaverso', basePrice:2.5   },
    { symbol:'HRZN',   name:'Horizon Lands',       type:'Metaverso', basePrice:0.8   },
    { symbol:'OVRL',   name:'Overlord World',      type:'Metaverso', basePrice:14    },
    { symbol:'VSRS',   name:'Verse Realm',         type:'Metaverso', basePrice:5     },
    { symbol:'XTRS',   name:'XtraSpace',           type:'Metaverso', basePrice:1.2   },
    { symbol:'NMTV',   name:'Neoverse',            type:'Metaverso', basePrice:3.3   },
    { symbol:'PLNT',   name:'PlanetSim',           type:'Metaverso', basePrice:0.4   },
    { symbol:'CRBX',   name:'CyberBox',            type:'Metaverso', basePrice:22    },
    { symbol:'ARTH',   name:'Artheon VR',          type:'Metaverso', basePrice:9     },
    { symbol:'VRXS',   name:'VRX Studios',         type:'Metaverso', basePrice:17    },
    // FINTECH
    { symbol:'PYPL',   name:'PayLux',              type:'Fintech',   basePrice:65    },
    { symbol:'STRI',   name:'Stripe Nova',         type:'Fintech',   basePrice:48    },
    { symbol:'RBHD',   name:'RobinHood X',         type:'Fintech',   basePrice:18    },
    { symbol:'PLAX',   name:'Plaid X',             type:'Fintech',   basePrice:31    },
    { symbol:'AFFM',   name:'Affirmo',             type:'Fintech',   basePrice:14    },
    { symbol:'KLRN',   name:'Klarna Coins',        type:'Fintech',   basePrice:26    },
    { symbol:'WISEX',  name:'WiseTransfer',        type:'Fintech',   basePrice:9     },
    { symbol:'SQRX',   name:'SquareX',             type:'Fintech',   basePrice:72    },
    { symbol:'NXBN',   name:'NexoBank',            type:'Fintech',   basePrice:1.4   },
    { symbol:'CELSI',  name:'CelsiusX',            type:'Fintech',   basePrice:0.3   },
    // ENERGÍA
    { symbol:'SOLR',   name:'SolarBit',            type:'Energía',   basePrice:8     },
    { symbol:'WNDX',   name:'WindChain',           type:'Energía',   basePrice:5     },
    { symbol:'GRNE',   name:'GreenEnergy Token',   type:'Energía',   basePrice:2     },
    { symbol:'NCLX',   name:'NuclearX',            type:'Energía',   basePrice:45    },
    { symbol:'HYDO',   name:'HydroToken',          type:'Energía',   basePrice:3     },
    { symbol:'PWRX',   name:'PowerChain',          type:'Energía',   basePrice:11    },
    { symbol:'FSNX',   name:'FusionX Energy',      type:'Energía',   basePrice:28    },
    { symbol:'BIOX',   name:'BioFuel Token',       type:'Energía',   basePrice:1.5   },
    { symbol:'GIDX',   name:'GridX Power',         type:'Energía',   basePrice:7     },
    { symbol:'VLTX',   name:'VoltageX',            type:'Energía',   basePrice:19    },
    // BIOTECH
    { symbol:'DNAIX',  name:'DNAi Labs',           type:'Biotech',   basePrice:120   },
    { symbol:'CRSP',   name:'CrisprX',             type:'Biotech',   basePrice:45    },
    { symbol:'NRBT',   name:'NeuroBot Med',        type:'Biotech',   basePrice:88    },
    { symbol:'GNMX',   name:'GenomicsX',           type:'Biotech',   basePrice:36    },
    { symbol:'VCCX',   name:'VaccineChain',        type:'Biotech',   basePrice:15    },
    { symbol:'MDAI',   name:'MedAI Systems',       type:'Biotech',   basePrice:210   },
    { symbol:'LNGX',   name:'LongevityX',          type:'Biotech',   basePrice:55    },
    { symbol:'PRTN',   name:'Protenix Bio',        type:'Biotech',   basePrice:29    },
    { symbol:'SNBIO',  name:'SynBio Corp',         type:'Biotech',   basePrice:67    },
    { symbol:'HLTH',   name:'HealthToken',         type:'Biotech',   basePrice:4     },
    // ESPACIO
    { symbol:'SPXX',   name:'SpaceX Token',        type:'Espacio',   basePrice:430   },
    { symbol:'LUNR',   name:'LunarCoin',           type:'Espacio',   basePrice:12    },
    { symbol:'MRSX',   name:'MarsX Colony',        type:'Espacio',   basePrice:78    },
    { symbol:'ORBT',   name:'OrbitTech',           type:'Espacio',   basePrice:33    },
    { symbol:'ASTX',   name:'AsteroX Mining',      type:'Espacio',   basePrice:19    },
    { symbol:'STNX',   name:'StationX',            type:'Espacio',   basePrice:55    },
    { symbol:'RKTX',   name:'RocketX',             type:'Espacio',   basePrice:145   },
    { symbol:'GLXY',   name:'Galaxy Ventures',     type:'Espacio',   basePrice:8     },
    { symbol:'NEBX',   name:'NebulaX',             type:'Espacio',   basePrice:3     },
    { symbol:'COSM',   name:'CosmosNet',           type:'Espacio',   basePrice:6     },
    // MEME
    { symbol:'PEPE',   name:'PepeCoin',            type:'Meme',      basePrice:0.00001 },
    { symbol:'SHIB',   name:'ShibaX',              type:'Meme',      basePrice:0.00002 },
    { symbol:'BONK',   name:'BonkCoin',            type:'Meme',      basePrice:0.00003 },
    { symbol:'WOJAK',  name:'WojakToken',          type:'Meme',      basePrice:0.001  },
    { symbol:'CHEEMS', name:'CheemsCoin',          type:'Meme',      basePrice:0.0002 },
    { symbol:'FLOKI',  name:'FlokiX',              type:'Meme',      basePrice:0.0002 },
    { symbol:'MYRO',   name:'MyroCoin',            type:'Meme',      basePrice:0.15   },
    { symbol:'BOME',   name:'Book of Meme',        type:'Meme',      basePrice:0.009  },
    { symbol:'TURBO',  name:'TurboCoin',           type:'Meme',      basePrice:0.006  },
    { symbol:'NEIRO',  name:'NeiroCoin',           type:'Meme',      basePrice:0.001  },
    // DEFI
    { symbol:'AAVEX',  name:'AaveX Protocol',      type:'DeFi',      basePrice:95    },
    { symbol:'CMPX',   name:'CompoundX',           type:'DeFi',      basePrice:55    },
    { symbol:'CRVX',   name:'CurveX Finance',      type:'DeFi',      basePrice:0.4   },
    { symbol:'MKRX',   name:'MakerX',              type:'DeFi',      basePrice:1600  },
    { symbol:'YDFI',   name:'YearnX Finance',      type:'DeFi',      basePrice:7200  },
    { symbol:'SSHX',   name:'SushiX',              type:'DeFi',      basePrice:1.2   },
    { symbol:'BNCX',   name:'BalancerX',           type:'DeFi',      basePrice:4.5   },
    { symbol:'DYDX',   name:'dYdX Protocol',       type:'DeFi',      basePrice:1.8   },
    { symbol:'GMXX',   name:'GmxX Perps',          type:'DeFi',      basePrice:28    },
    { symbol:'PENDL',  name:'PendleX',             type:'DeFi',      basePrice:3.5   },
];

// ============================================================
//  COMIDA
// ============================================================
const foodDatabase = [
    // FRUTAS 
    { id:'Apple-128',           name:'Manzana',           cat:'fruta',    health:0,  effectDuration:30 },
    { id:'Banana-128',          name:'Plátano',           cat:'fruta',    health:0,  effectDuration:30 },
    { id:'Blueberries-128',     name:'Arándanos',         cat:'fruta',    health:0,  effectDuration:45 },
    { id:'Cherry-128',          name:'Cereza',            cat:'fruta',    health:0,  effectDuration:40 },
    { id:'Lemon-128',           name:'Limón',             cat:'fruta',    health:0,  effectDuration:25 },
    { id:'Orange-128',          name:'Naranja',           cat:'fruta',    health:0,  effectDuration:35 },
    { id:'Peach-128',           name:'Durazno',           cat:'fruta',    health:0,  effectDuration:35 },
    { id:'Pear-128',            name:'Pera',              cat:'fruta',    health:0,  effectDuration:30 },
    { id:'Strawberry-128',      name:'Fresa',             cat:'fruta',    health:0,  effectDuration:40 },
    { id:'Watermelon-128',      name:'Sandía',            cat:'fruta',    health:0,  effectDuration:50 },
    // VERDURAS ️
    { id:'Carrot-128',          name:'Zanahoria',         cat:'verdura',  health:10, effectDuration:0  },
    { id:'Corn-128',            name:'Maíz',              cat:'verdura',  health:8,  effectDuration:0  },
    { id:'Grass-128',           name:'Hierba Mágica',     cat:'verdura',  health:5,  effectDuration:0  },
    { id:'Potato-128',          name:'Papa',              cat:'verdura',  health:7,  effectDuration:0  },
    { id:'Pumpkin-128',         name:'Calabaza',          cat:'verdura',  health:12, effectDuration:0  },
    { id:'Tomato-128',          name:'Tomate',            cat:'verdura',  health:9,  effectDuration:0  },
    { id:'Turnip-128',          name:'Nabo',              cat:'verdura',  health:6,  effectDuration:0  },
    // PROTEÍNAS 
    { id:'Egg-128',             name:'Huevo',             cat:'proteina', health:5,  effectDuration:30 },
    { id:'Fish-128',            name:'Pescado',           cat:'proteina', health:8,  effectDuration:40 },
    { id:'Meat-128',            name:'Carne',             cat:'proteina', health:10, effectDuration:50 },
    // DULCES 
    { id:'Candy-Blue-128',      name:'Dulce Azul',        cat:'dulce',    health:2,  effectDuration:20 },
    { id:'Candy-Pink-128',      name:'Dulce Rosa',        cat:'dulce',    health:2,  effectDuration:20 },
    { id:'Cookie-128',          name:'Galleta',           cat:'dulce',    health:4,  effectDuration:30 },
    { id:'Cupcake-128',         name:'Cupcake',           cat:'dulce',    health:5,  effectDuration:40 },
    // MISC 
    { id:'Bread-128',           name:'Pan',               cat:'misc',     health:3,  effectDuration:0  },
    { id:'Bretzel-128',         name:'Pretzel',           cat:'misc',     health:3,  effectDuration:0  },
    { id:'Mushroom-128',        name:'Champiñón',         cat:'misc',     health:4,  effectDuration:0  },
    { id:'Mushroom-Purple-128', name:'Champiñón Púrpura', cat:'misc',     health:6,  effectDuration:0  },
];

const catLabel = {
    fruta:    'Mercado rápido',
    verdura:  '+Salud',
    proteina: 'Ganancias/Pérdidas x2',
    dulce:    'Ver futuro del mercado',
    misc:     'Reventa 0.5x–4x',
};
const catClass = { fruta:'fruit', verdura:'veg', proteina:'protein', dulce:'candy', misc:'misc' };

// Iconos de efecto por categoría
const effectIcons = {
    marketFast:   '../assets/settings/Ranking-128.png',
    doubleProfit: '../assets/arrows/Arrow-Up-Green-128.png',
    futureVision: '../assets/settings/Shop-Balloons-128.png',
    verdura:      '../assets/Hearts/Heart-Red-128.png',
    misc:         '../assets/coins/Coins-2-Bag-128.png',
};

// petList movido a pets.js como PET_DEFS/PET_ORDER

// ============================================================
//  UTILIDADES
// ============================================================
const fmt = (v) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v);

const getMarketPrices = () => {
    const prices = Array.from(state.market.values()).map(a=>a.price).filter(p=>p>0);
    if (!prices.length) return { min:10, max:100, avg:50 };
    prices.sort((a,b)=>a-b);
    return { min:prices[0], max:prices[prices.length-1], avg:prices.reduce((s,p)=>s+p,0)/prices.length };
};

const foodPrice = (food) => {
    const { min, max, avg } = getMarketPrices();
    const map = { verdura:min*0.8+10, fruta:avg*0.05, proteina:max*0.002, dulce:avg*0.03, misc:avg*0.04 };
    return Math.max(5, Math.min(map[food.cat]||avg*0.03, max*0.005+200));
};

// ============================================================
//  GUARDADO
// ============================================================
// Clave de guardado única por usuario
const getSaveKey = () => {
    const usuario = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_save_${usuario}`;
};

const saveGame = () => {
    try {
        // Sincronizar salud actual al petData antes de guardar
        if (state.petData && state.petData.has(state.currentPet)) {
            const d = state.petData.get(state.currentPet);
            d.health = state.saludMascota;
            state.petData.set(state.currentPet, d);
        }
        const saveData = JSON.stringify({
            monedas:            state.monedas,
            saludMascota:       state.saludMascota,
            currentPet:         state.currentPet,
            portfolio:          Array.from(state.portfolio.entries()),
            inventory:          Array.from(state.inventory.entries()),
            foodInflation:      Array.from(state.foodInflation.entries()),
            sectorBonus:        Array.from(state.sectorBonus.entries()),
            effectsTime:        { ...state.effectsTime },
            petData:            state.petData ? Array.from(state.petData.entries()) : [],
            victoryAchieved:    state.victoryAchieved || false,
            diamondVictoryAchieved: state.diamondVictoryAchieved || false,
            marketSpeedEnabled: state.marketSpeedEnabled !== false,
            savedAt:            new Date().toISOString(),
        });
        // Guardar local siempre (rápido)
        localStorage.setItem(getSaveKey(), saveData);
        // Marcar que hay cambios para sincronizar con Supabase
        if (typeof window.markSyncPending === 'function') window.markSyncPending();
    } catch(e) { console.warn('Error guardando',e); }
};

const loadGame = () => {
    try {
        const raw = localStorage.getItem(getSaveKey());
        if (!raw) return;
        const d = JSON.parse(raw);
        state.monedas       = d.monedas      ?? 1000;
        // Sanitizar monedas por si son NaN o Infinity
        if (!isFinite(state.monedas) || isNaN(state.monedas)) state.monedas = 1000;
        state.saludMascota  = d.saludMascota ?? 75;
        state.currentPet    = d.currentPet   ?? 'Bunny-Pink-128';
        state.portfolio     = new Map(d.portfolio     || []);
        state.inventory     = new Map(d.inventory     || []);
        state.foodInflation = new Map(d.foodInflation || []);
        state.sectorBonus   = new Map(d.sectorBonus   || []);
        // Restaurar petData
        if (d.petData && d.petData.length) {
            state.petData = new Map(d.petData);
        }
        // Sincronizar saludMascota desde petData de la mascota activa
        if (state.petData && state.petData.has(state.currentPet)) {
            const activeData = state.petData.get(state.currentPet);
            if (typeof activeData.health === 'number') {
                state.saludMascota = activeData.health;
            }
        }
        state.victoryAchieved    = d.victoryAchieved    ?? false;
        state.diamondVictoryAchieved = d.diamondVictoryAchieved ?? false;
        state.marketSpeedEnabled = d.marketSpeedEnabled ?? true;

        // Restaurar efectos activos — solo los que aún tienen tiempo
        if (d.effectsTime) {
            state.effectsTime.marketFast   = Math.max(0, d.effectsTime.marketFast   || 0);
            state.effectsTime.doubleProfit = Math.max(0, d.effectsTime.doubleProfit || 0);
            state.effectsTime.futureVision = Math.max(0, d.effectsTime.futureVision || 0);
        }
    } catch(e) { console.warn('Error cargando guardado',e); }
};

// Reactivar efectos que quedaron pendientes tras recargar
const reactivateEffects = () => {
    if (state.effectsTime.futureVision > 0) {
        state.market.forEach((a, sym) => {
            const pred = parseFloat((Math.random() * 10 - 5).toFixed(2));
            state.market.set(sym, { ...a, _future: pred });
        });
    }
    renderEffectBadges();
    // La velocidad real la gestiona startPassivesForPet — no sobreescribir aquí
};

const clearSave = () => localStorage.removeItem(getSaveKey());

// ============================================================
//  EFECTOS ACUMULATIVOS CON COUNTDOWN
// ============================================================
// Tick global de 1s para restar tiempos
let effectTickInterval = null;

const startEffectTick = () => {
    if (effectTickInterval) { clearInterval(effectTickInterval); effectTickInterval = null; }
    effectTickInterval = setInterval(() => {
        let changed = false;
        ['marketFast','doubleProfit','futureVision'].forEach(key => {
            if (state.effectsTime[key] > 0) {
                state.effectsTime[key] = Math.max(0, state.effectsTime[key] - 1);
                changed = true;
                // Cuando llega a 0 apagar efectos
                if (state.effectsTime[key] === 0) {
                    if (key === 'marketFast') startMarket(SPEED_NORMAL);
                    if (key === 'futureVision') clearFutureVision();
                    showToast(`️ Efecto terminado: ${effectKeyLabel(key)}`);
                }
            }
        });
        if (changed) renderEffectBadges();
    }, 1000);
};

const effectKeyLabel = (key) => ({
    marketFast:'Mercado Rápido', doubleProfit:'Ganancias x2', futureVision:'Visión del Futuro'
}[key] || key);

// Sumar tiempo al efecto (acumulativo)
const addEffect = (key, secs) => {
    state.effectsTime[key] += secs;
    // Activar si acaba de encenderse
    if (key === 'marketFast' && state.effectsTime[key] === secs) startMarket(SPEED_FAST);
    renderEffectBadges();
};

const isEffectActive = (key) => state.effectsTime[key] > 0;

const clearFutureVision = () => {
    state.market.forEach((a,sym) => {
        const { _future, ...clean } = a;
        state.market.set(sym, clean);
    });
    renderMarket();
};

// ============================================================
//  RENDER BADGES CON COUNTDOWN + ICONOS
// ============================================================
const renderEffectBadges = () => {
    const el = document.getElementById('active-effects');
    if (!el) return;

    const badges = [];

    if (isEffectActive('marketFast')) {
        const s = state.effectsTime.marketFast;
        badges.push(`
            <div class="effect-badge fast">
                <img src="${effectIcons.marketFast}" class="eff-icon" alt="">
                <span>Mercado Rápido</span>
                <span class="eff-timer">${s}s</span>
            </div>`);
    }
    if (isEffectActive('doubleProfit')) {
        const s = state.effectsTime.doubleProfit;
        badges.push(`
            <div class="effect-badge double">
                <img src="${effectIcons.doubleProfit}" class="eff-icon" alt="">
                <img src="../assets/arrows/Arrow-Down-Red-128.png" class="eff-icon" alt="">
                <span>Ganancia x2</span>
                <span class="eff-timer">${s}s</span>
            </div>`);
    }
    if (isEffectActive('futureVision')) {
        const s = state.effectsTime.futureVision;
        badges.push(`
            <div class="effect-badge vision">
                <img src="${effectIcons.futureVision}" class="eff-icon" alt="">
                <span>Visión Activa</span>
                <span class="eff-timer">${s}s</span>
            </div>`);
    }

    el.innerHTML = badges.join('');
};

// ============================================================
//  MERCADO
// ============================================================
let marketTimer = null;
const SPEED_NORMAL = 3000;
const SPEED_FAST   = 1000;

// Auto-healing market loop — usa requestAnimationFrame + setTimeout como fallback
// Nunca se detiene aunque setInterval falle
let _marketRunning = false;
let _marketSpeed   = 3000;
let _marketTimeout = null;

const _marketLoop = () => {
    if (!_marketRunning) return;
    fetchMarket();
    _marketTimeout = setTimeout(_marketLoop, _marketSpeed);
};

const fetchMarket = () => {
    // Aplicar tick de bonos ANTES de actualizar precios volátiles
    if (typeof window.applyBondTick === 'function') window.applyBondTick();
    window._lastMarketUpdate = Date.now();
    assetDatabase.forEach(a => {
        const old  = state.market.get(a.symbol)?.price || a.basePrice;
        const vol  = 0.025;
        const next = Math.max(0.000001, old*(1+(Math.random()*vol*2-vol)));
        const prevFuture = state.market.get(a.symbol)?._future;
        const entry = { ...a, price:next, changePercent:((next-old)/old)*100 };
        if (prevFuture !== undefined) entry._future = prevFuture;
        state.market.set(a.symbol, entry);
    });
    const now = new Date();
    if (refs.marketUpdated) refs.marketUpdated.textContent = `Actualizado: ${now.toLocaleTimeString()}`;
    if (refs.monedasCount) {
        const _m = state.monedas;
        refs.monedasCount.textContent = (!isFinite(_m) || isNaN(_m)) ? '0.00'
            : _m >= 1e15 ? _m.toExponential(2)
            : parseFloat(_m).toFixed(2);
    }
    renderMarket();
    renderPortfolio();
    saveGame();
    // Registrar tick en historial de gráfica
    if (typeof recordChartTick === 'function') recordChartTick();
};

const startMarket = (speed = SPEED_NORMAL) => {
    // Parar loop anterior
    _marketRunning = false;
    if (_marketTimeout) clearTimeout(_marketTimeout);
    if (marketTimer)    clearInterval(marketTimer);
    
    // Guardar velocidad
    _marketSpeed   = speed || SPEED_NORMAL;
    _marketRunning = true;
    
    // Iniciar loop auto-curativo con setTimeout (más confiable que setInterval en móvil)
    _marketTimeout = setTimeout(_marketLoop, _marketSpeed);
    
    // También mantener setInterval como respaldo
    marketTimer = setInterval(fetchMarket, _marketSpeed);
};

// ============================================================
//  FILTROS + RENDER MERCADO
// ============================================================
let currentFilter = 'Todos';
window.setFilter = (t) => { currentFilter=t; buildFilterTabs(); renderMarket(); };

const buildFilterTabs = () => {
    const el = document.getElementById('market-filters');
    if (!el) return;
    const types = ['Todos', ...new Set(assetDatabase.map(a=>a.type))];
    el.innerHTML = types.map(t =>
        `<button class="filter-tab ${t===currentFilter?'active':''}" onclick="setFilter('${t}')">${t}</button>`
    ).join('');
};

const renderMarket = () => {
    if (!refs.marketList) return;
    let assets = Array.from(state.market.values());
    if (currentFilter !== 'Todos') assets = assets.filter(a=>a.type===currentFilter);
    if (isEffectActive('futureVision')) assets = [...assets].sort((a,b)=>(b._future||0)-(a._future||0));

    refs.marketList.innerHTML = assets.map(a => {
        const isUp  = a.changePercent >= 0;
        const owned = state.portfolio.has(a.symbol);
        const futureTag = isEffectActive('futureVision') && a._future !== undefined
            ? `<span class="future-tag ${a._future>=0?'up':'down'}">${a._future>=0?'▲':'▼'}${Math.abs(a._future).toFixed(1)}%</span>` : '';
        const isHighlighted = state._highlightSector === a.type;
        const hlClass = isHighlighted
            ? (state._highlightType === 'crash' ? 'row-crash' : 'row-boom')
            : '';
        // Badge de tipo: Bono o Acción
        const catBadge = typeof window.getAssetCategoryLabel === 'function'
            ? window.getAssetCategoryLabel(a.type) : '';
        return `
        <div class="asset-row ${hlClass}">
            <div class="asset-info">
                <strong class="asset-symbol">${a.symbol}</strong>
                <small class="asset-name">${a.name}</small>
                ${catBadge}
            </div>
            <div class="asset-type">${a.type}</div>
            <div class="asset-price">
                ${(() => {
                    const discPrice = typeof window.applyPetBuyModifiers === 'function' ? window.applyPetBuyModifiers(a.price) : a.price;
                    const hasDisc = discPrice < a.price;
                    return hasDisc
                        ? `<span style="text-decoration:line-through;opacity:.5;font-size:.8em;">${fmt(a.price)}</span> <span style="color:#52b788;font-weight:700;">${fmt(discPrice)}</span>`
                        : fmt(a.price);
                })()} ${futureTag}
            </div>
            <div class="asset-change ${isUp?'up':'down'}">${isUp?'▲':'▼'} ${Math.abs(a.changePercent).toFixed(2)}%</div>
            <div class="market-btns">
                <button class="btn-asset-info" onclick="showAssetFicha('${a.symbol}')" title="Ver ficha técnica">Info</button>
                <button class="btn-chart-open" onclick="openChart('${a.symbol}')" title="Ver gráfica">
                    <img src="../assets/settings/Ranking-128.png" style="width:16px;height:16px;vertical-align:middle;" alt="Gráfica">
                </button>
                <button class="btn-action btn-buy ${owned?'btn-disabled':''}"
                        onclick="buy('${a.symbol}')"
                        ${owned?'disabled':''}>Comprar</button>
            </div>
        </div>`;
    }).join('');
};

// ============================================================
//  COMPRAR ACCIÓN
// ============================================================
window.buy = (symbol) => {
    if (state.portfolio.has(symbol)) { showToast('️ Ya tienes este activo.'); return; }
    const a = state.market.get(symbol);
    if (!a) return;
    const actualPrice = typeof applyPetBuyModifiers === 'function' ? applyPetBuyModifiers(a.price) : a.price;
    if (state.monedas >= actualPrice) {
        state.monedas -= actualPrice;
        state.portfolio.set(symbol, { symbol:a.symbol, name:a.name, buyPrice:actualPrice, type:a.type });
        if (typeof applyPenguinBuyPenalty === 'function') applyPenguinBuyPenalty(a);
        if (typeof birdPaused !== 'undefined') { birdPaused = true; setTimeout(()=>{ birdPaused = false; }, 1000); }
        const discountMsg = actualPrice < a.price ? ` (descuento: ${fmt(a.price - actualPrice)})` : '';
        showToast(` Compraste ${a.symbol} por ${fmt(actualPrice)}${discountMsg}`);
        logEvent('compra', `Compraste ${a.symbol} — ${a.name}`, `Precio: ${fmt(actualPrice)} | Sector: ${a.type}`);
        updateUI();
        checkSectorBonus();
    } else {
        showToast(' ¡No tienes suficientes monedas!');
    }
};

// ============================================================
//  VENDER ACCIÓN (desde cartera)
// ============================================================
window.sellFromPortfolio = (symbol) => {
    const pos = state.portfolio.get(symbol);
    const cur = state.market.get(symbol);
    if (!pos || !cur) return;
    const baseProfit = cur.price - pos.buyPrice;
    const dpProfit   = isEffectActive('doubleProfit') ? baseProfit * 2 : baseProfit;

    // Pet modifiers
    let payout = pos.buyPrice + dpProfit;
    let petMsg = '';
    if (typeof applyPetSellModifiers === 'function') {
        const pm = applyPetSellModifiers(pos, cur, dpProfit);
        payout = pm.payout;
        petMsg = pm.extraMsg;
    } else {
        const sectorBonusAmt = applySectorBonus(pos.type || '', dpProfit, pos.buyPrice);
        payout += sectorBonusAmt;
        if (sectorBonusAmt > 0) petMsg = ` +${fmt(sectorBonusAmt)}`;
    }

    state.monedas += payout;
    state.portfolio.delete(symbol);
    if (typeof birdPaused !== 'undefined') { birdPaused = true; setTimeout(()=>{ birdPaused = false; }, 1000); }
    if (typeof checkSheepPenalty === 'function') checkSheepPenalty(payout - pos.buyPrice);
    if (typeof syncPetHealthToData === 'function') syncPetHealthToData();

    const x2tag = isEffectActive('doubleProfit') ? ' (x2)' : '';
    const realProfit = payout - pos.buyPrice;
    if (realProfit > 0) {
        const gain = Math.min(Math.round((realProfit/pos.buyPrice)*20),20);
        changePetHealth(gain);
        showToast(` Vendiste ${symbol}! +${fmt(realProfit)}${x2tag}${petMsg} +${gain}️`);
        logEvent('venta', `Vendiste ${symbol} con GANANCIA`, `+${fmt(realProfit)}${x2tag}${petMsg}`);
    } else if (realProfit < 0) {
        const petPassive = typeof PET_DEFS !== 'undefined' ? PET_DEFS[state.currentPet]?.passive : null;
        const isDiamond  = typeof PET_DEFS !== 'undefined' ? PET_DEFS[state.currentPet]?.diamond : false;
        if (petPassive === 'frog') {
            // Rana: pérdida se convierte en ganancia
            const gainAmount = Math.abs(realProfit);
            state.monedas += gainAmount * 2; // devolver lo perdido + convertir en ganancia
            const healthLoss = isDiamond ? 0 : 30;
            if (healthLoss > 0) changePetHealth(-healthLoss);
            showToast(` ¡Rana convirtió la pérdida en ganancia! +${fmt(gainAmount)}${healthLoss > 0 ? ` -${healthLoss}️` : ''}`);
            logEvent('venta', `Vendiste ${symbol} con RANA (pérdida→ganancia)`, `+${fmt(gainAmount)}`);
        } else {
            const loss = Math.min(Math.round((Math.abs(realProfit)/pos.buyPrice)*20),20);
            changePetHealth(-loss);
            showToast(` Vendiste ${symbol}. ${fmt(Math.abs(realProfit))}${x2tag}${petMsg} -${loss}️`);
            logEvent('venta', `Vendiste ${symbol} con PÉRDIDA`, `${fmt(Math.abs(realProfit))}${x2tag}${petMsg}`);
        }
    } else {
        showToast(`️ Vendiste ${symbol}${petMsg}`);
    }
    updateUI();
    checkGameOver();
    checkSectorBonus();
};

// ============================================================
//  DEPÓSITO
// ============================================================
window.openDeposit = () => {
    // Actualizar UI de las opciones según salud actual
    const cards = document.querySelectorAll('.deposit-card');
    cards.forEach(c => c.classList.remove('dep-unavailable'));
    const s = state.saludMascota;
    // 1000 necesita >11%, 10000 >41%, 100000 >71%
    if (s < 11)  { cards[1]?.classList.add('dep-unavailable'); cards[2]?.classList.add('dep-unavailable'); cards[3]?.classList.add('dep-unavailable'); }
    else if (s < 41) { cards[2]?.classList.add('dep-unavailable'); cards[3]?.classList.add('dep-unavailable'); }
    else if (s < 71) { cards[3]?.classList.add('dep-unavailable'); }
    const warn = document.getElementById('deposit-warning');
    if (warn) warn.style.display = 'none';
    document.getElementById('modal-depositar').style.display = 'flex';
};

window.closeDeposit = () => { document.getElementById('modal-depositar').style.display = 'none'; };

window.doDeposit = (amount, costPct) => {
    const needed = costPct;
    if (state.saludMascota <= needed) {
        const warn = document.getElementById('deposit-warning');
        if (warn) { warn.textContent = `️ Tu mascota necesita más de ${needed}% de salud para este depósito. Salud actual: ${state.saludMascota}%`; warn.style.display='block'; }
        return;
    }
    state.monedas += amount;
    changePetHealth(-costPct);
    closeDeposit();
    showToast(` Depositaste ${amount.toLocaleString()} (-${costPct}% ️)`);
    logEvent('deposito', `Depositaste ${amount.toLocaleString()}`, `Costo: -${costPct}% de salud de mascota`);
    updateUI();
    checkGameOver();
};

// ============================================================
//  TIENDA DE COMIDA
// ============================================================
window.openFoodShop = () => {
    const grid = document.getElementById('food-shop-grid');
    if (!grid) return;
    grid.innerHTML = foodDatabase.map(f => {
        const basePrice  = Math.round(foodPrice(f));
        const timesBought = state.foodInflation.get(f.id) || 0;
        const inflRate    = (f.cat === 'proteina' && typeof getProteinInflationRate === 'function')
                            ? getProteinInflationRate() : 2;
        const priceBeforePet = Math.round(basePrice * Math.pow(inflRate, timesBought));
        const price = typeof getPetFoodPrice === 'function'
                      ? getPetFoodPrice(f, priceBeforePet) : priceBeforePet;
        const currentQty = state.inventory.get(f.id)?.qty || 0;
        const isMisc = f.cat === 'misc';
        const maxQty = isMisc ? MAX_FOOD_MISC : MAX_FOOD_QTY;
        const atLimit = currentQty >= maxQty;
        const miscCdRemaining = isMisc ? getMiscCooldownRemaining(f.id) : 0;
        const onCooldown = miscCdRemaining > 0;
        const canBuy = state.monedas >= price && !atLimit && !onCooldown;
        const inflTag = timesBought > 0
            ? `<span class="food-inflation">x${Math.pow(2,timesBought)} inflacion</span>` : '';

        return `
        <div class="food-item ${catClass[f.cat]}">
            <img src="../assets/food/${f.id}.png" alt="${f.name}" class="food-img">
            <span class="food-name">${f.name}</span>
            <span class="food-eff-tag ${catClass[f.cat]}">${catLabel[f.cat]}</span>
            ${f.effectDuration ? `<span class="food-dur">+${f.effectDuration}s</span>` : ''}
            ${f.health ? `<span class="food-hp">+${f.health} salud</span>` : ''}
            ${inflTag}
            <span class="food-price">${price.toLocaleString()}</span>
            <button class="btn-action btn-buy btn-sm ${canBuy?'':'btn-disabled'}"
                    onclick="buyFood('${f.id}',${price})"
                    ${canBuy?'':'disabled'}>${atLimit ? `Max ${isMisc ? MAX_FOOD_MISC : MAX_FOOD_QTY}` : onCooldown ? `${formatCooldown(miscCdRemaining)}` : 'Comprar'}</button>
        </div>`;
    }).join('');
    document.getElementById('modal-food-shop').style.display = 'flex';
};

window.closeFoodShop = () => { document.getElementById('modal-food-shop').style.display = 'none'; };

window.buyFood = (foodId, price) => {
    const food = foodDatabase.find(f=>f.id===foodId);
    if (!food) return;

    // Si el precio es 0 (pingüino con pescados gratis disponibles), procesar como gratis
    if (price === 0 && foodId === 'Fish-128' && typeof tryPenguinFreeFish === 'function') {
        const wasFree = tryPenguinFreeFish(foodId);
        if (wasFree) {
            logEvent('comida', 'Pescado gratis del Pingüino', 'Sin costo ni inflación');
            updateUI();
            openFoodShop();
            return;
        }
        // Si ya no quedan gratis, cobrar precio real
        const realPrice = Math.round(typeof getPetFoodPrice === 'function'
            ? getPetFoodPrice(food, Math.round(typeof foodPrice === 'function' ? foodPrice(food) : food.basePrice))
            : food.basePrice);
        if (state.monedas < realPrice) { showToast('Monedas insuficientes'); return; }
        state.monedas -= realPrice;
    } else {
        if (state.monedas < price) { showToast('Monedas insuficientes'); return; }
        state.monedas -= price;
    }
    const existing = state.inventory.get(foodId);
    state.inventory.set(foodId, { ...food, price, qty:(existing?.qty||0)+1 });

    // Inflación: registrar compra para que la próxima cueste x2
    // Si la mascota tiene inmunidad a inflación para este alimento, no registrar
    const inflFree = typeof isFoodInflationFree === 'function' && isFoodInflationFree(foodId);
    if (!inflFree) {
        const timesB = (state.foodInflation.get(foodId) || 0) + 1;
        state.foodInflation.set(foodId, timesB);
    }

    // Cooldown 2 horas para categoría "otros"
    if (food.cat === 'misc') {
        localStorage.setItem(getMiscCooldownKey(food.id), Date.now().toString());
    }

    const nextPrice = Math.round(price * 2);
    showToast(`Compraste ${food.name} por ${price} | Próximo precio: ${nextPrice}`);
    logEvent('comida', `Compraste ${food.name}`, `Precio: ${price} | Efecto: ${catLabel[food.cat]}`);
    updateUI();
    openFoodShop();
};

// ============================================================
//  SELECCIÓN DE COMIDA EN INVENTARIO
// ============================================================
window.selectFood = (foodId) => {
    if (state.selectedFood === foodId) {
        // Deseleccionar
        state.selectedFood = null;
    } else {
        state.selectedFood = foodId;
    }
    renderInventory();
    updateSelectedLabel();
};

const updateSelectedLabel = () => {
    const label = document.getElementById('inv-selected-label');
    if (!label) return;
    if (state.selectedFood) {
        const item = state.inventory.get(state.selectedFood);
        if (item) {
            label.style.display = 'inline-block';
            label.textContent = `Seleccionado: ${item.name} — usa Vender o Enviar`;
        }
    } else {
        label.style.display = 'none';
    }
};

// ============================================================
//  USAR COMIDA (dar a mascota) — botón "Enviar"
// ============================================================
const useFoodOnPet = () => {
    const foodId = state.selectedFood;
    if (!foodId) { showToast(' Selecciona un ítem del inventario primero'); return; }
    const item = state.inventory.get(foodId);
    if (!item || item.qty <= 0) { showToast(' No tienes ese ítem'); return; }

    switch(item.cat) {
        case 'verdura':
            changePetHealth(item.health);
            showToast(` Diste ${item.name} a tu mascota! +${item.health}️`);
            logEvent('mascota', `Diste ${item.name} a tu mascota`, `Salud +${item.health}️`);
            break;
        case 'fruta':
            changePetHealth(item.health || 2);
            const multFruta = typeof getEffectDurationMultiplier === 'function' ? getEffectDurationMultiplier('fruta') : 1;
            addEffect('marketFast', item.effectDuration * multFruta);
            showToast(` ${item.name}! +${item.effectDuration}s al Mercado Rápido  (total: ${state.effectsTime.marketFast}s)`);
            logEvent('efecto', `${item.name} activó Mercado Rápido`, `+${item.effectDuration}s | Total: ${state.effectsTime.marketFast}s`);
            break;
        case 'proteina':
            changePetHealth(item.health);
            const multProt = typeof getEffectDurationMultiplier === 'function' ? getEffectDurationMultiplier('proteina') : 1;
            addEffect('doubleProfit', item.effectDuration * multProt);
            showToast(` ${item.name}! +${item.effectDuration}s a Ganancias x2  (total: ${state.effectsTime.doubleProfit}s)`);
            logEvent('efecto', `${item.name} activó Ganancias x2`, `+${item.effectDuration}s | Total: ${state.effectsTime.doubleProfit}s`);
            break;
        case 'dulce':
            changePetHealth(item.health);
            const multDulce = typeof getEffectDurationMultiplier === 'function' ? getEffectDurationMultiplier('dulce') : 1;
            addEffect('futureVision', item.effectDuration * multDulce);
            activateFutureVision();
            showToast(` ${item.name}! +${item.effectDuration}s a Visión del Futuro  (total: ${state.effectsTime.futureVision}s)`);
            logEvent('efecto', `${item.name} activó Visión del Futuro`, `+${item.effectDuration}s | Total: ${state.effectsTime.futureVision}s`);
            break;
        case 'misc':
            changePetHealth(item.health);
            showToast(` Diste ${item.name}! +${item.health}️`);
            break;
    }

    consumeItem(foodId);
    state.selectedFood = null;
    updateUI();
    checkGameOver();
};

// ============================================================
//  VENDER COMIDA — botón "Vender" del nav
// ============================================================
const sellSelectedFood = () => {
    const foodId = state.selectedFood;
    if (!foodId) { showToast(' Selecciona un ítem del inventario primero'); return; }
    const item = state.inventory.get(foodId);
    if (!item || item.qty <= 0) { showToast(' No tienes ese ítem'); return; }

    let salePrice, saleMsg;
    if (item.cat === 'misc') {
        const mult = 0.5 + Math.random()*3.5;
        salePrice  = Math.round(item.price * mult);
        const tag  = mult>=3?' ¡JACKPOT!': mult>=2?' Buen precio': mult>=1?'️ Precio justo':' Mala suerte';
        saleMsg    = ` Vendiste ${item.name} por ${salePrice} (x${mult.toFixed(2)}) ${tag}`;
    } else {
        salePrice = Math.round(item.price * 0.5);
        saleMsg   = ` Vendiste ${item.name} por ${salePrice} (mitad de precio)`;
    }

    state.monedas += salePrice;
    consumeItem(foodId);
    state.selectedFood = null;
    showToast(saleMsg);
    logEvent('comida', `Vendiste ${item.name}`, `Recibiste ${salePrice}`);
    updateUI();
};

const consumeItem = (foodId) => {
    const item = state.inventory.get(foodId);
    if (!item) return;
    if (item.qty <= 1) state.inventory.delete(foodId);
    else state.inventory.set(foodId, { ...item, qty:item.qty-1 });
};

// ============================================================
//  VISIÓN FUTURA
// ============================================================
const activateFutureVision = () => {
    state.market.forEach((a,sym) => {
        const pred = parseFloat((Math.random()*10-5).toFixed(2));
        state.market.set(sym, { ...a, _future:pred });
    });
    renderMarket();
    openFutureModal();
};

const openFutureModal = () => {
    const list = document.getElementById('future-list');
    if (!list) return;
    const assets = Array.from(state.market.values())
        .filter(a=>a._future!==undefined)
        .sort((a,b)=>b._future-a._future)
        .slice(0,20);
    list.innerHTML = assets.map(a=>`
        <div class="future-row">
            <div class="future-info">
                <strong class="future-symbol">${a.symbol}</strong>
                <span class="future-name">${a.name}</span>
            </div>
            <span class="future-type">${a.type || ''}</span>
            <span class="future-pred ${a._future>=0?'up':'down'}">${a._future>=0?'▲':'▼'}${Math.abs(a._future)}%</span>
        </div>`).join('');
    document.getElementById('modal-future').style.display = 'flex';
};

window.closeFutureModal = () => { document.getElementById('modal-future').style.display = 'none'; };

// ============================================================
//  SALUD MASCOTA — 5 CORAZONES
// ============================================================
const getHeartConfig = (pct) => {
    // Retorna array de 5 strings: 'red' | 'pink' | 'gray' | 'sad'
    if (pct === 0) return ['sad','sad','sad','sad','sad'];
    if (pct <= 10) return ['pink','gray','gray','gray','gray'];
    if (pct <= 20) return ['pink','pink','gray','gray','gray'];
    if (pct <= 30) return ['pink','pink','pink','gray','gray'];
    if (pct <= 40) return ['pink','pink','pink','pink','gray'];
    if (pct <= 50) return ['pink','pink','pink','pink','pink'];
    if (pct <= 60) return ['red','pink','pink','pink','pink'];
    if (pct <= 70) return ['red','red','pink','pink','pink'];
    if (pct <= 80) return ['red','red','red','pink','pink'];
    if (pct <= 90) return ['red','red','red','red','pink'];
    return ['red','red','red','red','red'];
};

const heartImg = { red:'Heart-Red-128', pink:'Heart-Pink-128', gray:'Heart-Gray-128', sad:'Heart-Sad-128' };

const renderPetHealth = () => {
    const heartsEl = document.getElementById('pet-hearts');
    if (heartsEl) {
        const config = getHeartConfig(state.saludMascota);
        heartsEl.innerHTML = config.map(type =>
            `<img src="/src/assets/Hearts/${heartImg[type]}.png" class="heart-icon" alt="${type}">`
        ).join('');
    }
    if (refs.petHealthValue) refs.petHealthValue.textContent = state.saludMascota;
    if (refs.petMessage) {
        const s = state.saludMascota;
        if (s===100)    refs.petMessage.textContent = '¡Estoy súper feliz! ';
        else if (s>60)  refs.petMessage.textContent = '¡Todo bajo control! ';
        else if (s>30)  refs.petMessage.textContent = 'Me siento un poco mal... ';
        else if (s>0)   refs.petMessage.textContent = '¡Tengo mucha hambre! ';
        else            refs.petMessage.textContent = '...';
    }
    // El botón de mascotas siempre está visible (gestionado por pets.js)
};

const changePetHealth = (delta) => {
    state.saludMascota = Math.max(0, Math.min(100, state.saludMascota+delta));
    renderPetHealth();
    if (typeof syncPetHealthToData === 'function') syncPetHealthToData();
};

// ============================================================
//  MASCOTA SELECTOR — gestionado por pets.js
// ============================================================
// openPetSelector, closePetSelector, selectPet están en pets.js

const renderPet = () => {
    const s = document.getElementById('pet-character');
    if (!s) return;
    const def = typeof PET_DEFS !== 'undefined' ? PET_DEFS[state.currentPet] : null;
    const imgId = def?.baseId || state.currentPet;
    s.style.backgroundImage = `url('/src/assets/pets/${imgId}.png')`;
    if (def?.diamond) {
        s.style.filter = 'sepia(1) saturate(5) hue-rotate(185deg) brightness(1.2) contrast(1.1) drop-shadow(0 0 12px #6ec6ff)';
    } else if (def?.golden) {
        s.style.filter = 'sepia(0.4) saturate(4) hue-rotate(5deg) brightness(1.25) drop-shadow(0 0 10px gold)';
    } else {
        s.style.filter = '';
    }
};

// ============================================================
//  INVENTARIO
// ============================================================
const renderInventory = () => {
    const el = document.getElementById('inventory-bar');
    if (!el) return;
    if (state.inventory.size === 0) {
        el.innerHTML = `<span class="inv-empty">Sin ítems — compra comida con Comprar</span>`;
        updateSelectedLabel();
        return;
    }
    el.innerHTML = Array.from(state.inventory.values()).map(item => {
        const isSelected = state.selectedFood === item.id;
        return `
        <div class="inv-item ${isSelected?'inv-selected':''}" onclick="selectFood('${item.id}')" title="${item.name} — click para seleccionar">
            <img src="../assets/food/${item.id}.png" alt="${item.name}" class="inv-img">
            <span class="inv-qty">x${item.qty}</span>
            <span class="inv-cat-dot cat-${catClass[item.cat]}"></span>
        </div>`;
    }).join('');
    updateSelectedLabel();
};

// ============================================================
//  CARTERA
// ============================================================
// Filtro activo de la cartera
let portfolioFilter = 'Todos';

const renderPortfolioFilters = () => {
    let bar = document.getElementById('portfolio-filter-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'portfolio-filter-bar';
        bar.className = 'portfolio-filter-bar';
        const container = document.getElementById('portfolio-list');
        container?.parentNode?.insertBefore(bar, container);
    }

    if (state.portfolio.size === 0) { bar.innerHTML = ''; return; }

    // Sectores presentes en cartera
    const sectors = ['Todos', ...new Set(Array.from(state.portfolio.values()).map(p => p.type).filter(Boolean))];

    bar.innerHTML = sectors.map(s =>
        `<button class="portfolio-filter-tab ${s === portfolioFilter ? 'active' : ''}"
            onclick="setPortfolioFilter('${s}')">${s}</button>`
    ).join('');
};

window.setPortfolioFilter = (sector) => {
    portfolioFilter = sector;
    renderPortfolio();
};

const renderPortfolio = () => {
    const container = document.getElementById('portfolio-list');
    const summary   = document.getElementById('portfolio-summary');
    const totalEl   = document.getElementById('portfolio-total');
    if (!container) return;

    renderPortfolioFilters();

    if (state.portfolio.size === 0) {
        portfolioFilter = 'Todos';
        container.innerHTML = `<p class="empty-msg">Aun no tienes posiciones.</p>`;
        if (summary) summary.style.display = 'none';
        return;
    }

    // Aplicar filtro de sector
    let items = Array.from(state.portfolio.entries());
    if (portfolioFilter !== 'Todos') {
        items = items.filter(([, pos]) => pos.type === portfolioFilter);
    }

    let totalVal = 0, html = '';

    items.forEach(([symbol, pos]) => {
        const cur    = state.market.get(symbol);
        const price  = cur ? cur.price : pos.buyPrice;
        const profit = price - pos.buyPrice;
        const pct    = ((profit / pos.buyPrice) * 100).toFixed(2);
        totalVal    += price;

        // Formatear números largos sin salirse del cuadro
        const fmtShort = (v) => {
            if (!isFinite(v) || isNaN(v)) return '$0';
            const abs = Math.abs(v);
            const sign = v >= 0 ? '' : '-';
            if (abs >= 1e12) return sign + '$' + (abs / 1e12).toFixed(1) + 'T';
            if (abs >= 1e9)  return sign + '$' + (abs / 1e9).toFixed(1) + 'B';
            if (abs >= 1e6)  return sign + '$' + (abs / 1e6).toFixed(1) + 'M';
            if (abs >= 1e3)  return sign + '$' + (abs / 1e3).toFixed(1) + 'K';
            return sign + '$' + abs.toFixed(2);
        };

        html += `
        <div class="portfolio-item">
            <div class="pi-header">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <strong>${pos.symbol}</strong>
                    <div style="display:flex; gap:2px; flex-shrink:0;">
                        ${isEffectActive('doubleProfit') ? '<span class="x2-tag">x2</span>' : ''}
                        ${state.sectorBonus.get(pos.type || '') ? '<span class="bonus-tag">+3%</span>' : ''}
                    </div>
                </div>
                <span class="pi-name">${pos.name}</span>
                ${pos.type ? `<span class="pi-type-tag">${pos.type}</span>` : ''}
            </div>
            <div class="pi-prices">
                <div class="pi-row">
                    <span class="pi-label">Compra:</span>
                    <span>${fmtShort(pos.buyPrice)}</span>
                </div>
                <div class="pi-row">
                    <span class="pi-label">Actual:</span>
                    <span>${fmtShort(price)}</span>
                </div>
            </div>
            <div class="pi-profit ${profit >= 0 ? 'up' : 'down'}">
                ${profit >= 0 ? '▲' : '▼'} ${fmtShort(Math.abs(profit))} (${Math.abs(pct)}%)
            </div>
            <button class="btn-action btn-sell" onclick="sellFromPortfolio('${symbol}')">Vender</button>
        </div>`;
    });

    // Si el filtro activo ya no tiene items (se vendieron), volver a Todos
    if (!html) {
        portfolioFilter = 'Todos';
        renderPortfolio();
        return;
    }

    container.innerHTML = html;

    // Total de todos (no solo los filtrados)
    let totalAll = 0;
    state.portfolio.forEach((pos, sym) => {
        const c = state.market.get(sym);
        totalAll += c ? c.price : pos.buyPrice;
    });
    if (summary) { summary.style.display = 'flex'; if (totalEl) totalEl.textContent = fmt(totalAll); }
};

// ============================================================
//  GAME OVER
// ============================================================
const checkGameOver = () => {
    if (state.saludMascota <= 0) { triggerGameOver(' Tu mascota murió de hambre...'); return; }
    if (state.monedas <= 0) {
        let val=0;
        state.portfolio.forEach((_,sym) => { const c=state.market.get(sym); if(c) val+=c.price; });
        if (val===0||(state.monedas+val)<=0) triggerGameOver(' Sin monedas ni activos para recuperarte...');
    }
};

const triggerGameOver = (reason) => {
    logEvent('gameover', 'GAME OVER', reason);
    clearSave();
    const m=document.getElementById('modal-gameover');
    const r=document.getElementById('gameover-reason');
    if (m) { if(r) r.textContent=reason; m.style.display='flex'; }
};

window.resetGame = () => {
    state.monedas=1000; state.saludMascota=75;
    state.currentPet='Bunny-Pink-128';
    state.portfolio.clear(); state.inventory.clear();
    state.foodInflation.clear(); state.sectorBonus.clear();
    state.effectsTime = { marketFast:0, doubleProfit:0, futureVision:0 };
    state.selectedFood = null;
    state.currentPet = 'Bunny-Pink-128';
    state.victoryAchieved = false;
    state.marketSpeedEnabled = true;
    state.petData = null;
    if (typeof initPetData === 'function') initPetData();
    if (typeof sheepPriceTripled !== 'undefined') sheepPriceTripled = false;
    if (typeof bunnyTurboCooldown !== 'undefined') { bunnyTurboCooldown = false; bunnyTurboActive = false; }
    if (typeof frogCooldown !== 'undefined') frogCooldown = false;
    clearSave();
    document.getElementById('modal-gameover').style.display='none';
    startMarket(SPEED_NORMAL);
    renderPet(); renderPetHealth(); renderEffectBadges();
    updateUI();
    showToast(' ¡Juego reiniciado!');
};

// ============================================================
//  UI GENERAL
// ============================================================
const updateUI = () => {
    const m = state.monedas;
    let mStr;
    if (!isFinite(m) || isNaN(m)) {
        mStr = '0.00';
        state.monedas = 0;
    } else if (m >= 1e15) {
        mStr = m.toExponential(2);
    } else {
        mStr = parseFloat(m).toFixed(2);
    }
    if (refs.monedasCount) refs.monedasCount.textContent = mStr;
    renderMarket();
    renderPortfolio();
    renderPetHealth();
    renderInventory();
    renderEffectBadges();
    // Actualizar panel de balance y diversificación
    if (typeof window.updateFinanceUI === 'function') window.updateFinanceUI();
    saveGame();
};

// ============================================================
//  AVATAR / LOGOUT
// ============================================================
window.toggleSettingsMenu = (e) => {
    if (e) e.stopPropagation();
    const m=document.getElementById('settings-dropdown-menu');
    if (m) m.style.display = m.style.display==='none'?'block':'none';
};

window.handleAvatarChange = (src) => {
    const img=document.getElementById('current-avatar-header');
    if (img) img.src=src;
    toggleSettingsMenu(null);
    showToast(' Avatar actualizado');
    saveGame();
};

window.handleLogout = () => {
    localStorage.removeItem('bitgameso_sesion_activa');
    window.location.href = '/src/PaginaMenu/menu-index.html';
};

document.addEventListener('click', (e) => {
    const m=document.getElementById('settings-dropdown-menu');
    const t=document.querySelector('.profile-trigger');
    if (m&&t&&!t.contains(e.target)) m.style.display='none';
});

// ============================================================
//  TOAST
// ============================================================
const showToast = (msg) => {
    let t=document.getElementById('toast');
    if (!t) { t=document.createElement('div'); t.id='toast'; document.body.appendChild(t); }
    t.textContent=msg;
    t.classList.add('toast-show');
    clearTimeout(t._timer);
    t._timer=setTimeout(()=>t.classList.remove('toast-show'),3500);
};


// ============================================================
//  50 MENSAJES DE MASCOTA — CONSEJOS DE INVERSIÓN
// ============================================================
const petTips = [
    // IA
    "¡Psst! Si inviertes en 3 acciones de IA conseguirás un bono del 3% en tus ganancias ",
    "Los activos de IA están en auge… ¿ya tienes 3? ¡Podría haber una bonificación esperándote! ",
    "He soñado con chips y algoritmos… quizás debería invertir en IA. ¡Tú también! ",
    "El sector IA crece cada día. ¡Con 3 acciones de IA obtendrás un bono especial! ",
    "Dicen que la inteligencia artificial lo dominará todo. ¿Y tus inversiones en IA? ",
    // BLUECHIP
    "Las empresas Bluechip son sólidas como una roca  ¡Con 3 acciones tendrás un bono del 3%!",
    "¿Seguridad o riesgo? Las Bluechip dan estabilidad. ¡Consigue 3 y desbloquea tu bonificación! ",
    "¡Me encantan las Bluechip! Grandes empresas, grandes resultados. ¡3 acciones = bono asegurado! ",
    "Los grandes inversores confían en Bluechips. ¿Ya tienes 3? ¡Hay un bono del 3% esperándote! ",
    "Una cartera sólida siempre tiene Bluechips. ¡Llega a 3 y gana tu bonificación! ",
    // DIGITAL / CRYPTO
    "¡Las criptos son el futuro! Invierte en 3 activos Digital y consigue un bono del 3% ",
    "El mercado Digital nunca duerme… ni yo tampoco esperando que compres 3 criptos ",
    "Bitcoin, Ethereum… ¡el mundo Digital es enorme! Con 3 acciones Digital obtendrás un bono ",
    "Las monedas digitales pueden explotar en cualquier momento. ¡3 activos = bonificación del 3%! ",
    "¿Hodl? ¡Mejor invierte en 3 activos Digital y gana un bono especial! ",
    // GAMING
    "¡Me encantan los videojuegos! Si inviertes en 3 acciones Gaming tendrás un bono del 3% ",
    "El sector Gaming vale billones. ¿Ya tienes 3 acciones? ¡Tu bonificación te espera! ️",
    "Jugar y ganar: eso hacen los jugadores de Gaming en el mercado. ¡3 acciones = bono! ",
    "Los gamers saben invertir. ¡Consigue 3 acciones Gaming y desbloquea tu bonificación! ",
    "¡Level up! Con 3 acciones Gaming conseguirás un bono del 3% en tus próximas ganancias ",
    // NFT
    "Los NFT son únicos como yo  ¡Invierte en 3 y consigue un bono del 3%!",
    "Arte digital, colecciones únicas… ¡3 acciones NFT te dan una bonificación especial! ️",
    "El mundo de los NFT puede sorprenderte. ¡Con 3 activos NFT obtendrás un bono del 3%! ",
    "¿Arte o inversión? ¡Los dos! Con 3 acciones NFT ganas una bonificación de inmediato ",
    "Los coleccionistas de NFT saben algo que tú no… ¡3 acciones y lo descubrirás con un bono! ",
    // METAVERSO
    "¡El Metaverso es el futuro! Con 3 acciones Metaverso consigues un bono del 3% ",
    "Mundos virtuales, oportunidades reales. ¡3 acciones Metaverso = bonificación garantizada! ",
    "Me imagino corriendo en el Metaverso… ¡y tú ganando un bono con 3 acciones! ",
    "El Metaverso crece cada día. ¡Con 3 activos tendrás un bono del 3% esperándote! ",
    "¿Ya exploraste el Metaverso? Invierte en 3 acciones y consigue tu bonificación ",
    // FINTECH
    "¡El dinero del futuro está en Fintech! 3 acciones y obtendrás un bono del 3% ",
    "Las Fintech están revolucionando las finanzas. ¡Con 3 acciones desbloqueas un bono! ",
    "Pagar, transferir, invertir… ¡las Fintech lo hacen todo! 3 acciones = bono del 3% ",
    "Me gusta contar monedas y las Fintech también. ¡3 acciones = bonificación especial! ",
    "El futuro de los pagos es digital. ¡Invierte en 3 Fintech y gana un bono del 3%! ",
    // ENERGÍA
    "¡Energía limpia = futuro brillante! 3 acciones de Energía te dan un bono del 3% ",
    "El planeta necesita energía verde y tú necesitas ese bono. ¡3 acciones Energía! ",
    "Sol, viento, agua… ¡todo es energía! Con 3 acciones Energía consigues un bono ",
    "La revolución energética ya comenzó. ¡Invierte en 3 y desbloquea tu bonificación! ",
    "¡Potencia tu cartera con Energía! 3 acciones del sector = bono del 3% garantizado ",
    // BIOTECH
    "¡La ciencia es asombrosa! Con 3 acciones Biotech obtendrás un bono del 3% ",
    "La Biotech puede salvar vidas y salvar tu cartera. ¡3 acciones = bonificación especial! ",
    "ADN, genes, salud… ¡el futuro es Biotech! Con 3 acciones ganas un bono del 3% ",
    "Los laboratorios trabajan 24/7 igual que el mercado. ¡3 acciones Biotech = bono! ",
    "¡Me cuido mucho y tú deberías cuidar tu cartera con 3 acciones Biotech y un bono! ",
    // ESPACIO
    "¡Ad astra! Con 3 acciones del sector Espacio conseguirás un bono del 3% ",
    "Las estrellas llaman… ¡y tu bono también! Invierte en 3 acciones Espacio ",
    "El universo es enorme pero el bono es concreto: 3 acciones Espacio = 3% extra ",
    "¡Sueño con volar a las estrellas! Y tú puedes ganar un bono con 3 acciones Espacio ",
    // MEME
    "¡Los Meme coins son locos pero el bono es real! 3 acciones Meme = 3% de bonificación ",
    // DEFI
    "¡DeFi es el banco del futuro! Con 3 acciones DeFi obtienes un bono del 3% ",
];

// Mensajes aleatorios: mostrar cada 20-45 segundos
let petTipTimer = null;
let lastTipIndex = -1;

const startPetTips = () => {
    const scheduleNext = () => {
        const delay = (20 + Math.random() * 25) * 1000; // 20-45s
        petTipTimer = setTimeout(() => {
            showPetTip();
            scheduleNext();
        }, delay);
    };
    scheduleNext();
};

const showPetTip = () => {
    let idx;
    do { idx = Math.floor(Math.random() * petTips.length); } while (idx === lastTipIndex);
    lastTipIndex = idx;
    const msg = document.getElementById('pet-message');
    if (msg) {
        msg.textContent = petTips[idx];
        msg.classList.add('pet-tip-glow');
        setTimeout(() => msg.classList.remove('pet-tip-glow'), 3000);
    }
};

// ============================================================
//  SISTEMA DE BONIFICACIÓN POR SECTOR
// ============================================================
const BONUS_THRESHOLD = 3;    // acciones del mismo sector
const BONUS_PCT = 0.03;       // 3% sobre el payout al vender

// Contar cuántas acciones del portfolio pertenecen a cada sector
const countBySector = () => {
    const counts = new Map();
    state.portfolio.forEach(pos => {
        const t = pos.type || '';
        counts.set(t, (counts.get(t) || 0) + 1);
    });
    return counts;
};

const checkSectorBonus = () => {
    const counts = countBySector();
    counts.forEach((count, type) => {
        if (count >= BONUS_THRESHOLD && !state.sectorBonus.get(type)) {
            state.sectorBonus.set(type, true);
            showToast(` ¡BONO DESBLOQUEADO! Tienes 3+ acciones de ${type}. Tus ganancias en este sector suben un 3% `);
            logEvent('bonus', `Bono de sector ${type} desbloqueado`, `+3% en ganancias del sector ${type}`);
            // Forzar mensaje de mascota celebrando
            const msg = document.getElementById('pet-message');
            if (msg) {
                msg.textContent = `¡Lo sabía! ¡Bonificación del 3% en ${type} activada! `;
                msg.classList.add('pet-tip-glow');
                setTimeout(() => msg.classList.remove('pet-tip-glow'), 4000);
            }
        }
        // Si perdió acciones y ya no llega al umbral, quitar el bono
        if (count < BONUS_THRESHOLD && state.sectorBonus.get(type)) {
            state.sectorBonus.set(type, false);
            showToast(`️ Perdiste el bono de ${type}: ya no tienes 3 acciones en ese sector.`);
        }
    });
    // Revisar sectores que ya no están en cartera
    state.sectorBonus.forEach((active, type) => {
        if (active && !counts.has(type)) {
            state.sectorBonus.set(type, false);
        }
    });
    saveGame();
};

// Aplicar bono al vender — se llama dentro de sellFromPortfolio
const applySectorBonus = (type, baseProfit, buyPrice) => {
    if (!state.sectorBonus.get(type)) return 0;
    const bonus = Math.abs(baseProfit) >= 0 ? buyPrice * BONUS_PCT : 0;
    return bonus;
};


// ============================================================
//  SISTEMA DE EVENTOS DRAMÁTICOS DEL MERCADO
// ============================================================

const marketEvents = [
    // CAÍDAS
    { sector:'IA',        type:'crash', magnitude:[0.10,0.30], warningMsg:'️ ¡ALERTA! Escándalo en el sector IA… ¡todas sus acciones podrían desplomarse pronto!', eventMsg:' ¡CRASH de IA! Todas las acciones de Inteligencia Artificial han caído drásticamente.' },
    { sector:'Bluechip',  type:'crash', magnitude:[0.10,0.25], warningMsg:'️ ¡ALERTA! Las grandes empresas Bluechip están en problemas… ¡una caída se acerca!', eventMsg:' ¡CRASH Bluechip! Las acciones de las grandes empresas han colapsado.' },
    { sector:'Digital',   type:'crash', magnitude:[0.15,0.35], warningMsg:'️ ¡ALERTA! Las criptomonedas están en pánico… ¡vienen caídas masivas en Digital!', eventMsg:' ¡CRYPTO CRASH! Todas las monedas digitales se han desplomado.' },
    { sector:'Gaming',    type:'crash', magnitude:[0.10,0.30], warningMsg:'️ ¡ALERTA! El sector Gaming está en crisis… ¡los precios van a caer pronto!', eventMsg:' ¡GAMING CRASH! Los activos de Gaming han sufrido una caída brutal.' },
    { sector:'NFT',       type:'crash', magnitude:[0.15,0.30], warningMsg:'️ ¡ALERTA! ¡Los NFT pronto caerán! ¡Todas sus acciones en peligro!', eventMsg:' ¡NFT CRASH! El mercado de NFT se ha hundido por completo.' },
    { sector:'Metaverso', type:'crash', magnitude:[0.10,0.25], warningMsg:'️ ¡ALERTA! El Metaverso está siendo abandonado… ¡viene una caída brutal!', eventMsg:' ¡METAVERSO CRASH! Las acciones del Metaverso han caído estrepitosamente.' },
    { sector:'Fintech',   type:'crash', magnitude:[0.10,0.20], warningMsg:'️ ¡ALERTA! Regulaciones nuevas amenazan al Fintech… ¡una crisis se avecina!', eventMsg:' ¡FINTECH CRASH! El sector Fintech ha colapsado por nuevas regulaciones.' },
    { sector:'Energía',   type:'crash', magnitude:[0.10,0.25], warningMsg:'️ ¡ALERTA! Crisis energética global… ¡las acciones de Energía van a caer!', eventMsg:' ¡ENERGÍA CRASH! El sector energético ha sufrido una caída masiva.' },
    { sector:'Biotech',   type:'crash', magnitude:[0.10,0.25], warningMsg:'️ ¡ALERTA! Un ensayo clínico falló… ¡el sector Biotech va a desplomarse!', eventMsg:' ¡BIOTECH CRASH! Las farmacéuticas y biotechs han caído en picado.' },
    { sector:'Espacio',   type:'crash', magnitude:[0.10,0.30], warningMsg:'️ ¡ALERTA! Una misión espacial fracasó… ¡el sector Espacio va a caer pronto!', eventMsg:' ¡ESPACIO CRASH! Los activos espaciales han sufrido una caída enorme.' },
    { sector:'Meme',      type:'crash', magnitude:[0.20,0.40], warningMsg:'️ ¡ALERTA! ¡Los meme coins van a morir! ¡Vende antes de que sea tarde!', eventMsg:' ¡MEME CRASH! Los meme coins han colapsado completamente. El meme ha muerto.' },
    { sector:'DeFi',      type:'crash', magnitude:[0.15,0.30], warningMsg:'️ ¡ALERTA! Un exploit masivo en DeFi… ¡todas sus acciones van a caer!', eventMsg:' ¡DeFi CRASH! El sector descentralizado ha sido hackeado. Precios en caída libre.' },
    // SUBIDAS
    { sector:'IA',        type:'boom',  magnitude:[0.20,0.50], warningMsg:' ¡NOTICIA! Un breakthrough de IA revolucionario está por anunciarse… ¡las acciones de IA subirán!', eventMsg:' ¡IA BOOM! Una revolución en inteligencia artificial ha disparado todas sus acciones.' },
    { sector:'Bluechip',  type:'boom',  magnitude:[0.10,0.30], warningMsg:' ¡NOTICIA! Las grandes empresas reportan ganancias récord… ¡las Bluechip van a subir!', eventMsg:' ¡BLUECHIP BOOM! Las grandes empresas han batido récords históricos de ganancias.' },
    { sector:'Digital',   type:'boom',  magnitude:[0.20,0.50], warningMsg:' ¡NOTICIA! ¡Un país ha adoptado las criptomonedas como moneda oficial! ¡Digital va a explotar!', eventMsg:' ¡CRYPTO BOOM! Adopción masiva de criptomonedas. ¡Todos los activos digitales se disparan!' },
    { sector:'Gaming',    type:'boom',  magnitude:[0.15,0.40], warningMsg:' ¡NOTICIA! El juego más esperado del año llega mañana… ¡el sector Gaming va a dispararse!', eventMsg:' ¡GAMING BOOM! El lanzamiento del año ha generado ganancias masivas en Gaming.' },
    { sector:'NFT',       type:'boom',  magnitude:[0.20,0.50], warningMsg:' ¡NOTICIA! ¡Una celebridad mundial acaba de comprar NFTs! ¡Todas las acciones subirán pronto!', eventMsg:' ¡NFT BOOM! El interés masivo en NFTs ha disparado todos sus precios.' },
    { sector:'Metaverso', type:'boom',  magnitude:[0.15,0.40], warningMsg:' ¡NOTICIA! Una mega empresa invierte billones en el Metaverso… ¡viene una subida enorme!', eventMsg:' ¡METAVERSO BOOM! Inversión histórica en el Metaverso ha disparado todos sus activos.' },
    { sector:'Fintech',   type:'boom',  magnitude:[0.10,0.30], warningMsg:' ¡NOTICIA! Nueva regulación favorece al Fintech… ¡sus acciones van a subir pronto!', eventMsg:' ¡FINTECH BOOM! Cambios regulatorios han impulsado enormemente al sector Fintech.' },
    { sector:'Energía',   type:'boom',  magnitude:[0.15,0.35], warningMsg:' ¡NOTICIA! Nuevo acuerdo climático global… ¡el sector Energía va a beneficiarse mucho!', eventMsg:' ¡ENERGÍA BOOM! El acuerdo climático global ha disparado todos los activos de Energía.' },
    { sector:'Biotech',   type:'boom',  magnitude:[0.20,0.50], warningMsg:' ¡NOTICIA! ¡Se ha encontrado la cura de una enfermedad! ¡El sector Biotech va a explotar!', eventMsg:' ¡BIOTECH BOOM! Un descubrimiento médico histórico ha disparado todas las biotechs.' },
    { sector:'Espacio',   type:'boom',  magnitude:[0.20,0.50], warningMsg:' ¡NOTICIA! ¡Se ha confirmado vida en otro planeta! ¡El sector Espacio va a la luna!', eventMsg:' ¡ESPACIO BOOM! El descubrimiento del siglo ha disparado todos los activos espaciales.' },
    { sector:'Meme',      type:'boom',  magnitude:[0.30,0.80], warningMsg:' ¡NOTICIA! ¡Un famoso ha tuiteado sobre los meme coins! ¡Van a explotar completamente!', eventMsg:' ¡MEME BOOM! ¡Un tweet viral ha multiplicado los precios de todos los meme coins!' },
    { sector:'DeFi',      type:'boom',  magnitude:[0.15,0.40], warningMsg:' ¡NOTICIA! Un protocolo DeFi ha generado retornos históricos… ¡todo el sector subirá!', eventMsg:' ¡DeFi BOOM! Rendimientos históricos en DeFi han atraído inversión masiva al sector.' },
];

// Evento activo actualmente (si lo hay)
let activeEvent = null;  // { sector, type, magnitude, eventMsg, applyAt }
let eventScheduleTimer = null;

const scheduleNextEvent = () => {
    // Intervalo aleatorio: 45s a 3min
    const delay = (45 + Math.random() * 135) * 1000;
    eventScheduleTimer = setTimeout(() => {
        triggerMarketEventWarning();
        scheduleNextEvent();
    }, delay);
};

const triggerMarketEventWarning = () => {
    // Elegir evento aleatorio, diferente al anterior
    let evt;
    do { evt = marketEvents[Math.floor(Math.random() * marketEvents.length)]; }
    while (activeEvent && evt.sector === activeEvent.sector && evt.type === activeEvent.type);

    // Tiempo de advertencia: 30-50 segundos antes del evento real
    const warningTime = 30 + Math.floor(Math.random() * 21); // 30-50s

    // Mostrar advertencia en mascota
    const msg = document.getElementById('pet-message');
    if (msg) {
        msg.textContent = evt.warningMsg;
        msg.classList.add(evt.type === 'crash' ? 'pet-warn-crash' : 'pet-warn-boom');
        setTimeout(() => {
            msg.classList.remove('pet-warn-crash', 'pet-warn-boom');
        }, warningTime * 1000);
    }

    // Toast de advertencia
    showToast(evt.type === 'crash'
        ? `️ ${evt.sector} — evento de CAÍDA en ${warningTime}s!`
        : ` ${evt.sector} — evento de SUBIDA en ${warningTime}s!`
    );
    logEvent('evento', `️ Alerta: evento ${evt.type === 'crash' ? 'CAÍDA' : 'SUBIDA'} en ${evt.sector}`, `Se aplicará en ${warningTime}s`);

    // Resaltar sector en el mercado como advertencia
    highlightSector(evt.sector, evt.type, warningTime * 1000);

    // Programar el evento real
    activeEvent = evt;
    setTimeout(() => applyMarketEvent(evt), warningTime * 1000);
};

const applyMarketEvent = (evt) => {
    if (!evt) return;
    const [minMag, maxMag] = evt.magnitude;
    const magnitude = minMag + Math.random() * (maxMag - minMag);
    const multiplier = evt.type === 'crash' ? (1 - magnitude) : (1 + magnitude);

    // Aplicar a todos los activos del sector
    state.market.forEach((a, sym) => {
        if (a.type === evt.sector) {
            const newPrice = Math.max(0.000001, a.price * multiplier);
            state.market.set(sym, { ...a, price: newPrice, changePercent: (multiplier - 1) * 100 });
        }
    });

    // Mensaje final en mascota
    const msg = document.getElementById('pet-message');
    if (msg) {
        msg.textContent = evt.eventMsg;
        msg.classList.add(evt.type === 'crash' ? 'pet-warn-crash' : 'pet-warn-boom');
        setTimeout(() => msg.classList.remove('pet-warn-crash', 'pet-warn-boom'), 5000);
    }

    // Toast dramático
    const pct = (magnitude * 100).toFixed(0);
    showToast(evt.type === 'crash'
        ? ` ${evt.sector} cayó un ${pct}%!`
        : ` ${evt.sector} subió un ${pct}%!`
    );
    logEvent('evento', `${evt.type === 'crash' ? ' CRASH' : ' BOOM'} en sector ${evt.sector}`, `${evt.type === 'crash' ? 'Cayó' : 'Subió'} un ${pct}%`);

    // Flash visual del sector
    highlightSector(evt.sector, evt.type, 4000);

    activeEvent = null;
    renderMarket();
    renderPortfolio();
};

// Resaltar sector en la lista del mercado
const highlightSector = (sector, type, duration) => {
    state._highlightSector = sector;
    state._highlightType   = type;
    renderMarket();
    setTimeout(() => {
        delete state._highlightSector;
        delete state._highlightType;
        renderMarket();
    }, duration);
};


// ============================================================
//  INFORMACIÓN DE SECTORES DEL MERCADO
// ============================================================
const sectorInfo = {
    'IA': {
        icon: '',
        titulo: 'IA — Inteligencia Artificial',
        que: 'Tecnología que permite a las máquinas "pensar", aprender y resolver problemas como humanos.',
        porque: 'Es la revolución industrial de nuestra era. Invertir aquí es apostar a que las máquinas harán el trabajo más rápido y eficiente, generando ganancias masivas.',
        riesgo: 'Alto',
    },
    'Bluechip': {
        icon: '',
        titulo: 'Bluechip',
        que: 'Empresas gigantes, estables y con historial impecable (ej. Microsoft o Coca-Cola).',
        porque: 'Son el "refugio seguro". No te harán millonario de la noche a la mañana, pero es muy difícil que pierdan su valor. Dan estabilidad a tu cartera.',
        riesgo: 'Bajo',
    },
    'Digital': {
        icon: '',
        titulo: 'Digital',
        que: 'Negocios basados 100% en internet: ciberseguridad, almacenamiento en la nube o redes sociales.',
        porque: 'El mundo vive en la red. Si el tráfico de internet sube, estas empresas ganan.',
        riesgo: 'Medio',
    },
    'Gaming': {
        icon: '',
        titulo: 'Gaming',
        que: 'Empresas de videojuegos, consolas y eSports.',
        porque: 'Es una de las industrias de entretenimiento que más dinero mueve, superando incluso al cine. Los lanzamientos de nuevos juegos generan picos de ganancias.',
        riesgo: 'Medio',
    },
    'NFT': {
        icon: '️',
        titulo: 'NFT — Tokens No Fungibles',
        que: 'Activos digitales únicos certificados por blockchain (arte, coleccionables, música).',
        porque: 'Es una inversión de alto riesgo basada en la escasez y el valor artístico. Si un NFT se vuelve "tendencia", su precio puede subir miles de veces.',
        riesgo: 'Muy Alto',
    },
    'Metaverso': {
        icon: '',
        titulo: 'Metaverso',
        que: 'Mundos virtuales donde la gente socializa, trabaja y compra.',
        porque: 'Es la apuesta al futuro de internet. Invertir aquí es como comprar terrenos en una ciudad que apenas se está construyendo.',
        riesgo: 'Alto',
    },
    'Fintech': {
        icon: '',
        titulo: 'Fintech — Financial Technology',
        que: 'Bancos digitales, apps de pago y préstamos online.',
        porque: 'Los bancos tradicionales son lentos; las Fintech son rápidas. Inviertes en la modernización del dinero.',
        riesgo: 'Medio',
    },
    'Energía': {
        icon: '',
        titulo: 'Energía',
        que: 'Producción de electricidad, desde petróleo hasta paneles solares y reactores nucleares.',
        porque: 'Todo lo demás (IA, Gaming, Casas) necesita energía para funcionar. Es la base de la economía mundial.',
        riesgo: 'Bajo',
    },
    'Biotech': {
        icon: '',
        titulo: 'Biotech — Biotecnología',
        que: 'Uso de organismos vivos para crear medicinas, vacunas o mejorar cultivos.',
        porque: 'Un solo descubrimiento médico (como una cura o vacuna nueva) puede hacer que las acciones se disparen en un día.',
        riesgo: 'Alto',
    },
    'Espacio': {
        icon: '',
        titulo: 'Espacio',
        que: 'Turismo espacial, satélites y minería en asteroides.',
        porque: 'Es la "última frontera". Es una inversión a largo plazo pensando en que la humanidad saldrá de la Tierra.',
        riesgo: 'Muy Alto',
    },
    'Meme': {
        icon: '',
        titulo: 'Meme — Memecoins',
        que: 'Criptomonedas que nacen de chistes en internet (como Dogecoin).',
        porque: 'Es pura especulación y diversión. No tienen un valor real sólido, pero si una comunidad se organiza, el precio vuela por los cielos.',
        riesgo: 'Extremo',
    },
    'DeFi': {
        icon: '',
        titulo: 'DeFi — Finanzas Descentralizadas',
        que: 'Sistemas financieros que no necesitan bancos, funcionando con contratos inteligentes.',
        porque: 'Es eliminar al "intermediario". Tú eres tu propio banco y ganas intereses directamente de otros usuarios.',
        riesgo: 'Alto',
    },
};

const riskColor = { 'Bajo':'#27ae60', 'Medio':'#f39c12', 'Alto':'#e67e22', 'Muy Alto':'#e74c3c', 'Extremo':'#9b59b6' };

window.openSectorGuide = () => {
    const body = document.getElementById('sector-guide-body');
    if (!body) return;
    body.innerHTML = Object.entries(sectorInfo).map(([key, s]) => `
        <div class="sg-card">
            <div class="sg-card-header">
                <span class="sg-icon">${s.icon}</span>
                <strong class="sg-title">${s.titulo}</strong>
                <span class="sg-risk" style="background:${riskColor[s.riesgo]}">Riesgo: ${s.riesgo}</span>
            </div>
            <p class="sg-que"><b>¿Qué es?</b> ${s.que}</p>
            <p class="sg-why"><b>¿Por qué invertir?</b> ${s.porque}</p>
        </div>
    `).join('');
    document.getElementById('modal-sector-guide').style.display = 'flex';
};

window.closeSectorGuide = () => {
    document.getElementById('modal-sector-guide').style.display = 'none';
};


// ============================================================
//  MODAL: INFO DE SECTORES
// ============================================================
window.openMarketInfo = () => {
    document.getElementById('modal-market-info').style.display = 'flex';
};
window.closeMarketInfo = () => {
    document.getElementById('modal-market-info').style.display = 'none';
};


// ============================================================
//  SISTEMA DE HISTORIAL
// ============================================================

const HISTORIAL_KEY = () => {
    const u = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_historial_${u}`;
};

const logEvent = (tipo, mensaje, extra = '') => {
    const historial = JSON.parse(localStorage.getItem(HISTORIAL_KEY()) || '[]');
    const entrada = {
        tipo,       // 'compra' | 'venta' | 'comida' | 'deposito' | 'efecto' | 'gameover' | 'bonus' | 'evento'
        mensaje,
        extra,
        hora: new Date().toLocaleTimeString(),
        fecha: new Date().toLocaleDateString(),
        monedas: parseFloat(state.monedas).toFixed(2),
    };
    historial.unshift(entrada); // más reciente primero
    // Máximo 200 entradas
    if (historial.length > 200) historial.length = 200;
    localStorage.setItem(HISTORIAL_KEY(), JSON.stringify(historial));
};

const iconByTipo = {
    compra:   'C',
    venta:    'V',
    comida:   'A',
    deposito: 'D',
    efecto:   'E',
    gameover: 'X',
    bonus:    'B',
    evento:   'M',
    mascota:  'P',
    sistema:  'S',
};

const colorByTipo = {
    compra:   '#B2F2BB',
    venta:    '#FFB6C1',
    comida:   '#FFF5BA',
    deposito: '#A0E7E5',
    efecto:   '#CBA6F7',
    gameover: '#FFB6C1',
    bonus:    '#FFF5BA',
    evento:   '#CBA6F7',
    mascota:  '#FFB6C1',
    sistema:  '#f0e7ff',
};

window.openHistorial = () => {
    renderHistorialList();
    document.getElementById('modal-historial').style.display = 'flex';
};

window.closeHistorial = () => {
    document.getElementById('modal-historial').style.display = 'none';
};

window.clearHistorial = () => {
    if (!confirm('¿Seguro que quieres limpiar todo el historial?')) return;
    localStorage.removeItem(HISTORIAL_KEY());
    renderHistorialList();
    showToast('Historial limpiado');
};

const renderHistorialList = () => {
    const container = document.getElementById('historial-list');
    if (!container) return;
    const historial = JSON.parse(localStorage.getItem(HISTORIAL_KEY()) || '[]');

    if (historial.length === 0) {
        container.innerHTML = `<div class="historial-empty">
            <p>Aun no hay actividad registrada. Empieza a invertir!</p>
        </div>`;
        return;
    }

    container.innerHTML = historial.map((e, i) => {
        const icon  = iconByTipo[e.tipo]  || '•';
        const color = colorByTipo[e.tipo] || '#f0e7ff';
        const isGameOver = e.tipo === 'gameover';
        return `
        <div class="historial-item ${isGameOver ? 'historial-gameover' : ''}">
            <div class="hi-icon" style="background:${color}; color:#CBA6F7;">${icon}</div>
            <div class="hi-body">
                <span class="hi-msg">${e.mensaje}</span>
                ${e.extra ? `<span class="hi-extra">${e.extra}</span>` : ''}
            </div>
            <div class="hi-meta">
                <span class="hi-hora">${e.hora}</span>
                <span class="hi-monedas">${e.monedas}</span>
            </div>
        </div>`;
    }).join('');
};

// Tutorial gestionado por tutorial.js
// Fallback por si tutorial.js no carga a tiempo
window.openTutorial = () => {
    // Esperar hasta 3 segundos a que tutorial.js cargue
    let attempts = 0;
    const tryOpen = () => {
        if (typeof TUTORIAL_STEPS !== 'undefined') {
            // tutorial.js ya cargó — usar su función real
            const realOpen = () => {
                tutorialFirstRun = !localStorage.getItem(TUTORIAL_DONE_KEY());
                tutorialActive   = true;
                tutorialStep     = 0;
                tutorialSelectedAction = null;
                createTutorialUI();
                renderTutorialStep();
            };
            realOpen();
        } else if (attempts < 30) {
            attempts++;
            setTimeout(tryOpen, 100);
        } else {
            showToast('️ Tutorial no disponible. Recarga la página e inténtalo de nuevo.');
        }
    };
    tryOpen();
};


// ============================================================
//  SISTEMA DE CÓDIGOS DE RECOMPENSA
// ============================================================
const CODIGOS = {
    'BITGAMESO': {
        unica: true,   // solo se puede canjear una vez por usuario
        recompensa: (usuario) => {
            state.monedas += 1000;
            logEvent('bonus', 'Código BITGAMESO canjeado', '+1000 monedas');
            return ' ¡Código válido! +1,000 monedas de bienvenida';
        }
    },
    '1234': {
        unica: true,  // solo una vez por cuenta
        recompensa: (usuario) => {
            state.monedas += 1000000;
            logEvent('bonus', 'Código 1234 canjeado', '+1,000,000 monedas');
            return ' ¡Código válido! +1,000,000 monedas';
        }
    },
    'BIENVENIDA': {
        unica: true,
        recompensa: (usuario) => {
            state.monedas += 500;
            // Añadir comidas respetando límite de 99
            const addFoodSafe = (id, qty) => {
                const food = foodDatabase.find(f => f.id === id);
                if (!food) return 0;
                const existing = state.inventory.get(id);
                const currentQty = existing?.qty || 0;
                const canAdd = Math.min(qty, MAX_FOOD_QTY - currentQty);
                if (canAdd <= 0) return 0;
                state.inventory.set(id, { ...food, price: 0, qty: currentQty + canAdd });
                return canAdd;
            };
            const r1 = addFoodSafe('Carrot-128', 2);
            const r2 = addFoodSafe('Fish-128', 1);
            const r3 = addFoodSafe('Candy-Blue-128', 3);
            const r4 = addFoodSafe('Pumpkin-128', 3);
            logEvent('bonus', 'Código BIENVENIDA canjeado', '+500 monedas + comidas gratis');
            return ` ¡Código válido! +500 monedas + ${r1} zanahorias, ${r2} pescado, ${r3} dulces, ${r4} calabazas`;
        }
    },
    'JOSELUIS': {
        unica: true,
        recompensa: (usuario) => {
            state.foodInflation.clear();
            logEvent('bonus', 'Código JOSELUIS canjeado', 'Inflación de comida reseteada');
            return ' ¡Código válido! Toda la inflación de comida ha sido reseteada';
        }
    },
    'DAVID': {
        unica: true,
        recompensa: (usuario) => {
            state.monedas += 1_000_000_000_000;
            const calabazaId = 'Pumpkin-128';
            const existing   = state.inventory.get(calabazaId);
            if (existing) {
                existing.qty = Math.min((existing.qty || 1) + 99, 99);
                state.inventory.set(calabazaId, existing);
            } else {
                state.inventory.set(calabazaId, { id: calabazaId, name: 'Calabaza', cat: 'verdura', health: 12, qty: 99 });
            }
            if (typeof renderInventory === 'function') renderInventory();
            logEvent('bonus', 'Código DAVID canjeado', '+1,000,000,000,000 monedas + 99 calabazas');
            return 'Código válido! +1,000,000,000,000 monedas + 99 calabazas';
        }
    },
    'PRUEBADEV': {
        unica: true,
        recompensa: (usuario) => {
            // +100,000,000,000,000,000,000,000 monedas
            state.monedas += 1e23;

            // 99 de TODAS las comidas
            foodDatabase.forEach(food => {
                const maxQty = food.cat === 'misc' ? 5 : 99;
                const existing = state.inventory.get(food.id);
                if (existing) {
                    existing.qty = maxQty;
                    state.inventory.set(food.id, existing);
                } else {
                    state.inventory.set(food.id, {
                        id:     food.id,
                        name:   food.name,
                        cat:    food.cat,
                        health: food.health,
                        qty:    maxQty,
                    });
                }
            });

            if (typeof renderInventory === 'function') renderInventory();
            logEvent('bonus', 'Código PRUEBADEV canjeado', '+1e23 monedas + 99 de toda la comida');
            return 'Código válido! +100,000,000,000,000,000,000,000 monedas + 99 de toda la comida';
        }
    },
};

const getCodigoKey = (codigo) => {
    const usuario = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_codigo_${codigo}_${usuario}`;
};

window.openCodigoModal = () => {
    const input = document.getElementById('codigo-input');
    const msg   = document.getElementById('codigo-msg');
    if (input) input.value = '';
    if (msg)   msg.textContent = '';
    if (msg)   msg.style.color = '';
    document.getElementById('modal-codigo').style.display = 'flex';
    setTimeout(() => input?.focus(), 100);
};

window.closeCodigoModal = () => {
    document.getElementById('modal-codigo').style.display = 'none';
};

window.canjearCodigo = () => {
    const input = document.getElementById('codigo-input');
    const msg   = document.getElementById('codigo-msg');
    if (!input || !msg) return;

    const codigo = input.value.trim().toUpperCase();
    if (!codigo) { msg.textContent = '️ Escribe un código primero'; msg.style.color = '#e67e22'; return; }

    const def = CODIGOS[codigo];
    if (!def) { msg.textContent = ' Código no válido'; msg.style.color = '#e74c3c'; return; }

    // Verificar si ya fue canjeado (solo para códigos únicos)
    if (def.unica && localStorage.getItem(getCodigoKey(codigo))) {
        msg.textContent = ' Este código ya fue canjeado por tu cuenta';
        msg.style.color = '#e74c3c';
        return;
    }

    // Aplicar recompensa
    const resultado = def.recompensa(localStorage.getItem('bitgameso_sesion_activa'));
    msg.textContent = resultado;
    msg.style.color = '#27ae60';

    // Marcar como canjeado si es único
    if (def.unica) localStorage.setItem(getCodigoKey(codigo), 'true');

    // Actualizar UI
    updateUI();
    input.value = '';
    showToast(resultado);
    // El modal queda abierto para que el usuario pueda canjear otro código
};

// También permitir Enter en el input
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('codigo-input');
    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') canjearCodigo();
        });
    }
});

// ============================================================
//  INIT
// ============================================================

// ============================================================
//  MOBILE: reiniciar timers al volver al primer plano
// ============================================================
let lastTickTime = Date.now();

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Guardar antes de ir a segundo plano
        if (typeof saveCurPetHealth === 'function') saveCurPetHealth();
        saveGame();
        lastTickTime = Date.now();
    } else {
        // Volvió al primer plano — reiniciar todos los timers
        const elapsed = Date.now() - lastTickTime;
        console.log(`Volvió al primer plano tras ${elapsed}ms — reiniciando timers`);

        // Restar tiempo transcurrido de los efectos activos
        if (elapsed > 0) {
            const elapsedSecs = Math.floor(elapsed / 1000);
            ['marketFast','doubleProfit','futureVision'].forEach(k => {
                if (state.effectsTime[k] > 0) {
                    state.effectsTime[k] = Math.max(0, state.effectsTime[k] - elapsedSecs);
                }
            });
        }

        // Reiniciar market timer
        if (typeof startPassivesForPet === 'function') {
            startPassivesForPet(state.currentPet);
        } else {
            startMarket(SPEED_NORMAL);
        }

        // Reiniciar effect tick
        if (typeof startEffectTick === 'function') startEffectTick();

        // Forzar fetch inmediato para que los precios se actualicen
        fetchMarket();
        renderEffectBadges();
    }
});

window.addEventListener('beforeunload', () => {
    if (typeof saveCurPetHealth === 'function') saveCurPetHealth();
    saveGame();
});

// Heartbeat: si el mercado lleva más de 10s sin actualizarse, reiniciarlo
setInterval(() => {
    const sinceLastUpdate = Date.now() - (window._lastMarketUpdate || 0);
    if (sinceLastUpdate > 10000 && document.visibilityState === 'visible') {
        console.warn('Mercado congelado detectado — reiniciando...');
        if (typeof startPassivesForPet === 'function') {
            startPassivesForPet(state.currentPet);
        } else {
            startMarket(SPEED_NORMAL);
        }
        fetchMarket();
    }
}, 10000);

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que hay una sesión activa
    const sesionActiva = localStorage.getItem('bitgameso_sesion_activa');
    if (!sesionActiva) {
        alert('Debes iniciar sesión para jugar.');
        window.location.href = '/src/InicioCuenta/inico.html';
        return;
    }

    // Mostrar nombre del usuario en el header
    const nombreEl = document.getElementById('nombre-usuario');
    if (nombreEl) nombreEl.textContent = sesionActiva;

    refs.monedasCount   = document.getElementById('monedas-count');
    refs.marketList     = document.getElementById('lista-activos');
    refs.marketUpdated  = document.getElementById('market-updated');
    refs.petHealthValue = document.getElementById('pet-health-value');
    refs.petMessage     = document.getElementById('pet-message');

    // Cargar progreso: primero nube, luego local
    if (typeof window.initCloudSync === 'function') {
        await window.initCloudSync(); // carga desde Supabase si hay guardado más reciente
    }
    loadGame(); // carga desde localStorage (ya actualizado por initCloudSync)

    // Actualizar monedas en pantalla inmediatamente tras cargar
    if (refs.monedasCount) {
        const _m = state.monedas;
        refs.monedasCount.textContent = (!isFinite(_m) || isNaN(_m)) ? '0.00'
            : _m >= 1e15 ? _m.toExponential(2)
            : parseFloat(_m).toFixed(2);
    }
    if (typeof initPetData === 'function') initPetData();

    // Botones nav
    document.getElementById('btn-depositar')?.addEventListener('click', openDeposit);
    document.getElementById('btn-comprar')  ?.addEventListener('click', openFoodShop);
    document.getElementById('btn-vender')   ?.addEventListener('click', sellSelectedFood);
    document.getElementById('btn-enviar')   ?.addEventListener('click', useFoodOnPet);

    renderPet();
    renderPetHealth();
    renderInventory();
    renderEffectBadges();
    buildFilterTabs();
    fetchMarket();
    reactivateEffects();
    if (typeof startPassivesForPet === 'function') startPassivesForPet(state.currentPet);
    startMarket(state.effectsTime.marketFast > 0 ? SPEED_FAST : SPEED_NORMAL);
    startEffectTick();
    startPetTips();
    scheduleNextEvent();
    // Inicializar mecánicas financieras realistas
    if (typeof window.initFinanceMechanics === 'function') window.initFinanceMechanics();
});

console.log('BITGAMESO v5 — inflación comida, bonos sector, 50 mensajes mascota. ');

// ============================================================
//  BUG REPORT — usa /api/send-bug y /api/save-bug (claves seguras en servidor)
// ============================================================
// Las claves de Resend y Supabase ya NO están aquí.
// Están en variables de entorno privadas de Vercel.

// Capturar errores de consola
window._bugErrors = [];
const _origErr = console.error.bind(console);
console.error = (...a) => {
    window._bugErrors.push({ t: new Date().toISOString(), m: a.join(' ') });
    if (window._bugErrors.length > 30) window._bugErrors.shift();
    _origErr(...a);
};

const _bugCtx = () => ({
    usuario:  localStorage.getItem('bitgameso_sesion_activa') || 'invitado',
    userId:   localStorage.getItem('bitgameso_user_id') || null,
    monedas:  state?.monedas ?? '—',
    mascota:  state?.currentPet ?? '—',
    salud:    state?.saludMascota ?? '—',
    pantalla: `${window.innerWidth}x${window.innerHeight}`,
    url:      window.location.href,
    fecha:    new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }),
    fechaISO: new Date().toISOString(),
    errores:  (window._bugErrors || []).slice(-5),
});

window.openBugReport = () => {
    // Cerrar dropdown
    const dd = document.getElementById('settings-dropdown-menu');
    if (dd) dd.style.display = 'none';

    // Inyectar estilos si no existen
    if (!document.getElementById('bug-inline-styles')) {
        const st = document.createElement('style');
        st.id = 'bug-inline-styles';
        st.textContent = `
        #modal-bug-inline{position:fixed;inset:0;background:rgba(0,0,0,0.48);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;}
        .bug-box{background:#FFF5BA;border-radius:20px;border:3px solid #CBA6F7;box-shadow:8px 8px 0 #CBA6F7;width:100%;max-width:480px;font-family:'Poppins',sans-serif;overflow:hidden;max-height:92vh;display:flex;flex-direction:column;}
        .bug-hdr{background:linear-gradient(135deg,#CBA6F7,#FFB6C1);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;}
        .bug-hdr h3{margin:0;color:#fff;font-family:'Fredoka',sans-serif;font-size:1.2rem;}
        .bug-hdr button{background:rgba(255,255,255,0.3);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:1rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;}
        .bug-body{padding:16px 20px;overflow-y:auto;flex:1;}
        .bug-body p{font-size:0.82rem;color:#CBA6F7;margin:0 0 10px;}
        #bug-desc{width:100%;min-height:100px;padding:12px;border:2px solid #CBA6F7;border-radius:12px;font-family:'Poppins',sans-serif;font-size:0.86rem;resize:vertical;outline:none;box-sizing:border-box;color:#CBA6F7;background:white;}
        .bug-ss-area{margin-top:10px;border:2px dashed #CBA6F7;border-radius:12px;padding:12px;text-align:center;cursor:pointer;position:relative;background:white;}
        .bug-ss-area input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
        .bug-ss-area p{font-size:0.78rem;color:#CBA6F7;margin:0;}
        #bug-ss-preview{display:none;margin-top:8px;}
        #bug-ss-preview img{max-width:100%;max-height:120px;border-radius:8px;border:2px solid #CBA6F7;}
        #bug-status{font-size:0.82rem;min-height:16px;margin-top:8px;text-align:center;font-weight:700;color:#CBA6F7;}
        .bug-auto{margin-top:10px;background:white;border-radius:10px;padding:8px 12px;font-size:0.72rem;color:#CBA6F7;line-height:1.8;}
        .bug-ftr{padding:12px 20px 16px;display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #f0e7ff;flex-shrink:0;}
        .bug-ftr button{padding:10px 20px;border-radius:12px;font-family:'Poppins',sans-serif;font-weight:700;font-size:0.88rem;cursor:pointer;}
        #bug-cancel{background:white;color:#CBA6F7;border:2px solid #CBA6F7;}
        #bug-cancel:hover{background:#f9f0ff;}
        #bug-send{background:linear-gradient(135deg,#CBA6F7,#FFB6C1);color:white;border:none;}
        #bug-send:disabled{opacity:0.55;cursor:not-allowed;}
        `;
        document.head.appendChild(st);
    }

    // Si ya existe el modal, mostrarlo limpio
    const existing = document.getElementById('modal-bug-inline');
    if (existing) {
        existing.style.display = 'flex';
        document.getElementById('bug-desc').value = '';
        document.getElementById('bug-status').textContent = '';
        document.getElementById('bug-ss-preview').style.display = 'none';
        window._bugScreenshot = null;
        return;
    }

    const ctx   = _bugCtx();
    const modal = document.createElement('div');
    modal.id    = 'modal-bug-inline';
    modal.innerHTML = `
        <div class="bug-box">
            <div class="bug-hdr">
                <h3>Reportar Bug</h3>
                <button onclick="closeBugReport()">x</button>
            </div>
            <div class="bug-body">
                <p>Cuentanos que paso. Adjunta una captura si puedes.</p>
                <textarea id="bug-desc" placeholder="Ej: Cuando presione Enviar la manzana desaparecio pero mi mascota no gano salud..."></textarea>
                <div class="bug-ss-area">
                    <input type="file" id="bug-ss-input" accept="image/*">
                    <p>Haz clic para adjuntar captura (opcional, max 5MB)</p>
                    <div id="bug-ss-preview"><img id="bug-ss-thumb" src="" alt="Captura"></div>
                </div>
                <div id="bug-status"></div>
                <div class="bug-auto">
                    Se adjunta: <b>${ctx.usuario}</b> · <b>${ctx.pantalla}</b> · mascota <b>${ctx.mascota}</b> · monedas <b>${typeof ctx.monedas === 'number' ? ctx.monedas.toLocaleString('es-MX',{maximumFractionDigits:0}) : ctx.monedas}</b>
                </div>
            </div>
            <div class="bug-ftr">
                <button id="bug-cancel" onclick="closeBugReport()">Cancelar</button>
                <button id="bug-send"   onclick="submitBugInline()">Enviar reporte</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) closeBugReport(); });

    window._bugScreenshot = null;
    document.getElementById('bug-ss-input').addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { document.getElementById('bug-status').textContent = 'La imagen no puede pesar mas de 5 MB.'; return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            window._bugScreenshot = ev.target.result;
            document.getElementById('bug-ss-thumb').src = ev.target.result;
            document.getElementById('bug-ss-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
};

window.closeBugReport = () => {
    const m = document.getElementById('modal-bug-inline');
    if (m) m.style.display = 'none';
};

window.submitBugInline = async () => {
    const desc   = (document.getElementById('bug-desc')?.value || '').trim();
    const status = document.getElementById('bug-status');
    const btn    = document.getElementById('bug-send');
    if (!desc) { status.textContent = 'Por favor describe el bug.'; return; }

    btn.disabled       = true;
    status.textContent = 'Enviando...';

    const ctx = _bugCtx();
    const ss  = window._bugScreenshot || null;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <style>body{font-family:Arial,sans-serif;background:#FFF5BA;padding:20px}.card{background:#fff;border-radius:16px;border:3px solid #CBA6F7;max-width:600px;margin:0 auto;overflow:hidden}.hdr{background:linear-gradient(135deg,#CBA6F7,#FFB6C1);padding:20px}.hdr h1{margin:0;color:#fff;font-size:1.3rem}.body{padding:20px}.sec{margin-bottom:16px}.sec h3{color:#CBA6F7;border-bottom:2px solid #f0e7ff;padding-bottom:4px;margin:0 0 8px;font-size:0.9rem}.desc{background:#f9f0ff;border-left:4px solid #CBA6F7;padding:12px;border-radius:0 10px 10px 0;font-size:0.9rem;white-space:pre-wrap}table{width:100%;border-collapse:collapse;font-size:0.82rem}td{padding:6px 8px;border-bottom:1px solid #f0e7ff}td:first-child{color:#CBA6F7;width:40%}td:last-child{font-weight:700;color:#CBA6F7}.ss img{max-width:100%;border-radius:8px;border:2px solid #CBA6F7}.ftr{background:#f9f0ff;padding:10px 20px;text-align:center;font-size:0.72rem;color:#aaa}</style>
    </head><body><div class="card">
    <div class="hdr"><h1>Bug Report — BITGAMESO</h1><p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:0.82rem">${ctx.fecha} · ${ctx.usuario}</p></div>
    <div class="body">
    <div class="sec"><h3>Descripcion</h3><div class="desc">${desc.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div></div>
    ${ss ? `<div class="sec"><h3>Captura</h3><div class="ss"><img src="${ss}"></div></div>` : ''}
    <div class="sec"><h3>Estado del jugador</h3><table>
    <tr><td>Usuario</td><td>${ctx.usuario}</td></tr>
    <tr><td>Monedas</td><td>${typeof ctx.monedas==='number'?ctx.monedas.toLocaleString('es-MX',{maximumFractionDigits:2}):ctx.monedas}</td></tr>
    <tr><td>Mascota</td><td>${ctx.mascota}</td></tr>
    <tr><td>Salud</td><td>${ctx.salud}%</td></tr>
    </table></div>
    <div class="sec"><h3>Info tecnica</h3><table>
    <tr><td>Pantalla</td><td>${ctx.pantalla}</td></tr>
    <tr><td>URL</td><td>${ctx.url}</td></tr>
    </table></div>
    ${ctx.errores.length ? `<div class="sec"><h3>Errores consola</h3><div style="background:#fff5f5;border-radius:8px;padding:10px;font-family:monospace;font-size:0.72rem">${ctx.errores.map(e=>`<div style="color:#c0392b;border-bottom:1px solid #fde;padding:2px 0">${e.t.slice(11,19)} — ${e.m.slice(0,200)}</div>`).join('')}</div></div>` : ''}
    </div><div class="ftr">Enviado desde BITGAMESO · bitgameso.com</div>
    </div></body></html>`;

    let ok = false;

    // 1 — Resend (via API segura)
    try {
        const r = await fetch('/api/send-bug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: `Bug de ${ctx.usuario} — ${ctx.fecha}`,
                html,
            }),
        });
        if (r.ok) ok = true;
    } catch(e) { console.warn('Resend error:', e); }

    // 2 — Supabase (via API segura)
    try {
        await fetch('/api/save-bug', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id:          ctx.userId,
                usuario:          ctx.usuario,
                descripcion:      desc,
                mascota:          ctx.mascota,
                monedas:          typeof ctx.monedas==='number' ? ctx.monedas : null,
                salud:            typeof ctx.salud==='number'   ? ctx.salud   : null,
                navegador:        navigator.userAgent,
                pantalla:         ctx.pantalla,
                url:              ctx.url,
                errores_consola:  JSON.stringify(ctx.errores),
                tiene_screenshot: !!ss,
                created_at:       ctx.fechaISO,
            }),
        });
        ok = true;
    } catch(e) { console.warn('Supabase error:', e); }

    if (ok) {
        status.textContent = 'Reporte enviado. Gracias por ayudarnos a mejorar BITGAMESO.';
        document.getElementById('bug-desc').value = '';
        window._bugScreenshot = null;
        document.getElementById('bug-ss-preview').style.display = 'none';
        setTimeout(() => closeBugReport(), 2800);
    } else {
        status.textContent = 'Error al enviar. Intenta de nuevo.';
        btn.disabled = false;
    }
};

// ============================================================
//  GRÁFICA EN TIEMPO REAL — BITGAMESO
//  Historial de 5 minutos (300 ticks de 1s aprox)
// ============================================================

const CHART_MAX_POINTS = 300; // 5 min a ~1 tick/seg
const chartHistory     = new Map(); // symbol → [{price, time}]
let   chartSymbol      = null;      // activo abierto en modal
let   chartAnimFrame   = null;

// ── Registrar precio en historial cada tick ──────────────────
const recordChartTick = () => {
    const now = Date.now();
    state.market.forEach((asset, sym) => {
        if (!chartHistory.has(sym)) chartHistory.set(sym, []);
        const arr = chartHistory.get(sym);
        arr.push({ price: asset.price, time: now });
        if (arr.length > CHART_MAX_POINTS) arr.shift();
    });
    // Si el modal está abierto, redibujar
    if (chartSymbol && document.getElementById('modal-chart')?.style.display !== 'none') {
        drawChart();
        updateChartUI();
    }
};

// ── Abrir modal de gráfica ───────────────────────────────────
window.openChart = (symbol) => {
    chartSymbol = symbol;
    document.getElementById('modal-chart').style.display = 'flex';
    buildChartSelector(symbol);
    updateChartUI();
    drawChart();
};

window.closeChart = () => {
    document.getElementById('modal-chart').style.display = 'none';
};

// ── Selector de activos dentro del modal ─────────────────────
const buildChartSelector = (selected) => {
    const el = document.getElementById('chart-selector');
    if (!el) return;
    const symbols = Array.from(state.market.keys()).slice(0, 20); // primeros 20
    el.innerHTML = symbols.map(sym => `
        <button onclick="switchChart('${sym}')" style="
            padding:3px 8px;border-radius:8px;border:2px solid #CBA6F7;
            font-size:10px;font-family:'Poppins',sans-serif;cursor:pointer;
            background:${sym === selected ? '#CBA6F7' : 'white'};
            color:${sym === selected ? 'white' : '#CBA6F7'};
            font-weight:600;transition:0.2s;white-space:nowrap;flex-shrink:0;
        ">${sym}</button>
    `).join('');
};

window.switchChart = (sym) => {
    chartSymbol = sym;
    buildChartSelector(sym);
    updateChartUI();
    drawChart();
};

// ── Actualizar título, precio y botón comprar ─────────────────
const updateChartUI = () => {
    const asset = state.market.get(chartSymbol);
    if (!asset) return;

    document.getElementById('chart-title').textContent = `${asset.symbol} — ${asset.name}`;
    document.getElementById('chart-subtitle').textContent = `${asset.type} · Últimos 5 minutos`;

    // Precio con descuento si hay vaca
    const discPrice = typeof window.applyPetBuyModifiers === 'function'
        ? window.applyPetBuyModifiers(asset.price) : asset.price;
    const owned = state.portfolio.has(chartSymbol);
    const priceEl = document.getElementById('chart-price-display');
    const buyBtn  = document.getElementById('chart-buy-btn');

    if (discPrice < asset.price) {
        priceEl.innerHTML = `<span style="text-decoration:line-through;opacity:.5;font-size:.8em;">${fmt(asset.price)}</span> <span style="color:#52b788;">${fmt(discPrice)}</span>`;
    } else {
        priceEl.textContent = fmt(asset.price);
    }

    if (owned) {
        buyBtn.textContent  = 'Ya tienes este activo';
        buyBtn.disabled     = true;
        buyBtn.className    = 'btn-action btn-disabled';
    } else {
        buyBtn.textContent  = `Comprar ${chartSymbol}`;
        buyBtn.disabled     = false;
        buyBtn.className    = 'btn-action btn-buy';
    }

    // Stats rápidos
    const arr = chartHistory.get(chartSymbol) || [];
    const statsEl = document.getElementById('chart-stats');
    if (arr.length >= 2) {
        const first  = arr[0].price;
        const last   = arr[arr.length - 1].price;
        const minP   = Math.min(...arr.map(p => p.price));
        const maxP   = Math.max(...arr.map(p => p.price));
        const change = ((last - first) / first) * 100;
        const isUp   = change >= 0;
        const statStyle = "background:#f9f0ff;border-radius:10px;padding:5px 10px;font-size:10px;font-family:'Poppins',sans-serif;flex-shrink:0;min-width:70px;";
        statsEl.innerHTML = `
            <div style="${statStyle}">
                <span style="color:#CBA6F7;opacity:.7;">Cambio 5min</span><br>
                <strong style="color:${isUp ? '#52b788' : '#FFB6C1'};">${isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}%</strong>
            </div>
            <div style="${statStyle}">
                <span style="color:#CBA6F7;opacity:.7;">Mínimo</span><br>
                <strong style="color:#CBA6F7;">${fmt(minP)}</strong>
            </div>
            <div style="${statStyle}">
                <span style="color:#CBA6F7;opacity:.7;">Máximo</span><br>
                <strong style="color:#CBA6F7;">${fmt(maxP)}</strong>
            </div>
            <div style="${statStyle}">
                <span style="color:#CBA6F7;opacity:.7;">Actual</span><br>
                <strong style="color:#CBA6F7;">${fmt(last)}</strong>
            </div>
        `;
    } else {
        statsEl.innerHTML = '<span style="color:#aaa;font-size:11px;">Acumulando datos...</span>';
    }
};

// ── Dibujar gráfica con Canvas ────────────────────────────────
const drawChart = () => {
    const canvas = document.getElementById('chart-canvas');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const arr    = chartHistory.get(chartSymbol) || [];

    // Ajustar resolución del canvas
    const W = canvas.offsetWidth  || 600;
    const H = canvas.offsetHeight || 200;
    canvas.width  = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, W, H);

    if (arr.length < 2) {
        ctx.fillStyle = '#CBA6F7';
        ctx.font      = '13px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Acumulando datos del mercado...', W / 2, H / 2);
        return;
    }

    const prices = arr.map(p => p.price);
    const minP   = Math.min(...prices);
    const maxP   = Math.max(...prices);
    const range  = maxP - minP || 1;
    const pad    = { top: 16, right: 16, bottom: 24, left: 60 };
    const cW     = W - pad.left - pad.right;
    const cH     = H - pad.top  - pad.bottom;

    const toX = (i)   => pad.left + (i / (arr.length - 1)) * cW;
    const toY = (p)   => pad.top  + (1 - (p - minP) / range) * cH;

    // Fondo grid
    ctx.strokeStyle = '#f0e7ff';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
        const y = pad.top + (i / 4) * cH;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cW, y); ctx.stroke();
        const val = maxP - (i / 4) * range;
        ctx.fillStyle   = '#CBA6F7';
        ctx.font        = '9px Poppins, sans-serif';
        ctx.textAlign   = 'right';
        ctx.fillText(fmt(val), pad.left - 4, y + 3);
    }

    // Área rellena bajo la línea
    const isUp = prices[prices.length - 1] >= prices[0];
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, isUp ? 'rgba(178,242,187,0.5)' : 'rgba(255,182,193,0.5)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(prices[0]));
    prices.forEach((p, i) => { if (i > 0) ctx.lineTo(toX(i), toY(p)); });
    ctx.lineTo(toX(prices.length - 1), pad.top + cH);
    ctx.lineTo(toX(0), pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Línea principal
    ctx.beginPath();
    ctx.strokeStyle = isUp ? '#52b788' : '#FFB6C1';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    prices.forEach((p, i) => {
        i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p));
    });
    ctx.stroke();

    // Punto actual (último)
    const lastX = toX(prices.length - 1);
    const lastY = toY(prices[prices.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle   = isUp ? '#B2F2BB' : '#FFB6C1';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Etiquetas de tiempo (inicio y fin)
    if (arr.length >= 2) {
        const startTime = new Date(arr[0].time).toLocaleTimeString();
        const endTime   = new Date(arr[arr.length-1].time).toLocaleTimeString();
        ctx.fillStyle  = '#CBA6F7';
        ctx.font       = '9px Poppins, sans-serif';
        ctx.textAlign  = 'left';
        ctx.fillText(startTime, pad.left, H - 6);
        ctx.textAlign  = 'right';
        ctx.fillText(endTime, pad.left + cW, H - 6);
    }
};

// ── Comprar desde el modal ────────────────────────────────────
window.chartBuySelected = () => {
    if (!chartSymbol) return;
    buy(chartSymbol);
    updateChartUI();
};

// ── Tooltip al pasar el mouse ─────────────────────────────────
const initChartTooltip = () => {
    const canvas  = document.getElementById('chart-canvas');
    const tooltip = document.getElementById('chart-tooltip');
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
        const arr = chartHistory.get(chartSymbol) || [];
        if (arr.length < 2) return;
        const rect = canvas.getBoundingClientRect();
        const mx   = e.clientX - rect.left;
        const W    = rect.width;
        const pad  = { left: 60, right: 16 };
        const cW   = W - pad.left - pad.right;
        const idx  = Math.round(((mx - pad.left) / cW) * (arr.length - 1));
        const pt   = arr[Math.max(0, Math.min(idx, arr.length - 1))];
        if (!pt) return;
        const time = new Date(pt.time).toLocaleTimeString();
        tooltip.style.display = 'block';
        tooltip.style.left    = `${mx + 10}px`;
        tooltip.style.top     = `10px`;
        tooltip.innerHTML     = `<strong>${fmt(pt.price)}</strong><br><span style="opacity:.7">${time}</span>`;
    });

    canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
};

// Inicializar tooltip cuando se abre el modal
const _origOpenChart = window.openChart;
window.openChart = (symbol) => {
    _origOpenChart(symbol);
    setTimeout(initChartTooltip, 50);
};