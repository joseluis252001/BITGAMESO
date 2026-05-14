// ============================================================
//  BITGAMESO — pets.js  (cargado ANTES de game.js)
//  Getters seguros para variables de game.js
// ============================================================
// Local speed constants (mirrors game.js)
const PETS_SPEED_NORMAL = 3000;
const PETS_SPEED_FAST   = 1000;

const petSpeed  = (mult) => {
    // Convierte multiplicador a ms de intervalo
    if (mult >= 4)   return 750;
    if (mult >= 3)   return 1000;
    if (mult >= 2)   return 1500;
    if (mult >= 1.5) return 2000;
    return 3000;
};

const _getStartMarket  = () => typeof startMarket  === 'function' ? startMarket  : ()=>{};
const _getShowToast    = () => typeof showToast    === 'function' ? showToast    : ()=>{};
const _getFmt          = () => typeof fmt          === 'function' ? fmt          : (v)=>v.toFixed(2);
const _getSaveGame     = () => typeof saveGame     === 'function' ? saveGame     : ()=>{};
const _getChangePH     = () => typeof changePetHealth === 'function' ? changePetHealth : ()=>{};
const _getCheckGO      = () => typeof checkGameOver  === 'function' ? checkGameOver  : ()=>{};
const _getRenderMarket = () => typeof renderMarket   === 'function' ? renderMarket   : ()=>{};
const _getLogEvent     = () => typeof logEvent       === 'function' ? logEvent       : ()=>{};
const _getUpdateUI     = () => typeof updateUI       === 'function' ? updateUI       : ()=>{};


