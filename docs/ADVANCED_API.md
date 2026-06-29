# TradeHub API Advanced Features Documentation

## Portfolio Analysis & Management

### Get Portfolio Metrics
```bash
GET /api/v1/portfolio/advanced/:id/metrics
```
Returns comprehensive portfolio metrics including:
- Total value and invested amount
- Gain/loss calculations
- Win rate and position count
- Volatility and Sharpe Ratio
- Maximum drawdown
- Diversification breakdown

### Get Trading Performance
```bash
GET /api/v1/portfolio/advanced/:id/performance
```
Analyzes trading performance:
- Total trades and win rate
- Profit/loss statistics
- Average win/loss
- Profit factor

### Rebalance Portfolio
```bash
POST /api/v1/portfolio/advanced/:id/rebalance
Body: { targetAllocation: { STOCK: 40, CRYPTO: 30, FOREX: 20, COMMODITIES: 10 } }
```
Suggests rebalancing orders based on target allocation.

## Risk Management

### Assess Portfolio Risk
```bash
GET /api/v1/portfolio/risk/assessment/:portfolioId
```
Comprehensive risk assessment including:
- Risk score (0-100)
- Position concentration analysis
- Leverage risk
- Volatility risk
- Correlation risk
- Risk recommendations

### Suggest Stop Loss
```bash
POST /api/v1/portfolio/risk/stop-loss/suggest
Body: { symbol: "BTC/USD", entryPrice: 50000, riskPercentage: 2 }
```
Calculates optimal stop-loss price.

### Suggest Take Profit
```bash
POST /api/v1/portfolio/risk/take-profit/suggest
Body: { symbol: "BTC/USD", entryPrice: 50000, rewardRatio: 2 }
```
Calculates optimal take-profit price based on reward ratio.

### Check Position Sizing
```bash
POST /api/v1/portfolio/risk/position-sizing
Body: { portfolioValue: 100000, riskPercentage: 2, symbol: "BTC/USD" }
```
Recommends optimal position size based on portfolio value and risk.

### Monitor Risk Exposure
```bash
GET /api/v1/portfolio/risk/exposure/:portfolioId
```
Monitors:
- Long exposure
- Short exposure
- Hedge ratio
- Net exposure

## Market Analysis

### Get Price with Technical Indicators
```bash
GET /api/v1/market/advanced/technical/:symbol
```
Returns price data with:
- RSI (Relative Strength Index)
- MACD (Moving Average Convergence Divergence)
- Bollinger Bands
- Volume data

### Get Multiple Prices (Batch)
```bash
POST /api/v1/market/advanced/technical/batch
Body: { symbols: ["BTC/USD", "ETH/USD", "AAPL"] }
```
Fetch multiple prices with indicators in one request.

### Get Market Sentiment
```bash
GET /api/v1/market/advanced/sentiment/:symbol
```
Returns sentiment analysis:
- BULLISH (RSI > 70)
- BEARISH (RSI < 30)
- NEUTRAL

### Get Asset Correlation
```bash
POST /api/v1/market/advanced/correlation
Body: { symbol1: "BTC/USD", symbol2: "ETH/USD" }
```
Analyzes correlation between two assets.

### Convert Currency
```bash
POST /api/v1/market/advanced/convert
Body: { amount: 1000, from: "USD", to: "EUR" }
```
Convert between currencies.

## Strategy Management

### Create Strategy
```bash
POST /api/v1/strategies
Body: {
  name: "RSI Momentum",
  description: "Trades on RSI extremes",
  type: "AUTOMATED",
  logic: "if RSI > 70 then SELL; if RSI < 30 then BUY",
  targetSymbols: ["BTC/USD", "ETH/USD"],
  capital: 10000,
  riskPerTrade: 2
}
```

### List Strategies
```bash
GET /api/v1/strategies
```

### Get Strategy Details
```bash
GET /api/v1/strategies/:id
```

### Update Strategy
```bash
PUT /api/v1/strategies/:id
Body: { name, description, logic, targetSymbols, status }
```

### Activate Strategy
```bash
POST /api/v1/strategies/:id/activate
```

### Pause Strategy
```bash
POST /api/v1/strategies/:id/pause
```

### Delete Strategy
```bash
DELETE /api/v1/strategies/:id
```

## Backtesting

### Backtest Strategy
```bash
POST /api/v1/trading/backtest/backtest
Body: {
  strategy: { name, logic, capital, riskPerTrade },
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  historicalData: [...]
}
```
Returns backtest results:
- Final balance
- Total return percentage
- Win rate
- Profit factor
- Maximum drawdown

### Optimize Strategy
```bash
POST /api/v1/trading/backtest/optimize
Body: { strategy: {...}, parameters: {...} }
```
Optimizes strategy parameters using genetic algorithm.

## Watchlist Management

### Get All Watchlists
```bash
GET /api/v1/watchlists
```

### Create Watchlist
```bash
POST /api/v1/watchlists
Body: { name: "Tech Stocks", description: "...", symbols: ["AAPL", "MSFT", "GOOGL"] }
```

### Update Watchlist
```bash
PUT /api/v1/watchlists/:id
Body: { name, description, symbols }
```

### Add Symbol to Watchlist
```bash
POST /api/v1/watchlists/:id/symbols
Body: { symbol: "TSLA" }
```

### Remove Symbol from Watchlist
```bash
DELETE /api/v1/watchlists/:id/symbols/:symbol
```

### Delete Watchlist
```bash
DELETE /api/v1/watchlists/:id
```

## Price Alerts

### Get All Alerts
```bash
GET /api/v1/alerts
```

### Create Alert
```bash
POST /api/v1/alerts
Body: {
  symbol: "BTC/USD",
  alertType: "PRICE_ABOVE",
  triggerPrice: 55000,
  notificationType: "EMAIL"
}
```
Alert types:
- PRICE_ABOVE
- PRICE_BELOW
- PERCENTAGE_CHANGE
- VOLUME_SPIKE
- MOVING_AVERAGE
- RSI
- MACD

### Update Alert
```bash
PUT /api/v1/alerts/:id
Body: { symbol, alertType, triggerPrice, isActive }
```

### Get Active Alerts
```bash
GET /api/v1/alerts/active
```

### Delete Alert
```bash
DELETE /api/v1/alerts/:id
```

## Advanced Order Management

### Place Order with Stop Loss & Take Profit
```bash
POST /api/v1/trading/orders
Body: {
  portfolioId: "...",
  symbol: "BTC/USD",
  orderType: "BUY",
  quantity: 1,
  entryPrice: 50000,
  stopLossPrice: 48000,
  takeProfitPrice: 55000
}
```

## Key Metrics Explained

### Sharpe Ratio
Measures risk-adjusted returns. Higher is better (typically >1 is good).

### Maximum Drawdown
Largest peak-to-trough decline. Lower is better (less than 20% is good).

### Profit Factor
Gross profit divided by gross loss. Higher is better (>1.5 is good).

### Win Rate
Percentage of profitable trades. Typically 40-60% is reasonable.

### Volatility
Measures price fluctuations. Lower is less risky.

---

For more details, see individual endpoint documentation.
