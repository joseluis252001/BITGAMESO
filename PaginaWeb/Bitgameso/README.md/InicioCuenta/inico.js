document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();

    const usuarioIngresado = document.getElementById('login-usuario').value;
    const passIngresada = document.getElementById('login-pass').value;

    // Recuperamos los datos que guardamos en el registro
    const datosGuardados = JSON.parse(localStorage.getItem('usuarioRegistrado'));

    if (datosGuardados) {
        // Verificamos si coinciden
        if (usuarioIngresado === datosGuardados.nombre && passIngresada === datosGuardados.pass) {
            alert(`¡Bienvenido de nuevo, ${datosGuardados.nombre}! Redirigiendo...`);
            window.location.href = "index.html"; // Te envía a la página principal
        } else {
            alert("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
        }
    } else {
        alert("No hay ningún usuario registrado todavía. ¡Ve a la página de registro!");
    }
});