// ============================================================
//  DEFINICIÓN DE MASCOTAS
// ============================================================
const PET_DEFS = {
    'Bear-100': {
        id: 'Bear-100', label: 'Oso', cost: 0, order: 0,
        marketSpeed: 2,
        passive: 'bear',
        desc: ' Velocidad x2 | Dulces -10% | Penalización en ventas negativas',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Dulces con 10% descuento',
            ' Ventas negativas penalizan proporcionalmente'
        ]
    },
    'Bird-128': {
        id: 'Bird-128', label: 'Pájaro', cost: 0, order: 1,
        marketSpeed: 3,
        passive: 'bird',
        desc: ' Velocidad x3 | +1 moneda/2s | Comida x4 precio | Pausa al operar',
        passiveDesc: [
            ' Mercado x3 permanente',
            ' +1 moneda cada 2 segundos',
            ' Toda la comida cuesta x4',
            ' La moneda se pausa al comprar/vender'
        ]
    },
    'Bunny-Pink-128': {
        id: 'Bunny-Pink-128', label: 'Conejito', cost: 0, order: 2,
        marketSpeed: 1,
        passive: 'bunny',
        desc: ' Habilidad: Turbo x4 por 30s (cooldown 3 min)',
        passiveDesc: [
            ' Botón Turbo: mercado x4 por 30s',
            ' Cooldown de 3 minutos'
        ]
    },
    'Cat-Beige-128': {
        id: 'Cat-Beige-128', label: 'Gato Beige', cost: 100, order: 3,
        marketSpeed: 2,
        passive: 'cat_beige',
        desc: ' Velocidad x2 | Dulces/Pescado duran x4 | -1% salud/20s',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Dulces y Pescado duran 4x más',
            ' -1% salud cada 20 segundos'
        ]
    },
    'Cat-Blue-128': {
        id: 'Cat-Blue-128', label: 'Gato Azul', cost: 100, order: 4,
        marketSpeed: 2,
        passive: 'cat_blue',
        desc: ' Velocidad x2 | Dulces/Pescado duran x5 | -5% salud/20s',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Dulces y Pescado duran 5x más',
            ' -5% salud cada 20 segundos'
        ]
    },
    'Cat-Pink-128': {
        id: 'Cat-Pink-128', label: 'Gato Rosa', cost: 100, order: 5,
        marketSpeed: 2,
        passive: 'cat_pink',
        desc: ' Velocidad x2 | Dulces/Pescado duran x6 | -7% salud/25s',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Dulces y Pescado duran 6x más',
            ' -7% salud cada 25 segundos'
        ]
    },
    'Cat-Tiger-128': {
        id: 'Cat-Tiger-128', label: 'Gato Tigre', cost: 1000, order: 6,
        marketSpeed: 2,
        passive: 'cat_tiger',
        desc: ' Velocidad x2 | Dulces/Pescado duran x7 | -9% salud/30s',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Dulces y Pescado duran 7x más',
            ' -9% salud cada 30 segundos'
        ]
    },
    'Cat-Tiger-Beige-128': {
        id: 'Cat-Tiger-Beige-128', label: 'Tigre Beige', cost: 1000, order: 7,
        marketSpeed: 3,
        passive: 'tiger_beige',
        desc: ' Velocidad x3 | Proteínas duran x15 | Sin inflación en proteínas',
        passiveDesc: [
            ' Mercado x3 permanente',
            ' Carne/Huevo/Pescado duran 15x más',
            ' Sin inflación en proteínas'
        ]
    },
    'Cat-Tiger-Rose-128': {
        id: 'Cat-Tiger-Rose-128', label: 'Tigre Rosa', cost: 1000, order: 8,
        marketSpeed: 3,
        passive: 'tiger_rose',
        desc: ' Velocidad x3 | Proteínas x25 duración | Dulces sin inflación',
        passiveDesc: [
            ' Mercado x3 permanente',
            ' Proteínas duran 25x más',
            ' Dulces sin inflación',
            ' Sin inflación en proteínas'
        ]
    },
    'Cat-White-128': {
        id: 'Cat-White-128', label: 'Gato Blanco', cost: 10000, order: 9,
        marketSpeed: 2,
        passive: 'cat_white',
        desc: ' Velocidad x2 | Bono sector +12% | Pescado/Dulces x20 duración sin inflación',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Bono de sector = +12% (incluye el 3%)',
            ' Pescado y Dulces duran 20x más',
            ' Pescado y Dulces sin inflación'
        ]
    },
    'Chicken-White-128': {
        id: 'Chicken-White-128', label: 'Pollito', cost: 10000, order: 10,
        marketSpeed: 1.5,
        passive: 'chicken_white',
        desc: ' Velocidad x1.5 | Resetea inflación (excepto proteínas) | Proteínas x100% precio +250% inflación',
        passiveDesc: [
            ' Mercado x1.5 permanente',
            ' Resetea inflación de frutas/verduras/dulces/misc',
            ' Proteínas cuestan x2 y su inflación suma +250%'
        ]
    },
    'Chicken-Yellow-128': {
        id: 'Chicken-Yellow-128', label: 'Pollito Amarillo', cost: 10000, order: 11,
        marketSpeed: 1.5,
        passive: 'chicken_yellow',
        desc: ' Velocidad x1.5 | Reset inflación | Proteínas x150% +450% inflación | 50% bonus al vender',
        passiveDesc: [
            ' Mercado x1.5 permanente',
            ' Resetea inflación de frutas/verduras/dulces/misc',
            ' Proteínas cuestan x2.5 y su inflación +450%',
            ' 50% de probabilidad de ganar lo que pagaste al vender'
        ]
    },
    'Cow-128': {
        id: 'Cow-128', label: 'Vaca', cost: 100000, order: 12,
        marketSpeed: 1,
        passive: 'cow',
        desc: ' Compras -50% | Ventas x150% ganancia | -11% salud/30s',
        passiveDesc: [
            ' Todas las compras del mercado cuestan -50%',
            ' Ganancias en ventas x150%',
            ' -11% salud cada 30 segundos'
        ]
    },
    'Frog-128': {
        id: 'Frog-128', label: 'Rana', cost: 100000, order: 13,
        marketSpeed: 1,
        passive: 'frog',
        desc: ' Con 3+ acciones del mismo sector: predicción 100% por 30s (cooldown 1min)',
        passiveDesc: [
            ' Habilidad: predicción perfecta 30s',
            ' Requiere 3+ acciones del mismo sector',
            ' Cooldown 1 minuto'
        ]
    },
    'Penguin-128': {
        id: 'Penguin-128', label: 'Pingüino', cost: 100000, order: 14,
        marketSpeed: 1,
        passive: 'penguin',
        desc: ' Pescado gratis | +50% ganancia ventas | +3% interés | 35% repetir acción | +1000/2min | Hambre',
        passiveDesc: [
            ' Pescado 100% gratis',
            ' +50% ganancia en cada venta',
            ' +3% interés adicional',
            ' 35% de repetir acción al vender',
            ' +1000 monedas cada 2 minutos',
            ' Compra en rojo = salud -30% | -12% salud/50s'
        ]
    },
    'Penguin-Pink-128': {
        id: 'Penguin-Pink-128', label: 'Pingüino Rosa', cost: 1000000, order: 15,
        marketSpeed: 1,
        passive: 'penguin_pink',
        desc: ' Pescado gratis | +70% ganancia | +8% interés | 75% repetir acción | +1500/2min | Hambre',
        passiveDesc: [
            ' Pescado 100% gratis',
            ' +70% ganancia en cada venta',
            ' +8% interés adicional',
            ' 75% de repetir acción al vender',
            ' +1500 monedas cada 2 minutos',
            ' Compra en rojo = salud -40% | -12% salud/50s'
        ]
    },
    'Shark-128': {
        id: 'Shark-128', label: 'Tiburón', cost: 1000000, order: 16,
        marketSpeed: 2,
        passive: 'shark',
        desc: ' Velocidad x2 | Reset inflación | Ventas x8 | 3+ mismo sector = +15% bono +30% extra | -15%/2min',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Resetea toda la inflación de comida',
            ' Ventas multiplicadas x8',
            ' Con 3+ del mismo sector: +15% bono adicional',
            ' Con 3+ del mismo sector: +30% de lo pagado',
            ' -15% salud cada 2 minutos'
        ]
    },
    'Sheep-128': {
        id: 'Sheep-128', label: 'Oveja', cost: 1000000, order: 17,
        marketSpeed: 2,
        passive: 'sheep',
        desc: ' Velocidad x2 | Tienda gratis (sin inflación) | +1700/30s | Al vender: +25% ganancia, 50% repetir, 100% predicción 35s, 25% +2500',
        passiveDesc: [
            ' Mercado x2 permanente',
            ' Tienda gratis si no hay inflación',
            ' Si pierdes dinero, tienda se triplica',
            ' +1700 monedas cada 30 segundos',
            ' Al vender: +25% ganancia',
            ' 50% repetir acción',
            ' 100% predicción de una acción por 35s',
            ' 25% de ganar 2500 monedas extra'
        ]
    },
};

// Orden de desbloqueo
const PET_ORDER = [
    'Bear-100','Bird-128','Bunny-Pink-128',
    'Cat-Beige-128','Cat-Blue-128','Cat-Pink-128',
    'Cat-Tiger-128','Cat-Tiger-Beige-128','Cat-Tiger-Rose-128',
    'Cat-White-128','Chicken-White-128','Chicken-Yellow-128',
    'Cow-128','Frog-128','Penguin-128',
    'Penguin-Pink-128','Shark-128','Sheep-128',
];

