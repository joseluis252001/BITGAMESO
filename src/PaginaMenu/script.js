document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================
    // 1. SISTEMA DE MASCOTAS ALEATORIAS (Sin repetición)
    // =========================================
    const nombresPets = [
        'Bear-100.png',
        'Bird-128.png',
        'Bunny-Pink-128.png',
        'Cat-Beige-128.png',
        'Cat-Blue-128.png',
        'Cat-Pink-128.png',
        'Cat-Tiger-128.png',
        'Cat-White-128.png',
        'Frog-128.png',
        'Penguin-128.png',
        'Shark-128.png'
    ];

    // Mezclamos la lista de pets al azar
    const petsMezclados = nombresPets.sort(() => Math.random() - 0.5);

    // Seleccionamos solo las imágenes que tengan la clase 'pet-random'
    const imagenesPets = document.querySelectorAll('.pet-random');

    imagenesPets.forEach((img, index) => {
        // Asignamos un pet de la lista mezclada según el índice (así no se repiten)
        if (petsMezclados[index]) {
            img.src = `../assets/pets/${petsMezclados[index]}`;
        }
    });

    // =========================================
    // 2. NAVEGACIÓN (Smooth Scroll)
    // =========================================
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

    // =========================================
    // 3. ANIMACIÓN DE ENTRADA (Intersection Observer)
    // =========================================
    const observerOptions = {
        threshold: 0.2 
    };

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                revealOnScroll.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const secciones = document.querySelectorAll('.contenido');
    secciones.forEach(seccion => {
        seccion.style.opacity = "0";
        seccion.style.transform = "translateY(30px)";
        seccion.style.transition = "all 0.8s ease-out";
        revealOnScroll.observe(seccion);
    });

    // =========================================
    // 4. EFECTO INTERACTIVO EN EL LOGO
    // =========================================
    const logoImg = document.querySelector('.main-logo');
    if (logoImg) {
        logoImg.style.transition = "transform 0.3s ease";
        logoImg.addEventListener('mouseover', () => {
            logoImg.style.transform = "scale(1.1) rotate(5deg)";
        });
        logoImg.addEventListener('mouseout', () => {
            logoImg.style.transform = "scale(1) rotate(0deg)";
        });
    }
});