// ============================================================
//  BITGAMESO — tutorial.js
//  Tutorial interactivo con overlay, mascota parlante y pasos
// ============================================================

const TUTORIAL_DONE_KEY = () => {
    const u = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_tutorial_done_${u}`;
};

let tutorialActive   = false;
let tutorialStep     = 0;
let tutorialFirstRun = false;
let tutorialSelectedAction = null;
let _typewriterTimer = null; // rastrea el intervalo activo para cancelarlo si hay uno nuevo

// ============================================================
//  PASOS DEL TUTORIAL
// ============================================================
// Cada paso tiene:
//   target    → selector CSS del elemento a resaltar (null = solo diálogo)
//   mascot    → texto que dice la mascota
//   waitFor   → evento que debe ocurrir para avanzar ('click_target' | 'auto' | 'buy' | 'sell' | 'buy_food' | 'use_food' | 'sell_food')
//   scrollTo  → si debe hacer scroll al elemento
const TUTORIAL_STEPS = [
    // PASO 0 — Bienvenida
    {
        target:  null,
        mascot:  'Hola! Soy tu mascota y te voy a ensenar lo basico de BITGAMESO en pocos pasos. Presiona Siguiente para comenzar.',
        waitFor: 'next',
    },
    // PASO 1 — Monedas + mascota
    {
        target:   '.score-container',
        mascot:   'Estas son tus monedas. Con ellas inviertes en el mercado y me compras comida para mantenerme con vida. Si mi salud llega a 0, pierdes. Mantenerme sana es tu prioridad.',
        waitFor:  'next',
        scrollTo: true,
    },
    // PASO 2 — El mercado
    {
        target:   '.market-main',
        arrowDir: 'up',
        mascot:   'Este es el Mercado Global. Los precios cambian solos cada pocos segundos. Tu objetivo: comprar barato y vender cuando el precio suba. La inversion aparece en tu Cartera.',
        waitFor:  'next',
        scrollTo: true,
    },
    // PASO 3 — Comprar una accion
    {
        target:   '.market-list',
        mascot:   'Voy a resaltar una accion. Presiona el boton COMPRAR de esa accion para hacer tu primera inversion.',
        waitFor:  'buy_tutorial',
        scrollTo: true,
    },
    // PASO 4 — Vender con ganancia
    {
        target:   '.portfolio-aside',
        mascot:   'Tu inversion esta en la Cartera. Cuando el numero este en VERDE significa ganancia. Presiona VENDER en tu cartera para cobrar.',
        waitFor:  'sell_tutorial',
        scrollTo: true,
    },
    // PASO 5 — Comprar comida
    {
        target:   '#btn-comprar',
        mascot:   'Bien vendido! Ahora vamos a comprarme comida. Presiona el boton "Comprar" para abrir la tienda.',
        waitFor:  'click_target',
        scrollTo: true,
    },
    // PASO 6 — Comprar verdura en tienda
    {
        target:     '.food-shop-grid',
        mascot:     'Busca una VERDURA (color verde) y comprala. Las verduras me dan salud directamente.',
        waitFor:    'buy_food_tutorial',
        scrollTo:   false,
        highlightVeg: true,
    },
    // PASO 7 — Seleccionar y enviar comida
    {
        target:   '.inventory-section',
        mascot:   'La verdura esta en tu inventario. Haz click en ella para seleccionarla y luego presiona el boton "Enviar" para darmela. Eso me recupera salud.',
        waitFor:  'select_food_tutorial',
        scrollTo: true,
    },
    // PASO 8 — Enviar comida
    {
        target:   '.nav-actions',
        mascot:   'Ahora presiona "Enviar" para darme la comida. Recuerda: "Vender" te da monedas por el item, "Enviar" me da la comida a mi.',
        waitFor:  'use_food_tutorial',
        scrollTo: true,
    },
    // PASO 9 — Mascotas
    {
        target:   '.pet-aside',
        arrowDir: 'left',
        mascot:   'Esta soy yo, tu mascota. Cada mascota tiene habilidades unicas que afectan el mercado. Hay mascotas que aceleran el mercado, duplican ganancias o predicen precios. Usa el boton "Mascotas" para ver todas.',
        waitFor:  'next',
        scrollTo: true,
    },
    // PASO 10 — Final
    {
        target:  null,
        mascot:  'Tutorial completado! Como recompensa te doy 1000 monedas extra. El objetivo final es tener todas las mascotas con 100 de salud. Buena suerte!',
        waitFor: 'finish',
    },
];

// ============================================================
//  INICIAR / CERRAR TUTORIAL
// ============================================================
window.openTutorial = () => {
    tutorialFirstRun = !localStorage.getItem(TUTORIAL_DONE_KEY());
    tutorialActive   = true;
    tutorialStep     = 0;
    tutorialSelectedAction = null;

    createTutorialUI();
    renderTutorialStep();
};

window.closeTutorial = () => {
    tutorialActive = false;
    if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
    removeTutorialUI();
    removeHighlight();
};

const finishTutorial = () => {
    // Dar monedas solo en el primer tutorial
    if (tutorialFirstRun && !localStorage.getItem(TUTORIAL_DONE_KEY())) {
        state.monedas += 1000;
        if (typeof updateUI === 'function') updateUI();
        localStorage.setItem(TUTORIAL_DONE_KEY(), 'true');
    }
    closeTutorial();
    if (typeof showToast === 'function')
        showToast(tutorialFirstRun ? ' ¡Tutorial completado! +1000 de regalo' : ' ¡Repasaste el tutorial!');
};

// ============================================================
//  UI DEL TUTORIAL
// ============================================================
const createTutorialUI = () => {
    removeTutorialUI();

    // Overlay oscuro — semi-transparente, no bloquea clicks
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.pointerEvents = 'none'; // permite interacción libre
    document.body.appendChild(overlay);

    // Ventana de mascota
    const bubble = document.createElement('div');
    bubble.id = 'tutorial-bubble';
    bubble.innerHTML = `
        <div class="tut-header">
            <div class="tut-mascot-wrap">
                <img id="tut-mascot-img" src="../assets/pets/${(() => {
                    const petDef = typeof PET_DEFS !== 'undefined' && PET_DEFS[state.currentPet];
                    return (petDef && petDef.golden && petDef.baseId) ? petDef.baseId : (state.currentPet || 'Bunny-Pink-128');
                })()}.png" alt="Mascota" style="${(() => {
                    const petDef = typeof PET_DEFS !== 'undefined' && PET_DEFS[state.currentPet];
                    return (petDef && petDef.golden) ? 'filter:sepia(1) saturate(3) hue-rotate(5deg) brightness(1.1)' : '';
                })()}">
            </div>
            ${!tutorialFirstRun ? `
            <button class="tut-close" onclick="closeTutorial()" title="Cerrar tutorial">
                <img src="../assets/arrows/X-Error-128.png" alt="Cerrar" style="width:22px;height:22px;object-fit:contain;">
            </button>` : '<div style="width:30px"></div>'}
        </div>
        <div class="tut-speech">
            <p id="tut-text"></p>
        </div>
        <div class="tut-footer">
            <span id="tut-step-counter" class="tut-counter"></span>
            <div class="tut-buttons">
                <button id="tut-btn-next" class="tut-btn-primary" onclick="tutorialNext()" style="display:none;">Siguiente →</button>
                <button id="tut-btn-finish" class="tut-btn-finish" onclick="finishTutorial()" style="display:none;"> ¡Terminar!</button>
            </div>
        </div>
    `;
    document.body.appendChild(bubble);
};

const removeTutorialUI = () => {
    ['tutorial-overlay','tutorial-bubble','tutorial-highlight-box','tutorial-arrow'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
};

// ============================================================
//  RENDER DE CADA PASO
// ============================================================
const renderTutorialStep = () => {
    if (!tutorialActive) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step) return;

    // Ocultar botones ANTES de iniciar typewriter
    const btnNextPre   = document.getElementById('tut-btn-next');
    const btnFinishPre = document.getElementById('tut-btn-finish');
    if (btnNextPre)   { btnNextPre.style.opacity = '0.3';   btnNextPre.style.pointerEvents = 'none'; }
    if (btnFinishPre) { btnFinishPre.style.opacity = '0.3'; btnFinishPre.style.pointerEvents = 'none'; }

    // Texto de la mascota con efecto typewriter
    const textEl = document.getElementById('tut-text');
    if (textEl) typewriterEffect(textEl, step.mascot);

    // Contador de pasos
    const counter = document.getElementById('tut-step-counter');
    if (counter) counter.textContent = `Paso ${tutorialStep + 1} de ${TUTORIAL_STEPS.length}`;

    // Botones
    const btnNext   = document.getElementById('tut-btn-next');
    const btnFinish = document.getElementById('tut-btn-finish');
    if (btnNext)   btnNext.style.display   = step.waitFor === 'next'   ? 'block' : 'none';
    if (btnFinish) btnFinish.style.display = step.waitFor === 'finish' ? 'block' : 'none';

    // Resaltar elemento
    if (step.target) {
        const el = document.querySelector(step.target);
        if (el) {
            if (step.scrollTo) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Esperar que scroll termine antes de calcular posición del highlight
                setTimeout(() => highlightElement(el, step), 600);
            } else {
                setTimeout(() => highlightElement(el, step), 400);
            }
        }
    } else {
        removeHighlight();
    }

    // Pasos especiales
    if (step.waitFor === 'buy_tutorial')       setupBuyTutorial();
    if (step.waitFor === 'sell_tutorial')      setupSellTutorial();
    if (step.waitFor === 'click_target')       setupClickTarget(step.target);
    if (step.waitFor === 'buy_food_tutorial')  setupBuyFoodTutorial();
    if (step.waitFor === 'select_food_tutorial') setupSelectFoodTutorial();
    if (step.waitFor === 'use_food_tutorial')  setupUseFoodTutorial();
};

const tutorialNext = () => {
    tutorialStep++;
    if (tutorialStep >= TUTORIAL_STEPS.length) { finishTutorial(); return; }
    renderTutorialStep();
};

window.tutorialNext = tutorialNext;
window.finishTutorial = finishTutorial;

// ============================================================
//  HIGHLIGHT DE ELEMENTO
// ============================================================
const highlightElement = (el, step) => {
    removeHighlight();
    const rect = el.getBoundingClientRect();
    const pad  = 8;

    // Caja de resaltado
    const box = document.createElement('div');
    box.id = 'tutorial-highlight-box';
    const isLarge = rect.width > 500 || rect.height > 300;
    box.style.cssText = `
        position: fixed;
        top:    ${rect.top    - pad}px;
        left:   ${rect.left   - pad}px;
        width:  ${rect.width  + pad*2}px;
        height: ${rect.height + pad*2}px;
        border: ${isLarge ? '4px' : '3px'} solid #CBA6F7;
        border-radius: 16px;
        box-shadow: 0 0 0 4px rgba(203,166,247,0.3), 0 0 30px #CBA6F7;
        z-index: 9990;
        pointer-events: none;
        animation: tut-pulse 1.5s infinite;
    `;
    document.body.appendChild(box);

    // Dirección de flecha según paso
    const dir = step.arrowDir || 'up';
    const arrowMap = {
        'up':    { img: 'Arrow-Complete-Up-128.png',    anim: 'tut-bounce-up' },
        'down':  { img: 'Arrow-Complete-Down-128.png',  anim: 'tut-bounce-down' },
        'left':  { img: 'Arrow-Complete-Left-128.png',  anim: 'tut-bounce-left' },
        'right': { img: 'Arrow-Complete-Right-128.png', anim: 'tut-bounce-right' },
    };
    const arrowCfg = arrowMap[dir] || arrowMap['up'];
    const arrowSize = 48;
    const arrow = document.createElement('div');
    arrow.id = 'tutorial-arrow';

    // Posición de la flecha según dirección
    let arrowTop, arrowLeft, arrowAnim = arrowCfg.anim;
    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    if (dir === 'up')    { arrowTop = rect.bottom + pad + 4; arrowLeft = cx - arrowSize/2; }
    if (dir === 'down')  { arrowTop = rect.top - arrowSize - pad - 4; arrowLeft = cx - arrowSize/2; }
    if (dir === 'left')  { arrowTop = cy - arrowSize/2; arrowLeft = rect.right + pad + 4; }
    if (dir === 'right') { arrowTop = cy - arrowSize/2; arrowLeft = rect.left - arrowSize - pad - 4; }

    arrowTop  = Math.max(10, Math.min(arrowTop,  window.innerHeight - arrowSize - 10));
    arrowLeft = Math.max(10, Math.min(arrowLeft, window.innerWidth  - arrowSize - 10));

    arrow.style.cssText = `
        position: fixed;
        top:  ${arrowTop}px;
        left: ${arrowLeft}px;
        width: ${arrowSize}px;
        height: ${arrowSize}px;
        z-index: 9991;
        pointer-events: none;
        animation: ${arrowAnim} 0.7s infinite alternate;
        filter: drop-shadow(0 0 6px #CBA6F7);
    `;
    arrow.innerHTML = `<img src="../assets/arrows/${arrowCfg.img}" style="width:100%;height:100%;object-fit:contain;">`;
    document.body.appendChild(arrow);

    // Posicionar burbuja
    positionBubble(rect, dir);
};

const positionBubble = (rect, dir = 'up') => {
    const bubble = document.getElementById('tutorial-bubble');
    if (!bubble) return;
    const bW  = bubble.offsetWidth  || 360;
    const bH  = bubble.offsetHeight || 220;
    const wH  = window.innerHeight;
    const wW  = window.innerWidth;
    const pad = 16;

    // Centrar horizontalmente respecto al elemento
    let left = rect.left + rect.width/2 - bW/2;
    let top;

    if (dir === 'left' || dir === 'right') {
        // Burbuja centrada verticalmente, al lado opuesto de la flecha
        top  = rect.top + rect.height/2 - bH/2;
        left = dir === 'left' ? rect.right + 70 : rect.left - bW - 70;
    } else {
        // up/down: burbuja debajo de la flecha
        top = rect.bottom + 65;
        if (top + bH > wH - pad) top = rect.top - bH - 65;
    }

    top  = Math.max(pad, Math.min(top,  wH - bH - pad));
    left = Math.max(pad, Math.min(left, wW - bW - pad));

    bubble.style.top       = `${top}px`;
    bubble.style.left      = `${left}px`;
    bubble.style.transform = 'none';
};

const removeHighlight = () => {
    ['tutorial-highlight-box','tutorial-arrow'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    removeActionGlow();
};

const addActionGlow = (el) => {
    if (!el) return;
    el.classList.add('tut-action-glow');
};

const removeActionGlow = () => {
    document.querySelectorAll('.tut-action-glow').forEach(el => el.classList.remove('tut-action-glow'));
};

// ============================================================
//  TYPEWRITER EFFECT
// ============================================================
const typewriterEffect = (el, text, onDone) => {
    if (!el || !text) { if (onDone) onDone(); return; }

    // Cancelar cualquier typewriter anterior antes de empezar uno nuevo
    if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }

    el.textContent = '';
    const chars = [...text];
    let i = 0;

    const btnNext   = document.getElementById('tut-btn-next');
    const btnFinish = document.getElementById('tut-btn-finish');
    if (btnNext)   { btnNext.style.opacity = '0.3';   btnNext.style.pointerEvents = 'none'; }
    if (btnFinish) { btnFinish.style.opacity = '0.3'; btnFinish.style.pointerEvents = 'none'; }

    _typewriterTimer = setInterval(() => {
        if (i < chars.length) {
            el.textContent += chars[i];
            i++;
        } else {
            clearInterval(_typewriterTimer);
            _typewriterTimer = null;
            if (btnNext)   { btnNext.style.opacity = '1'; btnNext.style.pointerEvents = 'auto'; }
            if (btnFinish) { btnFinish.style.opacity = '1'; btnFinish.style.pointerEvents = 'auto'; }
            if (onDone) onDone();
        }
    }, 22);
};

// ============================================================
//  SETUP DE PASOS ESPECIALES
// ============================================================

// Resaltar primera acción del mercado, moverla arriba y esperar que la compre
const setupBuyTutorial = () => {
    // Encontrar el primer activo no poseído
    let targetSymbol = null;
    for (const [sym] of state.market) {
        if (!state.portfolio.has(sym)) { targetSymbol = sym; break; }
    }
    if (!targetSymbol) { tutorialNext(); return; }
    tutorialSelectedAction = targetSymbol;

    // Mover el activo al inicio del mapa
    const targetAsset = state.market.get(targetSymbol);
    state.market.delete(targetSymbol);
    const newMarket = new Map();
    newMarket.set(targetSymbol, targetAsset);
    state.market.forEach((v, k) => newMarket.set(k, v));
    state.market = newMarket;

    // Forzar filtro 'Todos' para que se vea el activo
    if (typeof setFilter === 'function') setFilter('Todos');
    if (typeof renderMarket === 'function') renderMarket();

    // Paso 1: scroll al mercado
    const marketEl = document.querySelector('.market-main');
    if (marketEl) marketEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Paso 2: tras scroll, encontrar el botón y resaltarlo
    setTimeout(() => {
        const highlightTargetBtn = () => {
            const rows = document.querySelectorAll('.asset-row');
            let targetBtn = null;
            rows.forEach(row => {
                const symEl = row.querySelector('.asset-symbol');
                if (symEl && symEl.textContent.trim() === targetSymbol) {
                    targetBtn = row.querySelector('.btn-buy');
                }
            });

            if (targetBtn) {
                // Deshabilitar todos los otros botones comprar temporalmente
                document.querySelectorAll('.btn-buy').forEach(btn => {
                    if (btn !== targetBtn) {
                        btn.style.opacity = '0.3';
                        btn.style.pointerEvents = 'none';
                    }
                });

                // Scroll al botón y resaltar
                targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    const rect = targetBtn.getBoundingClientRect();
                    highlightElement(targetBtn, { arrowDir: 'up' });
                    positionBubble(rect, 'up');
                    addActionGlow(targetBtn);

                    // Actualizar texto de la burbuja
                    const textEl = document.getElementById('tut-text');
                    if (textEl) textEl.textContent = 'Presiona COMPRAR en la accion resaltada arriba para hacer tu primera inversion!';
                }, 500);
            }
        };
        highlightTargetBtn();
    }, 900);

    // Polling: esperar que aparezca en cartera y restaurar botones
    const poll = setInterval(() => {
        if (!tutorialActive) {
            clearInterval(poll);
            document.querySelectorAll('.btn-buy').forEach(btn => {
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            });
            return;
        }
        if (state.portfolio.has(targetSymbol)) {
            clearInterval(poll);
            // Restaurar botones
            document.querySelectorAll('.btn-buy').forEach(btn => {
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            });
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 800);
        }
    }, 500);
};

// Esperar que venda con ganancia (o mostrar aviso si intenta vender en rojo)
const setupSellTutorial = () => {
    if (!tutorialSelectedAction) { tutorialNext(); return; }
    const sym = tutorialSelectedAction;

    // Dar bono x2 automático en tutorial (primera vez)
    if (tutorialFirstRun) {
        const pos = state.portfolio.get(sym);
        if (pos) {
            const asset = state.market.get(sym);
            if (asset) {
                state.market.set(sym, { ...asset, price: pos.buyPrice * 2, changePercent: 100 });
                if (typeof renderMarket === 'function') renderMarket();
                if (typeof renderPortfolio === 'function') renderPortfolio();
            }
        }
    }

    // Glow en el botón de vender de la cartera
    setTimeout(() => {
        const sellBtns = document.querySelectorAll('.portfolio-aside .btn-sell, .portfolio-aside .btn-action');
        sellBtns.forEach(b => addActionGlow(b));
    }, 800);

    // Interceptar botón vender en cartera
    const checkSell = setInterval(() => {
        if (!tutorialActive) { clearInterval(checkSell); return; }
        if (!state.portfolio.has(sym)) {
            clearInterval(checkSell);
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
        }
    }, 400);

    // Avisar si el precio está en rojo (solo orientativo)
    const priceCheck = setInterval(() => {
        if (!tutorialActive || !state.portfolio.has(sym)) { clearInterval(priceCheck); return; }
        const pos = state.portfolio.get(sym);
        const cur = state.market.get(sym);
        if (pos && cur) {
            const textEl = document.getElementById('tut-text');
            if (textEl) {
                if (cur.price >= pos.buyPrice) {
                    textEl.textContent = ' ¡Está en verde! Es buen momento para vender. ¡Presiona VENDER en tu cartera!';
                } else {
                    textEl.textContent = ' Aún está en rojo, espera un poco más antes de vender...';
                }
            }
        }
    }, 1500);
};

// Esperar click en elemento target
const setupClickTarget = (selector) => {
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;

    addActionGlow(el);

    const handler = () => {
        el.removeEventListener('click', handler);
        removeActionGlow();
        setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 400);
    };
    el.addEventListener('click', handler);
};

// Esperar que compre comida — resaltar verduras en tienda
const setupBuyFoodTutorial = () => {
    // Resaltar items de verdura en la tienda
    setTimeout(() => {
        const vegItems = document.querySelectorAll('.food-item.veg');
        vegItems.forEach(item => {
            item.style.boxShadow = '0 0 0 3px #CBA6F7, 0 0 15px rgba(203,166,247,0.6)';
            item.style.transform = 'scale(1.05)';
        });
    }, 300);

    const prevInv = state.inventory.size;
    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); return; }
        if (state.inventory.size > prevInv) {
            clearInterval(check);
            // Quitar resaltado
            document.querySelectorAll('.food-item.veg').forEach(item => {
                item.style.boxShadow = '';
                item.style.transform = '';
            });
            if (typeof closeFoodShop === 'function') closeFoodShop();
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
        }
    }, 400);
};

// Esperar que seleccione un ítem del inventario
const setupSelectFoodTutorial = () => {
    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); return; }
        if (state.selectedFood) {
            clearInterval(check);
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 400);
        }
    }, 400);
};

// Esperar que envíe comida a la mascota (si vende, pedir que compre otra)
const setupUseFoodTutorial = () => {
    const prevHealth  = state.saludMascota;
    const prevInvSize = state.inventory.size;
    let   waitingForAction = false;
    // Interceptar el botón Enviar para saber exactamente qué pasó
    let sentFood = false;

    const btnEnviar = document.getElementById('btn-enviar');
    addActionGlow(btnEnviar);
    const enviarHandler = () => { sentFood = true; };
    if (btnEnviar) btnEnviar.addEventListener('click', enviarHandler, { once: true });

    const btnVender = document.getElementById('btn-vender');
    const venderHandler = () => { sentFood = false; };
    if (btnVender) btnVender.addEventListener('click', venderHandler, { once: true });

    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); return; }
        if (waitingForAction) return;

        const currentInvSize = state.inventory.size;

        // Inventario se redujo — verificar si fue enviando o vendiendo
        if (currentInvSize < prevInvSize) {
            clearInterval(check);
            if (btnEnviar) btnEnviar.removeEventListener('click', enviarHandler);
            if (btnVender) btnVender.removeEventListener('click', venderHandler);

            if (sentFood || state.saludMascota >= prevHealth) {
                //  Envió correctamente (salud igual o mayor, o botón enviar fue presionado)
                setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
            } else {
                // Vendió la comida
                waitingForAction = true;
                const textEl = document.getElementById('tut-text');
                if (textEl) textEl.textContent = ' ¡Ups! Vendiste la comida en vez de enviarla. Compra otra verdura y usa el botón "Enviar". ¡Inténtalo de nuevo!';
                setTimeout(() => {
                    const stepIdx = TUTORIAL_STEPS.findIndex(s => s.waitFor === 'click_target' && s.target === '#btn-comprar');
                    tutorialStep = stepIdx >= 0 ? stepIdx : tutorialStep - 3;
                    renderTutorialStep();
                }, 3000);
            }
        }
    }, 300);
};


// ============================================================
//  GARANTIZAR QUE tutorial.js GANA sobre cualquier otra versión
//  Se ejecuta al final de la carga para sobreescribir funciones viejas
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Sobreescribir cualquier función vieja de tutorial
    window.openTutorial = () => {
        tutorialFirstRun = !localStorage.getItem(TUTORIAL_DONE_KEY());
        tutorialActive   = true;
        tutorialStep     = 0;
        tutorialSelectedAction = null;
        createTutorialUI();
        renderTutorialStep();
    };

    window.closeTutorial = () => {
        tutorialActive = false;
        removeTutorialUI();
        removeHighlight();
    };

    // Ocultar modal viejo si existe
    const oldModal = document.getElementById('modal-tutorial');
    if (oldModal) oldModal.style.display = 'none';

    // Abrir tutorial automáticamente si el jugador nunca lo ha completado
    if (!localStorage.getItem(TUTORIAL_DONE_KEY())) {
        setTimeout(() => window.openTutorial(), 1200);
    }

    console.log('BITGAMESO Tutorial: sistema cargado correctamente ');
});