// ============================================================
//  MASCOTAS DORADAS — se desbloquean tras victoria (todas a 100 HP)
//  golden:true | baseId = imagen base | efectos positivos x2
// ============================================================
const GOLDEN_DEFS = (() => {
    const defs = {};
    const pairs = [
        ['Bear-100',         'Bear-100-Gold',         'Oso Dorado',         50000,  'bear'],
        ['Bird-128',         'Bird-128-Gold',         'Pajaro Dorado',      50000,  'bird'],
        ['Bunny-Pink-128',   'Bunny-Pink-128-Gold',   'Conejito Dorado',    50000,  'bunny'],
        ['Cat-Beige-128',    'Cat-Beige-128-Gold',    'Gato Beige Dorado',  1000,   'cat_beige'],
        ['Cat-Blue-128',     'Cat-Blue-128-Gold',     'Gato Azul Dorado',   1000,   'cat_blue'],
        ['Cat-Pink-128',     'Cat-Pink-128-Gold',     'Gato Rosa Dorado',   1000,   'cat_pink'],
        ['Cat-Tiger-128',    'Cat-Tiger-128-Gold',    'Gato Tigre Dorado',  10000,  'cat_tiger'],
        ['Cat-Tiger-Beige-128','Cat-Tiger-Beige-128-Gold','Tigre Beige Dorado',10000,'tiger_beige'],
        ['Cat-Tiger-Rose-128','Cat-Tiger-Rose-128-Gold','Tigre Rosa Dorado', 10000, 'tiger_rose'],
        ['Cat-White-128',    'Cat-White-128-Gold',    'Gato Blanco Dorado', 100000, 'cat_white'],
        ['Chicken-White-128','Chicken-White-128-Gold','Pollito Dorado',     100000, 'chicken_white'],
        ['Chicken-Yellow-128','Chicken-Yellow-128-Gold','Pollito Amarillo Dorado',100000,'chicken_yellow'],
        ['Cow-128',          'Cow-128-Gold',          'Vaca Dorada',        1000000,'cow'],
        ['Frog-128',         'Frog-128-Gold',         'Rana Dorada',        1000000,'frog'],
        ['Penguin-128',      'Penguin-128-Gold',      'Pinguino Dorado',    1000000,'penguin'],
        ['Penguin-Pink-128', 'Penguin-Pink-128-Gold', 'Pinguino Rosa Dorado',10000000,'penguin_pink'],
        ['Shark-128',        'Shark-128-Gold',        'Tiburon Dorado',     10000000,'shark'],
        ['Sheep-128',        'Sheep-128-Gold',        'Oveja Dorada',       10000000,'sheep'],
    ];
    pairs.forEach(([baseId, id, label, cost, passive], i) => {
        const base = PET_DEFS[baseId];
        defs[id] = {
            id, baseId, label, cost, order: i,
            marketSpeed: base.marketSpeed,
            passive,
            golden: true,
            desc: base.desc + ' | Efectos x2',
            passiveDesc: base.passiveDesc,
        };
    });
    return defs;
})();

// Inyectar doradas en PET_DEFS
Object.assign(PET_DEFS, GOLDEN_DEFS);

const PET_ORDER_GOLDEN = [
    'Bear-100-Gold','Bird-128-Gold','Bunny-Pink-128-Gold',
    'Cat-Beige-128-Gold','Cat-Blue-128-Gold','Cat-Pink-128-Gold',
    'Cat-Tiger-128-Gold','Cat-Tiger-Beige-128-Gold','Cat-Tiger-Rose-128-Gold',
    'Cat-White-128-Gold','Chicken-White-128-Gold','Chicken-Yellow-128-Gold',
    'Cow-128-Gold','Frog-128-Gold','Penguin-128-Gold',
    'Penguin-Pink-128-Gold','Shark-128-Gold','Sheep-128-Gold',
];

// ============================================================
//  VICTORIA — verificar si todas las mascotas normales tienen 100 HP
// ============================================================
const checkVictory = () => {
    if (state.victoryAchieved) return;
    if (!state.petData) return;
    const allAt100 = PET_ORDER.every(id => {
        const d = state.petData.get(id);
        return d && d.unlocked && Math.round(d.health) >= 100;
    });
    if (allAt100) {
        state.victoryAchieved = true;
        if (typeof saveGame === 'function') saveGame();
        const modal = document.getElementById('modal-victory');
        if (modal) modal.style.display = 'flex';
    }
};

window.closeVictoryModal = () => {
    const modal = document.getElementById('modal-victory');
    if (modal) modal.style.display = 'none';
};

// ============================================================
//  ESTADO DE MASCOTAS (se integra con state)
// ============================================================
// state.petData = Map<petId, { health, unlocked }>
// state.currentPet = petId activo

const initPetData = () => {
    if (!state.petData) state.petData = new Map();
    PET_ORDER.forEach((id, i) => {
        if (!state.petData.has(id)) {
            // Mascota nueva — asignar valores por defecto
            // 'everUsed' marca si el jugador ya interactuó con ella
            const defaultHealth = i < 3 ? 50 : 0;
            state.petData.set(id, {
                health:   defaultHealth,
                unlocked: i < 3,
                everUsed: false,  // nunca ha sido usada
            });
        } else {
            // Mascota existente — solo corregir a 50% si NUNCA fue usada
            const existing = state.petData.get(id);
            if (i < 3 && existing.health === 0 && existing.everUsed !== true) {
                existing.health = 50;
                state.petData.set(id, existing);
            }
        }
    });
    // Asegurar que el conejo siempre esté desbloqueado con al menos 50%
    const bunny = state.petData.get('Bunny-Pink-128') || { health: 50, unlocked: true };
    bunny.unlocked = true;
    if (!bunny.health || bunny.health < 1) bunny.health = 50;
    state.petData.set('Bunny-Pink-128', bunny);

    // Inicializar mascotas doradas (bloqueadas por defecto)
    PET_ORDER_GOLDEN.forEach(id => {
        if (!state.petData.has(id)) {
            state.petData.set(id, { health: 0, unlocked: false, everUsed: false });
        }
    });
};

