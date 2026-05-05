document.addEventListener('DOMContentLoaded', () => {
    // 1. NAVEGACIÓN (Tus funciones originales mejoradas)
    const btnQueEs = document.getElementById('btn-que-es');
    const btnProductos = document.getElementById('btn-productos');
    const sectionQueEs = document.getElementById('que-es-section');
    const sectionProductos = document.getElementById('productos-section');

    const scrollToSection = (section) => {
        section?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    btnQueEs?.addEventListener('click', () => scrollToSection(sectionQueEs));
    btnProductos?.addEventListener('click', () => scrollToSection(sectionProductos));

    // 2. ANIMACIÓN DE ENTRADA (Efecto para imágenes y texto)
    // Creamos un observador para detectar cuándo las secciones son visibles
    const observerOptions = {
        threshold: 0.2 // Se activa cuando el 20% de la sección es visible
    };

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Añadimos una clase de CSS para activar la animación
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                revealOnScroll.unobserve(entry.target); // Deja de observar una vez animado
            }
        });
    }, observerOptions);

    // Aplicamos el estilo inicial y observamos cada sección de contenido
    const secciones = document.querySelectorAll('.contenido');
    secciones.forEach(seccion => {
        // Estilo inicial "invisible" antes de la animación
        seccion.style.opacity = "0";
        seccion.style.transform = "translateY(30px)";
        seccion.style.transition = "all 0.8s ease-out";
        
        revealOnScroll.observe(seccion);
    });

    // 3. EFECTO DINÁMICO PARA EL LOGO (Opcional - Estilo Juego)
    const logo = document.querySelector('.logo-placeholder');
    if (logo) {
        logo.addEventListener('mouseover', () => {
            logo.style.transform = "scale(1.1) rotate(5deg)";
        });
        logo.addEventListener('mouseout', () => {
            logo.style.transform = "scale(1) rotate(0deg)";
        });
    }
});