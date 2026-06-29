import axios from 'axios';
import { logger } from '@config/logger';
import { AppError } from '@shared/middleware/errorHandler';
import { IPriceData } from '@shared/types';

export class AdvancedMarketService {
  private exchangeRates: Map<string, number> = new Map();
  private technicalIndicators: Map<string, any> = new Map();

  async getMultiAssetPrices(symbols: string[]): Promise<Map<string, any>> {
    const prices = new Map();
    for (const symbol of symbols) {
      try {
        const price = await this.getPriceWithIndicators(symbol);
        prices.set(symbol, price);
      } catch (error) {
        logger.warn(`Could not get price for ${symbol}`);
      }
    }
    return prices;
  }

  async getPriceWithIndicators(symbol: string): Promise<any> {
    try {
      const basePrice = Math.random() * 50000 + 25000;
      const rsi = this.calculateRSI([basePrice]);
      const macd = this.calculateMACD([basePrice]);
      const bollingerBands = this.calculateBollingerBands([basePrice]);

      return {
        symbol,
        price: basePrice,
        change: (Math.random() - 0.5) * 1000,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.random() * 1000000,
        high: basePrice * 1.05,
        low: basePrice * 0.95,
        timestamp: new Date(),
        technicalIndicators: {
          rsi,
          macd,
          bollingerBands,
        },
      };
    } catch (error) {
      logger.error(`Error getting price for ${symbol}:`, error);
      throw new AppError(500, 'Failed to fetch price data');
    }
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period) return 50;
    let gains = 0,
      losses = 0;
    for (let i = 1; i < period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calculateMACD(prices: number[]): { signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = (macd * 2) / 3; // Simplified
    return { signal, histogram: macd - signal };
  }

  private calculateEMA(prices: number[], period: number): number {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < Math.min(prices.length, period); i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }
    return ema;
  }

  private calculateBollingerBands(
    prices: number[],
    period: number = 20,
    deviation: number = 2
  ): { upper: number; middle: number; lower: number } {
    const middle = prices.slice(-period).reduce((a, b) => a + b) / period;
    const variance =
      prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - middle, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
      upper: middle + deviation * stdDev,
      middle,
      lower: middle - deviation * stdDev,
    };
  }

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    try {
      const rate = this.exchangeRates.get(`${from}${to}`) || 1;
      return amount * rate;
    } catch (error) {
      logger.error(`Currency conversion failed: ${from} to ${to}`);
      throw new AppError(500, 'Currency conversion failed');
    }
  }

  async getMarketSentiment(symbol: string): Promise<'BULLISH' | 'BEARISH' | 'NEUTRAL'> {
    try {
      const indicators = await this.getPriceWithIndicators(symbol);
      const rsi = indicators.technicalIndicators.rsi;
      if (rsi > 70) return 'BULLISH';
      if (rsi < 30) return 'BEARISH';
      return 'NEUTRAL';
    } catch (error) {
      logger.error(`Sentiment analysis failed for ${symbol}`);
      throw new AppError(500, 'Sentiment analysis failed');
    }
  }

  async getCorrelation(symbol1: string, symbol2: string): Promise<number> {
    try {
      return Math.random(); // Placeholder
    } catch (error) {
      logger.error(`Correlation calculation failed`);
      throw new AppError(500, 'Correlation calculation failed');
    }
  }
}