// ============================================================
//  TIMERS PASIVOS POR MASCOTA
// ============================================================
let passiveTimers = {};
let birdPaused   = false;
let bunnyTurboCooldown = false;
let bunnyTurboActive   = false;
let frogCooldown  = false;
let petHungerTimer = null;

const clearPassiveTimers = () => {
    // Only clear pet-specific timers (coins, bird), NOT the market timer
    Object.values(passiveTimers).forEach(t => clearInterval(t));
    passiveTimers = {};
    if (petHungerTimer) { clearInterval(petHungerTimer); petHungerTimer = null; }
    // NOTE: marketTimer is managed exclusively by game.js startMarket()
};

const startPassivesForPet = (petId) => {
    clearPassiveTimers();
    const def = PET_DEFS[petId];

    // Calcular velocidad de la mascota (doradas duplican la velocidad, max x4)
    let petNativeSpeed = 3000;
    if (def) {
        const effSpeed = def.golden ? Math.min(def.marketSpeed * 2, 4) : def.marketSpeed;
        if      (effSpeed >= 4)   petNativeSpeed = 750;
        else if (effSpeed >= 3)   petNativeSpeed = 1000;
        else if (effSpeed >= 2)   petNativeSpeed = 1500;
        else if (effSpeed >= 1.5) petNativeSpeed = 2000;
    }

    // Respetar toggle de velocidad: si está desactivado usar velocidad normal
    const speedEnabled = (typeof state !== 'undefined' && state.marketSpeedEnabled !== false);
    const speed = speedEnabled ? petNativeSpeed : 3000;

    if (typeof startMarket === 'function') {
        startMarket(speed);
    } else {
        console.warn('startMarket not available yet');
    }

    if (!def) return;

    switch(def.passive) {
        case 'bird': {
            const birdCoins = def?.golden ? 2 : 1;
            passiveTimers.bird = setInterval(() => {
                if (!birdPaused) {
                    state.monedas += birdCoins;
                    if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                    _getSaveGame()();
                }
            }, 2000);
            break;
        }

        case 'cat_beige':
            petHungerTimer = setInterval(() => { _getChangePH()(-1);  _getCheckGO()(); }, 20000); break;
        case 'cat_blue':
            petHungerTimer = setInterval(() => { _getChangePH()(-5);  _getCheckGO()(); }, 20000); break;
        case 'cat_pink':
            petHungerTimer = setInterval(() => { _getChangePH()(-7);  _getCheckGO()(); }, 25000); break;
        case 'cat_tiger':
            petHungerTimer = setInterval(() => { _getChangePH()(-9);  _getCheckGO()(); }, 30000); break;

        case 'cow':
            petHungerTimer = setInterval(() => { _getChangePH()(-11); _getCheckGO()(); }, 30000); break;

        case 'penguin':
        case 'penguin_pink': {
            const baseAmt = def.passive === 'penguin' ? 1000 : 1500;
            const amount  = def.golden ? baseAmt * 2 : baseAmt;
            passiveTimers.coins = setInterval(() => {
                state.monedas += amount;
                if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                _getShowToast()(` +${amount} del Pinguino!`);
                _getSaveGame()();
            }, 120000);
            petHungerTimer = setInterval(() => { _getChangePH()(-12); _getCheckGO()(); }, 50000);
            break;
        }

        case 'shark':
            petHungerTimer = setInterval(() => { _getChangePH()(-15); _getCheckGO()(); }, 120000); break;

        case 'sheep': {
            const sheepCoins = def.golden ? 3400 : 1700;
            passiveTimers.coins = setInterval(() => {
                state.monedas += sheepCoins;
                if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                _getShowToast()(` +${sheepCoins} de la Oveja!`);
                _getSaveGame()();
            }, 30000);
            break;
        }

        case 'chicken_white':
        case 'chicken_yellow':
            // Reset inflation on non-protein foods on activation
            resetNonProteinInflation();
            break;
    }

    renderPetAbilityButton();
};

const resetNonProteinInflation = () => {
    state.foodInflation.forEach((_, foodId) => {
        const food = foodDatabase.find(f => f.id === foodId);
        if (food && food.cat !== 'proteina') {
            state.foodInflation.delete(foodId);
        }
    });
    _getShowToast()(' Inflación de frutas/verduras/dulces/misc reseteada!');
};

// ============================================================
//  MODIFICADORES DE PASIVOS
// ============================================================

// Obtener multiplicador de duración de efecto según mascota activa y categoría de comida
const getEffectDurationMultiplier = (foodCat) => {
    const def = PET_DEFS[state.currentPet];
    const gm  = def?.golden ? 2 : 1;

    switch(def?.passive) {
        case 'cat_beige':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 4*gm  : 1;
        case 'cat_blue':   return (foodCat === 'dulce' || foodCat === 'proteina') ? 5*gm  : 1;
        case 'cat_pink':   return (foodCat === 'dulce' || foodCat === 'proteina') ? 6*gm  : 1;
        case 'cat_tiger':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 7*gm  : 1;
        case 'tiger_beige':return foodCat === 'proteina' ? 15*gm : 1;
        case 'tiger_rose': return (foodCat === 'proteina' || foodCat === 'dulce') ? 25*gm : 1;
        case 'cat_white':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 20*gm : 1;
        default: return 1;
    }
};

