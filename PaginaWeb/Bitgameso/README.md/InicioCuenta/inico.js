const loginForm = document.getElementById('form-login');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usuarioIngresado = document.getElementById('login-usuario').value.trim();
        const passIngresada = document.getElementById('login-pass').value;
        const datosGuardados = JSON.parse(localStorage.getItem('usuarioRegistrado'));

        if (!datosGuardados) {
            alert('No hay ningún usuario registrado todavía. ¡Ve a la página de registro!');
            return;
        }

        if (usuarioIngresado === datosGuardados.nombre && passIngresada === datosGuardados.pass) {
            alert(`¡Bienvenido de nuevo, ${datosGuardados.nombre}!`);
            window.location.href = '../Game/game.html';
            return;
        }

        alert('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
    });
}
