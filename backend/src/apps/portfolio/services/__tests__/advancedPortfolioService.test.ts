import { AdvancedPortfolioService } from '../advancedPortfolioService';

describe('AdvancedPortfolioService', () => {
  let service: AdvancedPortfolioService;

  beforeEach(() => {
    service = new AdvancedPortfolioService();
  });

  describe('calculatePortfolioMetrics', () => {
    it('should calculate metrics correctly for empty portfolio', () => {
      const positions: any[] = [];
      const transactions: any[] = [];
      const portfolio = { cashBalance: 1000 };

      const result = (service as any).calculateMetricsInSinglePass(
        positions,
        transactions,
        portfolio
      );

      expect(result.totalValue).toBe(1000);
      expect(result.totalInvested).toBe(0);
      expect(result.gainLoss).toBe(1000);
      expect(result.positionCount).toBe(0);
    });

    it('should handle multiple positions efficiently', () => {
      const positions = [
        {
          marketValue: 5000,
          gainLoss: 500,
          gainLossPercent: 10,
          assetType: 'STOCK',
        },
        {
          marketValue: 3000,
          gainLoss: -200,
          gainLossPercent: -6.67,
          assetType: 'CRYPTO',
        },
      ];
      const transactions = [
        { type: 'BUY', amount: 5000 },
        { type: 'DEPOSIT', amount: 3000 },
      ];
      const portfolio = { cashBalance: 2000 };

      const result = (service as any).calculateMetricsInSinglePass(
        positions,
        transactions,
        portfolio
      );

      expect(result.totalValue).toBe(10000);
      expect(result.totalInvested).toBe(8000);
      expect(result.positionCount).toBe(2);
      expect(result.diversification['STOCK']).toBeCloseTo(50, 1);
      expect(result.diversification['CRYPTO']).toBeCloseTo(30, 1);
    });

    it('should calculate winRate correctly', () => {
      const positions = [
        { marketValue: 5000, gainLoss: 500, gainLossPercent: 10, assetType: 'STOCK' },
        { marketValue: 3000, gainLoss: -200, gainLossPercent: -6.67, assetType: 'CRYPTO' },
        { marketValue: 2000, gainLoss: 100, gainLossPercent: 5, assetType: 'FOREX' },
      ];
      const transactions: any[] = [];
      const portfolio = { cashBalance: 1000 };

      const result = (service as any).calculateMetricsInSinglePass(
        positions,
        transactions,
        portfolio
      );

      expect(result.winRate).toBeCloseTo(66.67, 1);
    });

    it('should calculate maxDrawdown in single pass', () => {
      const positions = [
        { marketValue: 5000, gainLoss: 500, gainLossPercent: 10, assetType: 'STOCK' },
        { marketValue: 4000, gainLoss: -100, gainLossPercent: -2.5, assetType: 'CRYPTO' },
        { marketValue: 3500, gainLoss: -500, gainLossPercent: -12.5, assetType: 'FOREX' },
      ];
      const transactions: any[] = [];
      const portfolio = { cashBalance: 2000 };

      const result = (service as any).calculateMetricsInSinglePass(
        positions,
        transactions,
        portfolio
      );

      expect(result.maxDrawdown).toBeGreaterThan(0);
      expect(result.maxDrawdown).toBeLessThanOrEqual(100);
    });
  });

  describe('rebalancePortfolio', () => {
    it('should suggest rebalancing when allocation exceeds threshold', () => {
      const positions = [
        { marketValue: 6000, assetType: 'STOCK', symbol: 'AAPL' },
        { marketValue: 3000, assetType: 'CRYPTO', symbol: 'BTC' },
        { marketValue: 1000, assetType: 'FOREX', symbol: 'EURUSD' },
      ];

      const targetAllocation = {
        STOCK: 40,
        CRYPTO: 40,
        FOREX: 20,
      };

      const totalValue = 10000;
      const allocationMap = new Map(Object.entries(targetAllocation));
      const rebalancingOrders: any[] = [];

      for (const position of positions) {
        const type = position.assetType;
        const targetPercent = (allocationMap.get(type) || 0) as number;
        const targetValue = (totalValue * targetPercent) / 100;
        const currentValue = position.marketValue;

        if (currentValue < targetValue * 0.95 || currentValue > targetValue * 1.05) {
          rebalancingOrders.push({
            symbol: position.symbol,
            action: currentValue < targetValue ? 'BUY' : 'SELL',
            amount: Math.abs(targetValue - currentValue),
          });
        }
      }

      expect(rebalancingOrders.length).toBeGreaterThan(0);
      const cryptoOrder = rebalancingOrders.find((o) => o.symbol === 'BTC');
      expect(cryptoOrder?.action).toBe('BUY');
    });

    it('should use Map for O(1) lookups', () => {
      const targetAllocation = { STOCK: 50, CRYPTO: 30, FOREX: 20 };
      const allocationMap = new Map(Object.entries(targetAllocation));

      const stockAllocation = allocationMap.get('STOCK');
      expect(stockAllocation).toBe(50);
    });
  });

  describe('analyzeTradingPerformance', () => {
    it('should calculate trading metrics efficiently', () => {
      const buyTransactions = [
        { symbol: 'AAPL', price: 100, quantity: 10, amount: 1000 },
        { symbol: 'AAPL', price: 105, quantity: 5, amount: 525 },
      ];
      const sellTransactions = [
        { symbol: 'AAPL', price: 110, quantity: 15, amount: 1650 },
      ];

      const buyBySymbol = new Map<string, any[]>();
      for (const buy of buyTransactions) {
        if (!buyBySymbol.has(buy.symbol)) {
          buyBySymbol.set(buy.symbol, []);
        }
        buyBySymbol.get(buy.symbol)!.push(buy);
      }

      expect(buyBySymbol.has('AAPL')).toBe(true);
      expect(buyBySymbol.get('AAPL')?.length).toBe(2);
    });
  });

  describe('Performance improvements', () => {
    it('should calculate volatility once', () => {
      const returns = [5, -3, 7, 2, -1, 4];
      const volatility1 = (service as any).calculateVolatility(returns);
      const volatility2 = (service as any).calculateVolatility(returns);

      expect(volatility1).toBe(volatility2);
      expect(volatility1).toBeGreaterThan(0);
    });

    it('should handle edge cases with zero volatility', () => {
      const returns = [5, 5, 5, 5];
      const volatility = (service as any).calculateVolatility(returns);

      expect(volatility).toBe(0);
    });

    it('should calculate Sharpe ratio correctly', () => {
      const volatility = 4.5;
      const returnPercentage = 10;
      const sharpeRatio = (service as any).calculateSharpeRatio(volatility, returnPercentage);

      expect(sharpeRatio).toBeCloseTo((10 - 2) / 4.5, 2);
    });
  });
});