// ¿La comida está exenta de inflación con esta mascota?
const isFoodInflationFree = (foodId) => {
    const food = foodDatabase.find(f => f.id === foodId);
    if (!food) return false;
    const pet = PET_DEFS[state.currentPet]?.passive;
    if (pet === 'tiger_beige' && food.cat === 'proteina') return true;
    if (pet === 'tiger_rose'  && (food.cat === 'proteina' || food.cat === 'dulce')) return true;
    if (pet === 'cat_white'   && (food.cat === 'proteina' || food.cat === 'dulce')) return true;
    if ((pet === 'chicken_white' || pet === 'chicken_yellow' || pet === 'shark') && food.cat !== 'proteina') return true;
    return false;
};

// ¿El pescado es gratis?
const isFishFree = () => {
    const p = PET_DEFS[state.currentPet]?.passive;
    return p === 'penguin' || p === 'penguin_pink';
};

// ¿La oveja hace la tienda gratis (sin inflación)?
const isSheepFreeShop = (foodId) => {
    if (PET_DEFS[state.currentPet]?.passive !== 'sheep') return false;
    const times = state.foodInflation.get(foodId) || 0;
    return times === 0; // gratis solo si no hay inflación
};

// Obtener precio modificado por mascota activa
const getPetFoodPrice = (food, basePrice) => {
    const def = PET_DEFS[state.currentPet];
    const pet = def?.passive;
    const isFish = food.id === 'Fish-128';

    if (isFishFree() && isFish) return 0;
    if (isSheepFreeShop(food.id)) return 0;

    let price = basePrice;

    // Bear: dulces -10% (dorado -20%, efecto positivo x2)
    if (pet === 'bear' && food.cat === 'dulce') price *= def?.golden ? 0.8 : 0.9;

    // Bird: toda comida x4 (penalizacion, no cambia)
    if (pet === 'bird') price *= 4;

    // Pollito: proteinas precio mayor (penalizacion, no cambia)
    if (pet === 'chicken_white'  && food.cat === 'proteina') price *= 2;
    if (pet === 'chicken_yellow' && food.cat === 'proteina') price *= 2.5;

    return Math.round(price);
};

// Inflación especial pollitos para proteínas
const getProteinInflationRate = () => {
    const pet = PET_DEFS[state.currentPet]?.passive;
    if (pet === 'chicken_white')  return 2.5;  // +250% = suma 2.5x
    if (pet === 'chicken_yellow') return 4.5;  // +450%
    return 2; // normal x2
};

// ============================================================
//  MODIFICADORES EN VENTAS DEL MERCADO
// ============================================================
const applyPetSellModifiers = (pos, cur, baseProfit) => {
    const def = PET_DEFS[state.currentPet];
    const pet = def?.passive;
    const gm  = def?.golden ? 2 : 1; // multiplicador para efectos positivos
    let payout = pos.buyPrice + baseProfit;
    let extraMsg = '';

    switch(pet) {
        case 'bear':
            // Penalizacion negativa, no cambia con dorada
            if (baseProfit < 0) {
                const penalty = Math.abs(pos.buyPrice);
                payout -= penalty;
                extraMsg += ` | Penalizacion -${_getFmt()(penalty)}`;
            }
            break;

        case 'cow':
            if (baseProfit > 0) {
                const cowMult = def?.golden ? 3 : 1.5;
                payout = pos.buyPrice + baseProfit * cowMult;
                extraMsg += def?.golden ? ' | Ganancia x300%' : ' | Ganancia x150%';
            }
            break;

        case 'chicken_yellow': {
            const ckChance = def?.golden ? 1.0 : 0.5;
            if (Math.random() < ckChance) {
                payout += pos.buyPrice;
                extraMsg += ` | Bonus +${_getFmt()(pos.buyPrice)}`;
            }
            break;
        }

        case 'penguin': {
            const pgMult   = def?.golden ? 2.0 : 1.5;
            const pgInt    = def?.golden ? 0.06 : 0.03;
            const pgRepeat = def?.golden ? 0.70 : 0.35;
            payout = pos.buyPrice + baseProfit * pgMult + pos.buyPrice * pgInt;
            extraMsg += def?.golden ? ' | +100% +6%' : ' | +50% +3%';
            if (Math.random() < pgRepeat) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | Accion repetida!';
            }
            break;
        }

        case 'penguin_pink': {
            const ppMult   = def?.golden ? 2.4 : 1.7;
            const ppInt    = def?.golden ? 0.16 : 0.08;
            const ppRepeat = def?.golden ? 1.0 : 0.75;
            payout = pos.buyPrice + baseProfit * ppMult + pos.buyPrice * ppInt;
            extraMsg += def?.golden ? ' | +140% +16%' : ' | +70% +8%';
            if (Math.random() < ppRepeat) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | Accion repetida!';
            }
            break;
        }

        case 'shark': {
            const sharkMult = def?.golden ? 16 : 8;
            payout = pos.buyPrice * sharkMult;
            extraMsg += def?.golden ? ' | x16' : ' | x8';
            const counts = countBySector();
            if ((counts.get(pos.type) || 0) >= 3) {
                const extra = pos.buyPrice * (0.15 + 0.30) * gm;
                payout += extra;
                extraMsg += def?.golden ? ' | Bono sector x2' : ' | +15% +30% extra';
            }
            break;
        }

        case 'cat_white': {
            if (state.sectorBonus.get(pos.type)) {
                const bonusPct = def?.golden ? 0.24 : 0.12;
                const bonusAmt = pos.buyPrice * bonusPct;
                payout += bonusAmt;
                extraMsg += def?.golden ? ' | Bono sector +24%' : ' | Bono sector +12%';
            }
            break;
        }

        case 'sheep': {
            const sheepBonus = pos.buyPrice * (def?.golden ? 0.50 : 0.25);
            payout += sheepBonus;
            extraMsg += def?.golden ? ' | +50%' : ' | +25%';
            const sheepRepeat = def?.golden ? 1.0 : 0.50;
            if (Math.random() < sheepRepeat) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | Repetida!';
            }
            const bonusCoins = def?.golden ? 5000 : 2500;
            if (Math.random() < 0.25) {
                state.monedas += bonusCoins;
                extraMsg += ` | +${bonusCoins} bonus!`;
            }
            activateSheepPrediction(pos.symbol);
            break;
        }
    }

    return { payout, extraMsg };
};

