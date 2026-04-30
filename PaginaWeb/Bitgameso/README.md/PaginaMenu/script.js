// Esperamos a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Seleccionamos todos los botones dentro del nav
    const botones = document.querySelectorAll('nav button');

    // Botón 1: ¿Qué es?
    botones[0].addEventListener('click', () => {
        alert("¡Bienvenido a BITGAMESO! Somos una plataforma educativa sobre gaming y finanzas.");
    });

    // Botón 2: Productos
    botones[1].addEventListener('click', () => {
        // Esto desplaza la página hacia abajo suavemente
        window.scrollTo({
            top: 500,
            behavior: 'smooth'
        });
        console.log("El usuario está explorando los productos.");
    });

    // Botón 3: Iniciar Sesión
    botones[2].addEventListener('click', () => {
        const usuario = prompt("Ingresa tu nombre de usuario:");
        if (usuario) {
            alert(`Hola ${usuario}, ¡qué bueno verte de nuevo!`);
        }
    });

    // Botón 4: Crear Cuenta
    botones[3].addEventListener('click', () => {
        const confirmar = confirm("¿Quieres crear una cuenta nueva en BITGAMESO?");
        if (confirmar) {
            alert("¡Genial! Te redirigiremos al formulario de registro muy pronto.");
        }
    });

});