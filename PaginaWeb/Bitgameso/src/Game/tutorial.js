// ============================================================
//  BITGAMESO — tutorial.js  (v2 — bloqueo real de interacción)
// ============================================================

const TUTORIAL_DONE_KEY = () => {
    const u = localStorage.getItem('bitgameso_sesion_activa') || 'invitado';
    return `bitgameso_tutorial_done_${u}`;
};

let tutorialActive        = false;
let tutorialStep          = 0;
let tutorialFirstRun      = false;
let tutorialSelectedAction = null;
let _typewriterTimer      = null;

// Elementos que se elevan temporalmente para "romper" el overlay
let _elevatedEls = [];

// ============================================================
//  PASOS DEL TUTORIAL
// ============================================================
const TUTORIAL_STEPS = [
    // PASO 0 — Bienvenida
    {
        target:  null,
        mascot:  'Hola! Soy tu mascota y te voy a ensenar lo basico de BITGAMESO en pocos pasos. Presiona Siguiente para comenzar.',
        waitFor: 'next',
    },
    // PASO 1 — Monedas
    {
        target:   '.score-container',
        mascot:   'Estas son tus monedas. Con ellas inviertes en el mercado y me compras comida para mantenerme con vida. Si mi salud llega a 0, pierdes.',
        waitFor:  'next',
        scrollTo: true,
    },
    // PASO 2 — El mercado (resalta sección completa)
    {
        target:   '.market-main',
        arrowDir: 'up',
        mascot:   'Este es el Mercado Global. Los precios cambian solos cada pocos segundos. Tu objetivo: comprar barato y vender cuando el precio suba. La inversion aparece en tu Cartera.',
        waitFor:  'next',
        scrollTo: true,
    },
    // PASO 3 — Comprar una accion (resalta botón específico)
    {
        target:   null,   // se asigna dinámicamente en setupBuyTutorial
        mascot:   'Voy a resaltar una accion. Presiona el boton COMPRAR de esa accion para hacer tu primera inversion.',
        waitFor:  'buy_tutorial',
        scrollTo: true,
    },
    // PASO 4 — Cartera: vender con ganancia
    {
        target:   '.portfolio-aside',
        mascot:   'Tu inversion esta en la Cartera. Cuando el numero este en VERDE significa ganancia. Presiona VENDER en tu cartera para cobrar.',
        waitFor:  'sell_tutorial',
        scrollTo: true,
    },
    // PASO 5 — Abrir tienda
    {
        target:   '#btn-comprar',
        mascot:   'Bien vendido! Ahora vamos a comprarme comida. Presiona el boton "Comprar" para abrir la tienda.',
        waitFor:  'click_target',
        scrollTo: true,
    },
    // PASO 6 — Comprar manzana en tienda
    {
        target:     '.food-shop-grid',
        mascot:     'Busca la MANZANA (fruta roja, primera de la lista) y comprala. Las frutas activan el mercado rapido.',
        waitFor:    'buy_food_tutorial',
        scrollTo:   false,
    },
    // PASO 7 — Seleccionar item del inventario
    {
        target:   '.inventory-section',
        mascot:   'La manzana esta en tu inventario (barra superior). Haz click en ella para seleccionarla.',
        waitFor:  'select_food_tutorial',
        scrollTo: true,
    },
    // PASO 8 — Enviar comida
    {
        target:   '#btn-enviar',
        mascot:   'Ahora presiona "Enviar" para darme la comida. Recuerda: "Vender" te da monedas, "Enviar" me alimenta a mi.',
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
    tutorialFirstRun       = !localStorage.getItem(TUTORIAL_DONE_KEY());
    tutorialActive         = true;
    tutorialStep           = 0;
    tutorialSelectedAction = null;
    createTutorialUI();
    renderTutorialStep();
};

window.closeTutorial = () => {
    tutorialActive = false;
    if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
    removeTutorialUI();
    removeHighlight();
    lowerAllElevated();
};

const finishTutorial = () => {
    if (tutorialFirstRun && !localStorage.getItem(TUTORIAL_DONE_KEY())) {
        state.monedas += 1000;
        if (typeof updateUI === 'function') updateUI();
        localStorage.setItem(TUTORIAL_DONE_KEY(), 'true');
    }
    closeTutorial();
    if (typeof showToast === 'function')
        showToast(tutorialFirstRun ? '¡Tutorial completado! +1000 de regalo' : '¡Repasaste el tutorial!');
};

// ============================================================
//  ELEVACIÓN DE ELEMENTOS (para romper el overlay bloqueante)
// ============================================================

// Guarda el z-index original y eleva el elemento por encima del overlay
const elevateElement = (el) => {
    if (!el) return;
    // Evitar duplicados
    if (_elevatedEls.find(e => e.el === el)) return;
    const prev = el.style.zIndex;
    const prevPos = el.style.position;
    _elevatedEls.push({ el, prevZIndex: prev, prevPosition: prevPos });
    el.style.position = 'relative';
    el.style.zIndex   = '9993';
};

// Restaura z-index de todos los elementos elevados
const lowerAllElevated = () => {
    _elevatedEls.forEach(({ el, prevZIndex, prevPosition }) => {
        el.style.zIndex   = prevZIndex;
        el.style.position = prevPosition;
    });
    _elevatedEls = [];
};

// ============================================================
//  BLOQUEO GLOBAL — el overlay bloquea TODO
//  Los elementos elevados (z-index 9993) quedan por encima del overlay (9989)
//  y la burbuja (9995) queda por encima de todo
// ============================================================
const enableOverlayBlock = () => {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.pointerEvents = 'all'; // BLOQUEA clics
};

const disableOverlayBlock = () => {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.style.pointerEvents = 'none';
};

// ============================================================
//  UI DEL TUTORIAL
// ============================================================
const createTutorialUI = () => {
    removeTutorialUI();

    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.pointerEvents = 'all'; // BLOQUEANTE por defecto
    document.body.appendChild(overlay);

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
                <button id="tut-btn-finish" class="tut-btn-finish" onclick="finishTutorial()" style="display:none;">¡Terminar!</button>
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

    // Bajar elementos elevados del paso anterior
    lowerAllElevated();

    // Bloquear overlay por defecto
    enableOverlayBlock();

    // Ocultar botones mientras escribe
    const btnNextPre   = document.getElementById('tut-btn-next');
    const btnFinishPre = document.getElementById('tut-btn-finish');
    if (btnNextPre)   { btnNextPre.style.opacity = '0.3';   btnNextPre.style.pointerEvents = 'none'; }
    if (btnFinishPre) { btnFinishPre.style.opacity = '0.3'; btnFinishPre.style.pointerEvents = 'none'; }

    // Texto con typewriter
    const textEl = document.getElementById('tut-text');
    if (textEl) typewriterEffect(textEl, step.mascot);

    // Contador
    const counter = document.getElementById('tut-step-counter');
    if (counter) counter.textContent = `Paso ${tutorialStep + 1} de ${TUTORIAL_STEPS.length}`;

    // Botones
    const btnNext   = document.getElementById('tut-btn-next');
    const btnFinish = document.getElementById('tut-btn-finish');
    if (btnNext)   btnNext.style.display   = step.waitFor === 'next'   ? 'block' : 'none';
    if (btnFinish) btnFinish.style.display = step.waitFor === 'finish' ? 'block' : 'none';

    // Resaltar elemento (pasos con target fijo)
    if (step.target) {
        const doHighlight = () => {
            const el = document.querySelector(step.target);
            if (el) {
                elevateElement(el);
                highlightElement(el, step);
            }
        };
        if (step.scrollTo) {
            const el = document.querySelector(step.target);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(doHighlight, 700);
            }
        } else {
            setTimeout(doHighlight, 300);
        }
    } else {
        removeHighlight();
    }

    // Pasos especiales
    if (step.waitFor === 'buy_tutorial')           setupBuyTutorial();
    if (step.waitFor === 'sell_tutorial')          setupSellTutorial();
    if (step.waitFor === 'click_target')           setupClickTarget(step.target);
    if (step.waitFor === 'buy_food_tutorial')      setupBuyFoodTutorial();
    if (step.waitFor === 'select_food_tutorial')   setupSelectFoodTutorial();
    if (step.waitFor === 'use_food_tutorial')      setupUseFoodTutorial();

    // En pasos 'next'/'finish', elevar la burbuja (ya tiene z-index 9995 en CSS)
    // y también el botón de cerrar si existe
    if (step.waitFor === 'next' || step.waitFor === 'finish') {
        // nada extra — la burbuja ya está en z-index 9995
    }
};