// Predicción de oveja (1 acción por 35s)
const activateSheepPrediction = (excludeSymbol) => {
    const assets = Array.from(state.market.values()).filter(a => a.symbol !== excludeSymbol);
    if (!assets.length) return;
    const target = assets[Math.floor(Math.random() * assets.length)];
    target._future = parseFloat((Math.random() * 10 - 5).toFixed(2));
    state.market.set(target.symbol, target);
    _getShowToast()(` Predicción: ${target.symbol} ${target._future >= 0 ? '▲' : '▼'} ${Math.abs(target._future)}% por 35s`);
    _getRenderMarket()();
    setTimeout(() => {
        const a = state.market.get(target.symbol);
        if (a) { const { _future, ...clean } = a; state.market.set(target.symbol, clean); }
        _getRenderMarket()();
    }, 35000);
};

// Modificadores en COMPRA del mercado
const applyPetBuyModifiers = (assetPrice) => {
    const def = PET_DEFS[state.currentPet];
    const pet = def?.passive;
    if (pet === 'cow') return assetPrice * (def?.golden ? 0.25 : 0.5);  // -50% o -75%
    return assetPrice;
};

// Compra en rojo para pingüino
const applyPenguinBuyPenalty = (asset) => {
    const pet = PET_DEFS[state.currentPet]?.passive;
    if (pet !== 'penguin' && pet !== 'penguin_pink') return;
    if (asset.changePercent < 0) {
        const factor = pet === 'penguin' ? 0.30 : 0.40;
        const newHealth = Math.max(0, state.saludMascota - (state.saludMascota * factor));
        state.saludMascota = Math.round(newHealth);
        renderPetHealth();
        _getShowToast()(` Compraste en rojo! Salud -${Math.round(factor*100)}% de su valor actual`);
        _getCheckGO()();
    }
};

// Sheep: si pierdes dinero, triplicar precios base
let sheepPriceTripled = false;
const checkSheepPenalty = (profit) => {
    if (PET_DEFS[state.currentPet]?.passive !== 'sheep') return;
    if (profit < 0 && !sheepPriceTripled) {
        sheepPriceTripled = true;
        _getShowToast()(' ¡Perdiste dinero! Los precios de la tienda se triplicaron ');
    }
};

// ============================================================
//  HABILIDADES ACTIVAS (BOTONES EN MASCOTA)
// ============================================================

// Conejo: Turbo x4 (dorado x8 por 60s)
window.activateBunnyTurbo = () => {
    if (bunnyTurboCooldown) { _getShowToast()(' Turbo en cooldown, espera 3 minutos'); return; }
    if (bunnyTurboActive)   { _getShowToast()(' Turbo ya activo!'); return; }
    const isGolden   = PET_DEFS[state.currentPet]?.golden;
    const turboSpeed = isGolden ? 375 : 750;  // x8 o x4
    const turboDur   = isGolden ? 60000 : 30000;
    bunnyTurboActive = true;
    if (typeof startMarket === 'function') startMarket(turboSpeed);
    _getShowToast()(isGolden ? ' Turbo x8 activado por 60s!' : ' Turbo x4 activado por 30s!');
    setTimeout(() => {
        bunnyTurboActive = false;
        if (typeof startMarket === 'function') startMarket(3000);
        _getShowToast()(' Turbo terminado.');
        bunnyTurboCooldown = true;
        renderPetAbilityButton();
        setTimeout(() => {
            bunnyTurboCooldown = false;
            renderPetAbilityButton();
            _getShowToast()(' Turbo disponible de nuevo!');
        }, 180000); // 3 min (cooldown no cambia)
    }, turboDur);
    renderPetAbilityButton();
};

// Rana: Prediccion perfecta del sector (dorada 60s)
window.activateFrogPrediction = () => {
    if (frogCooldown) { _getShowToast()(' Habilidad de Rana en cooldown (1 min)'); return; }
    const counts = countBySector();
    let targetSector = null;
    counts.forEach((c, type) => { if (c >= 3) targetSector = type; });
    if (!targetSector) { _getShowToast()(' Necesitas 3+ acciones del mismo sector'); return; }

    const isGolden  = PET_DEFS[state.currentPet]?.golden;
    const predDur   = isGolden ? 60000 : 30000;

    state.market.forEach((a, sym) => {
        if (a.type === targetSector) {
            const pred = parseFloat((Math.random() * 10 - 5).toFixed(2));
            state.market.set(sym, { ...a, _future: pred });
        }
    });
    _getRenderMarket()();
    _getShowToast()(` Prediccion perfecta del sector ${targetSector} por ${isGolden ? '60s' : '30s'}!`);
    frogCooldown = true;
    renderPetAbilityButton();
    setTimeout(() => {
        state.market.forEach((a, sym) => {
            if (a.type === targetSector) {
                const { _future, ...clean } = a;
                state.market.set(sym, clean);
            }
        });
        _getRenderMarket()();
        _getShowToast()(' Prediccion de Rana terminada.');
    }, predDur);
    setTimeout(() => {
        frogCooldown = false;
        renderPetAbilityButton();
        _getShowToast()(' Habilidad de Rana disponible!');
    }, 60000);
};

