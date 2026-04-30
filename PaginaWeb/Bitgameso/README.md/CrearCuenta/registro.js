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