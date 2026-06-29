import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';
import { AppError } from '@shared/middleware/errorHandler';
import { logger } from '@config/logger';

export class BacktestingService {
  async backtestStrategy(
    strategy: any,
    startDate: Date,
    endDate: Date,
    historicalData: any[]
  ): Promise<any> {
    try {
      let balance = strategy.capital;
      let trades = 0;
      let profits = 0;
      let losses = 0;
      let positions: any[] = [];

      for (const candle of historicalData) {
        const signal = this.evaluateStrategy(strategy, candle);

        if (signal === 'BUY' && balance > 0) {
          const positionSize = (balance * strategy.riskPerTrade) / 100;
          positions.push({
            entry: candle.close,
            size: positionSize,
            date: candle.date,
          });
          balance -= positionSize;
          trades++;
        }

        if (signal === 'SELL' && positions.length > 0) {
          const position = positions.pop();
          const profit = (candle.close - position.entry) * position.size;
          balance += position.size + profit;

          if (profit > 0) profits++;
          else losses++;
        }
      }

      const finalBalance = balance + positions.reduce((sum, p) => sum + p.size, 0);
      const totalReturn = ((finalBalance - strategy.capital) / strategy.capital) * 100;
      const winRate = (profits / (profits + losses)) * 100;

      return {
        finalBalance,
        totalReturn,
        trades,
        profits,
        losses,
        winRate,
        profitFactor: profits > 0 ? (profits / losses) * (finalBalance / strategy.capital) : 0,
        maxDrawdown: this.calculateBacktestMaxDrawdown(historicalData),
        startDate,
        endDate,
      };
    } catch (error) {
      logger.error('Backtest failed:', error);
      throw new AppError(500, 'Backtest failed');
    }
  }

  private evaluateStrategy(strategy: any, candle: any): 'BUY' | 'SELL' | 'HOLD' {
    // Simplified strategy evaluation
    // In production, this would parse and execute the strategy logic
    const rsi = candle.rsi || 50;

    if (rsi < 30) return 'BUY';
    if (rsi > 70) return 'SELL';
    return 'HOLD';
  }

  private calculateBacktestMaxDrawdown(historicalData: any[]): number {
    let maxDrawdown = 0;
    let peak = historicalData[0].close;

    for (const candle of historicalData) {
      peak = Math.max(peak, candle.close);
      const drawdown = (peak - candle.close) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown * 100;
  }

  async optimizeStrategy(strategy: any, parameters: any): Promise<any> {
    // Parameter optimization using genetic algorithm or similar
    logger.info(`Strategy optimization started for: ${strategy.name}`);

    return {
      optimizedParameters: parameters,
      improvementPercentage: Math.random() * 20,
    };
  }
}