// ============================================================
//  RENDER BOTÓN DE HABILIDAD ACTIVA EN MASCOTA
// ============================================================
// Mascotas con velocidad de mercado pasiva que NO tienen cooldown propio
const PASSIVE_SPEED_PETS = new Set([
    'bear','bird','cat_beige','cat_blue','cat_pink','cat_tiger',
    'cat_tiger_beige','cat_tiger_rose','cat_white',
    'chicken_white','chicken_yellow','cow','penguin','penguin_pink','shark','sheep'
]);

window.toggleMarketSpeed = () => {
    state.marketSpeedEnabled = !state.marketSpeedEnabled;
    if (typeof startPassivesForPet === 'function') startPassivesForPet(state.currentPet);
    renderPetAbilityButton();
    const pet = PET_DEFS[state.currentPet];
    const label = pet ? `x${pet.marketSpeed}` : '';
    _getShowToast()(state.marketSpeedEnabled
        ? `Velocidad ${label} activada`
        : 'Velocidad normal activada (x1)');
};

const renderPetAbilityButton = () => {
    const container = document.getElementById('pet-ability-area');
    if (!container) return;
    const pet = PET_DEFS[state.currentPet];
    if (!pet) { container.innerHTML = ''; return; }

    const isGolden = pet.golden === true;
    let html = '';
    switch(pet.passive) {
        case 'bunny':
            html = `<button class="btn-pet-ability ${bunnyTurboCooldown?'ability-cooldown':''}"
                        onclick="activateBunnyTurbo()" ${bunnyTurboCooldown?'disabled':''}>
                        ${isGolden ? 'Turbo x8' : 'Turbo x4'} ${bunnyTurboCooldown ? '(cooldown 3min)' : isGolden ? '(60s)' : '(30s)'}
                    </button>`;
            break;
        case 'frog':
            html = `<button class="btn-pet-ability ${frogCooldown?'ability-cooldown':''}"
                        onclick="activateFrogPrediction()" ${frogCooldown?'disabled':''}>
                        Prediccion ${frogCooldown ? '(cooldown 1min)' : isGolden ? '(60s)' : '(30s)'}
                    </button>`;
            break;
        default: {
            // Mascotas con velocidad pasiva: mostrar toggle
            const effSpeed = isGolden ? Math.min(pet.marketSpeed * 2, 4) : pet.marketSpeed;
            if (PASSIVE_SPEED_PETS.has(pet.passive) && effSpeed > 1) {
                const on = state.marketSpeedEnabled !== false;
                html = `<button class="btn-pet-ability ${on ? '' : 'ability-cooldown'}"
                            onclick="toggleMarketSpeed()">
                            Velocidad x${effSpeed}: ${on ? 'Activa' : 'Desactivada'}
                        </button>`;
            }
        }
    }

    const infoDef = PET_DEFS[state.currentPet];
    if (infoDef) {
        html += `<button class="btn-pet-info-active" onclick="openPetInfo('${state.currentPet}')">
            <img src="../assets/arrows/Exclamation-Mark-128.png" alt="Info" class="pet-info-icon-sm">
            Ver habilidades de ${infoDef.label}
        </button>`;
    }

    container.innerHTML = html;
};

// ============================================================
//  SISTEMA DE DESBLOQUEO
// ============================================================

// ============================================================
//  MODAL INFO DE MASCOTA
// ============================================================
window.openPetInfo = (petId) => {
    const def = PET_DEFS[petId];
    if (!def) return;

    const modal = document.getElementById('modal-pet-info');
    const title = document.getElementById('pet-info-title');
    const img   = document.getElementById('pet-info-img');
    const list  = document.getElementById('pet-info-list');
    const desc  = document.getElementById('pet-info-desc');

    if (!modal) return;

    title.textContent = def.label;
    img.src = `../assets/pets/${petId}.png`;
    desc.textContent = def.desc;

    list.innerHTML = (def.passiveDesc || []).map(line => `
        <div class="pet-info-item">
            <span class="pet-info-dot"></span>
            <span>${line}</span>
        </div>`).join('');

    // Cost info
    const costEl = document.getElementById('pet-info-cost');
    if (costEl) {
        costEl.textContent = def.cost === 0
            ? ' Gratis'
            : ` Desbloqueo: ${def.cost.toLocaleString()}`;
    }

    modal.style.display = 'flex';
};

window.closePetInfo = () => {
    const modal = document.getElementById('modal-pet-info');
    if (modal) modal.style.display = 'none';
};

