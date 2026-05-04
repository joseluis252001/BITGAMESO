// script.js - BITGAMESO
document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('nav button');

    // Solo dejamos funciones para los botones que NO tienen enlace <a>
    
    // Botón ¿Qué es?
    botones[0].addEventListener('click', () => {
        alert("¡Bienvenido a BITGAMESO!");
    });

    // Botón Productos
    botones[1].addEventListener('click', () => {
        window.scrollTo({
            top: 700,
            behavior: 'smooth'
        });
    });

    // IMPORTANTE: No pongas botones[2] ni botones[3] aquí.
    // Al dejarlos vacíos en JS, el navegador usará el enlace <a> del HTML.
});