import { AppDataSource } from '@config/database';
import { generateId } from '@shared/utils/helpers';
import { AppError } from '@shared/middleware/errorHandler';
import { logger } from '@config/logger';

export class RiskManagementService {
  async assessPortfolioRisk(portfolioId: string): Promise<any> {
    const positionRepository = AppDataSource.getRepository('Position');
    const portfolioRepository = AppDataSource.getRepository('Portfolio');

    const portfolio = await portfolioRepository.findOne({ where: { id: portfolioId } });
    const positions = await positionRepository.find({ where: { portfolioId } });

    if (!portfolio) throw new AppError(404, 'Portfolio tidak ditemukan');
    if (positions.length === 0) {
      return {
        riskScore: 0,
        riskLevel: 'LOW',
        positionConcentration: 0,
        leverageRisk: 0,
        volatilityRisk: 0,
        correlationRisk: 0,
        recommendations: [],
      };
    }

    // FIX #1: Calculate all risk metrics in a single pass
    const riskMetrics = this.calculateRiskMetricsInSinglePass(positions);

    const riskScore = this.calculateRiskScore(riskMetrics);
    const recommendations = this.generateRiskRecommendations(riskScore, positions);

    return {
      riskScore,
      riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
      positionConcentration: riskMetrics.positionConcentration,
      leverageRisk: riskMetrics.leverageRisk,
      volatilityRisk: riskMetrics.volatilityRisk,
      correlationRisk: riskMetrics.correlationRisk,
      recommendations,
    };
  }

  // FIX #2: New method to calculate all metrics in single iteration
  private calculateRiskMetricsInSinglePass(
    positions: any[]
  ): {
    positionConcentration: number;
    leverageRisk: number;
    volatilityRisk: number;
    correlationRisk: number;
  } {
    let totalExposure = 0;
    let largestPosition = 0;
    let totalLeverage = 0;
    let totalVolatility = 0;
    let highLeverageCount = 0;

    // Single pass through positions
    for (const position of positions) {
      totalExposure += position.marketValue;
      largestPosition = Math.max(largestPosition, position.marketValue);
      totalLeverage += position.leverage - 1;
      totalVolatility += Math.abs(position.gainLossPercent || 0);
    }

    const positionConcentration =
      totalExposure > 0 ? (largestPosition / totalExposure) * 100 : 0;
    const leverageRisk = positions.length > 0 ? totalLeverage / positions.length : 0;
    const volatilityRisk = positions.length > 0 ? totalVolatility / positions.length : 0;

    // Simplified correlation (placeholder)
    const correlationRisk = positions.length < 2 ? 0 : 0.3;

    return {
      positionConcentration,
      leverageRisk,
      volatilityRisk,
      correlationRisk,
    };
  }

  async suggestStopLoss(symbol: string, entryPrice: number, riskPercentage: number): Promise<number> {
    const stopLossPrice = entryPrice * (1 - riskPercentage / 100);
    return stopLossPrice;
  }

  async suggestTakeProfit(
    symbol: string,
    entryPrice: number,
    rewardRatio: number
  ): Promise<number> {
    const avgVolatility = 0.02; // Placeholder
    const takeProfitPrice = entryPrice * (1 + avgVolatility * rewardRatio);
    return takeProfitPrice;
  }

  async checkPositionSizing(
    portfolioValue: number,
    riskPercentage: number,
    symbol: string
  ): Promise<number> {
    const maxRiskAmount = (portfolioValue * riskPercentage) / 100;
    return maxRiskAmount;
  }

  // FIX #3: Optimized exposure monitoring
  async monitorRiskExposure(portfolioId: string): Promise<any> {
    const positionRepository = AppDataSource.getRepository('Position');
    const positions = await positionRepository.find({ where: { portfolioId } });

    // Single pass calculation
    let longExposure = 0;
    let shortExposure = 0;

    for (const position of positions) {
      if (position.positionType === 'LONG') {
        longExposure += position.marketValue;
      } else if (position.positionType === 'SHORT') {
        shortExposure += position.marketValue;
      }
    }

    const netExposure = longExposure - shortExposure;
    const totalExposure = longExposure + shortExposure;
    const hedgeRatio = totalExposure > 0 ? shortExposure / totalExposure : 0;

    return {
      longExposure,
      shortExposure,
      hedgeRatio,
      netExposure,
    };
  }

  // FIX #4: Calculate volatility risk in already iterated data
  private calculateVolatilityRisk(positions: any[]): number {
    if (positions.length === 0) return 0;
    const volatilities = positions.map((p) => Math.abs(p.gainLossPercent || 0));
    return volatilities.reduce((sum, v) => sum + v, 0) / positions.length;
  }

  private calculateCorrelationRisk(positions: any[]): number {
    if (positions.length < 2) return 0;
    return 0.3; // Placeholder - simplified correlation
  }

  private calculateRiskScore(factors: any): number {
    const weights = {
      positionConcentration: 0.3,
      leverageRisk: 0.25,
      volatilityRisk: 0.25,
      correlationRisk: 0.2,
    };

    let score = 0;
    score += factors.positionConcentration * weights.positionConcentration;
    score += Math.min(factors.leverageRisk * 10, 100) * weights.leverageRisk;
    score += Math.min(factors.volatilityRisk * 5, 100) * weights.volatilityRisk;
    score += Math.min(factors.correlationRisk * 50, 100) * weights.correlationRisk;

    return Math.min(score, 100);
  }

  private generateRiskRecommendations(riskScore: number, positions: any[]): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('Portfolio risk is high. Consider reducing position sizes.');
      recommendations.push('Consider adding hedging positions.');
    }

    // FIX #5: Use single loop instead of positions.some()
    let hasHighLeverage = false;
    for (const position of positions) {
      if (position.leverage > 2) {
        hasHighLeverage = true;
        break;
      }
    }
    if (hasHighLeverage) {
      recommendations.push('High leverage detected. Consider reducing leverage.');
    }

    if (positions.length < 5) {
      recommendations.push('Portfolio lacks diversification. Add more positions.');
    }

    return recommendations;
  }
}