const buildPetCard = (id, golden = false) => {
    const def  = PET_DEFS[id];
    const data = state.petData.get(id) || { health: 0, unlocked: false };
    const isActive   = id === state.currentPet;
    const isUnlocked = data.unlocked;
    const canUnlock  = golden ? canUnlockGoldenPet(id) : canUnlockPet(id);
    const cost       = def.cost;
    const imgId      = def.baseId || id;
    const goldenStyle = golden ? 'filter:sepia(0.4) saturate(4) hue-rotate(5deg) brightness(1.25);border:2px solid gold;box-shadow:0 0 10px rgba(255,200,0,0.6);' : '';

    let btnHtml = '';
    if (isActive) {
        btnHtml = `<span class="pet-badge active">Activa</span>`;
    } else if (isUnlocked) {
        btnHtml = `<button class="btn-pet-select" onclick="selectPet('${id}','${def.label}')">Seleccionar</button>`;
    } else if (canUnlock) {
        btnHtml = `<button class="btn-pet-unlock" onclick="unlockPet('${id}')">
            ${cost.toLocaleString()}
        </button>`;
    } else {
        const reason = golden && !state.victoryAchieved ? 'Requiere Victoria' : 'Bloqueado';
        btnHtml = `<span class="pet-badge locked">${reason}</span>`;
    }

    const hearts = getHeartConfig(Math.round(data.health));
    const heartHtml = hearts.map(t =>
        `<img src="../assets/Hearts/${heartImg[t]}.png" class="pet-grid-heart">`
    ).join('');

    return `
    <div class="pet-option ${isActive?'pet-selected':''} ${isUnlocked?'':'pet-locked'}">
        <div class="pet-card-header">
            <div class="pet-preview" style="background-image:url('../assets/pets/${imgId}.png');${goldenStyle}"></div>
            <button class="btn-pet-info" onclick="event.stopPropagation(); openPetInfo('${id}')" title="Ver habilidades">
                <img src="../assets/arrows/Exclamation-Mark-128.png" alt="Info" class="pet-info-icon">
            </button>
        </div>
        ${golden ? '<span class="pet-golden-badge">DORADA x2</span>' : ''}
        <span class="pet-label ${golden?'pet-golden-label':''}">${def.label}</span>
        <div class="pet-grid-hearts">${heartHtml}</div>
        ${btnHtml}
    </div>`;
};

window.openPetSelector = () => {
    initPetData();
    const grid = document.getElementById('pet-grid');
    if (!grid) return;

    let html = PET_ORDER.map(id => buildPetCard(id, false)).join('');

    if (state.victoryAchieved) {
        html += `<div class="pet-grid-gold-section">
            <h4>Mascotas Doradas — Efectos x2</h4>
            <div class="pet-grid">${PET_ORDER_GOLDEN.map(id => buildPetCard(id, true)).join('')}</div>
        </div>`;
    }

    grid.innerHTML = html;
    document.getElementById('modal-mascota').style.display = 'flex';
};

const canUnlockPet = (id) => {
    if (PET_ORDER_GOLDEN.includes(id)) return canUnlockGoldenPet(id);
    const idx = PET_ORDER.indexOf(id);
    if (idx === 0) return true;
    const prevId   = PET_ORDER[idx - 1];
    const prevData = state.petData.get(prevId);
    if (!prevData || !prevData.unlocked) return false;
    if (prevData.health < 100) return false;
    const def = PET_DEFS[id];
    return state.monedas >= def.cost;
};

const canUnlockGoldenPet = (id) => {
    if (!state.victoryAchieved) return false;
    const idx = PET_ORDER_GOLDEN.indexOf(id);
    if (idx < 0) return false;
    if (idx > 0) {
        const prevId   = PET_ORDER_GOLDEN[idx - 1];
        const prevData = state.petData.get(prevId);
        if (!prevData || !prevData.unlocked) return false;
        if (Math.round(prevData.health) < 100) return false;
    }
    return state.monedas >= PET_DEFS[id].cost;
};

window.unlockPet = (id) => {
    const isGolden = PET_ORDER_GOLDEN.includes(id);
    const canUnlock = isGolden ? canUnlockGoldenPet(id) : canUnlockPet(id);
    if (!canUnlock) { _getShowToast()(' No puedes desbloquear esta mascota aun'); return; }
    const def  = PET_DEFS[id];
    const data = state.petData.get(id) || { health: 0, unlocked: false };
    state.monedas -= def.cost;
    data.unlocked = true;
    data.health   = 50;
    state.petData.set(id, data);
    _getShowToast()(` Desbloqueaste ${def.label}!`);
    _getLogEvent()('mascota', `Desbloqueaste ${def.label}`, `Costo: ${def.cost.toLocaleString()}`);
    _getUpdateUI()();
    openPetSelector();
};

window.selectPet = (id, label) => {
    // Guardar salud de la mascota actual antes de cambiar
    saveCurPetHealth();
    state.currentPet = id;
    // Restaurar salud de la nueva mascota
    const data = state.petData.get(id);
    if (data) {
        state.saludMascota = data.health;
        // Marcar como usada para que si llega a 0% no se resetee
        data.everUsed = true;
        state.petData.set(id, data);
    }
    renderPet();
    renderPetHealth();
    startPassivesForPet(id);
    closePetSelector();
    renderPetAbilityButton();
    _getShowToast()(`🐾 ¡Ahora juegas con ${label}!`);
    _getLogEvent()('mascota', `Cambiaste a ${label}`, '');
    _getSaveGame()();
};

window.closePetSelector = () => {
    document.getElementById('modal-mascota').style.display = 'none';
};

const saveCurPetHealth = () => {
    const data = state.petData.get(state.currentPet) || { health: state.saludMascota, unlocked: true };
    data.health = state.saludMascota;
    state.petData.set(state.currentPet, data);
};

// ============================================================
//  INTEGRACIÓN CON changePetHealth — sincroniza petData
// ============================================================
const _origChangePetHealth = typeof changePetHealth === 'function' ? changePetHealth : null;

// Override para sincronizar barras
const syncPetHealthToData = () => {
    const data = state.petData.get(state.currentPet);
    if (data) { data.health = state.saludMascota; state.petData.set(state.currentPet, data); }
    // Verificar condicion de victoria cada vez que cambia la salud
    checkVictory();
};