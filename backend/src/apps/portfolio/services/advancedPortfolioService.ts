import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';
import { AppError } from '@shared/middleware/errorHandler';
import { logger } from '@config/logger';

export class AdvancedPortfolioService {
  async calculatePortfolioMetrics(portfolioId: string): Promise<any> {
    const portfolioRepository = AppDataSource.getRepository('Portfolio');
    const positionRepository = AppDataSource.getRepository('Position');
    const transactionRepository = AppDataSource.getRepository('Transaction');

    const portfolio = await portfolioRepository.findOne({ where: { id: portfolioId } });
    if (!portfolio) {
      throw new AppError(404, 'Portfolio tidak ditemukan');
    }

    const positions = await positionRepository.find({ where: { portfolioId } });
    const transactions = await transactionRepository.find({ where: { portfolioId } });

    const totalValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0) + portfolio.cashBalance;
    const totalInvested = transactions
      .filter((t) => t.type === 'BUY' || t.type === 'DEPOSIT')
      .reduce((sum, t) => sum + t.amount, 0);

    const gainLoss = totalValue - totalInvested;
    const gainLossPercentage = (gainLoss / totalInvested) * 100;

    const winningPositions = positions.filter((p) => p.gainLoss > 0).length;
    const winRate = (winningPositions / positions.length) * 100;

    const volatility = this.calculateVolatility(positions);
    const sharpeRatio = this.calculateSharpeRatio(positions, gainLossPercentage);
    const maxDrawdown = this.calculateMaxDrawdown(positions);

    return {
      totalValue,
      totalInvested,
      gainLoss,
      gainLossPercentage,
      winRate,
      positionCount: positions.length,
      volatility,
      sharpeRatio,
      maxDrawdown,
      diversification: this.calculateDiversification(positions),
    };
  }

  private calculateVolatility(positions: any[]): number {
    if (positions.length === 0) return 0;
    const returns = positions.map((p) => p.gainLossPercent);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateSharpeRatio(positions: any[], returnPercentage: number): number {
    const riskFreeRate = 2; // Assume 2% risk-free rate
    const volatility = this.calculateVolatility(positions);
    if (volatility === 0) return 0;
    return (returnPercentage - riskFreeRate) / volatility;
  }

  private calculateMaxDrawdown(positions: any[]): number {
    if (positions.length === 0) return 0;
    const values = positions.map((p) => p.marketValue);
    let maxDrawdown = 0;
    let peak = values[0];
    for (const value of values) {
      peak = Math.max(peak, value);
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    return maxDrawdown * 100;
  }

  private calculateDiversification(positions: any[]): any {
    const assetTypes = {} as any;
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);

    for (const position of positions) {
      const type = position.assetType;
      assetTypes[type] = (assetTypes[type] || 0) + position.marketValue;
    }

    const diversification: any = {};
    for (const [type, value] of Object.entries(assetTypes)) {
      diversification[type] = ((value as number) / totalValue) * 100;
    }

    return diversification;
  }

  async rebalancePortfolio(portfolioId: string, targetAllocation: any): Promise<any[]> {
    const positionRepository = AppDataSource.getRepository('Position');
    const positions = await positionRepository.find({ where: { portfolioId } });
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);

    const rebalancingOrders: any[] = [];
    for (const position of positions) {
      const type = position.assetType;
      const targetValue = (totalValue * targetAllocation[type]) / 100;
      const currentValue = position.marketValue;

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
    const transactions = await transactionRepository.find({
      where: { portfolioId },
      order: { createdAt: 'ASC' },
    });

    const buyTransactions = transactions.filter((t) => t.type === 'BUY');
    const sellTransactions = transactions.filter((t) => t.type === 'SELL');

    const profitableTrades = sellTransactions.filter(
      (sell) => (sell.price || 0) > this.getAveragePrice(buyTransactions, sell.symbol!)
    ).length;

    const totalTrades = Math.min(buyTransactions.length, sellTransactions.length);
    const winRate = (profitableTrades / totalTrades) * 100 || 0;

    const totalProfit = sellTransactions.reduce((sum, sell) => sum + (sell.amount || 0), 0) -
      buyTransactions.reduce((sum, buy) => sum + (buy.amount || 0), 0);

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
      averageLoss: (totalTrades - profitableTrades) > 0 ? -totalProfit / (totalTrades - profitableTrades) : 0,
    };
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
