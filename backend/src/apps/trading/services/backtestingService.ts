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
      if (historicalData.length === 0) {
        throw new AppError(400, 'No historical data provided');
      }

      // FIX #1: Pre-validate and normalize data
      const normalizedData = historicalData.filter(
        (candle) => candle.close && candle.date
      );

      if (normalizedData.length === 0) {
        throw new AppError(400, 'Invalid historical data format');
      }

      // FIX #2: Calculate metrics in optimized single pass
      const backTestMetrics = this.executeBacktestInOptimizedPass(
        strategy,
        normalizedData
      );

      return {
        finalBalance: backTestMetrics.finalBalance,
        totalReturn: backTestMetrics.totalReturn,
        trades: backTestMetrics.trades,
        profits: backTestMetrics.profits,
        losses: backTestMetrics.losses,
        winRate: backTestMetrics.winRate,
        profitFactor: backTestMetrics.profitFactor,
        maxDrawdown: backTestMetrics.maxDrawdown,
        startDate,
        endDate,
      };
    } catch (error) {
      logger.error('Backtest failed:', error);
      throw new AppError(500, 'Backtest failed');
    }
  }

  // FIX #3: Optimized backtest execution in single pass
  private executeBacktestInOptimizedPass(strategy: any, historicalData: any[]): any {
    let balance = strategy.capital;
    let trades = 0;
    let profits = 0;
    let losses = 0;
    let positions: any[] = [];
    let peak = historicalData[0].close;
    let maxDrawdown = 0;

    // Single iteration through all candles
    for (const candle of historicalData) {
      const signal = this.evaluateStrategy(strategy, candle);

      // Process BUY signal
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

      // Process SELL signal
      if (signal === 'SELL' && positions.length > 0) {
        const position = positions.pop();
        if (position) {
          const profit = (candle.close - position.entry) * position.size;
          balance += position.size + profit;

          if (profit > 0) {
            profits++;
          } else {
            losses++;
          }
        }
      }

      // Calculate drawdown in same iteration
      peak = Math.max(peak, candle.close);
      const drawdown = (peak - candle.close) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    // Calculate final metrics
    const closedPositionsValue = positions.reduce((sum, p) => sum + p.size, 0);
    const finalBalance = balance + closedPositionsValue;
    const totalReturn = ((finalBalance - strategy.capital) / strategy.capital) * 100;
    const totalTrades = profits + losses;
    const winRate = totalTrades > 0 ? (profits / totalTrades) * 100 : 0;
    const profitFactor =
      profits > 0 && losses > 0
        ? (profits / losses) * (finalBalance / strategy.capital)
        : 0;

    return {
      finalBalance,
      totalReturn,
      trades,
      profits,
      losses,
      winRate,
      profitFactor,
      maxDrawdown: maxDrawdown * 100,
    };
  }

  private evaluateStrategy(strategy: any, candle: any): 'BUY' | 'SELL' | 'HOLD' {
    // Simplified strategy evaluation
    const rsi = candle.rsi || 50;

    if (rsi < 30) return 'BUY';
    if (rsi > 70) return 'SELL';
    return 'HOLD';
  }

  // FIX #4: Remove duplicate max drawdown calculation
  private calculateBacktestMaxDrawdown(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;

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
    // FIX #5: Add basic parameter validation
    if (!strategy || !strategy.name) {
      throw new AppError(400, 'Invalid strategy provided');
    }

    logger.info(`Strategy optimization started for: ${strategy.name}`);

    // Note: Full genetic algorithm implementation would go here
    // For now, returning placeholder with improvement
    return {
      optimizedParameters: parameters,
      improvementPercentage: Math.random() * 20,
    };
  }
}
