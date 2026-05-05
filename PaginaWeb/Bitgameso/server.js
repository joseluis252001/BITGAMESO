const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const WEB_ROOT = path.join(__dirname, 'README.md');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const randomNormal = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const marketSeed = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', basePrice: 192.5, volatility: 0.011, stepLimit: 0.03 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', basePrice: 415.8, volatility: 0.01, stepLimit: 0.028 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', basePrice: 1040.0, volatility: 0.014, stepLimit: 0.04 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', basePrice: 184.2, volatility: 0.018, stepLimit: 0.05 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', basePrice: 186.9, volatility: 0.012, stepLimit: 0.03 },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', basePrice: 68000.0, volatility: 0.022, stepLimit: 0.07 },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', basePrice: 3400.0, volatility: 0.024, stepLimit: 0.075 },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', basePrice: 158.0, volatility: 0.03, stepLimit: 0.09 },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto', basePrice: 0.59, volatility: 0.032, stepLimit: 0.1 },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto', basePrice: 0.18, volatility: 0.04, stepLimit: 0.12 }
];

const assets = marketSeed.map((asset, index) => ({
  id: index + 1,
  symbol: asset.symbol,
  name: asset.name,
  type: asset.type,
  basePrice: asset.basePrice,
  price: asset.basePrice,
  volatility: asset.volatility,
  stepLimit: asset.stepLimit,
  drift: (Math.random() - 0.5) * 0.002,
  lastChangePercent: 0
}));

let lastUpdatedAt = new Date().toISOString();

const updateAssetPrice = (asset) => {
  const noise = randomNormal() * asset.volatility;
  const meanReversion = ((asset.basePrice - asset.price) / asset.basePrice) * 0.02;
  const rawChangePercent = asset.drift + noise + meanReversion;
  const changePercent = clamp(rawChangePercent, -asset.stepLimit, asset.stepLimit);
  const nextPrice = Math.max(0.01, asset.price * (1 + changePercent));

  asset.price = Number(nextPrice.toFixed(4));
  asset.lastChangePercent = Number((changePercent * 100).toFixed(2));
};

const tickMarket = () => {
  assets.forEach(updateAssetPrice);
  lastUpdatedAt = new Date().toISOString();
};

setInterval(tickMarket, 5000);

app.use(express.static(WEB_ROOT));

app.get('/api/market', (req, res) => {
  res.json({
    updatedAt: lastUpdatedAt,
    assets: assets.map((asset) => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      price: Number(asset.price.toFixed(2)),
      changePercent: asset.lastChangePercent
    }))
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(WEB_ROOT, 'PaginaMenu', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
