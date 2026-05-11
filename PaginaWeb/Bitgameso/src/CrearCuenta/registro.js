// ============================================================
//  BITGAMESO — registro.js
//  Guarda lista de usuarios en localStorage
// ============================================================

const registroForm = document.getElementById('form-registro');

if (registroForm) {
    registroForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const email  = document.getElementById('email').value.trim();
        const pass1  = document.getElementById('pass1').value;
        const pass2  = document.getElementById('pass2').value;

        if (pass1 !== pass2) {
            alert('Las contraseñas no coinciden. Verifica e intenta otra vez.');
            return;
        }

        // Cargar lista de usuarios existente (puede haber varios)
        const usuarios = JSON.parse(localStorage.getItem('bitgameso_usuarios') || '[]');

        // Verificar que el nombre de usuario no esté tomado
        const yaExiste = usuarios.some(u => u.nombre.toLowerCase() === nombre.toLowerCase());
        if (yaExiste) {
            alert(`El usuario "${nombre}" ya existe. Elige otro nombre.`);
            return;
        }

        // Agregar nuevo usuario a la lista
        usuarios.push({
            nombre,
            email,
            pass: pass1,
            fechaRegistro: new Date().toISOString()
        });

        localStorage.setItem('bitgameso_usuarios', JSON.stringify(usuarios));
        alert(`¡Registro exitoso, ${nombre}! Ahora inicia sesión.`);
        window.location.href = '../InicioCuenta/inico.html';
    });
}

// ============================================================
//  Lluvia de Monedas Interactivas (sin cambios)
// ============================================================
const rainContainer = document.getElementById('rain-container');
const foods = ['Apple-128.png', 'Carrot-128.png', 'Fish-128.png'];

function createCoin() {
    const coin = document.createElement('img');
    coin.src = '../assets/coins/Coins-3-128.png';
    coin.className = 'coin-rain';

    const side = Math.random() > 0.5 ? 'left' : 'right';
    const posX = side === 'left' ? Math.random() * 20 : 80 + Math.random() * 15;
    coin.style.left = posX + 'vw';
    coin.style.top = '-60px';

    const duration = 3 + Math.random() * 4;
    coin.style.animationDuration = duration + 's';

    coin.addEventListener('mousedown', function () {
        const rect = this.getBoundingClientRect();
        const foodItem = document.createElement('img');
        const randomFood = foods[Math.floor(Math.random() * foods.length)];
        foodItem.src = `../assets/food/${randomFood}`;
        foodItem.className = 'food-pop';
        foodItem.style.left = rect.left + 'px';
        foodItem.style.top  = rect.top  + 'px';
        document.body.appendChild(foodItem);
        this.remove();
        setTimeout(() => { if (foodItem.parentNode) foodItem.remove(); }, 800);
    });

    rainContainer.appendChild(coin);
    setTimeout(() => { if (coin.parentNode) coin.remove(); }, duration * 1000);
}

setInterval(createCoin, 800);