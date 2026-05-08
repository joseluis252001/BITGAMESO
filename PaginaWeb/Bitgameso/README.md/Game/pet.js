// ============================================================
//  BITGAMESO — pets.js
//  Sistema completo de mascotas con habilidades, desbloqueo,
//  barras de vida independientes y efectos pasivos
// ============================================================

// ============================================================
//  DEFINICIÓN DE MASCOTAS
// ============================================================
const PET_DEFS = {
    'Bear-100': {
        id: 'Bear-100', label: 'Oso', cost: 0, order: 0,
        marketSpeed: 2,
        passive: 'bear',
        desc: '🐻 Velocidad x2 | Dulces -10% | Penalización en ventas negativas',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '🍬 Dulces con 10% descuento',
            '⚠️ Ventas negativas penalizan proporcionalmente'
        ]
    },
    'Bird-128': {
        id: 'Bird-128', label: 'Pájaro', cost: 0, order: 1,
        marketSpeed: 3,
        passive: 'bird',
        desc: '🐦 Velocidad x3 | +1 moneda/2s | Comida x4 precio | Pausa al operar',
        passiveDesc: [
            '⚡ Mercado x3 permanente',
            '🪙 +1 moneda cada 2 segundos',
            '🍎 Toda la comida cuesta x4',
            '⏸️ La moneda se pausa al comprar/vender'
        ]
    },
    'Bunny-Pink-128': {
        id: 'Bunny-Pink-128', label: 'Conejito', cost: 0, order: 2,
        marketSpeed: 1,
        passive: 'bunny',
        desc: '🐰 Habilidad: Turbo x4 por 30s (cooldown 3 min)',
        passiveDesc: [
            '🚀 Botón Turbo: mercado x4 por 30s',
            '⏱️ Cooldown de 3 minutos'
        ]
    },
    'Cat-Beige-128': {
        id: 'Cat-Beige-128', label: 'Gato Beige', cost: 100, order: 3,
        marketSpeed: 2,
        passive: 'cat_beige',
        desc: '🐱 Velocidad x2 | Dulces/Pescado duran x4 | -1% salud/20s',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '⏳ Dulces y Pescado duran 4x más',
            '💔 -1% salud cada 20 segundos'
        ]
    },
    'Cat-Blue-128': {
        id: 'Cat-Blue-128', label: 'Gato Azul', cost: 100, order: 4,
        marketSpeed: 2,
        passive: 'cat_blue',
        desc: '🐱 Velocidad x2 | Dulces/Pescado duran x5 | -5% salud/20s',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '⏳ Dulces y Pescado duran 5x más',
            '💔 -5% salud cada 20 segundos'
        ]
    },
    'Cat-Pink-128': {
        id: 'Cat-Pink-128', label: 'Gato Rosa', cost: 100, order: 5,
        marketSpeed: 2,
        passive: 'cat_pink',
        desc: '🐱 Velocidad x2 | Dulces/Pescado duran x6 | -7% salud/25s',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '⏳ Dulces y Pescado duran 6x más',
            '💔 -7% salud cada 25 segundos'
        ]
    },
    'Cat-Tiger-128': {
        id: 'Cat-Tiger-128', label: 'Gato Tigre', cost: 1000, order: 6,
        marketSpeed: 2,
        passive: 'cat_tiger',
        desc: '🐯 Velocidad x2 | Dulces/Pescado duran x7 | -9% salud/30s',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '⏳ Dulces y Pescado duran 7x más',
            '💔 -9% salud cada 30 segundos'
        ]
    },
    'Cat-Tiger-Beige-128': {
        id: 'Cat-Tiger-Beige-128', label: 'Tigre Beige', cost: 1000, order: 7,
        marketSpeed: 3,
        passive: 'tiger_beige',
        desc: '🐯 Velocidad x3 | Proteínas duran x15 | Sin inflación en proteínas',
        passiveDesc: [
            '⚡ Mercado x3 permanente',
            '⏳ Carne/Huevo/Pescado duran 15x más',
            '🔥 Sin inflación en proteínas'
        ]
    },
    'Cat-Tiger-Rose-128': {
        id: 'Cat-Tiger-Rose-128', label: 'Tigre Rosa', cost: 1000, order: 8,
        marketSpeed: 3,
        passive: 'tiger_rose',
        desc: '🐯 Velocidad x3 | Proteínas x25 duración | Dulces sin inflación',
        passiveDesc: [
            '⚡ Mercado x3 permanente',
            '⏳ Proteínas duran 25x más',
            '🍬 Dulces sin inflación',
            '🔥 Sin inflación en proteínas'
        ]
    },
    'Cat-White-128': {
        id: 'Cat-White-128', label: 'Gato Blanco', cost: 10000, order: 9,
        marketSpeed: 2,
        passive: 'cat_white',
        desc: '🐱 Velocidad x2 | Bono sector +12% | Pescado/Dulces x20 duración sin inflación',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '🏆 Bono de sector = +12% (incluye el 3%)',
            '⏳ Pescado y Dulces duran 20x más',
            '🔥 Pescado y Dulces sin inflación'
        ]
    },
    'Chicken-White-128': {
        id: 'Chicken-White-128', label: 'Pollito', cost: 10000, order: 10,
        marketSpeed: 1.5,
        passive: 'chicken_white',
        desc: '🐔 Velocidad x1.5 | Resetea inflación (excepto proteínas) | Proteínas x100% precio +250% inflación',
        passiveDesc: [
            '⚡ Mercado x1.5 permanente',
            '🔄 Resetea inflación de frutas/verduras/dulces/misc',
            '🥩 Proteínas cuestan x2 y su inflación suma +250%'
        ]
    },
    'Chicken-Yellow-128': {
        id: 'Chicken-Yellow-128', label: 'Pollito Amarillo', cost: 10000, order: 11,
        marketSpeed: 1.5,
        passive: 'chicken_yellow',
        desc: '🐥 Velocidad x1.5 | Reset inflación | Proteínas x150% +450% inflación | 50% bonus al vender',
        passiveDesc: [
            '⚡ Mercado x1.5 permanente',
            '🔄 Resetea inflación de frutas/verduras/dulces/misc',
            '🥩 Proteínas cuestan x2.5 y su inflación +450%',
            '💰 50% de probabilidad de ganar lo que pagaste al vender'
        ]
    },
    'Cow-128': {
        id: 'Cow-128', label: 'Vaca', cost: 100000, order: 12,
        marketSpeed: 1,
        passive: 'cow',
        desc: '🐄 Compras -50% | Ventas x150% ganancia | -11% salud/30s',
        passiveDesc: [
            '💰 Todas las compras del mercado cuestan -50%',
            '📈 Ganancias en ventas x150%',
            '💔 -11% salud cada 30 segundos'
        ]
    },
    'Frog-128': {
        id: 'Frog-128', label: 'Rana', cost: 100000, order: 13,
        marketSpeed: 1,
        passive: 'frog',
        desc: '🐸 Con 3+ acciones del mismo sector: predicción 100% por 30s (cooldown 1min)',
        passiveDesc: [
            '🔮 Habilidad: predicción perfecta 30s',
            '⏱️ Requiere 3+ acciones del mismo sector',
            '⏱️ Cooldown 1 minuto'
        ]
    },
    'Penguin-128': {
        id: 'Penguin-128', label: 'Pingüino', cost: 100000, order: 14,
        marketSpeed: 1,
        passive: 'penguin',
        desc: '🐧 Pescado gratis | +50% ganancia ventas | +3% interés | 35% repetir acción | +1000/2min | Hambre',
        passiveDesc: [
            '🐟 Pescado 100% gratis',
            '💰 +50% ganancia en cada venta',
            '📊 +3% interés adicional',
            '🔄 35% de repetir acción al vender',
            '🪙 +1000 monedas cada 2 minutos',
            '💔 Compra en rojo = salud -30% | -12% salud/50s'
        ]
    },
    'Penguin-Pink-128': {
        id: 'Penguin-Pink-128', label: 'Pingüino Rosa', cost: 1000000, order: 15,
        marketSpeed: 1,
        passive: 'penguin_pink',
        desc: '🐧 Pescado gratis | +70% ganancia | +8% interés | 75% repetir acción | +1500/2min | Hambre',
        passiveDesc: [
            '🐟 Pescado 100% gratis',
            '💰 +70% ganancia en cada venta',
            '📊 +8% interés adicional',
            '🔄 75% de repetir acción al vender',
            '🪙 +1500 monedas cada 2 minutos',
            '💔 Compra en rojo = salud -40% | -12% salud/50s'
        ]
    },
    'Shark-128': {
        id: 'Shark-128', label: 'Tiburón', cost: 1000000, order: 16,
        marketSpeed: 2,
        passive: 'shark',
        desc: '🦈 Velocidad x2 | Reset inflación | Ventas x8 | 3+ mismo sector = +15% bono +30% extra | -15%/2min',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '🔄 Resetea toda la inflación de comida',
            '📈 Ventas multiplicadas x8',
            '🏆 Con 3+ del mismo sector: +15% bono adicional',
            '💰 Con 3+ del mismo sector: +30% de lo pagado',
            '💔 -15% salud cada 2 minutos'
        ]
    },
    'Sheep-128': {
        id: 'Sheep-128', label: 'Oveja', cost: 1000000, order: 17,
        marketSpeed: 2,
        passive: 'sheep',
        desc: '🐑 Velocidad x2 | Tienda gratis (sin inflación) | +1700/30s | Al vender: +25% ganancia, 50% repetir, 100% predicción 35s, 25% +2500',
        passiveDesc: [
            '⚡ Mercado x2 permanente',
            '🛒 Tienda gratis si no hay inflación',
            '⚠️ Si pierdes dinero, tienda se triplica',
            '🪙 +1700 monedas cada 30 segundos',
            '📈 Al vender: +25% ganancia',
            '🔄 50% repetir acción',
            '🔮 100% predicción de una acción por 35s',
            '💰 25% de ganar 2500 monedas extra'
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
//  ESTADO DE MASCOTAS (se integra con state)
// ============================================================
// state.petData = Map<petId, { health, unlocked }>
// state.currentPet = petId activo

const initPetData = () => {
    if (!state.petData) state.petData = new Map();
    PET_ORDER.forEach((id, i) => {
        if (!state.petData.has(id)) {
            state.petData.set(id, {
                health:   id === 'Bunny-Pink-128' ? 75 : 0,
                unlocked: i < 3, // primeros 3 gratis
            });
        }
    });
    // Asegurar que el conejo siempre esté desbloqueado
    const bunny = state.petData.get('Bunny-Pink-128') || { health: 75, unlocked: true };
    bunny.unlocked = true;
    if (!bunny.health) bunny.health = 75;
    state.petData.set('Bunny-Pink-128', bunny);
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
    Object.values(passiveTimers).forEach(t => clearInterval(t));
    passiveTimers = {};
    if (petHungerTimer) { clearInterval(petHungerTimer); petHungerTimer = null; }
};

const startPassivesForPet = (petId) => {
    clearPassiveTimers();
    const def = PET_DEFS[petId];
    if (!def) return;

    // Velocidad de mercado
    const speed = def.marketSpeed <= 1 ? SPEED_NORMAL
                : def.marketSpeed === 1.5 ? 2000
                : def.marketSpeed === 2   ? 1500
                : def.marketSpeed === 3   ? 1000
                : 750; // x4
    startMarket(speed);

    switch(def.passive) {
        case 'bird':
            passiveTimers.bird = setInterval(() => {
                if (!birdPaused) {
                    state.monedas += 1;
                    if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                    saveGame();
                }
            }, 2000);
            break;

        case 'cat_beige':
            petHungerTimer = setInterval(() => { changePetHealth(-1);  checkGameOver(); }, 20000); break;
        case 'cat_blue':
            petHungerTimer = setInterval(() => { changePetHealth(-5);  checkGameOver(); }, 20000); break;
        case 'cat_pink':
            petHungerTimer = setInterval(() => { changePetHealth(-7);  checkGameOver(); }, 25000); break;
        case 'cat_tiger':
            petHungerTimer = setInterval(() => { changePetHealth(-9);  checkGameOver(); }, 30000); break;

        case 'cow':
            petHungerTimer = setInterval(() => { changePetHealth(-11); checkGameOver(); }, 30000); break;

        case 'penguin':
        case 'penguin_pink': {
            const amount = def.passive === 'penguin' ? 1000 : 1500;
            passiveTimers.coins = setInterval(() => {
                state.monedas += amount;
                if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                showToast(`🐧 +🪙${amount} del Pingüino!`);
                saveGame();
            }, 120000);
            petHungerTimer = setInterval(() => { changePetHealth(-12); checkGameOver(); }, 50000);
            break;
        }

        case 'shark':
            petHungerTimer = setInterval(() => { changePetHealth(-15); checkGameOver(); }, 120000); break;

        case 'sheep':
            passiveTimers.coins = setInterval(() => {
                state.monedas += 1700;
                if (refs.monedasCount) refs.monedasCount.textContent = parseFloat(state.monedas).toFixed(2);
                showToast('🐑 +🪙1700 de la Oveja!');
                saveGame();
            }, 30000);
            break;

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
    showToast('🔄 Inflación de frutas/verduras/dulces/misc reseteada!');
};

// ============================================================
//  MODIFICADORES DE PASIVOS
// ============================================================

// Obtener multiplicador de duración de efecto según mascota activa y categoría de comida
const getEffectDurationMultiplier = (foodCat) => {
    const pet = state.currentPet;
    const isDulceFish = foodCat === 'dulce' || foodCat === 'pescado_single';

    switch(PET_DEFS[pet]?.passive) {
        case 'cat_beige':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 4  : 1;
        case 'cat_blue':   return (foodCat === 'dulce' || foodCat === 'proteina') ? 5  : 1;
        case 'cat_pink':   return (foodCat === 'dulce' || foodCat === 'proteina') ? 6  : 1;
        case 'cat_tiger':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 7  : 1;
        case 'tiger_beige':return foodCat === 'proteina' ? 15 : 1;
        case 'tiger_rose': return (foodCat === 'proteina' || foodCat === 'dulce') ? 25 : 1;
        case 'cat_white':  return (foodCat === 'dulce' || foodCat === 'proteina') ? 20 : 1;
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
    const pet  = PET_DEFS[state.currentPet]?.passive;
    const isFish = food.id === 'Fish-128';

    if (isFishFree() && isFish) return 0;
    if (isSheepFreeShop(food.id)) return 0;

    let price = basePrice;

    // Bear: dulces -10%
    if (pet === 'bear' && food.cat === 'dulce') price *= 0.9;

    // Bird: toda comida x4
    if (pet === 'bird') price *= 4;

    // Pollito: proteínas x2 precio base
    if (pet === 'chicken_white' && food.cat === 'proteina') price *= 2;
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
    const pet = PET_DEFS[state.currentPet]?.passive;
    let payout = pos.buyPrice + baseProfit;
    let extraMsg = '';

    switch(pet) {
        case 'bear':
            if (baseProfit < 0) {
                const penalty = Math.abs(pos.buyPrice);
                payout -= penalty;
                extraMsg += ` | 🐻 Penalización -🪙${fmt(penalty)}`;
            }
            break;

        case 'cow':
            if (baseProfit > 0) {
                payout = pos.buyPrice + baseProfit * 1.5;
                extraMsg += ' | 🐄 Ganancia x150%';
            }
            break;

        case 'chicken_yellow':
            if (Math.random() < 0.5) {
                payout += pos.buyPrice;
                extraMsg += ` | 🐥 Bonus +🪙${fmt(pos.buyPrice)}`;
            }
            break;

        case 'penguin':
            payout = pos.buyPrice + baseProfit * 1.5 + pos.buyPrice * 0.03;
            extraMsg += ' | 🐧 +50% +3%';
            if (Math.random() < 0.35) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | 🔄 ¡Acción repetida!';
            }
            break;

        case 'penguin_pink':
            payout = pos.buyPrice + baseProfit * 1.7 + pos.buyPrice * 0.08;
            extraMsg += ' | 🐧 +70% +8%';
            if (Math.random() < 0.75) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | 🔄 ¡Acción repetida!';
            }
            break;

        case 'shark': {
            payout = pos.buyPrice * 8;
            extraMsg += ' | 🦈 x8';
            // Check sector bonus
            const counts = countBySector();
            if ((counts.get(pos.type) || 0) >= 3) {
                const extra = pos.buyPrice * 0.15 + pos.buyPrice * 0.30;
                payout += extra;
                extraMsg += ` | +15% bono +30% extra`;
            }
            break;
        }

        case 'cat_white': {
            // Sector bonus 12% instead of 3%
            if (state.sectorBonus.get(pos.type)) {
                const bonusAmt = pos.buyPrice * 0.12;
                payout += bonusAmt;
                extraMsg += ` | 🐱 Bono sector +12%`;
            }
            break;
        }

        case 'sheep': {
            const gain25 = pos.buyPrice * 0.25;
            payout += gain25;
            extraMsg += ` | 🐑 +25%`;
            if (Math.random() < 0.50) {
                state.portfolio.set(pos.symbol, { ...pos });
                extraMsg += ' | 🔄 Repetida!';
            }
            // 25% de 2500 extra
            if (Math.random() < 0.25) {
                state.monedas += 2500;
                extraMsg += ' | 💰 +2500 bonus!';
            }
            // 100% predicción de una acción por 35s
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
    showToast(`🐑 Predicción: ${target.symbol} ${target._future >= 0 ? '▲' : '▼'} ${Math.abs(target._future)}% por 35s`);
    renderMarket();
    setTimeout(() => {
        const a = state.market.get(target.symbol);
        if (a) { const { _future, ...clean } = a; state.market.set(target.symbol, clean); }
        renderMarket();
    }, 35000);
};

// Modificadores en COMPRA del mercado
const applyPetBuyModifiers = (assetPrice) => {
    const pet = PET_DEFS[state.currentPet]?.passive;
    if (pet === 'cow') return assetPrice * 0.5;   // -50%
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
        showToast(`🐧 Compraste en rojo! Salud -${Math.round(factor*100)}% de su valor actual`);
        checkGameOver();
    }
};

// Sheep: si pierdes dinero, triplicar precios base
let sheepPriceTripled = false;
const checkSheepPenalty = (profit) => {
    if (PET_DEFS[state.currentPet]?.passive !== 'sheep') return;
    if (profit < 0 && !sheepPriceTripled) {
        sheepPriceTripled = true;
        showToast('🐑 ¡Perdiste dinero! Los precios de la tienda se triplicaron 😱');
    }
};

// ============================================================
//  HABILIDADES ACTIVAS (BOTONES EN MASCOTA)
// ============================================================

// Conejo: Turbo x4
window.activateBunnyTurbo = () => {
    if (bunnyTurboCooldown) { showToast('⏱️ Turbo en cooldown, espera 3 minutos'); return; }
    if (bunnyTurboActive)   { showToast('⚡ ¡Turbo ya activo!'); return; }
    bunnyTurboActive = true;
    startMarket(750);
    showToast('🐰 ¡TURBO x4 activado por 30s!');
    setTimeout(() => {
        bunnyTurboActive = false;
        startMarket(SPEED_NORMAL);
        showToast('🐰 Turbo terminado.');
        bunnyTurboCooldown = true;
        renderPetAbilityButton();
        setTimeout(() => {
            bunnyTurboCooldown = false;
            renderPetAbilityButton();
            showToast('🐰 ¡Turbo disponible de nuevo!');
        }, 180000); // 3 min
    }, 30000);
    renderPetAbilityButton();
};

// Rana: Predicción perfecta del sector
window.activateFrogPrediction = () => {
    if (frogCooldown) { showToast('⏱️ Habilidad de Rana en cooldown (1 min)'); return; }
    const counts = countBySector();
    let targetSector = null;
    counts.forEach((c, type) => { if (c >= 3) targetSector = type; });
    if (!targetSector) { showToast('🐸 Necesitas 3+ acciones del mismo sector'); return; }

    // Predicción perfecta: mostrar futuro real de ese sector
    state.market.forEach((a, sym) => {
        if (a.type === targetSector) {
            const pred = parseFloat((Math.random() * 10 - 5).toFixed(2));
            state.market.set(sym, { ...a, _future: pred });
        }
    });
    renderMarket();
    showToast(`🐸 ¡Predicción perfecta del sector ${targetSector} por 30s!`);
    frogCooldown = true;
    renderPetAbilityButton();
    setTimeout(() => {
        state.market.forEach((a, sym) => {
            if (a.type === targetSector) {
                const { _future, ...clean } = a;
                state.market.set(sym, clean);
            }
        });
        renderMarket();
        showToast('🐸 Predicción de Rana terminada.');
    }, 30000);
    setTimeout(() => {
        frogCooldown = false;
        renderPetAbilityButton();
        showToast('🐸 ¡Habilidad de Rana disponible!');
    }, 60000);
};

// ============================================================
//  RENDER BOTÓN DE HABILIDAD ACTIVA EN MASCOTA
// ============================================================
const renderPetAbilityButton = () => {
    const container = document.getElementById('pet-ability-area');
    if (!container) return;
    const pet = PET_DEFS[state.currentPet];
    if (!pet) { container.innerHTML = ''; return; }

    let html = '';
    switch(pet.passive) {
        case 'bunny':
            html = `<button class="btn-pet-ability ${bunnyTurboCooldown?'ability-cooldown':''}"
                        onclick="activateBunnyTurbo()" ${bunnyTurboCooldown?'disabled':''}>
                        🚀 Turbo x4 ${bunnyTurboCooldown?'(cooldown 3min)':'(30s)'}
                    </button>`;
            break;
        case 'frog':
            html = `<button class="btn-pet-ability ${frogCooldown?'ability-cooldown':''}"
                        onclick="activateFrogPrediction()" ${frogCooldown?'disabled':''}>
                        🔮 Predicción ${frogCooldown?'(cooldown 1min)':'(30s)'}
                    </button>`;
            break;
        default:
            html = '';
    }
    container.innerHTML = html;
};

// ============================================================
//  SISTEMA DE DESBLOQUEO
// ============================================================
window.openPetSelector = () => {
    initPetData();
    const grid = document.getElementById('pet-grid');
    if (!grid) return;

    grid.innerHTML = PET_ORDER.map(id => {
        const def  = PET_DEFS[id];
        const data = state.petData.get(id) || { health: 0, unlocked: false };
        const isActive   = id === state.currentPet;
        const isUnlocked = data.unlocked;
        const canUnlock  = canUnlockPet(id);
        const cost       = def.cost;

        let btnHtml = '';
        if (isActive) {
            btnHtml = `<span class="pet-badge active">✅ Activa</span>`;
        } else if (isUnlocked) {
            btnHtml = `<button class="btn-pet-select" onclick="selectPet('${id}','${def.label}')">Seleccionar</button>`;
        } else if (canUnlock) {
            btnHtml = `<button class="btn-pet-unlock" onclick="unlockPet('${id}')">
                🔓 ${cost === 0 ? 'Gratis' : `🪙${cost.toLocaleString()}`}
            </button>`;
        } else {
            btnHtml = `<span class="pet-badge locked">🔒 Bloqueado</span>`;
        }

        const hearts = getHeartConfig(Math.round(data.health));
        const heartHtml = hearts.map(t =>
            `<img src="../assets/Hearts/${heartImg[t]}.png" class="pet-grid-heart">`
        ).join('');

        return `
        <div class="pet-option ${isActive?'pet-selected':''} ${isUnlocked?'':'pet-locked'}">
            <div class="pet-preview" style="background-image:url('../assets/pets/${id}.png')"></div>
            <span class="pet-label">${def.label}</span>
            <div class="pet-grid-hearts">${heartHtml}</div>
            ${btnHtml}
        </div>`;
    }).join('');

    document.getElementById('modal-mascota').style.display = 'flex';
};

const canUnlockPet = (id) => {
    const idx = PET_ORDER.indexOf(id);
    if (idx === 0) return true; // primero siempre
    const prevId   = PET_ORDER[idx - 1];
    const prevData = state.petData.get(prevId);
    if (!prevData || !prevData.unlocked) return false;
    if (prevData.health < 100) return false;
    const def = PET_DEFS[id];
    return state.monedas >= def.cost;
};

window.unlockPet = (id) => {
    if (!canUnlockPet(id)) { showToast('❌ No puedes desbloquear esta mascota aún'); return; }
    const def  = PET_DEFS[id];
    const data = state.petData.get(id) || { health: 0, unlocked: false };
    state.monedas -= def.cost;
    data.unlocked = true;
    data.health   = 50; // empieza con 50% de salud
    state.petData.set(id, data);
    showToast(`🎉 ¡Desbloqueaste ${def.label}!`);
    logEvent('mascota', `Desbloqueaste ${def.label}`, `Costo: 🪙${def.cost.toLocaleString()}`);
    updateUI();
    openPetSelector();
};

window.selectPet = (id, label) => {
    // Guardar salud de la mascota actual antes de cambiar
    saveCurPetHealth();
    state.currentPet = id;
    // Restaurar salud de la nueva mascota
    const data = state.petData.get(id);
    if (data) state.saludMascota = data.health;
    renderPet();
    renderPetHealth();
    startPassivesForPet(id);
    closePetSelector();
    renderPetAbilityButton();
    showToast(`🐾 ¡Ahora juegas con ${label}!`);
    logEvent('mascota', `Cambiaste a ${label}`, '');
    saveGame();
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
};