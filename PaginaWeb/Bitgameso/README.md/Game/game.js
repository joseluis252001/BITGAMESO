document.addEventListener('DOMContentLoaded', () => {
    const state = {
        monedas: 1000,
        saludConejo: 75,
        selectedAssetId: null,
        market: new Map(),
        portfolio: new Map()
    };

    const refs = {
        username: document.getElementById('nombre-usuario'),
        marketUpdated: document.getElementById('market-updated'),
        marketList: document.getElementById('lista-activos'),
        monedasCount: document.getElementById('monedas-count'),
        portfolioTotal: document.getElementById('portfolio-total'),
        portfolioList: document.getElementById('portfolio-list'),
        petMessage: document.getElementById('pet-message'),
        petHealthFill: document.getElementById('pet-health-fill'),
        btnTutorial: document.getElementById('btn-tutorial'),
        btnDepositar: document.getElementById('btn-depositar'),
        btnComprar: document.getElementById('btn-comprar'),
        btnVender: document.getElementById('btn-vender'),
        btnEnviar: document.getElementById('btn-enviar')
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(value);

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);


    const updateCoins = () => {
        refs.monedasCount.textContent = state.monedas.toFixed(2);
    };

    const updatePet = () => {
        state.saludConejo = clamp(state.saludConejo, 0, 100);
        refs.petHealthFill.style.width = `${state.saludConejo}%`;

        if (state.saludConejo > 70) {
            refs.petMessage.textContent = 'El conejo está feliz y motivado para invertir.';
            refs.petMessage.style.color = '#22c55e';
        } else if (state.saludConejo > 35) {
            refs.petMessage.textContent = 'El conejo está estable, pero necesita atención.';
            refs.petMessage.style.color = '#f59e0b';
        } else if (state.saludConejo > 0) {
            refs.petMessage.textContent = 'El conejo está débil por el estrés del mercado.';
            refs.petMessage.style.color = '#ef4444';
        } else {
            refs.petMessage.textContent = 'GAME OVER: el conejo colapsó por volatilidad extrema.';
            refs.petMessage.style.color = '#ef4444';
        }
    };

    const calculatePortfolioTotals = () => {
        let total = 0;
        let invested = 0;

        state.portfolio.forEach((position, id) => {
            const marketAsset = state.market.get(id);
            if (!marketAsset) return;
            total += marketAsset.price * position.quantity;
            invested += position.avgBuyPrice * position.quantity;
        });

        return { total, invested };
    };

    const renderPortfolio = () => {
        if (state.portfolio.size === 0) {
            refs.portfolioList.innerHTML = '<li class="empty-state">Aún no tienes posiciones abiertas.</li>';
            refs.portfolioTotal.textContent = '$0.00';
            return;
        }

        const rows = [];
        state.portfolio.forEach((position, id) => {
            const asset = state.market.get(id);
            if (!asset) return;

            const currentValue = asset.price * position.quantity;
            const investedValue = position.avgBuyPrice * position.quantity;
            const pnlPercent = ((currentValue - investedValue) / investedValue) * 100;
            const pnlClass = pnlPercent >= 0 ? 'up' : 'down';

            rows.push(`
                <li class="portfolio-item">
                    <div>
                        <strong>${asset.symbol} · ${position.quantity}u</strong>
                        <small>Precio promedio: ${formatCurrency(position.avgBuyPrice)}</small>
                    </div>
                    <div class="change ${pnlClass}">
                        ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%
                    </div>
                </li>
            `);
        });

        refs.portfolioList.innerHTML = rows.join('');
        const totals = calculatePortfolioTotals();
        refs.portfolioTotal.textContent = `${formatCurrency(totals.total)} | PnL ${(totals.total - totals.invested >= 0 ? '+' : '')}${formatCurrency(totals.total - totals.invested)}`;
    };

    const renderMarket = () => {
        const assets = Array.from(state.market.values());

        if (assets.length === 0) {
            refs.marketList.innerHTML = '<p class="empty-state">No hay datos de mercado disponibles.</p>';
            return;
        }

        refs.marketList.innerHTML = assets
            .map((asset) => {
                const isSelected = state.selectedAssetId === asset.id ? 'selected' : '';
                const changeClass = asset.changePercent >= 0 ? 'up' : 'down';
                const changeSign = asset.changePercent >= 0 ? '+' : '';

                return `
                    <article class="asset-item ${isSelected}" data-asset-id="${asset.id}">
                        <div>
                            <div class="asset-symbol">${asset.symbol}</div>
                            <div class="asset-name">${asset.name}</div>
                        </div>
                        <span class="pill ${asset.type}">${asset.type}</span>
                        <strong>${formatCurrency(asset.price)}</strong>
                        <strong class="change ${changeClass}">${changeSign}${asset.changePercent.toFixed(2)}%</strong>
                        <div class="item-actions">
                            <button data-action="dep" data-id="${asset.id}" title="Depositar">D</button>
                            <button data-action="com" data-id="${asset.id}" title="Comprar">C</button>
                            <button data-action="ven" data-id="${asset.id}" title="Vender">V</button>
                            <button data-action="env" data-id="${asset.id}" title="Enviar">E</button>
                        </div>
                    </article>
                `;
            })
            .join('');
    };

    const buyAsset = (assetId) => {
        const asset = state.market.get(assetId);
        if (!asset) return;

        if (state.monedas < asset.price) {
            alert('No tienes suficientes monedas para comprar.');
            return;
        }

        const position = state.portfolio.get(assetId) || { quantity: 0, avgBuyPrice: 0 };
        const newQuantity = position.quantity + 1;
        const totalInvested = position.avgBuyPrice * position.quantity + asset.price;
        position.quantity = newQuantity;
        position.avgBuyPrice = totalInvested / newQuantity;
        state.portfolio.set(assetId, position);

        state.monedas -= asset.price;
        state.saludConejo += 1.2;
        updateCoins();
        updatePet();
        renderPortfolio();
    };

    const sellAsset = (assetId) => {
        const asset = state.market.get(assetId);
        const position = state.portfolio.get(assetId);
        if (!asset || !position || position.quantity <= 0) {
            alert('No tienes unidades de este activo para vender.');
            return;
        }

        const profit = asset.price - position.avgBuyPrice;
        position.quantity -= 1;
        if (position.quantity === 0) {
            state.portfolio.delete(assetId);
        } else {
            state.portfolio.set(assetId, position);
        }

        state.monedas += asset.price;
        state.saludConejo += profit >= 0 ? 4 : -8;
        updateCoins();
        updatePet();
        renderPortfolio();
    };

    const runAction = (action, assetId = state.selectedAssetId) => {
        if (!assetId || !state.market.has(assetId)) {
            alert('Selecciona un activo del mercado primero.');
            return;
        }

        if (action === 'dep') {
            state.monedas += 100;
            updateCoins();
            return;
        }

        if (action === 'com') {
            buyAsset(assetId);
            return;
        }

        if (action === 'ven') {
            sellAsset(assetId);
            return;
        }

        if (action === 'env') {
            if (state.monedas < 25) {
                alert('No tienes monedas suficientes para enviar apoyo.');
                return;
            }
            state.monedas -= 25;
            state.saludConejo += 6;
            updateCoins();
            updatePet();
        }
    };

    const fetchMarket = async () => {
        try {
            const response = await fetch('/api/market');
            if (!response.ok) throw new Error('Sin respuesta del servidor');
            const data = await response.json();

            data.assets.forEach((asset) => {
                state.market.set(asset.id, asset);
            });

            if (!state.selectedAssetId && data.assets.length > 0) {
                state.selectedAssetId = data.assets[0].id;
            }

            refs.marketUpdated.textContent = `Última actualización: ${new Date(data.updatedAt).toLocaleTimeString()}`;
            renderMarket();
            renderPortfolio();
        } catch (error) {
            refs.marketUpdated.textContent = 'No se pudo actualizar el mercado.';
        }
    };

    refs.marketList.addEventListener('click', (event) => {
        const actionButton = event.target.closest('button[data-action]');
        if (actionButton) {
            const action = actionButton.dataset.action;
            const assetId = Number(actionButton.dataset.id);
            state.selectedAssetId = assetId;
            runAction(action, assetId);
            renderMarket();
            return;
        }

        const row = event.target.closest('.asset-item');
        if (row) {
            state.selectedAssetId = Number(row.dataset.assetId);
            renderMarket();
        }
    });

    refs.btnDepositar.addEventListener('click', () => {
        state.monedas += 250;
        updateCoins();
    });

    refs.btnComprar.addEventListener('click', () => runAction('com'));
    refs.btnVender.addEventListener('click', () => runAction('ven'));
    refs.btnEnviar.addEventListener('click', () => runAction('env'));

    refs.btnTutorial.addEventListener('click', () => {
        alert('Selecciona un activo, compra en caídas y vende cuando estés en verde para mantener sano al conejo.');
    });

    const user = JSON.parse(localStorage.getItem('usuarioRegistrado'));
    refs.username.textContent = user?.nombre || 'Invitado';

    updateCoins();
    updatePet();
    fetchMarket();
    setInterval(fetchMarket, 5000);
    setInterval(() => {
        const negatives = Array.from(state.market.values()).filter((asset) => asset.changePercent < 0).length;
        state.saludConejo -= 0.9 + negatives * 0.12;
        updatePet();
    }, 5000);
});
