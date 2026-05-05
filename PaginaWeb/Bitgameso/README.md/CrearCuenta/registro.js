const registroForm = document.getElementById('form-registro');

if (registroForm) {
    registroForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const pass1 = document.getElementById('pass1').value;
        const pass2 = document.getElementById('pass2').value;

        if (pass1 !== pass2) {
            alert('Las contraseñas no coinciden. Verifica e intenta otra vez.');
            return;
        }

        const nuevoUsuario = {
            nombre,
            email,
            pass: pass1,
            fechaRegistro: new Date().toISOString()
        };

        localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));
        alert(`¡Registro exitoso, ${nombre}! Ahora inicia sesión.`);
        window.location.href = '../InicioCuenta/inico.html';
    });
}