const tutorialNext = () => {
    tutorialStep++;
    if (tutorialStep >= TUTORIAL_STEPS.length) { finishTutorial(); return; }
    renderTutorialStep();
};

window.tutorialNext   = tutorialNext;
window.finishTutorial = finishTutorial;

// ============================================================
//  HIGHLIGHT DE ELEMENTO
// ============================================================
const highlightElement = (el, step) => {
    removeHighlight();
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const pad  = 8;

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

    // Flecha
    const dir = step.arrowDir || 'up';
    const arrowMap = {
        'up':    { img: 'Arrow-Complete-Up-128.png',    anim: 'tut-bounce-up' },
        'down':  { img: 'Arrow-Complete-Down-128.png',  anim: 'tut-bounce-down' },
        'left':  { img: 'Arrow-Complete-Left-128.png',  anim: 'tut-bounce-left' },
        'right': { img: 'Arrow-Complete-Right-128.png', anim: 'tut-bounce-right' },
    };
    const arrowCfg  = arrowMap[dir] || arrowMap['up'];
    const arrowSize = 48;
    const arrow     = document.createElement('div');
    arrow.id        = 'tutorial-arrow';

    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    let arrowTop, arrowLeft;
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
        animation: ${arrowCfg.anim} 0.7s infinite alternate;
        filter: drop-shadow(0 0 6px #CBA6F7);
    `;
    arrow.innerHTML = `<img src="../assets/arrows/${arrowCfg.img}" style="width:100%;height:100%;object-fit:contain;">`;
    document.body.appendChild(arrow);

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

    let left = rect.left + rect.width/2 - bW/2;
    let top;

    if (dir === 'left' || dir === 'right') {
        top  = rect.top + rect.height/2 - bH/2;
        left = dir === 'left' ? rect.right + 70 : rect.left - bW - 70;
    } else {
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
//  TYPEWRITER
// ============================================================
const typewriterEffect = (el, text, onDone) => {
    if (!el || !text) { if (onDone) onDone(); return; }
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
//  SETUP PASO 3 — COMPRAR ACCION
//  Eleva y resalta solo el botón COMPRAR del activo elegido
// ============================================================
const setupBuyTutorial = () => {
    // Elegir primer activo no poseído
    let targetSymbol = null;
    for (const [sym] of state.market) {
        if (!state.portfolio.has(sym)) { targetSymbol = sym; break; }
    }
    if (!targetSymbol) { tutorialNext(); return; }
    tutorialSelectedAction = targetSymbol;

    // Mover el activo al inicio del mapa para que aparezca primero
    const targetAsset = state.market.get(targetSymbol);
    state.market.delete(targetSymbol);
    const newMarket = new Map();
    newMarket.set(targetSymbol, targetAsset);
    state.market.forEach((v, k) => newMarket.set(k, v));
    state.market = newMarket;

    // Forzar filtro 'Todos'
    if (typeof setFilter === 'function') setFilter('Todos');
    if (typeof renderMarket === 'function') renderMarket();

    // Scroll al mercado
    const marketEl = document.querySelector('.market-main');
    if (marketEl) marketEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Esperar scroll y luego resaltar el botón correcto
    setTimeout(() => {
        const doHighlightBtn = () => {
            const rows = document.querySelectorAll('.asset-row');
            let targetBtn = null;
            rows.forEach(row => {
                const symEl = row.querySelector('.asset-symbol');
                if (symEl && symEl.textContent.trim() === targetSymbol) {
                    targetBtn = row.querySelector('.btn-buy');
                }
            });

            if (!targetBtn) {
                // Reintentar si el DOM todavía no se renderizó
                setTimeout(doHighlightBtn, 400);
                return;
            }

            // Deshabilitar TODOS los otros botones comprar
            document.querySelectorAll('.btn-buy').forEach(btn => {
                if (btn !== targetBtn) {
                    btn.style.opacity       = '0.3';
                    btn.style.pointerEvents = 'none';
                }
            });

            // Elevar el botón para que quede sobre el overlay
            elevateElement(targetBtn);
            // También elevar la fila para que se vea bien
            const targetRow = targetBtn.closest('.asset-row');
            if (targetRow) elevateElement(targetRow);

            // Scroll al botón
            targetBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

            setTimeout(() => {
                highlightElement(targetBtn, { arrowDir: 'up' });
                addActionGlow(targetBtn);

                const textEl = document.getElementById('tut-text');
                if (textEl) textEl.textContent = 'Presiona COMPRAR en la accion resaltada para hacer tu primera inversion.';
            }, 500);
        };
        doHighlightBtn();
    }, 900);

    // Polling: esperar que el activo aparezca en cartera
    const poll = setInterval(() => {
        if (!tutorialActive) {
            clearInterval(poll);
            restoreBuyBtns();
            return;
        }
        if (state.portfolio.has(targetSymbol)) {
            clearInterval(poll);
            restoreBuyBtns();
            lowerAllElevated();
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 800);
        }
    }, 500);
};

const restoreBuyBtns = () => {
    document.querySelectorAll('.btn-buy').forEach(btn => {
        btn.style.opacity       = '';
        btn.style.pointerEvents = '';
    });
};

// ============================================================
//  SETUP PASO 4 — VENDER CON GANANCIA
//  Fuerza el precio en +100% para que siempre esté en verde
// ============================================================
const setupSellTutorial = () => {
    if (!tutorialSelectedAction) { tutorialNext(); return; }
    const sym = tutorialSelectedAction;

    // Siempre forzar precio x2 (tanto en primera vez como en repetición sin monedas)
    const pos = state.portfolio.get(sym);
    if (pos) {
        const asset = state.market.get(sym);
        if (asset) {
            state.market.set(sym, { ...asset, price: pos.buyPrice * 2, changePercent: 100 });
            if (typeof renderMarket === 'function') renderMarket();
            if (typeof renderPortfolio === 'function') renderPortfolio();
        }
    }

    // Scroll a la cartera y resaltar
    setTimeout(() => {
        const portfolioEl = document.querySelector('.portfolio-aside');
        if (portfolioEl) {
            portfolioEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                // Buscar el botón VENDER de este activo en la cartera
                const sellBtns = document.querySelectorAll('.portfolio-aside .btn-sell, .portfolio-aside [class*="sell"]');
                sellBtns.forEach(b => {
                    elevateElement(b);
                    addActionGlow(b);
                });
                // Elevar toda la cartera para verla
                elevateElement(portfolioEl);
                highlightElement(portfolioEl, { arrowDir: 'up' });
            }, 700);
        }
    }, 300);

    // Actualizar texto según precio en tiempo real
    const priceCheck = setInterval(() => {
        if (!tutorialActive || !state.portfolio.has(sym)) { clearInterval(priceCheck); return; }
        const posNow = state.portfolio.get(sym);
        const cur    = state.market.get(sym);
        if (posNow && cur) {
            const textEl = document.getElementById('tut-text');
            if (textEl) {
                textEl.textContent = cur.price >= posNow.buyPrice
                    ? '¡Esta en verde! Es buen momento para vender. ¡Presiona VENDER en tu cartera!'
                    : 'Aun esta en rojo, espera un poco mas antes de vender...';
            }
        }
    }, 1500);

    // Polling: detectar que el activo salió de la cartera
    const checkSell = setInterval(() => {
        if (!tutorialActive) { clearInterval(checkSell); return; }
        if (!state.portfolio.has(sym)) {
            clearInterval(checkSell);
            clearInterval(priceCheck);
            lowerAllElevated();
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
        }
    }, 400);
};

// ============================================================
//  SETUP PASO 5 — CLICK EN BOTÓN COMPRAR (tienda)
// ============================================================
const setupClickTarget = (selector) => {
    if (!selector) return;
    const el = document.querySelector(selector);
    if (!el) return;

    elevateElement(el);
    addActionGlow(el);

    const handler = () => {
        el.removeEventListener('click', handler);
        removeActionGlow();
        lowerAllElevated();
        setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 400);
    };
    el.addEventListener('click', handler);
};

// ============================================================
//  SETUP PASO 6 — COMPRAR MANZANA EN TIENDA
//  Solo resalta la Manzana, bloquea todo lo demás, sin inflación
// ============================================================
const setupBuyFoodTutorial = () => {
    const TUTORIAL_FOOD_ID = 'Apple-128'; // Siempre la Manzana
    const prevInvSize = state.inventory ? state.inventory.size : 0;
    const prevQty     = state.inventory && state.inventory.has(TUTORIAL_FOOD_ID)
        ? (state.inventory.get(TUTORIAL_FOOD_ID).qty || 1) : 0;

    const doHighlightApple = () => {
        // Buscar el item de Manzana en la tienda
        const allItems = document.querySelectorAll('.food-item');
        let appleItem  = null;

        allItems.forEach(item => {
            // Buscar por el nombre o por el data-id
            const nameEl = item.querySelector('.food-name, [class*="name"]');
            const dataId = item.getAttribute('data-id') || item.getAttribute('data-food-id') || '';
            const nameText = nameEl ? nameEl.textContent.trim() : '';
            if (dataId === TUTORIAL_FOOD_ID || nameText === 'Manzana' || dataId.includes('Apple')) {
                appleItem = item;
            }
        });

        if (!appleItem && allItems.length === 0) {
            // Tienda aún no abrió, reintentar
            setTimeout(doHighlightApple, 300);
            return;
        }

        if (!appleItem) {
            // Fallback: buscar por imagen
            allItems.forEach(item => {
                const img = item.querySelector('img');
                if (img && img.src && img.src.includes('Apple')) appleItem = item;
            });
        }

        // Atenuar toda la tienda
        document.querySelectorAll('.food-item').forEach(item => {
            item.style.opacity       = '0.3';
            item.style.pointerEvents = 'none';
        });

        if (appleItem) {
            // Resaltar solo la Manzana
            appleItem.style.opacity       = '1';
            appleItem.style.pointerEvents = 'auto';
            appleItem.style.boxShadow     = '0 0 0 4px #CBA6F7, 0 0 20px rgba(203,166,247,0.8)';
            appleItem.style.transform     = 'scale(1.08)';
            appleItem.style.transition    = 'all 0.2s';
            elevateElement(appleItem);
        }

        // Elevar el modal/grid de la tienda
        const shopModal = document.querySelector('.food-shop-modal, #food-shop-modal, .modal-overlay.food');
        if (shopModal) elevateElement(shopModal);
        const shopGrid = document.querySelector('.food-shop-grid');
        if (shopGrid) elevateElement(shopGrid);
        const modalContainer = document.querySelector('.modal-shop, [id*="shop"]');
        if (modalContainer) elevateElement(modalContainer);

        // Actualizar texto de la burbuja
        const textEl = document.getElementById('tut-text');
        if (textEl) textEl.textContent = 'Compra la MANZANA que esta resaltada. Las frutas activan el mercado rapido.';
    };

    // Actualizar el paso en TUTORIAL_STEPS para que diga Manzana
    const stepEl = document.getElementById('tut-text');
    if (stepEl) stepEl.textContent = 'Presiona el boton "Comprar" para abrir la tienda y busca la Manzana.';

    setTimeout(doHighlightApple, 500);

    // Restaurar tienda
    const restoreShop = () => {
        document.querySelectorAll('.food-item').forEach(item => {
            item.style.opacity       = '';
            item.style.pointerEvents = '';
            item.style.boxShadow     = '';
            item.style.transform     = '';
        });
        lowerAllElevated();
    };

    // Polling: detectar que se compró la Manzana
    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); restoreShop(); return; }

        let boughtApple = false;
        if (state.inventory) {
            const currentQty = state.inventory.has(TUTORIAL_FOOD_ID)
                ? (state.inventory.get(TUTORIAL_FOOD_ID).qty || 1) : 0;
            // Se compró si la cantidad subió o si apareció en el inventario
            if (currentQty > prevQty || (prevQty === 0 && state.inventory.has(TUTORIAL_FOOD_ID))) {
                boughtApple = true;
            }
            // Fallback: inventario creció (solo hay manzanas disponibles)
            if (!boughtApple && state.inventory.size > prevInvSize) {
                boughtApple = true;
            }
        }

        if (boughtApple) {
            clearInterval(check);
            restoreShop();

            // CANCELAR inflación generada por la compra del tutorial
            if (state.foodInflation && state.foodInflation.has(TUTORIAL_FOOD_ID)) {
                state.foodInflation.set(TUTORIAL_FOOD_ID, 0);
            }

            if (typeof closeFoodShop === 'function') closeFoodShop();
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
        }
    }, 400);
};

// ============================================================
//  SETUP PASO 7 — SELECCIONAR ITEM DEL INVENTARIO
// ============================================================
const setupSelectFoodTutorial = () => {
    // Resaltar el inventario para que el jugador sepa donde clickear
    const invEl = document.querySelector('.inventory-section');
    if (invEl) {
        elevateElement(invEl);
        addActionGlow(invEl);
    }

    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); return; }
        if (state.selectedFood) {
            clearInterval(check);
            removeActionGlow();
            lowerAllElevated();
            setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 400);
        }
    }, 400);
};

// ============================================================
//  SETUP PASO 8 — ENVIAR COMIDA
// ============================================================
const setupUseFoodTutorial = () => {
    const prevHealth  = state.saludMascota;
    const prevInvSize = state.inventory ? state.inventory.size : 0;
    let sentFood      = false;

    const btnEnviar = document.getElementById('btn-enviar');
    const btnVender = document.getElementById('btn-vender');

    // Elevar solo el botón Enviar
    if (btnEnviar) {
        elevateElement(btnEnviar);
        addActionGlow(btnEnviar);
    }

    // Registrar si se presionó Enviar o Vender
    const enviarHandler = () => { sentFood = true; };
    const venderHandler = () => { sentFood = false; };
    if (btnEnviar) btnEnviar.addEventListener('click', enviarHandler, { once: true });
    if (btnVender) btnVender.addEventListener('click', venderHandler, { once: true });

    const check = setInterval(() => {
        if (!tutorialActive) { clearInterval(check); return; }

        const currentInvSize = state.inventory ? state.inventory.size : 0;
        if (currentInvSize < prevInvSize) {
            clearInterval(check);
            if (btnEnviar) btnEnviar.removeEventListener('click', enviarHandler);
            if (btnVender) btnVender.removeEventListener('click', venderHandler);
            lowerAllElevated();
            removeActionGlow();

            if (sentFood || state.saludMascota >= prevHealth) {
                // Envió correctamente
                setTimeout(() => { tutorialStep++; renderTutorialStep(); }, 600);
            } else {
                // Vendió la comida — pedir que compre otra
                const textEl = document.getElementById('tut-text');
                if (textEl) textEl.textContent = '¡Ups! Vendiste la manzana en vez de enviarla. Compra otra Manzana y usa el boton "Enviar". ¡Intentalo de nuevo!';
                setTimeout(() => {
                    // Volver al paso de abrir la tienda
                    const stepIdx = TUTORIAL_STEPS.findIndex(s => s.waitFor === 'click_target' && s.target === '#btn-comprar');
                    tutorialStep = stepIdx >= 0 ? stepIdx : tutorialStep - 3;
                    renderTutorialStep();
                }, 3000);
            }
        }
    }, 300);
};

// ============================================================
//  AUTO-INICIO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Sobreescribir funciones globales
    window.openTutorial = () => {
        tutorialFirstRun       = !localStorage.getItem(TUTORIAL_DONE_KEY());
        tutorialActive         = true;
        tutorialStep           = 0;
        tutorialSelectedAction = null;
        createTutorialUI();
        renderTutorialStep();
    };

    window.closeTutorial = () => {
        tutorialActive = false;
        if (_typewriterTimer) { clearInterval(_typewriterTimer); _typewriterTimer = null; }
        removeTutorialUI();
        removeHighlight();
        lowerAllElevated();
    };

    // Ocultar modal viejo si existe
    const oldModal = document.getElementById('modal-tutorial');
    if (oldModal) oldModal.style.display = 'none';

    // Abrir automáticamente si es la primera vez
    if (!localStorage.getItem(TUTORIAL_DONE_KEY())) {
        setTimeout(() => window.openTutorial(), 1200);
    }

    console.log('BITGAMESO Tutorial v2: bloqueo real de interaccion cargado ✅');
});