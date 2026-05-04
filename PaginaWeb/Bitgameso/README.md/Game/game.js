// game.js - El motor de BITGAMESO con lógica de riesgo real
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar nombre de usuario desde localStorage
    const datosUsuario = JSON.parse(localStorage.getItem('usuarioRegistrado'));
    if (datosUsuario) {
        document.getElementById('nombre-usuario').textContent = datosUsuario.nombre;
    }

    // 2. Variables de estado del juego
    let monedas = 1000;
    let saludConejo = 50; 
    const listaActivos = document.getElementById('lista-activos');
    const monedasDisplay = document.getElementById('monedas-count');
    const mensajePet = document.getElementById('pet-message');

    // 3. Generador de 50 activos ficticios
    const categorias = ['COIN', 'STOCK', 'AI', 'NFT', 'BLOCK'];
    const sufijos = ['Alpha', 'Delta', 'Prime', 'Zenith', 'Nexus', 'Flux', 'Void', 'Nova'];

    for (let i = 1; i <= 50; i++) {
        const cat = categorias[Math.floor(Math.random() * categorias.length)];
        const suf = sufijos[Math.floor(Math.random() * sufijos.length)];
        const nombreInversion = `${cat}-${suf}-${i}`;
        const precioInicial = (Math.random() * 1000 + 10).toFixed(2);

        const assetDiv = document.createElement('div');
        assetDiv.className = 'asset-item';
        assetDiv.innerHTML = `
            <span>${nombreInversion}</span>
            <span class="price" id="price-${i}" data-precio-compra="0">$${precioInicial}</span>
            <div class="item-actions">
                <button onclick="operar('dep', ${i})">D</button>
                <button onclick="operar('com', ${i})">C</button>
                <button onclick="operar('ven', ${i})">V</button>
                <button onclick="operar('env', ${i})">E</button>
            </div>
            <div class="mini-chart" id="chart-${i}">➖</div>
        `;
        listaActivos.appendChild(assetDiv);

        simularMercado(i, parseFloat(precioInicial));
    }

    // 4. Simulación de mercado
    function simularMercado(id, precioActual) {
        setInterval(() => {
            const cambio = (Math.random() * 2 - 1) * (precioActual * 0.05);
            const nuevoPrecio = Math.max(1, precioActual + cambio);
            
            const precioLabel = document.getElementById(`price-${id}`);
            const chartLabel = document.getElementById(`chart-${id}`);

            if (nuevoPrecio > precioActual) {
                precioLabel.style.color = "#4CAF50"; // Verde
                chartLabel.textContent = "📈";
            } else {
                precioLabel.style.color = "#FF5252"; // Rojo
                chartLabel.textContent = "📉";
            }

            precioLabel.textContent = `$${nuevoPrecio.toFixed(2)}`;
            precioActual = nuevoPrecio;
        }, 3000);
    }

    // 5. Sistema de la mascota dinámico (Afectado por el mercado)
    setInterval(() => {
        // Pérdida de salud base
        saludConejo -= 0.5;

        // El conejo se estresa si ve muchos números rojos en pantalla
        const precios = document.querySelectorAll('.price');
        precios.forEach(p => {
            if (p.style.color === "rgb(255, 82, 82)") { // Si el color es rojo
                saludConejo -= 0.05; 
            }
        });

        actualizarMascota();
    }, 2000);

    function actualizarMascota() {
        saludConejo = Math.max(0, Math.min(100, saludConejo)); // Mantener entre 0 y 100
        
        if (saludConejo > 80) {
            mensajePet.textContent = "¡El conejo está gordito y feliz! 🐰✨";
            mensajePet.style.color = "#4CAF50";
        } else if (saludConejo > 30) {
            mensajePet.textContent = "El conejo tiene hambre... 🥕";
            mensajePet.style.color = "#FF9800";
        } else if (saludConejo > 0) {
            mensajePet.textContent = "¡El conejo está muy débil! 😰";
            mensajePet.style.color = "#FF5252";
        } else {
            mensajePet.textContent = "El conejo ha muerto... 💀";
            alert("GAME OVER: El mercado acabó con tu mascota.");
            location.reload();
        }
    }

    // 6. Función de operaciones con lógica de "Números Rojos"
    window.operar = (tipo, id) => {
        const precioLabel = document.getElementById(`price-${id}`);
        const precioActual = parseFloat(precioLabel.textContent.replace('$', ''));
        
        if (tipo === 'com') {
            if (monedas >= precioActual) {
                monedas -= precioActual;
                precioLabel.dataset.precioCompra = precioActual; // Guardamos precio de compra
                alert(`Compraste a $${precioActual.toFixed(2)}`);
            } else {
                alert("No tienes suficientes monedas.");
            }
        } 
        
        else if (tipo === 'ven') {
            const precioCompra = parseFloat(precioLabel.dataset.precioCompra);
            
            if (precioCompra === 0) {
                alert("No tienes este activo para vender.");
                return;
            }

            if (precioActual < precioCompra) {
                // VENTA EN PÉRDIDA (NÚMEROS ROJOS)
                const perdida = precioCompra - precioActual;
                saludConejo -= 15; // Castigo al conejo
                alert(`¡Venta en rojo! Perdiste $${perdida.toFixed(2)}. El conejo sufre.`);
            } else {
                // VENTA EN GANANCIA
                const ganancia = precioActual - precioCompra;
                saludConejo += 20; // Recompensa al conejo
                alert(`¡Excelente! Ganaste $${ganancia.toFixed(2)}. El conejo come feliz.`);
            }

            monedas += precioActual;
            precioLabel.dataset.precioCompra = "0"; // Resetear compra
        }
        
        monedasDisplay.textContent = monedas.toFixed(2);
        actualizarMascota();
    };
});