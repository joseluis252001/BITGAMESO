// ============================================================
//  BITGAMESO — registro.js  (Supabase Auth)
// ============================================================

import { supabase } from '../Supabase/supabase-client.js';

// ── Formulario de registro ───────────────────────────────────
const registroForm = document.getElementById('form-registro');

if (registroForm) {
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email  = document.getElementById('email').value.trim();
        const pass1  = document.getElementById('pass1').value;
        const pass2  = document.getElementById('pass2').value;

        // Validaciones básicas
        if (pass1 !== pass2) {
            mostrarMensaje('Las contraseñas no coinciden. Verifica e intenta otra vez.', 'error');
            return;
        }
        if (pass1.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }
        if (nombre.length < 3) {
            mostrarMensaje('El nombre de usuario debe tener al menos 3 caracteres.', 'error');
            return;
        }

        // Deshabilitar botón mientras carga
        const btn = registroForm.querySelector('button[type="submit"]');
        btn.disabled    = true;
        btn.textContent = 'Registrando...';

        // 1. Crear usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass1,
            options: {
                data: { username: nombre },          // guardado en user_metadata
                emailRedirectTo: `${location.origin}/PaginaWeb/Bitgameso/src/InicioCuenta/inico.html`
            }
        });

        btn.disabled    = false;
        btn.textContent = 'Registrarme';

        if (error) {
            // Traducir errores comunes
            const msg = traducirError(error.message);
            mostrarMensaje(msg, 'error');
            return;
        }

        // 2. Guardar username en tabla profiles (para el juego)
        if (data.user) {
            await supabase.from('profiles').upsert({
                id:       data.user.id,
                username: nombre,
                email
            });
        }

        // 3. Éxito — avisar que revise su correo
        mostrarMensaje(
            `¡Registro exitoso, ${nombre}! Te enviamos un correo a <b>${email}</b>.<br>
             Revisa tu bandeja (y spam) para confirmar tu cuenta antes de iniciar sesión.`,
            'success'
        );
        registroForm.reset();
        setTimeout(() => {
            window.location.href = '../InicioCuenta/inico.html';
        }, 5000);
    });
}

// ── Mensaje de feedback ──────────────────────────────────────
function mostrarMensaje(html, tipo) {
    let box = document.getElementById('msg-registro');
    if (!box) {
        box = document.createElement('div');
        box.id = 'msg-registro';
        box.style.cssText = `
            margin: 12px 0 0;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.85rem;
            line-height: 1.5;
            text-align: left;
        `;
        registroForm.after(box);
    }
    box.innerHTML = html;
    box.style.background = tipo === 'error' ? '#ffeaea' : '#eaffea';
    box.style.border      = tipo === 'error' ? '2px solid #f38ba8' : '2px solid #a8e6cf';
    box.style.color       = tipo === 'error' ? '#c0392b' : '#27ae60';
}

// ── Traducción de errores de Supabase ────────────────────────
function traducirError(msg) {
    if (msg.includes('already registered') || msg.includes('already been registered'))
        return 'Este correo ya está registrado. ¿Quieres iniciar sesión?';
    if (msg.includes('invalid email'))
        return 'El correo electrónico no es válido.';
    if (msg.includes('Password should be'))
        return 'La contraseña debe tener al menos 6 caracteres.';
    if (msg.includes('rate limit'))
        return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
    return msg;
}

// ── Lluvia de Monedas Interactivas ───────────────────────────
const rainContainer = document.getElementById('rain-container');
const foods = ['Apple-128.png', 'Carrot-128.png', 'Fish-128.png'];

function createCoin() {
    if (!rainContainer) return;
    const coin = document.createElement('img');
    coin.src       = '../assets/coins/Coins-3-128.png';
    coin.className = 'coin-rain';
    const side = Math.random() > 0.5 ? 'left' : 'right';
    coin.style.left = (side === 'left' ? Math.random() * 20 : 80 + Math.random() * 15) + 'vw';
    coin.style.top  = '-60px';
    const duration  = 3 + Math.random() * 4;
    coin.style.animationDuration = duration + 's';
    coin.addEventListener('mousedown', function () {
        const rect      = this.getBoundingClientRect();
        const foodItem  = document.createElement('img');
        foodItem.src    = `../assets/food/${foods[Math.floor(Math.random() * foods.length)]}`;
        foodItem.className = 'food-pop';
        foodItem.style.left = rect.left + 'px';
        foodItem.style.top  = rect.top  + 'px';
        document.body.appendChild(foodItem);
        this.remove();
        setTimeout(() => { if (foodItem.parentNode) foodItem.remove(); }, 800);
    });
    rainContainer.appendChild(coin);
    setTimeout(() => { if (coin.parentNode) coin.remove(); }, duration * 1000);
}

setInterval(createCoin, 800);