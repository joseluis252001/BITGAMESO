// ============================================================
//  BITGAMESO — inicio.js (inico.js)
//  Login con lista de múltiples usuarios
// ============================================================

const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usuarioIngresado = document.getElementById('login-usuario').value.trim();
        const passIngresada    = document.getElementById('login-pass').value;

        // --- Compatibilidad hacia atrás: sistema antiguo de un solo usuario ---
        const datosViejos = JSON.parse(localStorage.getItem('usuarioRegistrado') || 'null');
        if (datosViejos && !localStorage.getItem('bitgameso_usuarios')) {
            // Migrar usuario antiguo al nuevo sistema
            localStorage.setItem('bitgameso_usuarios', JSON.stringify([datosViejos]));
            localStorage.removeItem('usuarioRegistrado');
        }

        // --- Sistema nuevo: lista de usuarios ---
        const usuarios = JSON.parse(localStorage.getItem('bitgameso_usuarios') || '[]');

        if (usuarios.length === 0) {
            alert('No hay ningún usuario registrado. ¡Ve a la página de registro!');
            return;
        }

        const usuario = usuarios.find(
            u => u.nombre.toLowerCase() === usuarioIngresado.toLowerCase()
               && u.pass === passIngresada
        );

        if (usuario) {
            // Guardar sesión activa con el nombre exacto del usuario
            localStorage.setItem('bitgameso_sesion_activa', usuario.nombre);
            alert(`¡Bienvenido de nuevo, ${usuario.nombre}!`);
            window.location.href = '../Game/game.html';
        } else {
            alert('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
        }
    });
}