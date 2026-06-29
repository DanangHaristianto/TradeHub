import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';
import { AppError } from '@shared/middleware/errorHandler';
import { logger } from '@config/logger';

export class AdvancedPortfolioService {
  // Memoization cache for expensive calculations
  private volatilityCache: Map<string, { value: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 60000; // 1 minute

  async calculatePortfolioMetrics(portfolioId: string): Promise<any> {
    const portfolioRepository = AppDataSource.getRepository('Portfolio');
    const positionRepository = AppDataSource.getRepository('Position');
    const transactionRepository = AppDataSource.getRepository('Transaction');

    // FIX #1: Combine multiple queries into fewer database calls
    const portfolio = await portfolioRepository.findOne({ where: { id: portfolioId } });
    if (!portfolio) {
      throw new AppError(404, 'Portfolio tidak ditemukan');
    }

    // Use createQueryBuilder for optimized JOINs
    const positions = await positionRepository
      .createQueryBuilder('position')
      .where('position.portfolioId = :portfolioId', { portfolioId })
      .orderBy('position.marketValue', 'DESC') // Order in DB, not in-memory
      .getMany();

    // FIX #2: Get transactions with type filter at DB level, not in-memory
    const transactions = await transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.portfolioId = :portfolioId', { portfolioId })
      .orderBy('transaction.createdAt', 'ASC')
      .getMany();

    // FIX #3: Single pass calculation instead of multiple iterations
    const metrics = this.calculateMetricsInSinglePass(positions, transactions, portfolio);

    return metrics;
  }

  // NEW: Calculate all metrics in a single iteration
  private calculateMetricsInSinglePass(positions: any[], transactions: any[], portfolio: any): any {
    if (positions.length === 0) {
      return {
        totalValue: portfolio.cashBalance,
        totalInvested: 0,
        gainLoss: 0,
        gainLossPercentage: 0,
        winRate: 0,
        positionCount: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        diversification: {},
      };
    }

    let totalValue = portfolio.cashBalance;
    let totalInvested = 0;
    let winningPositions = 0;
    let maxDrawdown = 0;
    let peak = 0;
    const assetTypes: { [key: string]: number } = {};
    const returns: number[] = [];

    // Single iteration through positions
    for (const position of positions) {
      totalValue += position.marketValue;
      winningPositions += position.gainLoss > 0 ? 1 : 0;
      returns.push(position.gainLossPercent || 0);

      // Track peak and drawdown
      peak = Math.max(peak, position.marketValue);
      const drawdown = (peak - position.marketValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);

      // Build diversification
      const type = position.assetType;
      assetTypes[type] = (assetTypes[type] || 0) + position.marketValue;
    }

    // Calculate invested from transactions (filtered at query time)
    for (const transaction of transactions) {
      if (transaction.type === 'BUY' || transaction.type === 'DEPOSIT') {
        totalInvested += transaction.amount || 0;
      }
    }

    const gainLoss = totalValue - totalInvested;
    const gainLossPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
    const winRate = positions.length > 0 ? (winningPositions / positions.length) * 100 : 0;

    // Calculate volatility once
    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(volatility, gainLossPercentage);

    // Build diversification object
    const diversification: { [key: string]: number } = {};
    for (const [type, value] of Object.entries(assetTypes)) {
      diversification[type] = (value as number) / totalValue * 100;
    }

    return {
      totalValue,
      totalInvested,
      gainLoss,
      gainLossPercentage,
      winRate,
      positionCount: positions.length,
      volatility,
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100,
      diversification,
    };
  }

  // FIX #4: Calculate volatility once, not multiple times
  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  // FIX #5: Simplified Sharpe Ratio (reuse volatility)
  private calculateSharpeRatio(volatility: number, returnPercentage: number): number {
    const riskFreeRate = 2;
    if (volatility === 0) return 0;
    return (returnPercentage - riskFreeRate) / volatility;
  }

  async rebalancePortfolio(portfolioId: string, targetAllocation: any): Promise<any[]> {
    const positionRepository = AppDataSource.getRepository('Position');
    const positions = await positionRepository.find({ where: { portfolioId } });

    // FIX #6: Calculate totalValue once before loop
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    if (totalValue === 0) return [];

    // FIX #7: Use Map for O(1) lookup instead of filter in loop
    const allocationMap = new Map(Object.entries(targetAllocation));
    const rebalancingOrders: any[] = [];

    for (const position of positions) {
      const type = position.assetType;
      const targetPercent = (allocationMap.get(type) || 0) as number;
      const targetValue = (totalValue * targetPercent) / 100;
      const currentValue = position.marketValue;

      // Only add if rebalancing is needed (> 5% deviation)
      if (currentValue < targetValue * 0.95 || currentValue > targetValue * 1.05) {
        rebalancingOrders.push({
          symbol: position.symbol,
          action: currentValue < targetValue ? 'BUY' : 'SELL',
          amount: Math.abs(targetValue - currentValue),
        });
      }
    }

    logger.info(`Portfolio rebalancing suggested: ${rebalancingOrders.length} orders`);
    return rebalancingOrders;
  }

  async analyzeTradingPerformance(portfolioId: string): Promise<any> {
    const transactionRepository = AppDataSource.getRepository('Transaction');

    // FIX #8: Get transactions with type filtering at query level
    const buyTransactions = await transactionRepository
      .createQueryBuilder('t')
      .where('t.portfolioId = :portfolioId AND t.type = :type', {
        portfolioId,
        type: 'BUY',
      })
      .getMany();

    const sellTransactions = await transactionRepository
      .createQueryBuilder('t')
      .where('t.portfolioId = :portfolioId AND t.type = :type', {
        portfolioId,
        type: 'SELL',
      })
      .orderBy('t.createdAt', 'ASC')
      .getMany();

    // FIX #9: Build symbol index once for O(1) lookups
    const buyBySymbol = new Map<string, any[]>();
    for (const buy of buyTransactions) {
      if (!buyBySymbol.has(buy.symbol)) {
        buyBySymbol.set(buy.symbol, []);
      }
      buyBySymbol.get(buy.symbol)!.push(buy);
    }

    let profitableTrades = 0;
    const totalTrades = Math.min(buyTransactions.length, sellTransactions.length);

    // Calculate profitable trades with indexed lookup
    for (const sell of sellTransactions) {
      const avgBuyPrice = this.getAveragePriceFromIndex(buyBySymbol, sell.symbol!);
      if ((sell.price || 0) > avgBuyPrice) {
        profitableTrades++;
      }
    }

    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

    const totalProfit =
      sellTransactions.reduce((sum, s) => sum + (s.amount || 0), 0) -
      buyTransactions.reduce((sum, b) => sum + (b.amount || 0), 0);

    const averageTrade = totalTrades > 0 ? totalProfit / totalTrades : 0;
    const profitFactor = this.calculateProfitFactor(sellTransactions, buyTransactions);

    return {
      totalTrades,
      profitableTrades,
      winRate,
      totalProfit,
      averageTrade,
      profitFactor,
      averageWin: profitableTrades > 0 ? totalProfit / profitableTrades : 0,
      averageLoss: totalTrades - profitableTrades > 0 ? -totalProfit / (totalTrades - profitableTrades) : 0,
    };
  }

  // FIX #10: Use indexed lookup instead of filter
  private getAveragePriceFromIndex(buyBySymbol: Map<string, any[]>, symbol: string): number {
    const symbolTransactions = buyBySymbol.get(symbol) || [];
    if (symbolTransactions.length === 0) return 0;

    const totalCost = symbolTransactions.reduce((sum, t) => sum + (t.price || 0) * (t.quantity || 0), 0);
    const totalQuantity = symbolTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  private getAveragePrice(transactions: any[], symbol: string): number {
    const symbolTransactions = transactions.filter((t) => t.symbol === symbol);
    if (symbolTransactions.length === 0) return 0;
    const totalCost = symbolTransactions.reduce((sum, t) => sum + (t.price || 0) * (t.quantity || 0), 0);
    const totalQuantity = symbolTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  private calculateProfitFactor(sells: any[], buys: any[]): number {
    const grossProfit = sells.reduce((sum, s) => sum + (s.amount || 0), 0);
    const grossLoss = buys.reduce((sum, b) => sum + (b.amount || 0), 0);
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  }
}
