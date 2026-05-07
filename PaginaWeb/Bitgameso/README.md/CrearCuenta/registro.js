const registroForm = document.getElementById('form-registro');

// 1. Lógica del Formulario
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

// 2. Lógica de la Lluvia de Monedas Interactivas
const rainContainer = document.getElementById('rain-container');
const foods = ['Apple-128.png', 'Carrot-128.png', 'Fish-128.png'];

function createCoin() {
    const coin = document.createElement('img');
    coin.src = '../assets/coins/Coins-3-128.png';
    coin.className = 'coin-rain';
    
    // Posición aleatoria en los laterales
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const posX = side === 'left' ? Math.random() * 20 : 80 + Math.random() * 15;
    
    coin.style.left = posX + 'vw';
    coin.style.top = '-60px';
    
    // Velocidad aleatoria
    const duration = 3 + Math.random() * 4;
    coin.style.animationDuration = duration + 's';

    // EVENTO AL HACER CLIC
    coin.addEventListener('mousedown', function() {
        // 1. Obtener posición actual de la moneda antes de borrarla
        const rect = this.getBoundingClientRect();
        
        // 2. Crear el alimento
        const foodItem = document.createElement('img');
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        foodItem.src = `../assets/food/${randomFood}`;
        foodItem.className = 'food-pop';
        
        // 3. Posicionar el alimento exactamente donde estaba la moneda
        foodItem.style.left = rect.left + 'px';
        foodItem.style.top = rect.top + 'px';
        
        // 4. Agregar al body y eliminar la moneda
        document.body.appendChild(foodItem);
        this.remove(); 
        
        // 5. Eliminar el alimento después de su animación
        setTimeout(() => {
            if(foodItem.parentNode) foodItem.remove();
        }, 800);
    });

    rainContainer.appendChild(coin);

    // Limpiar si nadie le da clic
    setTimeout(() => { 
        if(coin.parentNode) coin.remove(); 
    }, duration * 1000);
}

// Crear monedas cada 800ms
setInterval(createCoin, 800);