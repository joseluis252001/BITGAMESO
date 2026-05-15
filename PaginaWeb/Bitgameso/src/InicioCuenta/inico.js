// ============================================================
//  BITGAMESO — inico.js  (Supabase Auth)
//  Login real + recuperación de contraseña
// ============================================================

import { supabase } from '../Supabase/supabase-client.js';

// ── Login ────────────────────────────────────────────────────
const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailOUsuario = document.getElementById('login-usuario').value.trim();
        const pass          = document.getElementById('login-pass').value;

        const btn           = loginForm.querySelector('button[type="submit"]');
        btn.disabled        = true;
        btn.textContent     = 'Entrando...';

        // Supabase Auth requiere email. Si el usuario escribió un username,
        // buscamos su email en la tabla profiles.
        let emailFinal = emailOUsuario;

        if (!emailOUsuario.includes('@')) {
            // Buscar email por username
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .ilike('username', emailOUsuario)
                .maybeSingle();

            if (!profile) {
                mostrarMensaje('Usuario no encontrado. Verifica tu nombre de usuario.', 'error');
                btn.disabled    = false;
                btn.textContent = 'Entrar';
                return;
            }
            emailFinal = profile.email;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email:    emailFinal,
            password: pass
        });

        btn.disabled    = false;
        btn.textContent = 'Entrar';

        if (error) {
            mostrarMensaje(traducirError(error.message), 'error');
            return;
        }

        // Guardar nombre en localStorage para compatibilidad con el juego
        const username = data.user.user_metadata?.username || emailFinal.split('@')[0];
        localStorage.setItem('bitgameso_sesion_activa', username);
        localStorage.setItem('bitgameso_user_id', data.user.id);

        window.location.href = '../Game/game.html';
    });
}

// ── Recuperar contraseña ─────────────────────────────────────
const btnOlvide = document.getElementById('btn-olvide');

if (btnOlvide) {
    btnOlvide.addEventListener('click', async () => {
        const emailInput = document.getElementById('login-usuario').value.trim();

        // Pedir email si el campo está vacío o tiene username
        let email = emailInput.includes('@') ? emailInput : '';

        if (!email) {
            email = prompt('Escribe tu correo electrónico para recuperar tu contraseña:');
            if (!email || !email.includes('@')) {
                mostrarMensaje('Por favor escribe un correo válido.', 'error');
                return;
            }
        }

        btnOlvide.disabled    = true;
        btnOlvide.textContent = 'Enviando...';

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `https://www.bitgameso.com/PaginaWeb/Bitgameso/src/InicioCuenta/reset-password.html`
        });

        btnOlvide.disabled    = false;
        btnOlvide.textContent = '¿Olvidaste tu contraseña?';

        if (error) {
            mostrarMensaje(traducirError(error.message), 'error');
        } else {
            mostrarMensaje(
                `📧 Te enviamos un enlace de recuperación a <b>${email}</b>.<br>
                 Revisa tu bandeja de entrada (y la carpeta spam).`,
                'success'
            );
        }
    });
}

// ── Mensaje de feedback ──────────────────────────────────────
function mostrarMensaje(html, tipo) {
    let box = document.getElementById('msg-login');
    if (!box) {
        box = document.createElement('div');
        box.id = 'msg-login';
        box.style.cssText = `
            margin: 12px 0 0;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.85rem;
            line-height: 1.5;
            text-align: left;
        `;
        loginForm.after(box);
    }
    box.innerHTML = html;
    box.style.background = tipo === 'error' ? '#ffeaea' : '#eaffea';
    box.style.border      = tipo === 'error' ? '2px solid #f38ba8' : '2px solid #a8e6cf';
    box.style.color       = tipo === 'error' ? '#c0392b' : '#27ae60';
}

// ── Traducción de errores ────────────────────────────────────
function traducirError(msg) {
    if (msg.includes('Invalid login') || msg.includes('invalid credentials'))
        return 'Correo o contraseña incorrectos. Intenta de nuevo.';
    if (msg.includes('Email not confirmed'))
        return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.';
    if (msg.includes('rate limit'))
        return 'Demasiados intentos. Espera unos minutos.';
    return msg;
}