// Ejemplo para el formulario de registro
const formulario = document.querySelector('#form-registro');

if (formulario) {
    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Creamos un objeto con los datos (esto es formato JSON)
        const nuevoUsuario = {
            nombre: formulario.querySelector('input[type="text"]').value,
            email: formulario.querySelector('input[type="email"]').value
        };

        // Lo guardamos en el LocalStorage
        localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));

        alert("¡Datos guardados en el navegador con éxito!");
    });
}
document.getElementById('form-registro').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const pass1 = document.getElementById('pass1').value;
    const pass2 = document.getElementById('pass2').value;
    const fecha = new Date().toLocaleDateString(); // Obtiene la fecha actual

    // 1. Validación de contraseñas iguales
    if (pass1 !== pass2) {
        alert("¡Error! Las contraseñas no coinciden. Por favor, verifica.");
        return; // Detiene el registro
    }

    // 2. Simulación de envío de correo y registro exitoso
    const mensajeExito = `
        ¡Felicidades por registrarte en BitGameSo!
        
        Se ha enviado un mensaje de confirmación a: ${email}
        
        Tus datos de registro:
        - Usuario: ${nombre}
        - Contraseña: ${pass1}
        - Fecha de registro: ${fecha}
    `;

    alert(mensajeExito);

    // Opcional: Redirigir al inicio después de aceptar
    // window.location.href = "../PaginaMenu/index.html";
});

// Dentro de tu registro.js, cuando el registro es exitoso:
const nuevoUsuario = {
    nombre: nombre,
    email: email,
    pass: pass1 // Guardamos la contraseña para poder compararla luego
};

localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));