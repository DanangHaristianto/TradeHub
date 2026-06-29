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

    const totalExposure = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const largestPosition = Math.max(...positions.map((p) => p.marketValue));
    const positionConcentration = (largestPosition / totalExposure) * 100;

    const leverageRisk = positions.reduce((sum, p) => sum + (p.leverage - 1), 0) / positions.length;
    const volatilityRisk = this.calculateVolatilityRisk(positions);
    const correlationRisk = this.calculateCorrelationRisk(positions);

    const riskScore = this.calculateRiskScore({
      positionConcentration,
      leverageRisk,
      volatilityRisk,
      correlationRisk,
    });

    const recommendations = this.generateRiskRecommendations(riskScore, positions);

    return {
      riskScore,
      riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
      positionConcentration,
      leverageRisk,
      volatilityRisk,
      correlationRisk,
      recommendations,
    };
  }

  async suggestStopLoss(symbol: string, entryPrice: number, riskPercentage: number): Promise<number> {
    const stopLossPrice = entryPrice * (1 - riskPercentage / 100);
    return stopLossPrice;
  }

  async suggestTakeProfit(symbol: string, entryPrice: number, rewardRatio: number): Promise<number> {
    const avgVolatility = 0.02; // Placeholder
    const takeProfitPrice = entryPrice * (1 + avgVolatility * rewardRatio);
    return takeProfitPrice;
  }

  async checkPositionSizing(portfolioValue: number, riskPercentage: number, symbol: string): Promise<number> {
    const maxRiskAmount = (portfolioValue * riskPercentage) / 100;
    // Get symbol volatility and calculate position size
    return maxRiskAmount;
  }

  async monitorRiskExposure(portfolioId: string): Promise<any> {
    const positionRepository = AppDataSource.getRepository('Position');
    const positions = await positionRepository.find({ where: { portfolioId } });

    const exposures = {
      longExposure: positions.filter((p) => p.positionType === 'LONG').reduce((sum, p) => sum + p.marketValue, 0),
      shortExposure: positions.filter((p) => p.positionType === 'SHORT').reduce((sum, p) => sum + p.marketValue, 0),
      hedgeRatio: 0,
      netExposure: 0,
    };

    exposures.netExposure = exposures.longExposure - exposures.shortExposure;
    exposures.hedgeRatio = exposures.shortExposure / (exposures.longExposure + exposures.shortExposure);

    return exposures;
  }

  private calculateVolatilityRisk(positions: any[]): number {
    if (positions.length === 0) return 0;
    const volatilities = positions.map((p) => p.gainLossPercent);
    return volatilities.reduce((sum, v) => sum + Math.abs(v), 0) / positions.length;
  }

  private calculateCorrelationRisk(positions: any[]): number {
    // Simplified correlation calculation
    if (positions.length < 2) return 0;
    return 0.3; // Placeholder
  }

  private calculateRiskScore(
    factors: any
  ): number {
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

    if (positions.some((p) => p.leverage > 2)) {
      recommendations.push('High leverage detected. Consider reducing leverage.');
    }

    if (positions.length < 5) {
      recommendations.push('Portfolio lacks diversification. Add more positions.');
    }

    return recommendations;
  }
}
